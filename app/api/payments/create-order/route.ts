import { NextRequest, NextResponse } from 'next/server';
const Razorpay = require('razorpay');

export async function POST(request: NextRequest) {
  try {
    const { amount, currency = 'INR', medicineId, userId } = await request.json();

    // Validate input
    if (!amount || !medicineId || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields: amount, medicineId, userId' },
        { status: 400 }
      );
    }

    // Initialize Razorpay with environment variables
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      return NextResponse.json(
        { error: 'Razorpay credentials not configured' },
        { status: 500 }
      );
    }

    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    // Create receipt
    const receipt = `order_${medicineId}_${userId}_${Date.now()}`;

    // Create Razorpay order
    const order = await razorpay.orders.create({
      amount: amount * 100, // Razorpay expects amount in paise
      currency,
      receipt,
      payment_capture: 1, // Auto capture payment
    });

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
        receipt: order.receipt,
      },
      keyId: keyId,
    });
  } catch (error) {
    console.error('Error creating payment order:', error);
    return NextResponse.json(
      { error: 'Failed to create payment order' },
      { status: 500 }
    );
  }
}
