import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { postgresDb } from '../../lib/postgres-db';
import { logger, auditLog } from '../../lib/secure-logger';
import { encryptSensitiveFields } from '../../lib/encryption';

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
    const user = await postgresDb.users.findByEmail(userEmail);
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

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
    const userId = user.id;

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

    const evaluationRecord = await postgresDb.evaluations.create({
      user_id: userId,
      medicine_id: evaluationData.medicineId,
      medicine_name: evaluationData.medicineName,
      evaluation_type: evaluationData.primaryGoal.toLowerCase().replace(' ', '-'),
      responses: encryptedResponses,
      status: 'pending_review'
    });

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
    const user = await postgresDb.users.findByEmail(userEmail);
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Get evaluations for authenticated user
    const evaluations = await postgresDb.evaluations.findByUserId(user.id);
    return NextResponse.json({ evaluations });

  } catch (error) {
    console.error('Error fetching evaluations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch evaluations' },
      { status: 500 }
    );
  }
}
