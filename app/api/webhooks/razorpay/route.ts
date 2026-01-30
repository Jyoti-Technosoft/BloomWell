import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { updatePaymentTransaction, getTransactionByPaymentId } from '@/app/lib/database-operations';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('x-razorpay-signature');
    
    if (!signature) {
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 400 }
      );
    }

    // Verify webhook signature
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!secret) {
      return NextResponse.json(
        { error: 'Webhook secret not configured' },
        { status: 500 }
      );
    }

    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(body)
      .digest('hex');

    if (signature !== expectedSignature) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    const event = JSON.parse(body);
    console.log('Webhook event received:', event.event);

    // Handle different webhook events
    switch (event.event) {
      case 'payment.captured':
        await handlePaymentCaptured(event);
        break;
      
      case 'payment.failed':
        await handlePaymentFailed(event);
        break;
      
      case 'order.paid':
        await handleOrderPaid(event);
        break;
      
      default:
        console.log('Unhandled webhook event:', event.event);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

async function handlePaymentCaptured(event: any) {
  const payment = event.payload.payment.entity;
  
  await updatePaymentTransaction(payment.id, {
    status: 'paid',
    payment_method: payment.method,
    bank: payment.bank,
    wallet: payment.wallet,
    vpa: payment.vpa,
    fee: payment.fee,
    tax: payment.tax
  });

  // Send confirmation email, update order status, etc.
  console.log('Payment captured:', payment.id);
}

async function handlePaymentFailed(event: any) {
  const payment = event.payload.payment.entity;
  
  await updatePaymentTransaction(payment.id, {
    status: 'failed'
  });

  console.log('Payment failed:', payment.id);
}

async function handleOrderPaid(event: any) {
  const order = event.payload.order.entity;
  console.log('Order paid:', order.id);
}
