// lib/db.ts
import fs from 'fs';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'data/db.json');

type Database = {
    users: Array<{
        id: string;
        email: string;
        password: string;
        fullName: string;
        gender?: string;
        phoneNumber?: string;
        dateOfBirth?: string;
        createdAt: string;
    }>;
    contacts: Array<{
        id: string;
        name: string;
        email: string;
        message: string;
        createdAt: string;
    }>;
    consultations: Array<{
        id: string;
        userId: string;
        doctorName: string;
        doctorSpecialty: string;
        date: string;
        time: string;
        reason: string;
        status: string;
        createdAt: string;
    }>;
};

const defaultDB: Database = { users: [], contacts: [], consultations: [] };

function readDB(): Database {
    try {
        if (!fs.existsSync(DB_PATH)) {
            fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
            fs.writeFileSync(DB_PATH, JSON.stringify(defaultDB, null, 2), 'utf8');
            return defaultDB;
        }
        const data = fs.readFileSync(DB_PATH, 'utf8');
        const parsedData = JSON.parse(data);
        
        // Merge with defaultDB to ensure all required properties exist
        const loadedDb = {
            users: parsedData.users || [],
            contacts: parsedData.contacts || [],
            consultations: parsedData.consultations || []
        };
        return loadedDb;
    } catch (error) {
        console.error('Error reading database:', error);
        return defaultDB;
    }
}

function writeDB(data: Database) {
    try {
        fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf8');
    } catch (error) {
        console.error('Error writing to database:', error);
    }
}

export const db = {
    users: {
        async create(user: Omit<Database['users'][0], 'id' | 'createdAt'>) {
            const db = readDB();
            const newUser = {
                ...user,
                id: Date.now().toString(),
                createdAt: new Date().toISOString(),
            };
            db.users.push(newUser);
            writeDB(db);
            return newUser;
        },
        async updateByEmail(email: string, updates: Partial<Omit<Database['users'][0], 'id' | 'createdAt' | 'email'>>) {
            const db = readDB();
            const index = db.users.findIndex(user => user.email.toLowerCase().trim() === email.toLowerCase().trim());
            if (index === -1) return null;

            const updatedUser = {
                ...db.users[index],
                ...updates,
            };

            db.users[index] = updatedUser;
            writeDB(db);
            return updatedUser;
        },
        async findByEmail(email: string) {
            const db = readDB();
            const normalizedEmail = email.toLowerCase().trim();
            const user = db.users.find(user => 
                user.email.toLowerCase().trim() === normalizedEmail
            );
            return user || null;
        },
        async findAllEmails() {
            const db = readDB();
            return db.users.map(user => user.email);
        },
    },
    contacts: {
        async create(contact: Omit<Database['contacts'][0], 'id' | 'createdAt'>) {
            const db = readDB();
            const newContact = {
                ...contact,
                id: Date.now().toString(),
                createdAt: new Date().toISOString(),
            };
            db.contacts.push(newContact);
            writeDB(db);
            return newContact;
        },
    },
    consultations: {
        async create(consultation: Omit<Database['consultations'][0], 'id' | 'createdAt'>) {
            const db = readDB();
            const newConsultation = {
                ...consultation,
                id: Date.now().toString(),
                createdAt: new Date().toISOString(),
            };
            db.consultations.push(newConsultation);
            writeDB(db);
            return newConsultation;
        },
        async findMany(where: Partial<Database['consultations'][0]>) {
            const db = readDB();
            return db.consultations.filter(item => {
                return Object.entries(where).every(([key, value]) => {
                    return item[key as keyof typeof item] === value;
                });
            });
        },
        async findById(id: string) {
            const db = readDB();
            return db.consultations.find(consultation => consultation.id === id) || null;
        },
        async update(id: string, updates: Partial<Omit<Database['consultations'][0], 'id' | 'createdAt'>>) {
            const db = readDB();
            const index = db.consultations.findIndex(consultation => consultation.id === id);
            if (index === -1) return null;

            const updatedConsultation = {
                ...db.consultations[index],
                ...updates,
            };

            db.consultations[index] = updatedConsultation;
            writeDB(db);
            return updatedConsultation;
        },
        async delete(id: string) {
            const db = readDB();
            const index = db.consultations.findIndex(consultation => consultation.id === id);
            if (index === -1) return null;

            const [deletedConsultation] = db.consultations.splice(index, 1);
            writeDB(db);
            return deletedConsultation;
        }
    },
};