// app/api/evaluations/route.ts
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

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

    // Create evaluation record
    const evaluationRecord = {
      id: Date.now().toString(),
      userId,
      medicineId: evaluationData.medicineId,
      medicineName: evaluationData.medicineName,
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
      status: 'pending_review',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Save to database (for now, save to JSON file)
    const dbPath = path.join(process.cwd(), 'data', 'db.json');
    
    try {
      let db: any = {};
      
      // Read existing database or create new structure
      if (fs.existsSync(dbPath)) {
        const dbContent = fs.readFileSync(dbPath, 'utf-8');
        db = JSON.parse(dbContent);
      } else {
        // Create new database structure if file doesn't exist
        db = {
          users: [],
          contacts: [],
          consultations: [],
          evaluations: []
        };
      }

      // Ensure evaluations array exists
      if (!db.evaluations) {
        db.evaluations = [];
      }

      // Add the new evaluation record
      db.evaluations.push(evaluationRecord);

      // Write back to database
      fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
      
    } catch (error) {
      console.error('Error saving evaluation:', error);
      return NextResponse.json(
        { error: 'Failed to save evaluation data' },
        { status: 500 }
      );
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
    const dbPath = path.join(process.cwd(), 'data', 'db.json');
    
    if (!fs.existsSync(dbPath)) {
      return NextResponse.json({ evaluations: [] });
    }

    const dbContent = fs.readFileSync(dbPath, 'utf-8');
    const db = JSON.parse(dbContent);

    return NextResponse.json({ 
      evaluations: db.evaluations || [] 
    });

  } catch (error) {
    console.error('Error fetching evaluations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch evaluations' },
      { status: 500 }
    );
  }
}
