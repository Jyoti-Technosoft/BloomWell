import fs from 'fs';
import path from 'path';
import { postgresDb } from '../app/lib/postgres-db';

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
        const existingUser = await postgresDb.users.findByEmail(user.email);
        if (existingUser) {
          userIdMap[user.id] = existingUser.id;
          console.log(`✓ Found existing user: ${user.email} (ID: ${user.id} -> ${existingUser.id})`);
        } else {
          const newUser = await postgresDb.users.create({
            email: user.email,
            password_hash: user.password,
            full_name: user.fullName,
            date_of_birth: user.dateOfBirth,
            phone_number: user.phoneNumber,
            healthcarePurpose: user.healthcarePurpose
          });
          userIdMap[user.id] = newUser.id;
          console.log(`✓ Migrated user: ${user.email} (ID: ${user.id} -> ${newUser.id})`);
        }
      } catch (error) {
        console.log(`⚠ User ${user.email} may already exist or failed:`, error instanceof Error ? error.message : String(error));
      }
    }
    
    // Migrate contacts
    for (const contact of jsonData.contacts) {
      try {
        await postgresDb.contacts.create({
          name: contact.name,
          email: contact.email,
          message: contact.message
        });
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
        
        await postgresDb.consultations.create({
          user_id: newUserId,
          doctor_name: consultation.doctorName,
          doctor_specialty: consultation.doctorSpecialty,
          consultation_date: consultation.date,
          consultation_time: consultation.time,
          reason: consultation.reason,
          status: consultation.status
        });
        console.log(`✓ Migrated consultation for user: ${consultation.userId} -> ${newUserId}`);
      } catch (error) {
        console.log(`⚠ Consultation ${consultation.id} failed:`, error instanceof Error ? error.message : String(error));
      }
    }
    
    // Migrate evaluations
    for (const evaluation of jsonData.evaluations) {
      try {
        await postgresDb.evaluations.create({
          user_id: evaluation.userId === 'anonymous' ? null : evaluation.userId,
          medicine_id: evaluation.medicineId,
          medicine_name: evaluation.medicineName,
          evaluation_type: 'general', // Default to 'general' for migrated data
          responses: evaluation.responses,
          status: evaluation.status
        });
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
