// app/data/physicians.ts
export interface Physician {
  name: string;
  specialty: string;
  education: string;
  image: string;
  bio: string;
}

export const physicians: Physician[] = [
  {
    name: 'Dr. Sarah Johnson',
    specialty: 'Endocrinology',
    education: 'MD, Harvard Medical School',
    image: '/doctors/dr-sarah-johnson.jpg',
    bio: 'Specializes in hormone therapy and weight management with over 10 years of experience.',
  },
  {
    name: 'Dr. Michael Chen',
    specialty: 'Urology',
    education: 'MD, Johns Hopkins University',
    image: '/doctors/dr-michael-chen.jpg',
    bio: 'Expert in men\'s health and sexual medicine with a focus on innovative treatments.',
  },
  {
    name: 'Dr. Emily Rodriguez',
    specialty: 'Internal Medicine',
    education: 'MD, Stanford University',
    image: '/doctors/dr-emily-rodriguez.jpg',
    bio: 'Board-certified in internal medicine with a focus on preventive care and wellness.',
  },
];