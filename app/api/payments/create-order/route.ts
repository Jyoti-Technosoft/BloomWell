import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { Pool } from 'pg';
import { createOrUpdateCustomer, createOrder, createPaymentTransaction } from '@/app/lib/database-operations';

const pool = new Pool({
  connectionString: process.env.NEON_DATABASE_URL,
});

export async function POST(request: NextRequest) {
  try {
    const requestData: {
  amount: number;
  currency?: string;
  medicineId: string;
  medicineName: string;
  evaluationId: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
} = await request.json() as {
  amount: number;
  currency?: string;
  medicineId: string;
  medicineName: string;
  evaluationId: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
};

    const amount = requestData.amount;
    const currency = requestData.currency || 'INR';
    const medicineId = requestData.medicineId;
    const medicineName = requestData.medicineName;
    const evaluationId = requestData.evaluationId;
    const userId = requestData.userId;
    const customerName = requestData.customerName;
    const customerEmail = requestData.customerEmail;
    const customerPhone = requestData.customerPhone;

    // Validate input
    if (!amount || !medicineId || !evaluationId || !userId || !customerName || !customerEmail) {
      return NextResponse.json(
        { error: 'Missing required fields: amount, medicineId, evaluationId, userId, customerName, customerEmail' },
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

    // Create or update customer in database with error handling
    let customer;
    try {
      customer = await createOrUpdateCustomer({
        userId,
        name: customerName,
        email: customerEmail,
        phone: customerPhone
      });
    } catch (customerError: unknown) {
      console.error('Customer creation failed:', customerError instanceof Error ? customerError.message : String(customerError));
      return NextResponse.json(
        { error: 'Failed to create customer record' },
        { status: 500 }
      );
    }

    // Create Razorpay customer if not exists
    let razorpayCustomerId = customer.razorpay_customer_id;
    if (!razorpayCustomerId) {
      try {
        const razorpayCustomer = await razorpay.customers.create({
          name: customerName,
          email: customerEmail,
          contact: customerPhone,
          fail_existing: 0
        });
        razorpayCustomerId = razorpayCustomer.id;
        
        // Update database with Razorpay customer ID
        const client = await pool.connect();
        try {
          await client.query(
            'UPDATE customers SET razorpay_customer_id = $1 WHERE id = $2',
            [razorpayCustomerId, customer.id]
          );
        } finally {
          client.release();
        }
      } catch (razorpayError) {
        console.error('Razorpay customer creation failed:', razorpayError);
      }
    }

    // Create receipt (max 40 characters)
    const receipt = `ord_${medicineId.slice(0, 8)}_${Date.now()}`;
    const orderData: {
  amount: number;
  currency: string;
  receipt: string;
  payment_capture: number;
  notes: {
    customer_id: string;
    medicine_id: string;
    medicine_name: string;
    user_id: string;
    app_customer_name: string;
    app_customer_email: string;
  };
} = {
      amount: amount * 100,
      currency,
      receipt,
      payment_capture: 1,
      notes: {
        customer_id: customer.id,
        medicine_id: medicineId,
        medicine_name: medicineName,
        user_id: userId,
        app_customer_name: customerName,
        app_customer_email: customerEmail
      }
    };

    let order;
    try {
      order = await razorpay.orders.create(orderData);
    } catch (orderError) {
      console.error('Razorpay order creation failed:', orderError);
      throw orderError;
    }

    // Save order and transaction to database
    let testClient;
    try {
      testClient = await pool.connect();
      await testClient.query('SELECT NOW()');
      testClient.release();
    } catch (dbTestError) {
      throw new Error(`Database connection failed: ${dbTestError instanceof Error ? dbTestError.message : 'Unknown error'}`);
    }
    
    try {
      await createOrder({
        razorpayOrderId: order.id,
        customerId: Number(customer.id),
        medicineId,
        medicineName,
        amount: amount * 100,
        currency,
        receipt
      });
    } catch (orderError: unknown) {
      throw new Error(`Order creation failed: ${orderError instanceof Error ? orderError.message : 'Unknown error'}`);
    }
    try {
      await createPaymentTransaction({
        razorpayOrderId: order.id,
        customerId: Number(customer.id),
        medicineId: evaluationId, // Use evaluationId instead of medicineId for payment tracking
        medicineName,
        amount: amount * 100,
        currency,
        status: 'created',
        email: customerEmail,
        contact: customerPhone,
        description: `Payment for ${medicineName}`,
        notes: order.notes
      });
    } catch (transactionError) {
      throw new Error(`Failed to create payment transaction: ${transactionError instanceof Error ? transactionError.message : 'Unknown error'}`);
    }

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
        receipt: order.receipt,
        created_at: order.created_at, // Add timestamp for age tracking
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
