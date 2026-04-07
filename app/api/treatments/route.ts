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
    id: 'womens-health',
    name: "Women's Health",
    description: "Specialized treatments for women's overall health, fitness, and weight management.",
    category: 'womens-health',
    image: '/default-treatment.jpg',
    overview: "Our women's health program focuses on comprehensive care including weight management, hormonal balance, and metabolic health.",
    howItWorks: "Our women's health treatments address specific female health concerns including hormonal fluctuations and metabolic differences.",
    benefits: [
      "Specialized for women's health needs",
      "Hormonal balance support",
      "Weight management solutions",
      "Metabolic health improvement",
      "Personalized treatment plans"
    ],
    faqs: [
      {
        question: "Are these treatments safe for women?",
        answer: "Yes, all our women's health treatments are FDA-approved and prescribed based on your individual health assessment."
      },
      {
        question: "How quickly will I see results?",
        answer: "Results vary by treatment and individual, but most women begin to see improvements within 4-8 weeks."
      }
    ],
    medicines: ['semaglutide-tablets', 'metformin-er', 'ozempic-injection']
  },
  {
    id: 'tirzepatide',
    name: 'Tirzepatide',
    description: 'Dual GIP and GLP-1 receptor agonist for significant weight loss.',
    category: 'weight-loss',
    image: '/default-treatment.jpg',
    overview: 'Tirzepatide is a novel medication that combines the benefits of GIP and GLP-1 receptor agonism.',
    howItWorks: 'Works by activating both GIP and GLP-1 receptors to regulate blood sugar and reduce appetite.',
    benefits: [
      'Dual-action formula',
      'Significant weight loss',
      'Improved A1C levels'
    ],
    faqs: [
      {
        question: 'How does Tirzepatide work?',
        answer: 'It activates both GIP and GLP-1 receptors for enhanced effects.'
      }
    ],
    medicines: ['tirzepatide-5mg', 'tirzepatide-10mg']
  },
  {
    id: 'injectable-treatments',
    name: 'Injectable Treatments',
    description: 'Advanced injectable therapies for various health and wellness needs.',
    category: 'injectable-therapy',
    image: '/default-treatment.jpg',
    overview: 'Our clinic offers a range of injectable treatments including vitamin therapy and specialized medications.',
    howItWorks: 'Injectable treatments deliver vitamins and medications directly into the bloodstream for maximum absorption.',
    benefits: [
      'Direct delivery for maximum absorption',
      'Customizable treatment plans',
      'Administered by medical professionals'
    ],
    faqs: [
      {
        question: 'What conditions can injectable treatments help with?',
        answer: 'Injectable therapies can support energy levels, immune function, weight management, and overall wellness.'
      }
    ],
    medicines: ['b12-injection', 'glutathione-injection', 'lipotropic-injection']
  }
];

export async function GET() {
  try {
    const result = await query('SELECT * FROM treatments ORDER BY id');
    
    const treatments = result.map((row: Record<string, unknown>) => {
      let category = row.category as string;
      if (!category) {
        const name = String(row.name).toLowerCase();
        if (name.includes('semaglutide') || name.includes('tirzepatide')) {
          category = 'weight-loss';
        } else if (name.includes('women') || name.includes('metformin') || name.includes('ozempic')) {
          category = 'womens-health';
        } else if (name.includes('injectable') || name.includes('b12') || name.includes('glutathione') || name.includes('lipotropic')) {
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
        medicines: row.medicines ? String(row.medicines).split(',').map((m: string) => m.trim()) : [],
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
      medicines: result[0].medicines ? String(result[0].medicines).split(',').map((m: string) => m.trim()) : [],
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
