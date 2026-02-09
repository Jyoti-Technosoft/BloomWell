import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.NEON_DATABASE_URL,
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const evaluationId = searchParams.get('evaluationId');

    if (!evaluationId) {
      return NextResponse.json(
        { error: 'Missing required parameter: evaluationId' },
        { status: 400 }
      );
    }

    // Check if there's a successful payment for this evaluation
    const client = await pool.connect();
    
    try {
      // Check for this evaluation with different statuses
      const paidResult = await client.query(
        `SELECT COUNT(*) as payment_count
         FROM payment_transactions 
         WHERE medicine_id = $1 AND status = 'paid'`,
        [evaluationId]
      );
      
      const capturedResult = await client.query(
        `SELECT COUNT(*) as payment_count
         FROM payment_transactions 
         WHERE medicine_id = $1 AND status = 'captured'`,
        [evaluationId]
      );
      
      const anyStatusResult = await client.query(
        `SELECT COUNT(*) as payment_count
         FROM payment_transactions 
         WHERE medicine_id = $1`,
        [evaluationId]
      );

      const paidCount = parseInt(paidResult.rows[0].payment_count);
      const capturedCount = parseInt(capturedResult.rows[0].payment_count);
      const totalCount = parseInt(anyStatusResult.rows[0].payment_count);
      
      // Consider both 'paid' and 'captured' as successful payments
      const hasPayment = (paidCount + capturedCount) > 0;
      const paymentCount = totalCount;

      return NextResponse.json({
        success: true,
        hasPayment,
        evaluationId,
        paymentCount
      });

    } finally {
      client.release();
    }

  } catch (error) {
    console.error('Error checking payment status:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to check payment status',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
