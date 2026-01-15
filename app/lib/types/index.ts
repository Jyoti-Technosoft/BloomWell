// Global type definitions for BloomWell application

// User related types
export interface User {
  id: string;
  email: string;
  fullName: string;
  phoneNumber?: string;
  createdAt?: string;
}

export interface UserContextType {
  user: User | null;
  loading: boolean;
  logout: () => Promise<void>;
}

// Physician/Doctor related types
export interface Physician {
  id: string;
  name: string;
  role: string;
  bio: string;
  image: string;
  education: string;
  experience: string;
  specialties: string[];
  rating?: number;
  reviewCount?: number;
  consultationCount?: number;
  initialConsultation?: number;
  available_time_slots?: string[];
  available_dates?: string[];
  consultationLink?: string | null;
  scheduledConsultation?: {
    id: string;
    date: string;
    time: string;
    type: string;
    link: string | null;
  };
}

// Medicine/Treatment related types
export interface Medicine {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  inStock: boolean;
  image?: string;
  dosage?: string;
  overview?: string;
  howItWorks?: string;
  benefits?: string[];
  usageInstructions?: string[];
  precautions?: string[];
  sideEffects?: string[];
  features?: string[];
  shipping?: string;
  support?: string;
}

export interface MedicineDetails {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  inStock: boolean;
  image: string;
  overview: string;
  usage: string;
  sideEffects: string[];
  precautions: string[];
  interactions: string[];
}

export interface Treatment {
  id: string;
  name: string;
  description: string;
  category: string;
  medicines: Medicine[];
  overview?: string;
  howItWorks?: string;
  benefits?: string[];
  faqs?: Array<{
    question: string;
    answer: string;
  }>;
}

// Consultation related types
export interface Consultation {
  id: string;
  user_id: string;
  doctor_name: string;
  doctor_id: string;
  consultation_type: string;
  date: string;
  time: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'pending';
  notes?: string;
  physicianId: string;
  created_at: string;
}


// Evaluation related types
export interface Evaluation {
  id: string;
  user_id: string | null;
  medicine_id: string;
  evaluation_data: any;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface EvaluationData {
  medicineId: string;
  medicineName: string;
  birthday: string;
  pregnant: string;
  currentlyUsingMedicines: string;
  hasAllergies: string;
  allergies: string;
  hasMedicalConditions: string;
  medicalConditions: string;
  isTakingMedications: string;
  medications: string;
  stressLevel: string;
  sleepHours: string;
  diet: string;
  exercise: string;
  stressManagementTechniques: string[];
}

// Contact related types
export interface Contact {
  id: string;
  name: string;
  email: string;
  message: string;
  created_at: string;
}

// Form related types
export interface FormData {
  // Authentication forms
  email?: string;
  password?: string;
  fullName?: string;
  phoneNumber?: string;
  
  // Medical questionnaire
  birthday?: string;
  pregnant?: string;
  currentlyUsingMedicines?: string;
  hasAllergies?: string;
  allergies?: string;
  hasMedicalConditions?: string;
  medicalConditions?: string;
  isTakingMedications?: string;
  medications?: string;
  stressLevel?: string;
  sleepHours?: string;
  diet?: string;
  exercise?: string;
  stressManagementTechniques?: string[];
  lastFourSSN?: string;
}

// Component Props types
export interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info';
  onClose: () => void;
}

export interface VideoCallProps {
  roomUrl: string;
  onLeave?: () => void;
}

export interface VideoConsultationProps {
  physician: {
    name: string;
    role: string;
    image: string;
  };
}

export interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  physician: Physician;
  onComplete: (bookingData: any) => void;
}

export interface MedicalQuestionnaireProps {
  medicineId: string;
  medicineName: string;
  isOpen: boolean;
  onClose: () => void;
  onComplete: (formData: FormData) => void;
}

export interface IdentityVerificationProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (ssnLast4: string) => void;
}

export interface TreatmentRecommendationProps {
  medicineId: string;
  medicineName: string;
  formData: FormData;
}

export interface StarRatingProps {
  rating: number;
  reviewCount?: number;
  size?: 'sm' | 'md' | 'lg';
  showCount?: boolean;
  className?: string;
}

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
  onPageChange?: (page: number) => void;
}

export interface DoctorProfileProps {
  params: Promise<{ doctor: string }>;
}

// Navigation types
export interface NavItem {
  name: string;
  href: string;
  dropdown?: Array<{
    name: string;
    href: string;
  }>;
}

// Phone validation types
export interface CountryPhoneConfig {
  code: string;
  name: string;
  pattern: RegExp;
  format: string;
}

// Database types (for JSON and PostgreSQL)
export interface Database {
  users: User[];
  contacts: Contact[];
  consultations: Consultation[];
  evaluations: Evaluation[];
}

// NextAuth extended types
declare module 'next-auth' {
  interface Session {
    user: {
      id?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string;
  }
}
