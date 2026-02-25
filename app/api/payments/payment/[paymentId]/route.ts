import { NextRequest, NextResponse } from 'next/server';
import { getTransactionByPaymentId } from '@/app/lib/database-operations';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const paymentId = searchParams.get('paymentId');

    if (!paymentId) {
      return NextResponse.json(
        { error: 'Missing required parameter: paymentId' },
        { status: 400 }
      );
    }

    // Get transaction by payment ID
    const transaction = await getTransactionByPaymentId(paymentId);

    if (!transaction) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      transaction: {
        id: transaction.id,
        razorpayOrderId: transaction.razorpay_order_id,
        razorpayPaymentId: transaction.razorpay_payment_id,
        razorpaySignature: transaction.razorpay_signature,
        customerId: transaction.customer_id,
        medicineId: transaction.medicine_id,
        medicineName: transaction.medicine_name,
        amount: transaction.amount,
        currency: transaction.currency,
        status: transaction.status,
        paymentMethod: transaction.payment_method,
        bank: transaction.bank,
        wallet: transaction.wallet,
        vpa: transaction.vpa,
        email: transaction.email,
        contact: transaction.contact,
        description: transaction.description,
        notes: transaction.notes,
        fee: transaction.fee,
        tax: transaction.tax,
        createdAt: transaction.created_at,
        updatedAt: transaction.updated_at
      }
    });
  } catch (error) {
    console.error('Error fetching payment details:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch payment details',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
