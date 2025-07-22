
import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { prisma } from '@/lib/db';

// Function to get anti-forgery token from the registration form
async function getAntiForgeryToken(): Promise<string | null> {
  try {
    const response = await fetch('https://5f86bd85fd1c.ngrok-free.app/memberregistration', {
      method: 'GET',
      headers: {
        'ngrok-skip-browser-warning': 'true'
      }
    });

    if (!response.ok) {
      return null;
    }

    const html = await response.text();
    
    // Extract token from HTML (looking for hidden input with name="Token" or "__RequestVerificationToken")
    // First try Token field
    let tokenMatch = html.match(/<input[^>]*name="Token"[^>]*value="([^"]*)"[^>]*>/i);
    if (tokenMatch && tokenMatch[1]) {
      return tokenMatch[1];
    }
    
    // If Token field is empty, try __RequestVerificationToken
    tokenMatch = html.match(/<input[^>]*name="__RequestVerificationToken"[^>]*value="([^"]*)"[^>]*>/i);
    if (tokenMatch && tokenMatch[1]) {
      return tokenMatch[1];
    }
    
    // If both fail, extract from any token-like pattern
    tokenMatch = html.match(/token\s*=\s*"([^"]+)"/i);
    if (tokenMatch && tokenMatch[1]) {
      return tokenMatch[1];
    }
    
    return null;
  } catch (error) {
    console.error('Error getting anti-forgery token:', error);
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { firstName, lastName, username, password, confirmPassword, email, phone } = body;

    // Validate required fields (Username, Password, RepeatPassword are required according to the report)
    if (!username || !password || !confirmPassword) {
      return NextResponse.json(
        { message: 'Kullanıcı adı, şifre ve şifre tekrarı zorunludur' },
        { status: 400 }
      );
    }

    // Validate password match
    if (password !== confirmPassword) {
      return NextResponse.json(
        { message: 'Şifreler eşleşmiyor' },
        { status: 400 }
      );
    }

    // Validate username length (max 30 characters according to report)
    if (username.length > 30) {
      return NextResponse.json(
        { message: 'Kullanıcı adı en fazla 30 karakter olmalıdır' },
        { status: 400 }
      );
    }

    // Validate password length (max 45 characters according to report)
    if (password.length > 45) {
      return NextResponse.json(
        { message: 'Şifre en fazla 45 karakter olmalıdır' },
        { status: 400 }
      );
    }

    // Validate email format and length if provided
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return NextResponse.json(
          { message: 'Geçerli bir e-posta adresi giriniz' },
          { status: 400 }
        );
      }
      if (email.length > 254) {
        return NextResponse.json(
          { message: 'E-posta adresi en fazla 254 karakter olmalıdır' },
          { status: 400 }
        );
      }
    }

    // Validate phone format if provided
    if (phone) {
      const phoneRegex = /^\d{10,11}$/;
      if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
        return NextResponse.json(
          { message: 'Geçerli bir telefon numarası giriniz' },
          { status: 400 }
        );
      }
    }

    // Validate name fields length if provided
    if (firstName && firstName.length > 45) {
      return NextResponse.json(
        { message: 'Ad en fazla 45 karakter olmalıdır' },
        { status: 400 }
      );
    }

    if (lastName && lastName.length > 45) {
      return NextResponse.json(
        { message: 'Soyad en fazla 45 karakter olmalıdır' },
        { status: 400 }
      );
    }

    // Get anti-forgery token
    const token = await getAntiForgeryToken();
    if (!token) {
      return NextResponse.json(
        { message: 'Güvenlik token\'ı alınamadı. Lütfen tekrar deneyin' },
        { status: 500 }
      );
    }

    // Prepare the request body according to the report specifications
    const formData = new URLSearchParams();
    formData.append('Username', username);
    formData.append('Password', password);
    formData.append('RepeatPassword', confirmPassword);
    formData.append('VerificationMethod', 'None');
    formData.append('ProcessedUserAgreements', '');
    formData.append('Token', token);

    // Add optional fields if provided
    if (firstName) formData.append('FirstName', firstName);
    if (lastName) formData.append('LastName', lastName);
    if (email) formData.append('Email', email);
    if (phone) formData.append('Mobile', phone);

    // Make request to correct Gizmo member registration endpoint
    const gizmoResponse = await fetch('https://5f86bd85fd1c.ngrok-free.app/memberregistration/complete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'ngrok-skip-browser-warning': 'true'
      },
      body: formData.toString()
    });

    // Handle response - checking both status code and response body
    const responseText = await gizmoResponse.text();
    
    console.log('Gizmo API Response Status:', gizmoResponse.status);
    console.log('Gizmo API Response Body:', responseText);

    // The report states that 200 OK might not mean successful database insertion
    // We need to check the response body for actual success/failure indicators
    if (gizmoResponse.status === 200) {
      // Enhanced response parsing for Gizmo API
      const lowerResponseText = responseText.toLowerCase();
      
      // Check for explicit error indicators first (but exclude JavaScript variables)
      const hasError = (lowerResponseText.includes('hata') || 
                       lowerResponseText.includes('geçersiz') ||
                       lowerResponseText.includes('invalid') ||
                       lowerResponseText.includes('zaten') ||
                       lowerResponseText.includes('already') ||
                       lowerResponseText.includes('mevcut') ||
                       lowerResponseText.includes('exists') ||
                       lowerResponseText.includes('başarısız') ||
                       lowerResponseText.includes('failed') ||
                       lowerResponseText.includes('validation') ||
                       lowerResponseText.includes('doğrulama')) &&
                       // Don't count JavaScript variables as errors
                       !lowerResponseText.includes('errormessage = \'success\'') &&
                       !lowerResponseText.includes('var errormessage = \'success\'');

      // Check for success indicators
      const hasSuccess = lowerResponseText.includes('başarı') || 
                        lowerResponseText.includes('success') ||
                        lowerResponseText.includes('kayıt') ||
                        lowerResponseText.includes('registration') ||
                        lowerResponseText.includes('tamamlandı') ||
                        lowerResponseText.includes('completed') ||
                        lowerResponseText.includes('created') ||
                        lowerResponseText.includes('oluşturuldu') ||
                        lowerResponseText.includes('account has been created') ||
                        lowerResponseText.includes('hesap oluşturuldu') ||
                        lowerResponseText.includes('alert-success') ||
                        lowerResponseText.includes('your account');

      // If contains errors, it's failed
      // If contains success indicators and no errors, it's successful
      // If response is short HTML (likely redirect), it's successful
      const isSuccessful = !hasError && (hasSuccess || responseText.length < 1000);

      console.log('Gizmo Response Analysis:', {
        responseLength: responseText.length,
        hasError,
        hasSuccess,
        isSuccessful,
        firstPart: responseText.substring(0, 200)
      });

      if (isSuccessful) {
        // SUCCESS: Now save to local database
        try {
          // Check if user already exists in local database
          const existingUser = await prisma.user.findUnique({
            where: { email: email || `${username}@venusespor.local` }
          });

          if (existingUser) {
            console.log('User already exists in local database:', existingUser.email);
            return NextResponse.json(
              { 
                message: 'Gizmo\'da kayıt başarılı, ancak bu e-posta zaten yerel veritabanında mevcut',
                success: true,
                details: 'Gizmo kayıt tamamlandı',
                localUser: existingUser.id
              },
              { status: 201 }
            );
          }

          // Hash password for local storage
          const hashedPassword = await hash(password, 12);

          // Create user in local database
          const newUser = await prisma.user.create({
            data: {
              email: email || `${username}@venusespor.local`,
              password: hashedPassword,
              name: firstName && lastName ? `${firstName} ${lastName}` : username,
              isAdmin: false
            }
          });

          // Create player profile
          const newPlayer = await prisma.player.create({
            data: {
              userId: newUser.id,
              gamertag: username,
              displayName: firstName && lastName ? `${firstName} ${lastName}` : username,
              email: email,
              phone: phone,
              isActive: true
            }
          });

          console.log('User created successfully:', {
            userId: newUser.id,
            playerId: newPlayer.id,
            username: username,
            email: email || `${username}@venusespor.local`
          });

          return NextResponse.json(
            { 
              message: 'Üyelik başarıyla oluşturuldu ve veritabanına kaydedildi',
              success: true,
              details: 'Kayıt işlemi tamamlandı',
              localUser: newUser.id,
              player: newPlayer.id
            },
            { status: 201 }
          );

        } catch (dbError) {
          console.error('Database error while saving user:', dbError);
          
          // Even if local DB fails, Gizmo registration was successful
          return NextResponse.json(
            { 
              message: 'Gizmo\'da kayıt başarılı, ancak yerel veritabanı hatası',
              success: true,
              details: 'Gizmo kayıt tamamlandı, yerel kayıt hatası: ' + (dbError instanceof Error ? dbError.message : 'Unknown error'),
              warning: 'Lütfen yöneticiyle iletişime geçin'
            },
            { status: 201 }
          );
        }
      } else {
        // 200 OK but response indicates failure
        let errorMessage = 'Üye kayıt işlemi başarısız oldu';
        
        if (responseText.includes('kullanıcı adı') || responseText.includes('username')) {
          errorMessage = 'Bu kullanıcı adı zaten kullanılıyor';
        } else if (responseText.includes('e-posta') || responseText.includes('email')) {
          errorMessage = 'Bu e-posta adresi zaten kullanılıyor';
        } else if (responseText.includes('geçersiz') || responseText.includes('invalid')) {
          errorMessage = 'Geçersiz bilgiler girildi';
        }

        return NextResponse.json(
          { 
            message: errorMessage,
            success: false,
            details: responseText 
          },
          { status: 400 }
        );
      }
    } else {
      // Handle different error status codes
      let errorMessage = 'Üye kayıt işlemi başarısız oldu';
      
      if (gizmoResponse.status === 400) {
        errorMessage = 'Geçersiz bilgiler girildi';
      } else if (gizmoResponse.status === 409) {
        errorMessage = 'Bu kullanıcı adı veya e-posta zaten kullanılıyor';
      } else if (gizmoResponse.status === 500) {
        errorMessage = 'Sunucu hatası. Lütfen daha sonra tekrar deneyin';
      }

      return NextResponse.json(
        { 
          message: errorMessage,
          success: false,
          details: responseText 
        },
        { status: gizmoResponse.status }
      );
    }

  } catch (error) {
    console.error('Registration API error:', error);
    return NextResponse.json(
      { 
        message: 'Sunucu hatası. Lütfen daha sonra tekrar deneyin',
        success: false
      },
      { status: 500 }
    );
  }
}
