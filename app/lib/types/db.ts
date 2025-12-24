// app/lib/types/db.ts
export interface Database {
  users: Array<{
    id: string;
    email: string;
    password: string;
    fullName: string;
    createdAt: string;
  }>;
  products: Array<{
    id: string;
    name: string;
    description: string;
    price: number;
    image?: string;
    createdAt: string;
    updatedAt: string;
  }>;
  cart: Array<{
    id: string;
    userId: string;
    productId: string;
    quantity: number;
    createdAt: string;
  }>;
}