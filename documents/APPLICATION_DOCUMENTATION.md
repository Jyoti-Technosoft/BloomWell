# BloomWell - Weight Management & Wellness Platform

## 📋 Overview

**BloomWell** is a comprehensive digital health platform focused on weight management and wellness treatments. The application provides personalized medical treatments, physician consultations, and FDA-approved medications for weight loss, hormone therapy, and sexual health.

## 🎯 Purpose & Goals

### Primary Purpose
- **Accessible Healthcare**: Make weight management and wellness treatments accessible and affordable
- **Personalized Treatment**: Provide tailored medical solutions based on individual health profiles
- **Physician Supervision**: Ensure all treatments are medically supervised and safe
- **Digital Convenience**: Offer healthcare services through an intuitive digital platform

### Key Goals
1. **Democratize Access**: Remove barriers to quality weight management treatments
2. **Medical Safety**: Ensure all treatments are FDA-approved and physician-supervised
3. **User Empowerment**: Help users make informed health decisions
4. **Seamless Experience**: Provide end-to-end digital healthcare journey

## 👥 Target Users

### Primary Users
- **Adults (18-65+)** seeking weight management solutions
- **Individuals with hormonal imbalances** requiring hormone therapy
- **Men experiencing erectile dysfunction** seeking treatment
- **Patients seeking physician consultations** for weight-related health issues

### User Personas
1. **Health-Conscious Professionals**: Busy adults seeking convenient, effective weight management
2. **Hormone Therapy Patients**: Individuals needing testosterone or hormonal balance treatments
3. **Wellness Enthusiasts**: Users looking for comprehensive health and wellness solutions
4. **Privacy-Conscious Patients**: Users preferring discreet, digital healthcare access

## 🛠 Technology Stack

### Frontend Technologies
- **Next.js 16.1.0**: React framework with App Router for modern web development
- **React 19.2.3**: Core UI library with latest features
- **TypeScript 5**: Type-safe JavaScript development
- **Tailwind CSS 4.1.18**: Utility-first CSS framework for responsive design
- **Framer Motion 12.23.26**: Animation library for smooth UI interactions
- **Headless UI 2.2.9**: Accessible, customizable UI components

### Backend & Database
- **PostgreSQL**: Primary database for structured data storage
- **NextAuth 4.24.13**: Authentication and session management
- **Node.js**: Server-side JavaScript runtime
- **API Routes**: RESTful endpoints for data operations

### Key Libraries & Tools
- **React Hook Form 7.69.0**: Form management and validation
- **React Icons 5.5.0**: Icon library for UI enhancement
- **bcryptjs 3.0.3**: Password hashing for security
- **jsonwebtoken 9.0.3**: JWT token management
- **pg 8.16.3**: PostgreSQL client for database operations

## 🏗 Application Architecture

### Core Features

#### 1. **Medical Treatments**
- **Weight Loss Medications**: Semaglutide, Tirzepatide with detailed information
- **Hormone Therapy**: Testosterone treatments (injections, gels)
- **ED Treatments**: Oral medications (Sildenafil, Tadalafil, Vardenafil)
- **Injectable Therapies**: Vitamin B12, Glutathione, Lipotropic injections

#### 2. **Physician Network**
- **12 Specialized Physicians**: Cardiologists, Endocrinologists, Dermatologists, etc.
- **Detailed Profiles**: Education, experience, specialties for each physician
- **Consultation Booking**: Easy scheduling system for patient appointments

#### 3. **Medical Evaluation System**
- **Comprehensive Questionnaires**: Health assessment forms for each treatment type
- **Identity Verification**: Secure patient verification process
- **Treatment Recommendations**: AI-powered or physician-guided recommendations
- **Evaluation Tracking**: Status tracking of medical evaluations

#### 4. **User Management**
- **Secure Authentication**: NextAuth-based login system
- **Profile Management**: Personal health information and preferences
- **Order History**: Track treatments and consultations
- **Dashboard**: Personalized health dashboard

### Data Flow Architecture

```
User → Authentication → Treatment Selection → Medical Evaluation → Physician Review → Treatment Access
```

1. **User Registration/Login**: Secure authentication with NextAuth
2. **Treatment Browse**: Explore available medications and treatments
3. **Medical Questionnaire**: Complete health assessment forms
4. **Identity Verification**: Verify patient identity for compliance
5. **Evaluation Review**: Physicians review and approve/reject evaluations
6. **Treatment Access**: Approved users access treatments and consultations

## 🚀 How to Run

### Prerequisites
- **Node.js 18+**: JavaScript runtime environment
- **PostgreSQL**: Database server (local or cloud)
- **npm or yarn**: Package manager

### Setup Steps

