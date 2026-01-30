import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20, // Maximum number of connections in the pool
  idleTimeoutMillis: 30000, // How long a client is allowed to remain idle before being closed
  connectionTimeoutMillis: 2000, // How long to wait when connecting a new client
});

// Handle pool errors
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

// Customer operations
export async function createOrUpdateCustomer(userData: {
  userId: string;
  name: string;
  email: string;
  phone?: string;
}) {
  let client;
  try {
    client = await pool.connect();
    const result = await client.query(
      `INSERT INTO customers (user_id, name, email, phone)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (user_id) 
       DO UPDATE SET 
         name = EXCLUDED.name,
         email = EXCLUDED.email,
         phone = EXCLUDED.phone,
         updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [userData.userId, userData.name, userData.email, userData.phone]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Error in createOrUpdateCustomer:', error);
    throw error;
  } finally {
    if (client) {
      client.release();
    }
  }
}

// Order operations
export async function createOrder(orderData: {
  razorpayOrderId: string;
  customerId: number;
  medicineId: string;
  medicineName: string;
  amount: number;
  currency: string;
  receipt: string;
}) {
  let client;
  try {
    client = await pool.connect();
    const result = await client.query(
      `INSERT INTO orders (razorpay_order_id, customer_id, medicine_id, medicine_name, amount, currency, receipt)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        orderData.razorpayOrderId,
        orderData.customerId,
        orderData.medicineId,
        orderData.medicineName,
        orderData.amount,
        orderData.currency,
        orderData.receipt
      ]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Error in createOrder:', error);
    throw error;
  } finally {
    if (client) {
      client.release();
    }
  }
}

// Payment transaction operations
export async function createPaymentTransaction(transactionData: {
  razorpayOrderId: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  customerId: number;
  medicineId: string;
  medicineName: string;
  amount: number;
  currency: string;
  status: string;
  paymentMethod?: string;
  bank?: string;
  wallet?: string;
  vpa?: string;
  email?: string;
  contact?: string;
  description?: string;
  notes?: any;
  fee?: number;
  tax?: number;
}) {
  let client;
  try {
    client = await pool.connect();
    const result = await client.query(
      `INSERT INTO payment_transactions (
        razorpay_order_id, razorpay_payment_id, razorpay_signature,
        customer_id, medicine_id, medicine_name, amount, currency,
        status, payment_method, bank, wallet, vpa, email, contact,
        description, notes, fee, tax
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
       RETURNING *`,
      [
        transactionData.razorpayOrderId,
        transactionData.razorpayPaymentId,
        transactionData.razorpaySignature,
        transactionData.customerId,
        transactionData.medicineId,
        transactionData.medicineName,
        transactionData.amount,
        transactionData.currency,
        transactionData.status,
        transactionData.paymentMethod,
        transactionData.bank,
        transactionData.wallet,
        transactionData.vpa,
        transactionData.email,
        transactionData.contact,
        transactionData.description,
        JSON.stringify(transactionData.notes),
        transactionData.fee || 0,
        transactionData.tax || 0
      ]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Error in createPaymentTransaction:', error);
    throw error;
  } finally {
    if (client) {
      client.release();
    }
  }
}

export async function updatePaymentTransaction(
  razorpayPaymentId: string,
  updateData: Partial<{
    status: string;
    payment_method: string;
    bank: string;
    wallet: string;
    vpa: string;
    fee: number;
    tax: number;
  }>
) {
  const client = await pool.connect();
  try {
    const setClause = Object.keys(updateData)
      .map((key, index) => `${key} = $${index + 2}`)
      .join(', ');
    
    const values = Object.values(updateData);
    
    const result = await client.query(
      `UPDATE payment_transactions 
       SET ${setClause}, updated_at = CURRENT_TIMESTAMP
       WHERE razorpay_payment_id = $1
       RETURNING *`,
      [razorpayPaymentId, ...values]
    );
    return result.rows[0];
  } finally {
    client.release();
  }
}

export async function getCustomerTransactions(customerId: number) {
  const client = await pool.connect();
  try {
    const result = await client.query(
      `SELECT * FROM payment_transactions 
       WHERE customer_id = $1 
       ORDER BY created_at DESC`,
      [customerId]
    );
    return result.rows;
  } finally {
    client.release();
  }
}

export async function getTransactionByPaymentId(paymentId: string) {
  const client = await pool.connect();
  try {
    const result = await client.query(
      `SELECT * FROM payment_transactions 
       WHERE razorpay_payment_id = $1`,
      [paymentId]
    );
    return result.rows[0];
  } finally {
    client.release();
  }
}
