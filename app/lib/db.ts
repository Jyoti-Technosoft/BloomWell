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
        createdAt: string;
    }>;
    contacts: Array<{
        id: string;
        name: string;
        email: string;
        message: string;
        createdAt: string;
    }>;
    cart: Array<{
        id: string;
        userId: string;
        productId: string;
        quantity: number;
        createdAt: string;
    }>;
    products: Array<{
      id: string;
      name: string;
      price: string;
      image: number;
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

const defaultDB: Database = { users: [], contacts: [], cart: [], products: [], consultations: [] };

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
        return {
            users: parsedData.users || [],
            contacts: parsedData.contacts || [],
            cart: parsedData.cart || [],
            products: parsedData.products || [],
            consultations: parsedData.consultations || []
        };
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
        async findByEmail(email: string) {
            const db = readDB();
            return db.users.find(user => user.email === email) || null;
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
    cart: {
        async create(cart: Omit<Database['cart'][0], 'id' | 'createdAt'>) {
            const db = readDB();
            const newCart = {
                ...cart,
                id: Date.now().toString(),
                createdAt: new Date().toISOString(),
            };
            db.cart.push(newCart);
            writeDB(db);
            return newCart;
        },
        async findMany(where: Partial<Database['cart'][0]>) {
            const db = readDB();
            return db.cart.filter(item => {
                return Object.entries(where).every(([key, value]) => {
                    return item[key as keyof typeof item] === value;
                });
            });
        },
        async upsert(where: { userId: string; productId: string }, data: { quantity: number }) {
            const db = readDB();
            const existingItem = db.cart.find(
                item => item.userId === where.userId && item.productId === where.productId
            );
            if (existingItem) {
                existingItem.quantity += data.quantity;
            } else {
                db.cart.push({
                    id: Date.now().toString(),
                    userId: where.userId,
                    productId: where.productId,
                    quantity: data.quantity,
                    createdAt: new Date().toISOString(),
                });
            }
            writeDB(db);
            return existingItem || db.cart[db.cart.length - 1];
        },
        async delete(where: { userId: string; productId: string }) {
            const db = readDB();
            const index = db.cart.findIndex(
                item => item.userId === where.userId && item.productId === where.productId
            );
            if (index !== -1) {
                const [deletedItem] = db.cart.splice(index, 1);
                writeDB(db);
                return deletedItem;
            }
            return null;
        },
    },
    products: {
        async create(product: Omit<Database['products'][0], 'id' | 'createdAt' | 'updatedAt'>) {
            const db = readDB();
            const newProduct = {
                ...product,
                id: Date.now().toString(),
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };
            db.products.push(newProduct);
            writeDB(db);
            return newProduct;
        },
        async findMany(where?: Partial<Database['products'][0]>) {
            const db = readDB();
            if (!where) return [...db.products];
            return db.products.filter(product => {
                return Object.entries(where).every(([key, value]) => {
                    return product[key as keyof typeof product] === value;
                });
            });
        },
        async findById(id: string) {
            const db = readDB();
            return db.products.find(product => product.id === id) || null;
        },
        async findByIds(ids: string[]) {
            const db = readDB();
            return db.products.filter(product => ids.includes(product.id));
        },
        async update(id: string, updates: Partial<Omit<Database['products'][0], 'id' | 'createdAt'>>) {
            const db = readDB();
            const index = db.products.findIndex(product => product.id === id);
            if (index === -1) return null;

            const updatedProduct = {
                ...db.products[index],
                ...updates,
                updatedAt: new Date().toISOString(),
            };

            db.products[index] = updatedProduct;
            writeDB(db);
            return updatedProduct;
        },
        async delete(id: string) {
            const db = readDB();
            const index = db.products.findIndex(product => product.id === id);
            if (index === -1) return null;

            const [deletedProduct] = db.products.splice(index, 1);
            writeDB(db);
            return deletedProduct;
        }
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