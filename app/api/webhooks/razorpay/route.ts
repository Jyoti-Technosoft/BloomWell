import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { updatePaymentTransaction, getTransactionByPaymentId, updateUserCustomerId } from '@/app/lib/database-operations';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.NEON_DATABASE_URL,
});

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
        return NextResponse.json({ message: 'Unhandled webhook event' });
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
  
  // First update the payment transaction with payment_id
  const client = await pool.connect();
  try {
    // Check if transaction exists
    const checkResult = await client.query(
      'SELECT id FROM payment_transactions WHERE razorpay_order_id = $1',
      [payment.order_id]
    );
    if (checkResult.rows.length === 0) {
      console.log('No transaction found for order_id:', payment.order_id);
      return;
    }
    
    await client.query(
      `UPDATE payment_transactions 
       SET razorpay_payment_id = $1, updated_at = CURRENT_TIMESTAMP
       WHERE razorpay_order_id = $2 AND razorpay_payment_id IS NULL`,
      [payment.id, payment.order_id]
    );
  } finally {
    client.release();
  }
  
  // Then update all payment details
  await updatePaymentTransaction(payment.id, {
    status: 'paid',
    payment_method: payment.method,
    bank: payment.bank,
    wallet: payment.wallet,
    vpa: payment.vpa,
    fee: payment.fee,
    tax: payment.tax
  });

  // Link user to customer
  try {
    const transaction = await getTransactionByPaymentId(payment.id);
    if (transaction) {
      const customerClient = await pool.connect();
      try {
        const customerResult = await customerClient.query(
          'SELECT user_id FROM customers WHERE id = $1',
          [transaction.customer_id]
        );
        
        if (customerResult.rows.length > 0) {
          const userId = customerResult.rows[0].user_id;
          await updateUserCustomerId(userId, transaction.customer_id);
          console.log(`Webhook linked user ${userId} to customer ${transaction.customer_id}`);
        }
      } finally {
        customerClient.release();
      }
    }
  } catch (error) {
    console.error('Error in webhook user linking:', error);
  }
}

async function handlePaymentFailed(event: any) {
  const payment = event.payload.payment.entity;
  
  // First update the payment transaction with payment_id
  const client = await pool.connect();
  try {
    await client.query(
      `UPDATE payment_transactions 
       SET razorpay_payment_id = $1, updated_at = CURRENT_TIMESTAMP
       WHERE razorpay_order_id = $2 AND razorpay_payment_id IS NULL`,
      [payment.id, payment.order_id]
    );
  } finally {
    client.release();
  }
  
  // Then update status
  await updatePaymentTransaction(payment.id, {
    status: 'failed'
  });

  console.log('Payment failed:', payment.id);
}

async function handleOrderPaid(event: any) {
  const order = event.payload.order.entity;
  console.log('Order paid:', order.id);
}
