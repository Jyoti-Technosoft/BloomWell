// lib/postgres-db.ts
// PostgreSQL data access layer - mirrors the JSON db interface
import { query, queryOne, transaction } from './postgres';

// Types matching the database schema
export interface User {
  id: string;
  email: string;
  password_hash: string;
  full_name: string;
  created_at: string;
  date_of_birth: string;
  gender: string;
  phone_number: string;
}

export interface Contact {
  id: string;
  name: string;
  email: string;
  message: string;
  created_at: string;
}

export interface Consultation {
  id: string;
  user_id: string;
  doctor_name: string;
  doctor_specialty: string;
  consultation_date: string;
  consultation_time: string;
  reason: string;
  status: string;
  created_at: string;
}

export interface Evaluation {
  id: string;
  user_id: string | null;
  medicine_id: string;
  medicine_name: string;
  responses: any;
  status: string;
  created_at: string;
  updated_at: string;
}

// PostgreSQL database interface - mirrors the JSON db structure
export const postgresDb = {
  users: {
    async create(user: Omit<User, 'id' | 'created_at'>): Promise<User> {
      const id = Date.now().toString();
      const result = await queryOne<User>(
        'INSERT INTO users (id, email, password_hash, full_name, gender, date_of_birth, phone_number, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP) RETURNING *',
        [id, user.email, user.password_hash, user.full_name, user.gender, user.date_of_birth, user.phone_number]
      );
      return result!;
    },

    async findByEmail(email: string): Promise<User | null> {
      return await queryOne<User>('SELECT * FROM users WHERE email = $1', [email]);
    },

    async findById(id: string): Promise<User | null> {
      return await queryOne<User>('SELECT * FROM users WHERE id = $1', [id]);
    },

    async update(id: string, updates: Partial<Omit<User, 'id' | 'created_at'>>): Promise<User | null> {
      const fields = Object.keys(updates);
      const values = Object.values(updates);
      const setClause = fields.map((field, index) => `${field} = $${index + 2}`).join(', ');
      
      const result = await queryOne<User>(
        `UPDATE users SET ${setClause} WHERE id = $1 RETURNING *`,
        [id, ...values]
      );
      return result;
    }
  },

  contacts: {
    async create(contact: Omit<Contact, 'id' | 'created_at'>): Promise<Contact> {
      const id = Date.now().toString();
      const result = await queryOne<Contact>(
        'INSERT INTO contacts (id, name, email, message, created_at) VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP) RETURNING *',
        [id, contact.name, contact.email, contact.message]
      );
      return result!;
    },

    async findMany(limit?: number): Promise<Contact[]> {
      const limitClause = limit ? ` LIMIT ${limit}` : '';
      return await query<Contact>(`SELECT * FROM contacts ORDER BY created_at DESC${limitClause}`);
    },

    async findById(id: string): Promise<Contact | null> {
      return await queryOne<Contact>('SELECT * FROM contacts WHERE id = $1', [id]);
    }
  },

  consultations: {
    async create(consultation: Omit<Consultation, 'id' | 'created_at'>): Promise<Consultation> {
      const id = Date.now().toString();
      const result = await queryOne<Consultation>(
        'INSERT INTO consultations (id, user_id, doctor_name, doctor_specialty, consultation_date, consultation_time, reason, status, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP) RETURNING *',
        [
          id,
          consultation.user_id,
          consultation.doctor_name,
          consultation.doctor_specialty,
          consultation.consultation_date,
          consultation.consultation_time,
          consultation.reason,
          consultation.status
        ]
      );
      return result!;
    },

    async findMany(where: Partial<Consultation>): Promise<Consultation[]> {
      const conditions = Object.entries(where).map(([key, value], index) => `${key} = $${index + 1}`);
      const values = Object.values(where);
      
      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
      return await query<Consultation>(
        `SELECT * FROM consultations ${whereClause} ORDER BY created_at DESC`,
        values
      );
    },

    async findById(id: string): Promise<Consultation | null> {
      return await queryOne<Consultation>('SELECT * FROM consultations WHERE id = $1', [id]);
    },

    async findByUserId(userId: string): Promise<Consultation[]> {
      return await query<Consultation>(
        'SELECT * FROM consultations WHERE user_id = $1 ORDER BY created_at DESC',
        [userId]
      );
    },

    async update(id: string, updates: Partial<Omit<Consultation, 'id' | 'created_at'>>): Promise<Consultation | null> {
      const fields = Object.keys(updates);
      const values = Object.values(updates);
      const setClause = fields.map((field, index) => `${field} = $${index + 2}`).join(', ');
      
      const result = await queryOne<Consultation>(
        `UPDATE consultations SET ${setClause} WHERE id = $1 RETURNING *`,
        [id, ...values]
      );
      return result;
    },

    async delete(id: string): Promise<Consultation | null> {
      const result = await queryOne<Consultation>('DELETE FROM consultations WHERE id = $1 RETURNING *', [id]);
      return result;
    }
  },

  evaluations: {
    async create(evaluation: Omit<Evaluation, 'id' | 'created_at' | 'updated_at'>): Promise<Evaluation> {
      const id = Date.now().toString();
      const result = await queryOne<Evaluation>(
        'INSERT INTO evaluations (id, user_id, medicine_id, medicine_name, responses, status, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) RETURNING *',
        [
          id,
          evaluation.user_id,
          evaluation.medicine_id,
          evaluation.medicine_name,
          JSON.stringify(evaluation.responses),
          evaluation.status
        ]
      );
      return result!;
    },

    async findById(id: string): Promise<Evaluation | null> {
      return await queryOne<Evaluation>('SELECT * FROM evaluations WHERE id = $1', [id]);
    },

    async findByUserId(userId: string): Promise<Evaluation[]> {
      return await query<Evaluation>(
        'SELECT * FROM evaluations WHERE user_id = $1 ORDER BY created_at DESC',
        [userId]
      );
    },

    async findByStatus(status: string): Promise<Evaluation[]> {
      return await query<Evaluation>(
        'SELECT * FROM evaluations WHERE status = $1 ORDER BY created_at DESC',
        [status]
      );
    },

    async update(id: string, updates: Partial<Omit<Evaluation, 'id' | 'created_at' | 'updated_at'>>): Promise<Evaluation | null> {
      const fields = Object.keys(updates);
      const values = Object.values(updates);
      const setClause = fields.map((field, index) => {
        if (field === 'responses') {
          return `${field} = $${index + 2}::jsonb`;
        }
        return `${field} = $${index + 2}`;
      }).join(', ');
      
      const result = await queryOne<Evaluation>(
        `UPDATE evaluations SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *`,
        [id, ...values]
      );
      return result;
    }
  },
};
