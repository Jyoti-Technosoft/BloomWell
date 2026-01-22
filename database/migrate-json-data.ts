import fs from 'fs';
import path from 'path';
import pool from '../app/lib/postgres';

interface JsonData {
  users: Array<{
    email: string;
    password: string;
    fullName: string;
    id: string;
    createdAt: string;
    dateOfBirth: string;
    healthcarePurpose: string;
    phoneNumber: string;
  }>;
  contacts: Array<{
    name: string;
    email: string;
    message: string;
    id: string;
    createdAt: string;
  }>;
  consultations: Array<{
    userId: string;
    doctorName: string;
    doctorSpecialty: string;
    date: string;
    time: string;
    reason: string;
    status: string;
    id: string;
    createdAt: string;
  }>;
  evaluations: Array<{
    id: string;
    userId: string;
    medicineId: string;
    medicineName: string;
    responses: any;
    status: string;
    createdAt: string;
    updatedAt: string;
  }>;
}

async function migrateData() {
  try {
    console.log('Starting data migration from db.json...');
    
    // Read JSON data
    const jsonPath = path.join(process.cwd(), 'data', 'db.json');
    const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf8')) as JsonData;
    
    console.log(`Found ${jsonData.users.length} users, ${jsonData.contacts.length} contacts, ${jsonData.consultations.length} consultations, ${jsonData.evaluations.length} evaluations`);
    
    // Migrate users
    const userIdMap: { [oldId: string]: string } = {};
    for (const user of jsonData.users) {
      try {
        // Check if user already exists
        const existingUserResult = await pool.query('SELECT id FROM users WHERE email = $1', [user.email]);
        if (existingUserResult.rows.length > 0) {
          userIdMap[user.id] = existingUserResult.rows[0].id;
          console.log(`✓ Found existing user: ${user.email} (ID: ${user.id} -> ${existingUserResult.rows[0].id})`);
        } else {
          const newUserResult = await pool.query(
            'INSERT INTO users (id, email, password_hash, full_name, date_of_birth, phone_number, healthcare_purpose, created_at) VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP) RETURNING id',
            [user.id, user.email, user.password, user.fullName, user.dateOfBirth, user.phoneNumber, user.healthcarePurpose]
          );
          userIdMap[user.id] = newUserResult.rows[0].id;
          console.log(`✓ Migrated user: ${user.email} (ID: ${user.id} -> ${newUserResult.rows[0].id})`);
        }
      } catch (error) {
        console.log(`⚠ User ${user.email} may already exist or failed:`, error instanceof Error ? error.message : String(error));
      }
    }
    
    // Migrate contacts
    for (const contact of jsonData.contacts) {
      try {
        await pool.query(
          'INSERT INTO contacts (name, email, message) VALUES ($1, $2, $3)',
          [contact.name, contact.email, contact.message]
        );
        console.log(`✓ Migrated contact: ${contact.name}`);
      } catch (error) {
        console.log(`⚠ Contact ${contact.name} failed:`, error instanceof Error ? error.message : String(error));
      }
    }
    
    // Migrate consultations
    for (const consultation of jsonData.consultations) {
      try {
        const newUserId = userIdMap[consultation.userId];
        if (!newUserId) {
          console.log(`⚠ Skipping consultation ${consultation.id} - user ID ${consultation.userId} not found`);
          continue;
        }
        
        await pool.query(
          'INSERT INTO consultations (user_id, doctor_name, doctor_specialty, consultation_date, consultation_time, reason, status, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP)',
          [newUserId, consultation.doctorName, consultation.doctorSpecialty, consultation.date, consultation.time, consultation.reason, consultation.status]
        );
        console.log(`✓ Migrated consultation for user: ${consultation.userId} -> ${newUserId}`);
      } catch (error) {
        console.log(`⚠ Consultation ${consultation.id} failed:`, error instanceof Error ? error.message : String(error));
      }
    }
    
    // Migrate evaluations
    for (const evaluation of jsonData.evaluations) {
      try {
        const evalUserId = evaluation.userId === 'anonymous' ? null : userIdMap[evaluation.userId];
        
        await pool.query(
          'INSERT INTO evaluations (user_id, medicine_id, medicine_name, evaluation_type, responses, status, created_at) VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)',
          [evalUserId, evaluation.medicineId, evaluation.medicineName, 'general', evaluation.responses, evaluation.status]
        );
        console.log(`✓ Migrated evaluation: ${evaluation.medicineName}`);
      } catch (error) {
        console.log(`⚠ Evaluation ${evaluation.id} failed:`, error instanceof Error ? error.message : String(error));
      }
    }
    
    console.log('✅ Data migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run migration if this script is executed directly
if (require.main === module) {
  migrateData();
}

export { migrateData };
