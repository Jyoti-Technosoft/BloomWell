import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { Pool } from 'pg';
import { updatePaymentTransaction, getTransactionByPaymentId, updateUserCustomerId } from '@/app/lib/database-operations';

const pool = new Pool({
  connectionString: process.env.NEON_DATABASE_URL,
});

export async function POST(request: NextRequest) {
  try {
    const requestBody = await request.json();
    
    const { orderId, paymentId, signature } = requestBody;

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
    const signatureBody = orderId + '|' + paymentId;
    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(signatureBody.toString())
      .digest('hex');

    const isValidSignature = expectedSignature === signature;

    if (!isValidSignature) {
      return NextResponse.json(
        { error: 'Invalid payment signature' },
        { status: 400 }
      );
    }

    // Fetch payment details from Razorpay
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: keySecret,
    });

    const payment = await razorpay.payments.fetch(paymentId);
    
    // First, update the payment transaction with the payment_id
    const client = await pool.connect();
    try {
      const updateResult = await client.query(
        `UPDATE payment_transactions 
         SET razorpay_payment_id = $1, updated_at = CURRENT_TIMESTAMP
         WHERE razorpay_order_id = $2
         RETURNING *`,
        [paymentId, orderId]
      );
      
      if (updateResult.rows.length > 0) {
        // Payment transaction updated successfully
      } else {
        console.error('No transaction found for order_id:', orderId);
      }
    } catch (error) {
      console.error('Failed to update payment_id:', error);
    } finally {
      client.release();
    }
    
    // Update transaction in database with payment details
    let updatedTransaction;
    try {
      updatedTransaction = await updatePaymentTransaction(paymentId, {
        status: payment.status === 'captured' ? 'paid' : payment.status,
        payment_method: payment.method,
        bank: payment.bank || undefined,
        wallet: payment.wallet || undefined,
        vpa: payment.vpa || undefined,
        fee: payment.fee || 0,
        tax: payment.tax || 0
      });
      
      if (updatedTransaction) {
        // Payment transaction updated successfully
      } else {
        console.error('No transaction found to update - payment transaction was never created during order creation');
        console.error('This means the create-order API failed or was not called');
      }
    } catch (dbError) {
      console.error('Failed to update payment transaction:', dbError);      
      // Continue with response even if DB update fails
      console.log('Continuing without database update');
    }

    // Link user to customer on first successful payment
    if (payment.status === 'captured' && updatedTransaction) {
      try {
        // Get the transaction details to find user_id and customer_id
        const client = await pool.connect();
        
        const transactionResult = await client.query(
          `SELECT pt.*, c.user_id 
           FROM payment_transactions pt
           JOIN customers c ON pt.customer_id = c.id
           WHERE pt.id = $1`,
          [updatedTransaction.id]
        );
        
        if (transactionResult.rows.length > 0) {
          const transaction = transactionResult.rows[0];
          const userId = transaction.user_id;
          const customerId = transaction.customer_id;
          
          // Use the proper function to update user's customer_id
          await updateUserCustomerId(userId, customerId);
          
          console.log(`✅ Linked user ${userId} to customer ${customerId}`);
        }
        
        client.release();
      } catch (error) {
        console.error('Error linking user to customer:', error);
        // Don't fail the payment if user linking fails
      }
    }

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

    const response = {
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
    };
    
    return NextResponse.json(response);
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
