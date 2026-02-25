-- Customers table
CREATE TABLE IF NOT EXISTS customers (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    razorpay_customer_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Payment transactions table
CREATE TABLE IF NOT EXISTS payment_transactions (
    id SERIAL PRIMARY KEY,
    razorpay_order_id VARCHAR(255) NOT NULL,
    razorpay_payment_id VARCHAR(255) UNIQUE,
    razorpay_signature VARCHAR(255),
    customer_id INTEGER REFERENCES customers(id),
    medicine_id VARCHAR(255) NOT NULL,
    medicine_name VARCHAR(255) NOT NULL,
    amount INTEGER NOT NULL, -- in paise
    currency VARCHAR(3) DEFAULT 'INR',
    status VARCHAR(50) DEFAULT 'created', -- created, paid, failed, refunded
    payment_method VARCHAR(100),
    bank VARCHAR(100),
    wallet VARCHAR(100),
    vpa VARCHAR(100),
    email VARCHAR(255),
    contact VARCHAR(20),
    description TEXT,
    notes JSONB,
    fee INTEGER DEFAULT 0,
    tax INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Orders table (for order management)
CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    razorpay_order_id VARCHAR(255) UNIQUE NOT NULL,
    customer_id INTEGER REFERENCES customers(id),
    medicine_id VARCHAR(255) NOT NULL,
    medicine_name VARCHAR(255) NOT NULL,
    amount INTEGER NOT NULL,
    currency VARCHAR(3) DEFAULT 'INR',
    receipt VARCHAR(255),
    status VARCHAR(50) DEFAULT 'created',
    attempts INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_payment_transactions_razorpay_order_id ON payment_transactions(razorpay_order_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_customer_id ON payment_transactions(customer_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_status ON payment_transactions(status);
CREATE INDEX IF NOT EXISTS idx_customers_user_id ON customers(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_razorpay_order_id ON orders(razorpay_order_id);
