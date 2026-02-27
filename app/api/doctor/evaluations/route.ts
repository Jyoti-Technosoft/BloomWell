import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import pool from '@/app/lib/postgres';
import { decryptField } from '@/app/lib/encryption';

export async function GET(request: NextRequest) {
  try {
    // Get NextAuth token from cookies - using same pattern as dashboard API
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

    // Check if user is a doctor or admin
    const userRole = token.role as string;
    if (!['doctor', 'admin'].includes(userRole)) {
      return NextResponse.json(
        { error: 'Unauthorized - only doctors and admins can access evaluations' },
        { status: 403 }
      );
    }

    // Use token.id directly instead of email lookup
    const doctorId = token.id as string;

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');
    const status = searchParams.get('status');

    // Build query - filter by doctor_id for logged-in doctor
    let query = `
      SELECT e.*, u.full_name as patient_name, u.email as patient_email
      FROM evaluations e
      JOIN users u ON e.user_id = u.id
      WHERE 1=1
    `;
    
    const params: any[] = [];
    let paramIndex = 1;

    // Filter by logged-in doctor's ID
    if (userRole === 'doctor') {
      query += ` AND e.doctor_id = $${paramIndex}`;
      params.push(doctorId);
      paramIndex++;
    }

    // Filter by status if provided
    if (status) {
      query += ` AND e.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    query += ` ORDER BY e.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const evaluationsResult = await pool.query(query, params);

    // Process evaluations and decrypt patient data
    const evaluations = await Promise.all(
      evaluationsResult.rows.map(async (row) => {
        let decryptedResponses: { [key: string]: any } = {};
        
        try {
          const responses = JSON.parse(row.responses);
          
          // Decrypt each field in the responses
          for (const [key, value] of Object.entries(responses)) {
            if (value && typeof value === 'object' && 'encrypted' in value) {
              const decryptedValue = await decryptField(value as any);
              try {
                const parsed = JSON.parse(decryptedValue);
                decryptedResponses[key] = parsed;
              } catch (e) {
                decryptedResponses[key] = decryptedValue;
              }
            } else {
              decryptedResponses[key] = value;
            }
          }
        } catch (error) {
          console.error('Error decrypting evaluation responses:', error);
          decryptedResponses = { error: 'Failed to decrypt responses' };
        }

        return {
          id: row.id,
          patientName: row.patient_name,
          patientEmail: row.patient_email,
          medicineId: row.medicine_id,
          medicineName: row.medicine_name,
          evaluationType: row.evaluation_type,
          status: row.status,
          responses: decryptedResponses,
          createdAt: row.created_at,
          updatedAt: row.updated_at
        };
      })
    );

    return NextResponse.json({ evaluations });

  } catch (error) {
    console.error('Doctor evaluations error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch evaluations' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = await getToken({ 
      req: request,
      secret: process.env.JWT_SECRET,
      secureCookie: process.env.NODE_ENV === 'production'
    });

    if (!token || token.role !== 'doctor') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get doctor info
    const userEmail = token.email as string;
    const userResult = await pool.query('SELECT id FROM users WHERE email = $1', [userEmail]);
    
    if (userResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Doctor not found' },
        { status: 404 }
      );
    }

    const doctorId = userResult.rows[0].id;
    const evaluationId = params.id;
    const { action, notes } = await request.json();

    if (!['approve', 'reject', 'claim'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      );
    }

    // Get current evaluation to update responses
    const currentEvalQuery = 'SELECT responses FROM evaluations WHERE id = $1';
    const currentResult = await pool.query(currentEvalQuery, [evaluationId]);

    if (currentResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Evaluation not found' },
        { status: 404 }
      );
    }

    let currentResponses = {};
    try {
      currentResponses = JSON.parse(currentResult.rows[0].responses || '{}');
    } catch (e) {
      currentResponses = {};
    }

    // Update responses with doctor info
    const updatedResponses = {
      ...currentResponses,
      reviewedBy: doctorId,
      reviewedAt: new Date().toISOString(),
      reviewedByEmail: userEmail,
      action: action,
      notes: notes || ''
    };

    // Update evaluation status and responses
    const newStatus = action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'pending_review';
    
    const updateQuery = `
      UPDATE evaluations 
      SET status = $1, responses = $2, updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
      RETURNING *
    `;

    const result = await pool.query(updateQuery, [newStatus, JSON.stringify(updatedResponses), evaluationId]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Evaluation not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Evaluation ${action}d successfully`,
      evaluation: result.rows[0]
    });

  } catch (error) {
    console.error('Update evaluation error:', error);
    return NextResponse.json(
      { error: 'Failed to update evaluation' },
      { status: 500 }
    );
  }
}
