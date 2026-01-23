import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { orderId, paymentId, signature } = await request.json();

    // Validate input
    if (!orderId || !paymentId || !signature) {
      return NextResponse.json(
        { error: 'Missing required fields: orderId, paymentId, signature' },
        { status: 400 }
      );
    }

    // Get Razorpay secret from environment variables
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keySecret) {
      return NextResponse.json(
        { error: 'Razorpay credentials not configured' },
        { status: 500 }
      );
    }

    // Verify payment signature
    const crypto = require('crypto');
    const body = orderId + '|' + paymentId;
    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(body.toString())
      .digest('hex');

    const isValidSignature = expectedSignature === signature;

    if (!isValidSignature) {
      return NextResponse.json(
        { error: 'Invalid payment signature' },
        { status: 400 }
      );
    }

    // Here you would typically:
    // 1. Update your database with payment status
    // 2. Send confirmation email
    // 3. Update order status
    // 4. Trigger any post-payment workflows

    return NextResponse.json({
      success: true,
      message: 'Payment verified successfully',
      paymentId,
      orderId,
    });
  } catch (error) {
    console.error('Error verifying payment:', error);
    return NextResponse.json(
      { error: 'Failed to verify payment' },
      { status: 500 }
    );
  }
}