1. **Clone Repository**
   ```bash
   git clone <repository-url>
   cd bloom-well
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   ```bash
   # Copy environment template
   cp .env.example .env.local
   
   # Configure database connection
   DATABASE_URL=postgresql://username:password@localhost:5432/bloomwell_db
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=bloomwell_db
   DB_USER=bloomwell_user
   DB_PASSWORD=StrongPassword123
   ```

4. **Database Setup**
   ```bash
   # Initialize database and create tables
   npm run db:setup
   
   # Or run steps individually
   npm run db:init      # Create database and tables
   npm run db:migrate    # Migrate existing data
   npm run db:seed      # Seed with sample data
   ```

5. **Start Development Server**
   ```bash
   npm run dev
   ```

6. **Access Application**
   - **Development**: http://localhost:3000
   - **Production**: Build and deploy with `npm run build && npm start`

### Available Scripts

```json
{
  "dev": "next dev",                    // Start development server
  "build": "next build",                // Build for production
  "start": "next start",                // Start production server
  "db:init": "tsx database/init-db.ts",  // Initialize database
  "db:migrate": "tsx database/migrate-data.ts",  // Migrate data
  "db:seed": "tsx scripts/seed-database.ts",      // Seed database
  "lint": "eslint"                    // Run linting
}
```

## 📊 Database Schema

### Core Tables

#### **Users**
- Patient information and authentication data
- Stores personal details, contact information, login credentials

#### **Physicians**
- Medical professional profiles
- Education, experience, specialties, contact information

#### **Medicines**
- Treatment and medication catalog
- Detailed information including pricing, usage, side effects

#### **Treatments**
- Treatment categories and descriptions
- Comprehensive treatment information with FAQs

#### **Consultations**
- Patient appointment scheduling
- Physician consultation bookings and management

#### **Evaluations**
- Medical evaluation forms and responses
- Patient health assessments and treatment recommendations

#### **Contacts**
- Patient inquiries and support requests
- Communication tracking and follow-up management

## 🔒 Security & Compliance

### Security Measures
- **Password Hashing**: bcryptjs for secure password storage
- **JWT Tokens**: Secure session management
- **Input Validation**: Form validation and sanitization
- **SQL Injection Prevention**: Parameterized queries

### Compliance Features
- **HIPAA Considerations**: Patient data protection
- **FDA Compliance**: Only approved medications listed
- **Identity Verification**: Patient verification for prescription access
- **Medical Supervision**: All treatments require physician approval

## 🎨 UI/UX Features

### Design Principles
- **Mobile-First**: Responsive design for all devices
- **Accessibility**: WCAG compliance considerations
- **Modern UI**: Clean, professional healthcare interface
- **Intuitive Navigation**: Easy-to-use treatment discovery

### Key UI Components
- **Medical Questionnaires**: Step-by-step health assessments
- **Treatment Cards**: Detailed medication information displays
- **Physician Profiles**: Professional medical provider information
- **Interactive Dashboards**: Personalized user health tracking
- **Toast Notifications**: User feedback and status updates

## 📈 Business Impact

### Value Proposition
- **Healthcare Accessibility**: Democratize access to quality treatments
- **Cost Efficiency**: Affordable alternatives to traditional healthcare
- **Convenience**: 24/7 access to medical consultations
- **Privacy**: Discreet treatment access from home

### Success Metrics
- **Patient Outcomes**: Successful weight management results
- **User Engagement**: Active treatment participation
- **Physician Satisfaction**: Quality consultation experiences
- **Treatment Adherence**: User compliance with medical recommendations

## 🔮 Future Enhancements

### Planned Features
- **Telemedicine Integration**: Video consultation capabilities
- **Mobile Application**: Native iOS/Android apps
- **AI Treatment Matching**: Advanced recommendation algorithms
- **Insurance Integration**: Insurance claim processing
- **Wearable Integration**: Health device data synchronization

### Scalability Considerations
- **Cloud Infrastructure**: AWS/Azure deployment readiness
- **Microservices Architecture**: Service-based scalability
- **CDN Integration**: Global content delivery
- **Load Balancing**: High-availability setup

---

## 📞 Support & Contact

### Development Team
- **Frontend**: React/Next.js specialists
- **Backend**: Node.js/PostgreSQL developers
- **Healthcare**: Medical advisors and physicians
- **UI/UX**: Design and user experience experts

### Technical Support
- **Documentation**: Comprehensive code and API documentation
- **Testing**: Unit tests, integration tests, E2E testing
- **Monitoring**: Application performance and error tracking
- **Security**: Regular security audits and updates

---

*BloomWell represents the future of accessible, personalized healthcare - bringing quality medical treatments to everyone, anywhere, anytime.*
