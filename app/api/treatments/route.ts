import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/app/lib/postgres';

// Fallback treatments data when database is not available
const fallbackTreatments = [
  {
    id: 'semaglutide',
    name: 'Semaglutide',
    description: 'Advanced GLP-1 medication for sustainable weight management and blood sugar control.',
    category: 'weight-loss',
    image: '/default-treatment.jpg',
    overview: 'Semaglutide is a once-weekly injection that helps with weight loss by regulating appetite.',
    howItWorks: 'Mimics GLP-1 hormone to regulate blood sugar and reduce appetite.',
    benefits: [
      'Significant weight loss',
      'Blood sugar control',
      'Once-weekly dosing'
    ],
    faqs: [
      {
        question: 'How long does it take to see results?',
        answer: 'Most patients see results within 12-16 weeks.'
      }
    ],
    medicines: ['semaglutide-1mg', 'semaglutide-2mg']
  },
  {
    id: 'erectile-dysfunction',
    name: 'Erectile Dysfunction',
    description: 'Effective treatments for ED to improve sexual health and performance.',
    category: 'ed-treatments',
    image: '/default-treatment.jpg',
    overview: 'Comprehensive solutions for men experiencing erectile dysfunction.',
    benefits: [
      'Improved sexual performance',
      'Increased confidence',
      'Various treatment options'
    ],
    howItWorks: 'Treatments work by increasing blood flow to penis or addressing underlying causes.',
    faqs: [
      {
        question: 'What treatments are available?',
        answer: 'Oral medications, injections, and lifestyle changes are common approaches.'
      }
    ],
    medicines: ['sildenafil-50mg', 'tadalafil-20mg']
  },
  {
    id: 'testosterone-therapy',
    name: 'Testosterone Therapy',
    description: 'Hormone replacement therapy for low testosterone levels.',
    category: 'hormone-therapy',
    image: '/default-treatment.jpg',
    overview: 'Testosterone therapy helps restore normal hormone levels in men with low testosterone.',
    benefits: [
      'Increased energy',
      'Improved muscle mass',
      'Better mood'
    ],
    howItWorks: 'Supplements testosterone to restore normal levels.',
    faqs: [
      {
        question: 'Is testosterone therapy safe?',
        answer: 'When monitored by medical professionals, testosterone therapy is generally safe.'
      }
    ],
    medicines: ['testo-cypionate', 'testo-gel']
  }
];

export async function GET(request: NextRequest) {
  try {
    const result = await query('SELECT * FROM treatments ORDER BY id');
    
    const treatments = result.map((row: any) => {
      let category = row.category;
      if (!category) {
        const name = row.name.toLowerCase();
        if (name.includes('semaglutide') || name.includes('tirzepatide')) {
          category = 'weight-loss';
        } else if  (name.includes('testosterone')) {
          category = 'hormone-therapy';
        } else if (name.includes('erectile') || name.includes('ed')) {
          category = 'ed-treatments';
        } else if (name.includes('injectable')) {
          category = 'injectable-therapy';
        } else {
          category = 'other';
        }
      }

      let benefits = [];
      let faqs = [];
      
      try {
        benefits = row.benefits ? (typeof row.benefits === 'string' ? JSON.parse(row.benefits) : row.benefits) : [];
      } catch (e) {
        console.error('Error parsing benefits for treatment', row.id, e);
      }
      
      try {
        faqs = row.faqs ? (typeof row.faqs === 'string' ? JSON.parse(row.faqs) : row.faqs) : [];
      } catch (e) {
        console.error('Error parsing faqs for treatment', row.id, e);
      }

      const treatment = {
        id: row.id,
        name: row.name,
        description: row.description,
        category: category,
        image: row.image || '/default-treatment.jpg',
        overview: row.overview,
        howItWorks: row.how_it_works,
        benefits: benefits,
        faqs: faqs,
        medicines: row.medicines ? row.medicines.split(',').map((m: string) => m.trim()) : [],
      };
      
      return treatment;
    });

    return NextResponse.json(treatments);
  } catch (error) {
    console.error('Error fetching treatments from database:', error);
    console.log('Returning fallback treatments data');
    
    // Return fallback data when database is not available
    return NextResponse.json(fallbackTreatments);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, category, image, medicines } = body;

    const medicinesString = medicines ? medicines.join(', ') : '';

    const result = await query(
      `INSERT INTO treatments (name, description, category, image, medicines) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING *`,
      [name, description, category, image, medicinesString]
    );

    const treatment = {
      id: result[0].id,
      name: result[0].name,
      description: result[0].description,
      category: result[0].category,
      image: result[0].image,
      medicines: result[0].medicines ? result[0].medicines.split(',').map((m: string) => m.trim()) : [],
    };

    return NextResponse.json(treatment, { status: 201 });
  } catch (error) {
    console.error('Error creating treatment:', error);
    return NextResponse.json(
      { error: 'Failed to create treatment' },
      { status: 500 }
    );
  }
}
