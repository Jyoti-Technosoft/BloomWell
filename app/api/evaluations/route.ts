// app/api/evaluations/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { postgresDb } from '../../lib/postgres-db';

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
  userId?: string;
}

export async function POST(request: NextRequest) {
  try {
    const evaluationData: EvaluationData = await request.json();

    // Validate required fields
    const requiredFields = [
      'medicineId',
      'medicineName',
      'birthday',
      'pregnant',
      'currentlyUsingMedicines',
      'hasDiabetes',
      'seenDoctorLastTwoYears',
      'medicalConditions',
      'height',
      'weight',
      'targetWeight',
      'goals',
      'allergies',
      'primaryGoal',
      'triedWeightLossMethods',
      'activityLevel',
      'sleepHours',
      'stressLevel',
      'dietaryRestrictions',
      'lastFourSSN'
    ];

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

    // Get user from session (you'll need to implement session management)
    const userId = request.headers.get('x-user-id') || 'anonymous';

    // Create evaluation record in PostgreSQL
    const evaluationRecord = await postgresDb.evaluations.create({
      user_id: userId === 'anonymous' ? null : userId,
      medicine_id: evaluationData.medicineId,
      medicine_name: evaluationData.medicineName,
      responses: {
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
        lastFourSSN: evaluationData.lastFourSSN // Note: In production, this should be encrypted
      },
      status: 'pending_review'
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
    console.error('Error processing evaluation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get user from session or query parameter
    const userId = request.headers.get('x-user-id');
    
    if (userId) {
      // Get evaluations for specific user
      const evaluations = await postgresDb.evaluations.findByUserId(userId);
      return NextResponse.json({ evaluations });
    } else {
      // Get all evaluations with pending_review status
      const evaluations = await postgresDb.evaluations.findByStatus('pending_review');
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
