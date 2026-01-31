import { NextRequest, NextResponse } from 'next/server';
const Razorpay = require('razorpay');
import { updatePaymentTransaction, getTransactionByPaymentId } from '@/app/lib/database-operations';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

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

    // Initialize Razorpay to fetch payment details
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: keySecret,
    });

    // Fetch payment details from Razorpay
    const payment = await razorpay.payments.fetch(paymentId);
    
    // Update transaction in database with payment details
    const updatedTransaction = await updatePaymentTransaction(paymentId, {
      status: payment.status === 'captured' ? 'paid' : payment.status,
      payment_method: payment.method,
      bank: payment.bank,
      wallet: payment.wallet,
      vpa: payment.vpa,
      fee: payment.fee,
      tax: payment.tax
    });

    // Also update the razorpay_payment_id if it's not already set
    if (updatedTransaction && !updatedTransaction.razorpay_payment_id) {
      const client = await pool.connect();
      try {
        await client.query(
          `UPDATE payment_transactions 
           SET razorpay_payment_id = $1, updated_at = CURRENT_TIMESTAMP
           WHERE razorpay_order_id = $2`,
          [paymentId, orderId]
        );
      } finally {
        client.release();
      }
    }

    // Get complete transaction details
    const transaction = await getTransactionByPaymentId(paymentId);

    return NextResponse.json({
      success: true,
      message: 'Payment verified successfully',
      paymentId,
      orderId,
      transaction: {
        id: transaction?.id,
        status: transaction?.status,
        amount: transaction?.amount,
        payment_method: transaction?.payment_method,
        bank: transaction?.bank,
        wallet: transaction?.wallet,
        vpa: transaction?.vpa,
        fee: transaction?.fee,
        tax: transaction?.tax,
        created_at: transaction?.created_at
      }
    });
  } catch (error) {
    console.error('Error verifying payment:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to verify payment',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
