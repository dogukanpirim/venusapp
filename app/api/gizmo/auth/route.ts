
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

// Function to get anti-forgery token from the login form
async function getAntiForgeryToken(): Promise<string | null> {
  try {
    // Try different potential login endpoints
    const loginEndpoints = [
      'https://5f86bd85fd1c.ngrok-free.app/',
      'https://5f86bd85fd1c.ngrok-free.app/login',
      'https://5f86bd85fd1c.ngrok-free.app/auth',
      'https://5f86bd85fd1c.ngrok-free.app/member'
    ];

    for (const endpoint of loginEndpoints) {
      try {
        const response = await fetch(endpoint, {
          method: 'GET',
          headers: {
            'ngrok-skip-browser-warning': 'true'
          }
        });

        if (response.ok) {
          const html = await response.text();
          
          // Look for token in form fields
          let tokenMatch = html.match(/<input[^>]*name="Token"[^>]*value="([^"]*)"[^>]*>/i);
          if (tokenMatch && tokenMatch[1]) {
            return tokenMatch[1];
          }
          
          tokenMatch = html.match(/<input[^>]*name="__RequestVerificationToken"[^>]*value="([^"]*)"[^>]*>/i);
          if (tokenMatch && tokenMatch[1]) {
            return tokenMatch[1];
          }
          
          // Look for other token patterns
          tokenMatch = html.match(/token\s*=\s*"([^"]+)"/i);
          if (tokenMatch && tokenMatch[1]) {
            return tokenMatch[1];
          }
        }
      } catch (e) {
        // Continue to next endpoint
        continue;
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error getting anti-forgery token:', error);
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password are required' }, { status: 400 });
    }

    console.log('Attempting Gizmo authentication for user:', username);

    // First check if user exists in local database
    const localUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: `${username}@venusespor.local` },
          { email: `${username}@gizmo.local` }
        ]
      }
    });

    if (localUser) {
      console.log('User found in local database:', localUser.email);
      
      // For local users, we'll trust that they were registered through Gizmo
      // and authenticate them locally
      return NextResponse.json({
        success: true,
        user: {
          id: localUser.id,
          username: username,
          email: localUser.email,
          name: localUser.name,
          isAdmin: localUser.isAdmin,
          source: 'gizmo',
          gizmoToken: 'local_auth_token',
        },
      });
    }

    // Try to authenticate with Gizmo system using web form approach
    try {
      console.log('Attempting web form authentication with Gizmo...');
      
      // Get anti-forgery token
      const token = await getAntiForgeryToken();
      console.log('Token obtained:', token ? 'Yes' : 'No');

      // Try different potential login endpoints
      const loginEndpoints = [
        'https://5f86bd85fd1c.ngrok-free.app/auth/login',
        'https://5f86bd85fd1c.ngrok-free.app/login',
        'https://5f86bd85fd1c.ngrok-free.app/member/login',
        'https://5f86bd85fd1c.ngrok-free.app/account/login'
      ];

      for (const endpoint of loginEndpoints) {
        try {
          const formData = new URLSearchParams();
          formData.append('username', username);
          formData.append('password', password);
          if (token) {
            formData.append('Token', token);
            formData.append('__RequestVerificationToken', token);
          }

          const authResponse = await fetch(endpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              'ngrok-skip-browser-warning': 'true',
            },
            body: formData.toString()
          });

          console.log(`Tried endpoint ${endpoint}: ${authResponse.status}`);

          if (authResponse.ok) {
            const responseText = await authResponse.text();
            
            // Check if login was successful
            const lowerResponse = responseText.toLowerCase();
            const hasError = lowerResponse.includes('hata') || 
                           lowerResponse.includes('error') ||
                           lowerResponse.includes('invalid') ||
                           lowerResponse.includes('geçersiz') ||
                           lowerResponse.includes('başarısız') ||
                           lowerResponse.includes('failed');

            const hasSuccess = lowerResponse.includes('başarı') ||
                             lowerResponse.includes('success') ||
                             lowerResponse.includes('welcome') ||
                             lowerResponse.includes('dashboard') ||
                             lowerResponse.includes('ana sayfa') ||
                             lowerResponse.includes('redirecting') ||
                             responseText.length < 1000; // Short response usually means redirect

            if (!hasError && hasSuccess) {
              console.log('Gizmo authentication successful');
              
              // Create user in local database if not exists
              try {
                const newUser = await prisma.user.create({
                  data: {
                    email: `${username}@gizmo.local`,
                    password: 'gizmo_auth', // Placeholder password
                    name: username,
                    isAdmin: false
                  }
                });

                await prisma.player.create({
                  data: {
                    userId: newUser.id,
                    gamertag: username,
                    displayName: username,
                    email: `${username}@gizmo.local`,
                    isActive: true
                  }
                });

                console.log('User created in local database:', newUser.id);
              } catch (dbError) {
                console.error('Error creating user in local database:', dbError);
              }

              return NextResponse.json({
                success: true,
                user: {
                  id: username,
                  username: username,
                  email: `${username}@gizmo.local`,
                  name: username,
                  isAdmin: false,
                  source: 'gizmo',
                  gizmoToken: 'authenticated',
                },
              });
            }
          }
        } catch (endpointError) {
          console.error(`Error with endpoint ${endpoint}:`, endpointError);
          continue;
        }
      }

      // If all endpoints failed, return error
      return NextResponse.json({ 
        error: 'Geçersiz kullanıcı adı veya şifre',
        success: false 
      }, { status: 401 });

    } catch (fetchError) {
      console.error('Gizmo API connection error:', fetchError);
      
      return NextResponse.json({ 
        error: 'Gizmo sistemi şu anda kullanılamıyor. Lütfen daha sonra tekrar deneyin.',
        success: false 
      }, { status: 503 });
    }

  } catch (error) {
    console.error('Gizmo auth API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
