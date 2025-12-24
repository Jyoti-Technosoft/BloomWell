// app/lib/types/db.ts
export interface Database {
  users: Array<{
    id: string;
    email: string;
    password: string;
    fullName: string;
    createdAt: string;
  }>;
}