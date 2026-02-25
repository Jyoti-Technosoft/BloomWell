import { NextRequest, NextResponse } from 'next/server';
import { getCustomerTransactions, createOrUpdateCustomer, getCustomerBalance } from '@/app/lib/database-operations';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing required parameter: userId' },
        { status: 400 }
      );
    }

    // First get customer by userId
    const customer = await createOrUpdateCustomer({
      userId,
      name: '', // Will be updated if customer exists
      email: '', // Will be updated if customer exists
    });

    // Get customer transactions
    const transactions = await getCustomerTransactions(customer.id);

    // Get customer balance
    const balance = await getCustomerBalance(customer.id);

    return NextResponse.json({
      success: true,
      customer: {
        id: customer.id,
        userId: customer.user_id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        createdAt: customer.created_at
      },
      balance: {
        totalTransactions: parseInt(balance.total_transactions),
        successfulTransactions: parseInt(balance.successful_transactions),
        totalPaid: parseInt(balance.total_paid),
        netBalance: parseInt(balance.net_balance),
        totalFees: parseInt(balance.total_fees),
        totalTaxes: parseInt(balance.total_taxes)
      },
      transactions: transactions.map(t => ({
        id: t.id,
        razorpayOrderId: t.razorpay_order_id,
        razorpayPaymentId: t.razorpay_payment_id,
        medicineId: t.medicine_id,
        medicineName: t.medicine_name,
        amount: t.amount,
        currency: t.currency,
        status: t.status,
        paymentMethod: t.payment_method,
        bank: t.bank,
        wallet: t.wallet,
        vpa: t.vpa,
        email: t.email,
        contact: t.contact,
        description: t.description,
        fee: t.fee,
        tax: t.tax,
        createdAt: t.created_at,
        updatedAt: t.updated_at
      }))
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch transactions',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
