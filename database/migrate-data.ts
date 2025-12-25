// database/migrate-data.ts
// Data migration script from JSON to PostgreSQL
import fs from 'fs';
import path from 'path';
import { query, queryOne, transaction } from '../app/lib/postgres';

interface JsonUser {
  id: string;
  email: string;
  password: string;
  fullName: string;
  createdAt: string;
}

interface JsonContact {
  id: string;
  name: string;
  email: string;
  message: string;
  createdAt: string;
}

interface JsonConsultation {
  id: string;
  userId: string;
  doctorName: string;
  doctorSpecialty: string;
  date: string;
  time: string;
  reason: string;
  status: string;
  createdAt: string;
}

interface JsonEvaluation {
  id: string;
  userId: string;
  medicineId: string;
  medicineName: string;
  responses: any;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface JsonDatabase {
  users: JsonUser[];
  contacts: JsonContact[];
  consultations: JsonConsultation[];
  evaluations: JsonEvaluation[];
}

async function migrateData() {
  try {
    console.log('Starting data migration from JSON to PostgreSQL...');
    
    // Read existing JSON data
    const jsonPath = path.join(process.cwd(), 'data/db.json');
    if (!fs.existsSync(jsonPath)) {
      console.log('No existing JSON database found. Skipping migration.');
      return;
    }
    
    const jsonData: JsonDatabase = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    console.log(`Found ${jsonData.users.length} users, ${jsonData.contacts.length} contacts, ${jsonData.consultations.length} consultations, ${jsonData.evaluations.length} evaluations`);
    
    // Migrate in a transaction to ensure data consistency
    await transaction(async (client) => {
      
      // Migrate users
      for (const user of jsonData.users) {
        await client.query(
          'INSERT INTO users (id, email, password_hash, full_name, gender, date_of_birth, phone_number, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) ON CONFLICT (id) DO NOTHING',
          [user.id, user.email, user.password, user.fullName, user.createdAt]
        );
      }
      console.log(`Migrated ${jsonData.users.length} users`);
      
      // Migrate contacts
      for (const contact of jsonData.contacts) {
        await client.query(
          'INSERT INTO contacts (id, name, email, message, created_at) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (id) DO NOTHING',
          [contact.id, contact.name, contact.email, contact.message, contact.createdAt]
        );
      }
      console.log(`Migrated ${jsonData.contacts.length} contacts`);
      
      // Migrate consultations
      for (const consultation of jsonData.consultations) {
        await client.query(
          'INSERT INTO consultations (id, user_id, doctor_name, doctor_specialty, consultation_date, consultation_time, reason, status, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) ON CONFLICT (id) DO NOTHING',
          [
            consultation.id,
            consultation.userId,
            consultation.doctorName,
            consultation.doctorSpecialty,
            consultation.date,
            consultation.time,
            consultation.reason,
            consultation.status,
            consultation.createdAt
          ]
        );
      }
      console.log(`Migrated ${jsonData.consultations.length} consultations`);
      
      // Migrate evaluations
      for (const evaluation of jsonData.evaluations) {
        await client.query(
          'INSERT INTO evaluations (id, user_id, medicine_id, medicine_name, responses, status, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) ON CONFLICT (id) DO NOTHING',
          [
            evaluation.id,
            evaluation.userId,
            evaluation.medicineId,
            evaluation.medicineName,
            JSON.stringify(evaluation.responses),
            evaluation.status,
            evaluation.createdAt,
            evaluation.updatedAt
          ]
        );
      }
      console.log(`Migrated ${jsonData.evaluations.length} evaluations`);
      
    });
    
    // Verify migration
    const userCount = await queryOne('SELECT COUNT(*) as count FROM users');
    const contactCount = await queryOne('SELECT COUNT(*) as count FROM contacts');
    const consultationCount = await queryOne('SELECT COUNT(*) as count FROM consultations');
    const evaluationCount = await queryOne('SELECT COUNT(*) as count FROM evaluations');
    
    console.log('\nMigration verification:');
    console.log(`Users in PostgreSQL: ${userCount?.count || 0}`);
    console.log(`Contacts in PostgreSQL: ${contactCount?.count || 0}`);
    console.log(`Consultations in PostgreSQL: ${consultationCount?.count || 0}`);
    console.log(`Evaluations in PostgreSQL: ${evaluationCount?.count || 0}`);
    
    console.log('\nData migration completed successfully!');
    
  } catch (error) {
    console.error('Data migration failed:', error);
    process.exit(1);
  }
}

// Run migration if this script is executed directly
if (require.main === module) {
  migrateData();
}

export { migrateData };
