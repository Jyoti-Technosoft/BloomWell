// app/data/physicians.ts
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
}

export const physicians: Physician[] = [
  {
    id: '1',
    name: 'Dr. Sarah Johnson',
    role: 'Medical Director',
    bio: 'Board-certified physician with over 15 years of experience in hormone therapy and weight management.',
    image: '/doctors/dr-sarah-johnson.jpg',
    education: 'MD, Harvard Medical School',
    experience: '15+ years',
    specialties: ['Hormone Therapy', 'Weight Management', 'Preventive Care'],
    rating: 5,
    reviewCount: 127,
    consultationCount: 342,
    initialConsultation: 150
  },
  {
    id: '2',
    name: 'Dr. Michael Chen',
    role: 'Endocrinologist',
    bio: 'Specializes in hormonal imbalances and metabolic health with a focus on personalized treatment plans.',
    image: '/doctors/dr-michael-chen.jpg',
    education: 'MD, Johns Hopkins University',
    experience: '12+ years',
    specialties: ['Endocrinology', 'Diabetes Care', 'Metabolic Health'],
    rating: 5,
    reviewCount: 89,
    consultationCount: 256,
    initialConsultation: 150
  },
  {
    id: '3',
    name: 'Dr. Emily Rodriguez',
    role: 'Primary Care Physician',
    bio: 'Dedicated to providing comprehensive primary care with emphasis on preventive medicine and chronic disease management.',
    image: '/doctors/dr-emily-rodriguez.jpg',
    education: 'MD, Stanford University',
    experience: '10+ years',
    specialties: ['Primary Care', 'Preventive Medicine', 'Chronic Disease Management'],
    rating: 5,
    reviewCount: 156,
    consultationCount: 412,
    initialConsultation: 150
  },
  {
    id: '4',
    name: 'Dr. James Wilson',
    role: 'Cardiologist',
    bio: 'Expert in cardiovascular health with extensive experience in preventive cardiology and heart disease management.',
    image: '/default-profile.jpg',
    education: 'MD, Mayo Clinic College of Medicine',
    experience: '18+ years',
    specialties: ['Cardiology', 'Preventive Cardiology', 'Heart Health'],
    rating: 4,
    reviewCount: 203,
    consultationCount: 523,
    initialConsultation: 150
  },
  {
    id: '5',
    name: 'Dr. Lisa Thompson',
    role: 'Dermatologist',
    bio: 'Specializes in medical and cosmetic dermatology with a focus on skin health and anti-aging treatments.',
    image: '/default-profile.jpg',
    education: 'MD, Columbia University',
    experience: '8+ years',
    specialties: ['Dermatology', 'Cosmetic Procedures', 'Skin Health'],
    rating: 4,
    reviewCount: 78,
    consultationCount: 189,
    initialConsultation: 150
  },
  {
    id: '6',
    name: 'Dr. Robert Martinez',
    role: 'Orthopedic Surgeon',
    bio: 'Expert in orthopedic surgery and sports medicine with extensive experience in joint replacement and trauma care.',
    image: '/default-profile.jpg',
    education: 'MD, UCLA School of Medicine',
    experience: '20+ years',
    specialties: ['Orthopedic Surgery', 'Sports Medicine', 'Joint Replacement'],
    rating: 4,
    reviewCount: 145,
    consultationCount: 387,
    initialConsultation: 150
  },
  {
    id: '7',
    name: 'Dr. Amanda Foster',
    role: 'Pediatrician',
    bio: 'Dedicated to providing comprehensive pediatric care from infancy through adolescence with focus on developmental health.',
    image: '/default-profile.jpg',
    education: 'MD, Children\'s Hospital of Philadelphia',
    experience: '7+ years',
    specialties: ['Pediatrics', 'Developmental Health', 'Child Wellness'],
    rating: 4,
    reviewCount: 92,
    consultationCount: 267,
    initialConsultation: 150
  },
  {
    id: '8',
    name: 'Dr. David Kim',
    role: 'Neurologist',
    bio: 'Specializes in neurological disorders with expertise in headache management, epilepsy, and neurodegenerative diseases.',
    image: '/default-profile.jpg',
    education: 'MD, Yale School of Medicine',
    experience: '14+ years',
    specialties: ['Neurology', 'Epilepsy', 'Headache Management'],
    rating: 4,
    reviewCount: 118,
    consultationCount: 298,
    initialConsultation: 150
  },
  {
    id: '9',
    name: 'Dr. Jennifer Brown',
    role: 'Psychiatrist',
    bio: 'Expert in mental health with focus on anxiety, depression, and mood disorders using evidence-based treatments.',
    image: '/default-profile.jpg',
    education: 'MD, NYU School of Medicine',
    experience: '11+ years',
    specialties: ['Psychiatry', 'Mental Health', 'Mood Disorders'],
    rating: 4,
    reviewCount: 167,
    consultationCount: 445,
    initialConsultation: 150
  },
  {
    id: '10',
    name: 'Dr. Christopher Lee',
    role: 'Gastroenterologist',
    bio: 'Specializes in digestive health with expertise in endoscopic procedures and inflammatory bowel disease management.',
    image: '/default-profile.jpg',
    education: 'MD, University of Pennsylvania',
    experience: '13+ years',
    specialties: ['Gastroenterology', 'Endoscopy', 'Digestive Health'],
    rating: 4,
    reviewCount: 134,
    consultationCount: 312,
    initialConsultation: 150
  },
  {
    id: '11',
    name: 'Dr. Michelle Garcia',
    role: 'Rheumatologist',
    bio: 'Expert in autoimmune diseases and rheumatic conditions with focus on arthritis and systemic inflammatory disorders.',
    image: '/default-profile.jpg',
    education: 'MD, Northwestern University',
    experience: '9+ years',
    specialties: ['Rheumatology', 'Autoimmune Diseases', 'Arthritis'],
    rating: 4,
    reviewCount: 81,
    consultationCount: 198,
    initialConsultation: 150
  },
  {
    id: '12',
    name: 'Dr. Andrew Taylor',
    role: 'Pulmonologist',
    bio: 'Specializes in respiratory health with expertise in asthma, COPD, and sleep medicine.',
    image: '/default-profile.jpg',
    education: 'MD, Duke University School of Medicine',
    experience: '16+ years',
    specialties: ['Pulmonology', 'Sleep Medicine', 'Respiratory Health'],
    rating: 4,
    reviewCount: 109,
    consultationCount: 276,
    initialConsultation: 150
  }
];

export function getPhysicians(page: number = 1, limit: number = 3) {
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const members = physicians.slice(startIndex, endIndex);
  
  return {
    members,
    currentPage: page,
    totalPages: Math.ceil(physicians.length / limit),
    totalPhysicians: physicians.length,
    hasNext: endIndex < physicians.length,
    hasPrev: page > 1
  };
}

export function getAllPhysicians() {
  return physicians;
}