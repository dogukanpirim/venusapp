
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

async function analyzeRegistrationForm() {
  const baseUrl = 'https://5f86bd85fd1c.ngrok-free.app';
  
  try {
    // Get the registration form
    const response = await fetch(`${baseUrl}/memberregistration`, {
      method: 'GET',
      headers: {
        'ngrok-skip-browser-warning': 'true'
      }
    });

    if (!response.ok) {
      return {
        success: false,
        error: 'Failed to fetch registration form',
        status: response.status
      };
    }

    const html = await response.text();
    
    // Extract form action and method
    const formMatch = html.match(/<form[^>]*action\s*=\s*["']([^"']+)["'][^>]*>/i);
    const methodMatch = html.match(/<form[^>]*method\s*=\s*["']([^"']+)["'][^>]*>/i);
    
    // Extract all input fields
    const inputMatches = html.match(/<input[^>]*>/gi) || [];
    const inputs = inputMatches.map(input => {
      const nameMatch = input.match(/name\s*=\s*["']([^"']+)["']/i);
      const typeMatch = input.match(/type\s*=\s*["']([^"']+)["']/i);
      const valueMatch = input.match(/value\s*=\s*["']([^"']+)["']/i);
      const requiredMatch = input.match(/required/i);
      
      return {
        name: nameMatch ? nameMatch[1] : null,
        type: typeMatch ? typeMatch[1] : 'text',
        value: valueMatch ? valueMatch[1] : null,
        required: !!requiredMatch,
        html: input
      };
    }).filter(input => input.name);

    // Extract select fields
    const selectMatches = html.match(/<select[^>]*name\s*=\s*["']([^"']+)["'][^>]*>[\s\S]*?<\/select>/gi) || [];
    const selects = selectMatches.map(select => {
      const nameMatch = select.match(/name\s*=\s*["']([^"']+)["']/i);
      const optionMatches = select.match(/<option[^>]*value\s*=\s*["']([^"']+)["'][^>]*>([^<]*)<\/option>/gi) || [];
      const options = optionMatches.map(option => {
        const valueMatch = option.match(/value\s*=\s*["']([^"']+)["']/i);
        const textMatch = option.match(/>([^<]*)<\/option>/i);
        return {
          value: valueMatch ? valueMatch[1] : null,
          text: textMatch ? textMatch[1].trim() : null
        };
      });
      
      return {
        name: nameMatch ? nameMatch[1] : null,
        options,
        html: select
      };
    }).filter(select => select.name);

    // Extract textarea fields
    const textareaMatches = html.match(/<textarea[^>]*name\s*=\s*["']([^"']+)["'][^>]*>[\s\S]*?<\/textarea>/gi) || [];
    const textareas = textareaMatches.map(textarea => {
      const nameMatch = textarea.match(/name\s*=\s*["']([^"']+)["']/i);
      return {
        name: nameMatch ? nameMatch[1] : null,
        html: textarea
      };
    }).filter(textarea => textarea.name);

    // Try to find any JavaScript that might reveal API endpoints
    const scriptMatches = html.match(/<script[^>]*>[\s\S]*?<\/script>/gi) || [];
    const jsCode = scriptMatches.join('\n');
    
    // Look for API endpoints in JavaScript
    const apiEndpoints: string[] = [];
    const urlMatches = jsCode.match(/['"`]\/[^'"`\s]*['"`]/g) || [];
    urlMatches.forEach(url => {
      const cleanUrl = url.replace(/['"`]/g, '');
      if (cleanUrl.includes('api') || cleanUrl.includes('users') || cleanUrl.includes('members')) {
        apiEndpoints.push(cleanUrl);
      }
    });

    // Extract any hidden fields that might contain tokens or IDs
    const hiddenFields = inputs.filter(input => input.type === 'hidden');
    
    return {
      success: true,
      form: {
        action: formMatch ? formMatch[1] : null,
        method: methodMatch ? methodMatch[1] : 'GET'
      },
      inputs,
      selects,
      textareas,
      hiddenFields,
      apiEndpoints: Array.from(new Set(apiEndpoints)),
      analysis: {
        totalFields: inputs.length + selects.length + textareas.length,
        requiredFields: inputs.filter(i => i.required).length,
        hasTokenField: inputs.some(i => i.name?.toLowerCase().includes('token')),
        hasVerification: inputs.some(i => i.name?.toLowerCase().includes('verification')),
        hasAntiForgery: inputs.some(i => i.name?.toLowerCase().includes('antiforgery') || i.name?.toLowerCase().includes('csrf'))
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
    const result = await analyzeRegistrationForm();
    
    return NextResponse.json({
      timestamp: new Date().toISOString(),
      gizmoApiUrl: 'https://5f86bd85fd1c.ngrok-free.app',
      ...result
    });
  } catch (error) {
    console.error('Registration analysis error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
