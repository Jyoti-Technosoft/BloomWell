import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { v4 as uuidv4 } from 'uuid';
import pool from '@/app/lib/postgres';
import { logger, auditLog } from '@/app/lib/secure-logger';

export async function POST(request: NextRequest) {
  try {
    // Get NextAuth token from cookies
    const token = await getToken({ 
      req: request,
      secret: process.env.JWT_SECRET,
      secureCookie: process.env.NODE_ENV === 'production'
    });

    if (!token) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Get email from NextAuth token
    const userEmail = token.email as string;

    if (!userEmail) {
      return NextResponse.json(
        { error: 'Invalid token - no email found' },
        { status: 401 }
      );
    }

    // Get user from database
    const userResult = await pool.query('SELECT id FROM users WHERE email = $1', [userEmail]);
    
    if (userResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const userId = userResult.rows[0].id;

    const { evaluationId, medicineId, medicineName, amount, paymentId, paymentStatus } = await request.json();

    // Validate required fields
    if (!evaluationId || !medicineId || !amount || !paymentId) {
      return NextResponse.json(
        { error: 'Missing required fields: evaluationId, medicineId, amount, paymentId' },
        { status: 400 }
      );
    }

    // Check if evaluation is approved
    const evaluationResult = await pool.query(
      'SELECT status FROM evaluations WHERE id = $1 AND user_id = $2',
      [evaluationId, userId]
    );

    if (evaluationResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Evaluation not found' },
        { status: 404 }
      );
    }

    const evaluation = evaluationResult.rows[0];
    if (evaluation.status !== 'approved') {
      return NextResponse.json(
        { error: 'Evaluation must be approved before placing order' },
        { status: 400 }
      );
    }

    // Generate UUID for order
    const orderId = uuidv4();

    // Create order
    const result = await pool.query(
      `INSERT INTO orders (
        id, user_id, evaluation_id, medicine_id, medicine_name, 
        amount, payment_id, payment_status, order_status, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *`,
      [
        orderId,
        userId,
        evaluationId,
        medicineId,
        medicineName,
        amount,
        paymentId,
        paymentStatus || 'completed',
        'processing',
        new Date()
      ]
    );

    const order = result.rows[0];

    await auditLog({
      userId: userId,
      action: 'ORDER_CREATED',
      resource: 'order',
      timestamp: new Date(),
      success: true,
      details: { 
        orderId: order.id,
        evaluationId,
        medicineId,
        amount
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Order created successfully',
      order: {
        id: order.id,
        medicineId: order.medicine_id,
        medicineName: order.medicine_name,
        amount: order.amount,
        status: order.order_status,
        paymentStatus: order.payment_status,
        createdAt: order.created_at
      }
    });

  } catch (error) {
    logger.error('Order creation error', { 
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get NextAuth token from cookies
    const token = await getToken({ 
      req: request,
      secret: process.env.JWT_SECRET,
      secureCookie: process.env.NODE_ENV === 'production'
    });

    if (!token) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Get email from NextAuth token
    const userEmail = token.email as string;

    if (!userEmail) {
      return NextResponse.json(
        { error: 'Invalid token - no email found' },
        { status: 401 }
      );
    }

    // Get user from database
    const userResult = await pool.query('SELECT id FROM users WHERE email = $1', [userEmail]);
    
    if (userResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    const user = { id: userResult.rows[0].id };
    
    // Get orders for authenticated user
    const ordersResult = await pool.query(
      'SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC', 
      [user.id]
    );
    
    const orders = ordersResult.rows.map(row => ({
      id: row.id,
      evaluationId: row.evaluation_id,
      medicineId: row.medicine_id,
      medicineName: row.medicine_name,
      amount: row.amount,
      paymentId: row.payment_id,
      paymentStatus: row.payment_status,
      orderStatus: row.order_status,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));

    return NextResponse.json({ orders });

  } catch (error) {
    logger.error('Order fetch error', { 
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}
