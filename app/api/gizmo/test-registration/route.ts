
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

async function testRegistrationProcess() {
  const baseUrl = 'https://5f86bd85fd1c.ngrok-free.app';
  
  try {
    // Step 1: Get the registration form to get tokens
    const formResponse = await fetch(`${baseUrl}/memberregistration`, {
      method: 'GET',
      headers: {
        'ngrok-skip-browser-warning': 'true'
      }
    });

    if (!formResponse.ok) {
      return {
        success: false,
        error: 'Failed to fetch registration form',
        status: formResponse.status
      };
    }

    const html = await formResponse.text();
    
    // Extract tokens
    const tokenMatch = html.match(/<input[^>]*name="Token"[^>]*value="([^"]*)"[^>]*>/i);
    const verificationTokenMatch = html.match(/<input[^>]*name="__RequestVerificationToken"[^>]*value="([^"]*)"[^>]*>/i);
    
    const token = tokenMatch ? tokenMatch[1] : null;
    const verificationToken = verificationTokenMatch ? verificationTokenMatch[1] : null;

    // Step 2: Test with a dummy user to see the response
    const testUser = {
      Username: 'testuser_' + Date.now(),
      Password: 'testpassword123',
      RepeatPassword: 'testpassword123',
      FirstName: 'Test',
      LastName: 'User',
      Email: 'test@example.com',
      Mobile: '05551234567',
      VerificationMethod: 'None',
      ProcessedUserAgreements: '',
      Token: token || '',
      __RequestVerificationToken: verificationToken || ''
    };

    const formData = new URLSearchParams();
    Object.entries(testUser).forEach(([key, value]) => {
      formData.append(key, value);
    });

    const registrationResponse = await fetch(`${baseUrl}/memberregistration/complete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'ngrok-skip-browser-warning': 'true'
      },
      body: formData.toString()
    });

    const responseText = await registrationResponse.text();
    
    return {
      success: true,
      tokens: {
        token: token ? 'Found' : 'Not found',
        verificationToken: verificationToken ? 'Found' : 'Not found'
      },
      testUser: testUser.Username,
      registrationResponse: {
        status: registrationResponse.status,
        statusText: registrationResponse.statusText,
        contentType: registrationResponse.headers.get('content-type'),
        response: responseText.length > 1000 ? responseText.substring(0, 1000) + '...' : responseText
      },
      analysis: {
        registrationWorking: registrationResponse.ok,
        responseContainsSuccess: responseText.includes('başarı') || responseText.includes('success') || responseText.includes('kayıt'),
        responseContainsError: responseText.includes('hata') || responseText.includes('error'),
        responseContainsForm: responseText.includes('<form'),
        responseContainsRedirect: responseText.includes('redirect') || responseText.includes('location')
      }
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

export async function GET(request: NextRequest) {
  try {
    const result = await testRegistrationProcess();
    
    return NextResponse.json({
      timestamp: new Date().toISOString(),
      gizmoApiUrl: 'https://5f86bd85fd1c.ngrok-free.app',
      ...result
    });
  } catch (error) {
    console.error('Registration test error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
