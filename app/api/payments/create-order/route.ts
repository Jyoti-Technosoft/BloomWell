import { NextRequest, NextResponse } from 'next/server';
const Razorpay = require('razorpay');
import { createOrUpdateCustomer, createOrder, createPaymentTransaction } from '@/app/lib/database-operations';

export async function POST(request: NextRequest) {
  try {
    const { 
      amount, 
      currency = 'INR', 
      medicineId, 
      medicineName,
      userId,
      customerName,
      customerEmail,
      customerPhone 
    } = await request.json();

    // Validate input
    if (!amount || !medicineId || !userId || !customerName || !customerEmail) {
      return NextResponse.json(
        { error: 'Missing required fields: amount, medicineId, userId, customerName, customerEmail' },
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

    // Create or update customer in database
    const customer = await createOrUpdateCustomer({
      userId,
      name: customerName,
      email: customerEmail,
      phone: customerPhone
    });

    // Create receipt (max 40 characters)
    const receipt = `ord_${medicineId.slice(0, 8)}_${Date.now()}`;

    // Create Razorpay order
    const order = await razorpay.orders.create({
      amount: amount * 100, // Razorpay expects amount in paise
      currency,
      receipt,
      payment_capture: 1, // Auto capture payment
      notes: {
        customer_id: customer.id,
        medicine_id: medicineId,
        medicine_name: medicineName,
        user_id: userId
      }
    });

    // Save order and transaction to database sequentially to avoid conflicts
    try {
      await createOrder({
        razorpayOrderId: order.id,
        customerId: customer.id,
        medicineId,
        medicineName,
        amount: amount * 100,
        currency,
        receipt
      });

      // Create initial payment transaction record
      await createPaymentTransaction({
        razorpayOrderId: order.id,
        customerId: customer.id,
        medicineId,
        medicineName,
        amount: amount * 100,
        currency,
        status: 'created',
        email: customerEmail,
        contact: customerPhone,
        description: `Payment for ${medicineName}`,
        notes: order.notes
      });
    } catch (dbError) {
      console.error('Database error after Razorpay order creation:', dbError);
      // Continue with response even if DB save fails - Razorpay order is created
    }

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
        receipt: order.receipt,
      },
      keyId: keyId,
      customer: {
        id: customer.id,
        name: customer.name,
        email: customer.email
      }
    });
  } catch (error) {
    console.error('Error creating payment order:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to create payment order',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
