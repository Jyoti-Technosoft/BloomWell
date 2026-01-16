# 🚀 BloomWell Neon + Vercel Deployment Guide

## 📋 Prerequisites

- Neon database account
- Vercel account
- Node.js 18+
- GitHub repository (recommended)

## 🔧 Step 1: Set Up Neon Database

### 1. Create Neon Project
1. Go to [neon.tech](https://neon.tech)
2. Sign up for a free account
3. Create new project `bloom-well`
4. Choose a region closest to your users
5. Copy the connection string

### 2. Get Neon Connection Details
From your Neon dashboard, you'll need:
- **Connection String**: `postgresql://[user]:[password]@[host]/[db]?sslmode=require`
- **Pooled Connection String**: For production use

### 3. Create Database Tables
Run this SQL in Neon SQL Editor:

```sql
-- Physicians table
CREATE TABLE physicians (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  bio TEXT,
  image TEXT,
  education TEXT,
  experience TEXT,
  specialties TEXT[]
);

-- Medicines table  
CREATE TABLE medicines (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(10,2),
  dosage TEXT,
  category TEXT,
  in_stock BOOLEAN DEFAULT true,
  image TEXT,
  features TEXT[],
  overview TEXT,
  how_it_works TEXT,
  benefits TEXT[],
  side_effects TEXT[],
  usage_instructions TEXT[],
  precautions TEXT[],
  shipping TEXT,
  support TEXT
);

-- Treatments table
CREATE TABLE treatments (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  overview TEXT,
  how_it_works TEXT,
  category TEXT,
  benefits TEXT,
  faqs JSONB,
  image TEXT,
  medicines TEXT[]
);

-- Users table (for authentication)
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name TEXT,
  gender TEXT,
  date_of_birth DATE,
  phone_number TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Consultations table
CREATE TABLE consultations (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id),
  doctor_name TEXT,
  doctor_specialty TEXT,
  date DATE,
  time TEXT,
  reason TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Evaluations table
CREATE TABLE evaluations (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id),
  responses JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🔧 Step 2: Configure Environment Variables

### 1. Local Development (.env.local)
```env
# Neon Database
NEON_DATABASE_URL=postgresql://[user]:[password]@[host]/[db]?sslmode=require

# Supabase (if still using for some features)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Daily.co for Video Calls
DAILY_API_KEY=your-daily-api-key

# JWT
JWT_SECRET=your-jwt-secret-here

# Next.js
NODE_ENV=development
```

### 2. Vercel Environment Variables
Add these in Vercel Dashboard → Settings → Environment Variables:

```env
NEON_DATABASE_URL=postgresql://[user]:[password]@[host]/[db]?sslmode=require
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
DAILY_API_KEY=your-daily-api-key
JWT_SECRET=your-jwt-secret-here
NODE_ENV=production
```

## 🔧 Step 3: Update Database Configuration

Your `app/lib/postgres.ts` is already configured correctly for Neon:

```typescript
const pool = new Pool({
  connectionString: process.env.NEON_DATABASE_URL, // Neon pooled URL
  ssl: true,
});
```

## 🔧 Step 4: Seed Your Neon Database

### 1. Run Seeding Script
```bash
npm run db:seed
```

### 2. Verify Data
```bash
# Test API endpoints
curl http://localhost:3000/api/physicians
curl http://localhost:3000/api/medicines
curl http://localhost:3000/api/treatments
```

## 🚀 Step 5: Deploy to Vercel

### 1. Install Vercel CLI
```bash
npm i -g vercel
```

### 2. Deploy Your Project
```bash
# From your project root
vercel

# Or for production
vercel --prod
```

### 3. Vercel Deployment Steps
1. **Login to Vercel**: `vercel login`
2. **Link Project**: `vercel link` (if not already linked)
3. **Deploy**: `vercel --prod`
4. **Add Environment Variables** in Vercel dashboard
5. **Redeploy**: `vercel --prod` (after adding env vars)

### 4. GitHub Integration (Recommended)
1. Push your code to GitHub
2. In Vercel dashboard: "Add New Project"
3. Import your GitHub repository
4. Configure build settings:
   - **Framework Preset**: Next.js
   - **Root Directory**: ./
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
5. Add environment variables
6. Deploy

## 🔧 Step 6: Post-Deployment Setup

### 1. Verify Database Connection
```bash
# Test your deployed API
curl https://your-app.vercel.app/api/physicians
```

### 2. Check Video Calls
- Test video consultation functionality
- Verify Daily.co integration
- Check authentication flow

### 3. Monitor Performance
- Set up Vercel Analytics
- Monitor Neon database usage
- Check error logs

## 🔧 Step 7: Custom Domain (Optional)

### 1. Add Custom Domain
1. In Vercel dashboard → Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed

### 2. SSL Certificate
- Vercel automatically provides SSL
- No additional configuration needed

## 🐛 Troubleshooting

### Common Issues

#### 1. Database Connection Errors
```bash
# Check if NEON_DATABASE_URL is set
echo $NEON_DATABASE_URL

# Test connection locally
node -e "console.log(process.env.NEON_DATABASE_URL)"
```

#### 2. Environment Variables Not Loading
- Ensure variables are added in Vercel dashboard
- Check variable names match exactly
- Redeploy after adding variables

#### 3. Build Errors
```bash
# Clear Next.js cache
rm -rf .next
npm run build

# Check for TypeScript errors
npm run lint
```

#### 4. API Errors
- Check Vercel function logs
- Verify database tables exist
- Test API endpoints locally first

### Debug Commands

```bash
# Local testing
npm run dev
npm run db:seed

# Build testing
npm run build
npm run start

# Deployment testing
vercel --prod
```

## 📊 Neon Benefits

### ✅ Why Neon?
- **Serverless PostgreSQL**: Auto-scaling
- **Branching**: Development isolation
- **Instant Scale**: Handle traffic spikes
- **Cost Effective**: Pay per usage
- **Global Edge**: Fast connections worldwide

### 🎯 Neon Features Used:
- **Connection Pooling**: Better performance
- **SSL Security**: Encrypted connections
- **Auto-backups**: Data protection
- **Branching**: Dev/staging environments

## 🎉 Deployment Complete!

### ✅ What You Have:
- **Neon Database**: Production-ready PostgreSQL
- **Vercel Hosting**: Global CDN, auto-scaling
- **Video Consultations**: Daily.co integration
- **Full API**: All endpoints working
- **Authentication**: User management
- **Professional UI**: Responsive design

### 🚀 Next Steps:
1. **Monitor performance**: Set up alerts
2. **Backup strategy**: Neon auto-backups
3. **Analytics**: Vercel + custom tracking
4. **Scale**: Handle more users
5. **Security**: Regular updates

---

**🎊 Your BloomWell application is now deployed with Neon database on Vercel!**

For support:
- [Neon Documentation](https://neon.tech/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [Daily.co Documentation](https://docs.daily.co)
