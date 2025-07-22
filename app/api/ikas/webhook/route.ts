
import { NextRequest, NextResponse } from 'next/server';
import { ikasGizmoBridge } from '@/lib/ikas-gizmo-bridge';
import { IKAS_CONFIG } from '@/lib/ikas-client';
import crypto from 'crypto';

export const dynamic = "force-dynamic";

function verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  
  return crypto.timingSafeEqual(
    Buffer.from(signature, 'hex'),
    Buffer.from(expectedSignature, 'hex')
  );
}

export async function POST(request: NextRequest) {
  try {
    const payload = await request.text();
    const signature = request.headers.get('x-ikas-signature') || '';
    
    // Verify webhook signature for security
    if (!verifyWebhookSignature(payload, signature, IKAS_CONFIG.WEBHOOK_SECRET)) {
      console.error('Invalid İkas webhook signature');
      return NextResponse.json(
        { success: false, error: 'Invalid signature' },
        { status: 401 }
      );
    }

    const webhookData = JSON.parse(payload);
    
    // Process the webhook
    await ikasGizmoBridge.handleIkasWebhook(webhookData);
    
    return NextResponse.json({
      success: true,
      message: 'Webhook processed successfully'
    });

  } catch (error) {
    console.error('İkas webhook error:', error);
    return NextResponse.json(
      { success: false, error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
