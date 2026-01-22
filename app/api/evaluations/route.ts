import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import pool from '../../lib/postgres';
import { logger, auditLog } from '../../lib/secure-logger';
import { encryptSensitiveFields, decryptSensitiveFields } from '../../lib/encryption';

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

    // Get user from authenticated session
    // Create evaluation record in PostgreSQL with encryption
    const encryptedResponses = encryptSensitiveFields({
      birthday: evaluationData.birthday,
      pregnant: evaluationData.pregnant,
      currentlyUsingMedicines: evaluationData.currentlyUsingMedicines,
      hasDiabetes: evaluationData.hasDiabetes,
      seenDoctorLastTwoYears: evaluationData.seenDoctorLastTwoYears,
      medicalConditions: evaluationData.medicalConditions,
      height: evaluationData.height,
      weight: evaluationData.weight,
      targetWeight: evaluationData.targetWeight,
      goals: evaluationData.goals,
      allergies: evaluationData.allergies,
      currentMedications: evaluationData.currentMedications || '',
      additionalInfo: evaluationData.additionalInfo || '',
      lastFourSSN: evaluationData.lastFourSSN,
      primaryGoal: evaluationData.primaryGoal,
      triedWeightLossMethods: evaluationData.triedWeightLossMethods,
      activityLevel: evaluationData.activityLevel,
      sleepHours: evaluationData.sleepHours,
      stressLevel: evaluationData.stressLevel,
      dietaryRestrictions: evaluationData.dietaryRestrictions,
      currentWeightliftingRoutine: evaluationData.currentWeightliftingRoutine,
      proteinIntake: evaluationData.proteinIntake,
      workoutFrequency: evaluationData.workoutFrequency,
      healthConcerns: evaluationData.healthConcerns,
      sleepIssues: evaluationData.sleepIssues,
      stressTriggers: evaluationData.stressTriggers,
      stressManagementTechniques: evaluationData.stressManagementTechniques
    });

    const result = await pool.query(
      `INSERT INTO evaluations (
        user_id, medicine_id, medicine_name, evaluation_type, responses, status
      ) VALUES ($1, $2, $3, $4, $5)
      RETURNING id`,
      [
        userId,
        evaluationData.medicineId,
        evaluationData.medicineName,
        evaluationData.primaryGoal.toLowerCase().replace(' ', '-'),
        JSON.stringify(encryptedResponses),
        'pending_review'
      ]
    );

    const evaluationRecord = { id: result.rows[0].id };

    // Log successful evaluation submission
    await auditLog({
      userId: userId,
      action: 'EVALUATION_SUBMITTED',
      resource: 'evaluation',
      timestamp: new Date(),
      success: true,
      details: { 
        evaluationId: evaluationRecord.id,
        medicineId: evaluationData.medicineId,
        evaluationType: evaluationData.primaryGoal.toLowerCase().replace(' ', '-')
      }
    });

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
    
    // Get evaluations for authenticated user
    const evaluationsResult = await pool.query('SELECT * FROM evaluations WHERE user_id = $1 ORDER BY created_at DESC', [user.id]);
    const evaluations = evaluationsResult.rows.map(row => ({
      id: row.id,
      medicineId: row.medicine_id,
      medicineName: row.medicine_name,
      evaluationType: row.evaluation_type,
      responses: row.responses,
      status: row.status,
      createdAt: row.created_at
    }));
    return NextResponse.json({ evaluations });

  } catch (error) {
    console.error('Error fetching evaluations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch evaluations' },
      { status: 500 }
    );
  }
}
