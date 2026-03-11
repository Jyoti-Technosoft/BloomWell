import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.NEON_DATABASE_URL,
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

    // Check if customer already exists first
    const existingCustomer = await client.query(
      'SELECT id, user_id, name, email FROM customers WHERE user_id = $1',
      [userData.userId]
    );
    
    let result;
    if (existingCustomer.rows.length > 0) {
      // Update existing customer
      result = await client.query(
        `UPDATE customers 
         SET name = $1, email = $2, phone = $3, updated_at = CURRENT_TIMESTAMP
         WHERE user_id = $4
         RETURNING *`,
        [userData.name, userData.email, userData.phone, userData.userId]
      );
    } else {
      // Insert new customer
      result = await client.query(
        `INSERT INTO customers (user_id, name, email, phone)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [userData.userId, userData.name, userData.email, userData.phone]
      );
    }
    
    return result.rows[0];
  } catch (error) {
    // console.error('Error in createOrUpdateCustomer:', error);
      console.error('❌ Error in createOrUpdateCustomer:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      code: (error as { code?: string }).code,
      detail: (error as { detail?: string }).detail,
      constraint: (error as { constraint?: string }).constraint,
      table: (error as { table?: string }).table,
      hint: (error as { hint?: string }).hint,
      where: (error as { where?: string }).where,
      userData: {
        userId: userData.userId,
        name: userData.name,
        email: userData.email,
        phone: userData.phone
      }
    });
    throw error;
  } finally {
    if (client) {
      client.release();
    }
  }
}

// Update user's customer_id after first payment
export async function updateUserCustomerId(userId: string, customerId: number) {
  let client;
  try {
    client = await pool.connect();
    
    // Check which database we're connected to
    const dbCheck = await client.query('SELECT current_database(), current_user');
    console.log('🔍 Database connection info:', dbCheck.rows);
    
    // Check all tables in the database
    const tableCheck = await client.query(
      `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`
    );
    console.log('🔍 Available tables:', tableCheck.rows.map(row => row.table_name));
    
    // Check users table structure
    const usersTableCheck = await client.query(
      `SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'users' ORDER BY ordinal_position`
    );
    console.log('🔍 Users table structure:', usersTableCheck.rows);
    
    // First, check if the column exists
    const columnCheck = await client.query(
      `SELECT column_name 
       FROM information_schema.columns 
       WHERE table_name = 'users' AND column_name = 'customer_id'`
    );
    
    console.log('🔍 Column check result:', columnCheck.rows);
    
    if (columnCheck.rows.length === 0) {
      console.error('❌ customer_id column does not exist in users table');
      console.log('🔧 Available columns in users table:', usersTableCheck.rows.map(row => `${row.column_name} (${row.data_type})`));
      throw new Error('customer_id column does not exist in users table');
    }
    
    // Check if user exists
    const userCheck = await client.query(
      `SELECT id, customer_id FROM users WHERE id = $1`,
      [userId]
    );
    
    console.log('🔍 User check result:', userCheck.rows);
    
    if (userCheck.rows.length === 0) {
      console.error('❌ User not found:', userId);
      throw new Error(`User not found: ${userId}`);
    }
    
    // Update the user
    const result = await client.query(
      `UPDATE users 
       SET customer_id = $1
       WHERE id = $2
       RETURNING *`,
      [customerId, userId]
    );
    
    console.log(`✅ Updated user ${userId} with customer_id ${customerId}, rows affected: ${result.rowCount}`);
    console.log('🔍 Updated user data:', result.rows[0]);
    
    return result.rows[0];
  } catch (error) {
    console.error('Error in updateUserCustomerId:', error);
    throw error;
  } finally {
    if (client) {
      client.release();
    }
  }
}

// Get user with customer information
export async function getUserWithCustomerInfo(userId: string) {
  let client;
  try {
    client = await pool.connect();
    const result = await client.query(
      `SELECT u.*, c.id as customer_exists, c.razorpay_customer_id
       FROM users u
       LEFT JOIN customers c ON u.customer_id = c.id
       WHERE u.id = $1`,
      [userId]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Error in getUserWithCustomerInfo:', error);
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
    console.log('🔄 Creating order with data:', {
      razorpayOrderId: orderData.razorpayOrderId,
      customerId: orderData.customerId,
      medicineId: orderData.medicineId,
      medicineName: orderData.medicineName,
      amount: orderData.amount,
      currency: orderData.currency,
      receipt: orderData.receipt
    });
    
    client = await pool.connect();
    console.log('✅ Database connected for order creation');
    
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
    
    console.log('✅ Order created successfully:', result.rows[0]);
    return result.rows[0];
  } catch (error) {
    console.error('❌ Error in createOrder:', error);
    console.error('🔧 Error details:', {
      message: error instanceof Error ? error.message : String(error),
      code: error instanceof Error && 'code' in error ? error.code : undefined,
      detail: error instanceof Error && 'detail' in error ? error.detail : undefined,
      constraint: error instanceof Error && 'constraint' in error ? error.constraint : undefined,
      table: error instanceof Error && 'table' in error ? error.table : undefined,
      column: error instanceof Error && 'column' in error ? error.column : undefined,
      severity: error instanceof Error && 'severity' in error ? error.severity : undefined
    });
    throw error;
  } finally {
    if (client) {
      client.release();
      console.log('🔄 Database connection released for order creation');
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
  notes?: Record<string, unknown>;
  fee?: number;
  tax?: number;
}) {
  let client;
  try {
    console.log('🔄 Creating payment transaction with data:', {
      razorpayOrderId: transactionData.razorpayOrderId,
      razorpayPaymentId: transactionData.razorpayPaymentId,
      customerId: transactionData.customerId,
      medicineId: transactionData.medicineId,
      medicineName: transactionData.medicineName,
      amount: transactionData.amount,
      currency: transactionData.currency,
      status: transactionData.status,
      email: transactionData.email,
      contact: transactionData.contact
    });
    
    client = await pool.connect();
    console.log('✅ Database connected for payment transaction creation');
    
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
    
    console.log('✅ Payment transaction created successfully:', result.rows[0]);
    return result.rows[0];
  } catch (error) {
    console.error('❌ Error in createPaymentTransaction:', error);
    console.error('🔧 Error details:', {
      message: error instanceof Error ? error.message : String(error),
      code: error instanceof Error && 'code' in error ? error.code : undefined,
      detail: error instanceof Error && 'detail' in error ? error.detail : undefined,
      constraint: error instanceof Error && 'constraint' in error ? error.constraint : undefined,
      table: error instanceof Error && 'table' in error ? error.table : undefined,
      column: error instanceof Error && 'column' in error ? error.column : undefined,
      severity: error instanceof Error && 'severity' in error ? error.severity : undefined
    });
    throw error;
  } finally {
    if (client) {
      client.release();
      console.log('🔄 Database connection released for payment transaction creation');
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

export async function getCustomerBalance(customerId: number) {
  const client = await pool.connect();
  try {
    const result = await client.query(
      `SELECT 
         COUNT(*) as total_transactions,
         COUNT(CASE WHEN status = 'paid' THEN 1 END) as successful_transactions,
         COALESCE(SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END), 0) as total_paid,
         COALESCE(SUM(CASE WHEN status = 'paid' THEN (amount - fee - tax) ELSE 0 END), 0) as net_balance,
         COALESCE(SUM(fee), 0) as total_fees,
         COALESCE(SUM(tax), 0) as total_taxes
       FROM payment_transactions 
       WHERE customer_id = $1`,
      [customerId]
    );
    return result.rows[0];
  } finally {
    client.release();
  }
}
