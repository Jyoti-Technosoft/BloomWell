import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { v4 as uuidv4 } from 'uuid';
import pool from '@/app/lib/postgres';
import { logger, auditLog } from '@/app/lib/secure-logger';
import { encryptField, decryptField } from '@/app/lib/encryption';

interface EvaluationData {
  medicineId: string;
  medicineName: string;
  birthday: string;
  pregnant: string;
  currentlyUsingMedicines: string;
  hasDiabetes: string;
  seenDoctorLastTwoYears: string;
  medicalConditions: string[];
  height: string;
  weight: string;
  targetWeight: string;
  goals: string[];
  allergies: string;
  currentMedications: string;
  additionalInfo: string;
  lastFourSSN: string;
  primaryGoal: string;
  triedWeightLossMethods: string;
  activityLevel: string;
  sleepHours: string;
  stressLevel: string;
  dietaryRestrictions: string[];
  currentWeightliftingRoutine: string;
  proteinIntake: string;
  workoutFrequency: string;
  healthConcerns: string[];
  sleepIssues: string[];
  stressTriggers: string[];
  stressManagementTechniques: string[];
  userId?: string;
  doctorId?: string; // NEW: Doctor assigned to review this evaluation
}

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

    const evaluationData: EvaluationData = await request.json();

    // Validate doctorId if provided
    if (evaluationData.doctorId) {
      const doctorResult = await pool.query(
        'SELECT id, full_name, role FROM users WHERE id = $1 AND role = $2',
        [evaluationData.doctorId, 'doctor']
      );
      
      if (doctorResult.rows.length === 0) {
        return NextResponse.json(
          { error: 'Invalid doctor selected' },
          { status: 400 }
        );
      }
    } else {
      console.log('⚠️ No doctor selected - will use default assignment');
    }

    // Get goal-specific required fields
    const getGoalSpecificRequiredFields = (primaryGoal: string): string[] => {
      const baseFields = [
        'medicineId', 'medicineName', 'birthday', 'pregnant', 'currentlyUsingMedicines',
        'hasDiabetes', 'seenDoctorLastTwoYears', 'primaryGoal', 'lastFourSSN'
      ];

      switch (primaryGoal) {
        case 'Weight Loss':
          return [...baseFields, 'height', 'weight', 'targetWeight', 'triedWeightLossMethods', 'goals', 'allergies', 'dietaryRestrictions'];
        case 'Muscle Gain':
          return [...baseFields, 'height', 'weight', 'targetWeight', 'currentWeightliftingRoutine', 'workoutFrequency', 'proteinIntake', 'goals', 'allergies', 'dietaryRestrictions'];
        case 'Improved Health':
          return [...baseFields, 'medicalConditions', 'healthConcerns', 'goals', 'allergies', 'dietaryRestrictions'];
        case 'Better Sleep':
          return [...baseFields, 'activityLevel', 'sleepHours', 'stressLevel', 'sleepIssues', 'goals', 'allergies', 'dietaryRestrictions'];
        case 'Stress Reduction':
          return [...baseFields, 'activityLevel', 'sleepHours', 'stressLevel', 'stressTriggers', 'stressManagementTechniques', 'goals', 'allergies', 'dietaryRestrictions'];
        default:
          return [...baseFields, 'height', 'weight', 'targetWeight', 'goals', 'allergies', 'dietaryRestrictions'];
      }
    };

    const requiredFields = getGoalSpecificRequiredFields(evaluationData.primaryGoal);

    for (const field of requiredFields) {
      const value = evaluationData[field as keyof EvaluationData];
      
      // Special handling for string fields that might be empty
      if (field === 'allergies' || field === 'currentlyUsingMedicines' || field === 'additionalInfo' || field === 'primaryGoal' || field === 'triedWeightLossMethods' || field === 'activityLevel' || field === 'sleepHours' || field === 'stressLevel') {
        if (!value || (typeof value === 'string' && value.trim() === '')) {
          return NextResponse.json(
            { error: `Missing required field: ${field}` },
            { status: 400 }
          );
        }
      } else if (field === 'medicalConditions' || field === 'goals' || field === 'dietaryRestrictions') {
        // Array fields
        if (!value || !Array.isArray(value) || value.length === 0) {
          return NextResponse.json(
            { error: `Missing required field: ${field}` },
            { status: 400 }
          );
        }
      } else {
        // Other required fields
        if (!value) {
          return NextResponse.json(
            { error: `Missing required field: ${field}` },
            { status: 400 }
          );
        }
      }
    }

    // Validate SSN format (exactly 4 digits)
    if (!/^\d{4}$/.test(evaluationData.lastFourSSN)) {
      return NextResponse.json(
        { error: 'Invalid SSN format. Must be exactly 4 digits.' },
        { status: 400 }
      );
    }

    const evaluationFields = [
      'birthday', 'pregnant', 'currentlyUsingMedicines', 'hasDiabetes', 
      'seenDoctorLastTwoYears', 'medicalConditions', 'height', 'weight', 
      'targetWeight', 'goals', 'allergies', 'currentMedications', 
      'additionalInfo', 'lastFourSSN', 'primaryGoal', 'triedWeightLossMethods',
      'activityLevel', 'sleepHours', 'stressLevel', 'dietaryRestrictions',
      'currentWeightliftingRoutine', 'proteinIntake', 'workoutFrequency',
      'healthConcerns', 'sleepIssues', 'stressTriggers', 'stressManagementTechniques'
    ];

    const manualEncryptedResponses: { [key: string]: any } = {};
    for (const field of evaluationFields) {
      const value = (evaluationData as any)[field];
      // Include empty strings to avoid NULL values in database
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          manualEncryptedResponses[field] = await encryptField(JSON.stringify(value));
        } else {
          manualEncryptedResponses[field] = await encryptField(String(value));
        }
      }
    }

    try {
      // Generate UUID for evaluation ID
      const evaluationId = uuidv4();
      
      const result = await pool.query(
        `INSERT INTO evaluations (
          id, user_id, doctor_id, medicine_id, medicine_name, evaluation_type, responses, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING id`,
        [
          evaluationId, // Generated UUID
          userId || null, // Ensure userId is handled properly
          evaluationData.doctorId || null, // NEW: Doctor assigned to review
          evaluationData.medicineId || 'unknown', // Provide default if null
          evaluationData.medicineName || 'Unknown Medicine', // Provide default if null
          evaluationData.primaryGoal?.toLowerCase().replace(' ', '-') || 'general', // Provide default if null
          JSON.stringify(manualEncryptedResponses), // Use manual encrypted data
          'pending_review'
        ]
      );

      const evaluationRecord = { id: result.rows[0].id };

      // Log successful evaluation submission
      if (userId) {
        await auditLog({
          userId: userId,
          action: 'EVALUATION_SUBMITTED',
          resource: 'evaluation',
          timestamp: new Date(),
          success: true,
          details: { 
            evaluationId: evaluationRecord.id,
            medicineId: evaluationData.medicineId,
            evaluationType: evaluationData.primaryGoal?.toLowerCase().replace(' ', '-') || 'general'
          }
        });
      }

      // In a real application, you would:
      // 1. Send notification to medical team
      // 2. Create patient record if needed
      // 3. Schedule consultation
      // 4. Send confirmation email

      return NextResponse.json({
        success: true,
        message: 'Evaluation submitted successfully',
        evaluationId: evaluationRecord.id
      });
    } catch (insertError) {
      console.error('Database INSERT error:', insertError);
      throw insertError;
    }

  } catch (error) {
    logger.error('Evaluation submission error', { 
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    
    await auditLog({
      action: 'EVALUATION_SUBMISSION_FAILED',
      resource: 'evaluation',
      timestamp: new Date(),
      success: false,
      details: { error: error instanceof Error ? error.message : 'Unknown error' }
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

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    // Check user role and fetch accordingly
    const userRole = token.role as string;
    
    if (userRole === 'doctor') {
      // DOCTOR: Fetch evaluations assigned to this doctor
      const doctorId = token.id as string;
      
      let query = `
        SELECT e.*, u.full_name as patient_name, u.email as patient_email
        FROM evaluations e
        JOIN users u ON e.user_id = u.id
        WHERE e.doctor_id = $1
      `;
      
      const params: any[] = [doctorId];
      let paramIndex = 2;

      // Filter by status if provided
      if (status && status !== 'all') {
        query += ` AND e.status = $${paramIndex}`;
        params.push(status);
        paramIndex++;
      }

      query += ` ORDER BY e.created_at DESC`;

      const evaluationsResult = await pool.query(query, params);

      const evaluations = await Promise.all(
        evaluationsResult.rows.map(async (row) => {
          let decryptedResponses: { [key: string]: any } = {};
          let decryptedPatientName = row.patient_name;
          let decryptedPatientEmail = row.patient_email;
          
          try {
            // Decrypt patient name if it's encrypted
            if (row.patient_name) {
              if (typeof row.patient_name === 'object' && 'encrypted' in row.patient_name) {
                decryptedPatientName = await decryptField(row.patient_name);
              } else if (typeof row.patient_name === 'string') {
                // Check if it's a JSON string that needs parsing
                try {
                  const parsed = JSON.parse(row.patient_name);
                  if (typeof parsed === 'object' && 'encrypted' in parsed) {
                    decryptedPatientName = await decryptField(parsed);
                  } else {
                    decryptedPatientName = parsed;
                  }
                } catch (parseError) {
                  // It's a plain string, use as-is
                  decryptedPatientName = row.patient_name;
                }
              }
            }
            
            // Decrypt patient email if it's encrypted
            if (row.patient_email) {
              if (typeof row.patient_email === 'object' && 'encrypted' in row.patient_email) {
                decryptedPatientEmail = await decryptField(row.patient_email);
              } else if (typeof row.patient_email === 'string') {
                // Check if it's a JSON string that needs parsing
                try {
                  const parsed = JSON.parse(row.patient_email);
                  if (typeof parsed === 'object' && 'encrypted' in parsed) {
                    decryptedPatientEmail = await decryptField(parsed);
                  } else {
                    decryptedPatientEmail = parsed;
                  }
                } catch (parseError) {
                  // It's a plain string, use as-is
                  decryptedPatientEmail = row.patient_email;
                }
              }
            }
            
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
            patientName: decryptedPatientName,
            patientEmail: decryptedPatientEmail,
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

    } else {
      // PATIENT: Fetch their own evaluations
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
      
      // Get evaluations for authenticated patient
      let query = 'SELECT * FROM evaluations WHERE user_id = $1';
      const params: any[] = [user.id];
      
      // Filter by status if provided
      if (status && status !== 'all') {
        query += ' AND status = $2';
        params.push(status);
      }
      
      query += ' ORDER BY created_at DESC';

      const evaluationsResult = await pool.query(query, params);

      const evaluations = await Promise.all(
        evaluationsResult.rows.map(async (row) => {
          let decryptedResponses: { [key: string]: any } = {};
          try {
            let responses;
            if (typeof row.responses === 'string') {
              try {
                responses = JSON.parse(row.responses);
              } catch (parseError) {
                console.error('Failed to parse responses as JSON:', parseError);
                console.error('Raw responses:', row.responses);
                responses = {};
              }
            } else if (typeof row.responses === 'object') {
              responses = row.responses;
            } else {
              console.error('Unexpected responses format:', typeof row.responses, row.responses);
              responses = {};
            }
            
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
            console.error('Error processing evaluation responses:', error);
            console.error('Row data:', row);
            decryptedResponses = { error: 'Failed to process responses' };
          }
          
          return {
            id: row.id,
            medicineId: row.medicine_id,
            medicineName: row.medicine_name,
            evaluationType: row.evaluation_type,
            responses: decryptedResponses,
            status: row.status,
            createdAt: row.created_at
          };
        })
      );
      return NextResponse.json({ evaluations });
    }

  } catch (error) {
    console.error('Error fetching evaluations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch evaluations' },
      { status: 500 }
    );
  }
}
