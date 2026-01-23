import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.NEON_DATABASE_URL,
});

// Fallback medicines data when database is not available
const fallbackMedicines = [
  {
    id: 'semaglutide-1mg',
    name: 'Semaglutide 1mg',
    description: 'Weekly injection for weight management',
    category: 'weight-loss',
    image: '/medicines/semaglutide-1mg.jpg',
    price: 299,
    dosage: '4 x 1mg prefilled pens',
    overview: 'Semaglutide 1mg is an FDA-approved medication that helps with weight management.',
    howItWorks: 'Semaglutide works by mimicking the GLP-1 hormone to regulate appetite.',
    shipping: 'Discreet packaging with temperature-controlled shipping',
    support: '24/7 medical support and weekly check-ins',
    sideEffects: ['Nausea', 'Decreased appetite', 'Possible diarrhea'],
    benefits: ['Significant weight loss', 'Blood sugar control', 'Once-weekly injection'],
    inStock: true
  },
  {
    id: 'semaglutide-2mg',
    name: 'Semaglutide 2.4mg',
    description: 'Maintenance dose for optimal results',
    category: 'weight-loss',
    image: '/medicines/semaglutide-2mg.jpg',
    price: 399,
    dosage: '4 x 2.4mg prefilled pens',
    overview: 'Semaglutide 2.4mg is the maintenance dose for continued weight management.',
    howItWorks: 'Higher dose provides enhanced GLP-1 receptor activation.',
    shipping: 'Temperature-controlled shipping with ice packs',
    support: 'Enhanced medical monitoring and regular lab tests',
    sideEffects: ['Initial nausea', 'Reduced appetite', 'Possible constipation'],
    benefits: ['Maximum weight loss effectiveness', 'Sustained appetite control'],
    inStock: true
  },
  {
    id: 'sildenafil-50mg',
    name: 'Sildenafil 50mg',
    description: 'Generic Viagra for ED treatment',
    category: 'ed-treatments',
    image: '/medicines/sildenafil-50mg.jpg',
    price: 99,
    dosage: '10 tablets',
    overview: 'Sildenafil 50mg helps men achieve and maintain erections.',
    howItWorks: 'Relaxes smooth muscles in blood vessels to increase blood flow.',
    shipping: 'Discreet packaging with no indication of contents',
    support: '24/7 medical consultation',
    sideEffects: ['Headache', 'Flushing', 'Upset stomach', 'Nasal congestion'],
    benefits: ['Proven effectiveness', 'Fast-acting formula', 'Affordable'],
    inStock: true
  },
  {
    id: 'testo-cypionate',
    name: 'Testosterone Cypionate',
    description: 'Injectable testosterone for hormone therapy',
    category: 'hormone-therapy',
    image: '/medicines/testo-cypionate.jpg',
    price: 199,
    dosage: '10ml vial (200mg/ml)',
    overview: 'Testosterone Cypionate is used for hormone replacement therapy.',
    howItWorks: 'Provides sustained release of testosterone into the bloodstream.',
    shipping: 'Discreet packaging with medical-grade supplies',
    support: 'Regular hormone level monitoring',
    sideEffects: ['Injection site pain', 'Acne', 'Increased red blood cell count'],
    benefits: ['Increased energy', 'Improved muscle mass', 'Enhanced mood'],
    inStock: true
  }
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    
    let query = 'SELECT * FROM medicines';
    let params: any[] = [];
    
    if (category) {
      query += ' WHERE category = $1';
      params.push(category);
    }
    
    query += ' ORDER BY id';
    
    const result = await pool.query(query, params);
    
    const medicines = result.rows.map((row: any) => ({
      id: row.id,
      name: row.name,
      description: row.description,
      category: row.category,
      image: row.image,
      price: row.price,
      dosage: row.dosage,
      overview: row.overview,
      howItWorks: row.how_it_works,
      shipping: row.shipping,
      support: row.support,
      sideEffects: row.side_effects ? row.side_effects.split(',').map((s: string) => s.trim()).filter(Boolean) : [],
      benefits: row.benefits ? row.benefits.split(',').map((b: string) => b.trim()).filter(Boolean) : [],
      inStock: row.in_stock,
    }));

    return NextResponse.json(medicines);
  } catch (error) {
    console.error('Error fetching medicines from database:', error);
    console.log('Returning fallback medicines data');
    
    // Filter fallback medicines by category if specified
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    
    let filteredMedicines = fallbackMedicines;
    if (category) {
      filteredMedicines = fallbackMedicines.filter(medicine => medicine.category === category);
    }
    
    // Return fallback data when database is not available
    return NextResponse.json(filteredMedicines);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, category, image, price, dosage, overview, howItWorks, shipping, support, sideEffects, benefits, inStock } = body;

    const sideEffectsString = sideEffects ? sideEffects.join(', ') : null;
    const benefitsString = benefits ? benefits.join(', ') : null;

    const result = await pool.query(
      `INSERT INTO medicines (name, description, category, image, price, dosage, overview, how_it_works, shipping, support, side_effects, benefits, in_stock) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) 
       RETURNING *`,
      [name, description, category, image, price, dosage, overview, howItWorks, shipping, support, sideEffectsString, benefitsString, inStock]
    );

    const medicine = {
      id: result.rows[0].id,
      name: result.rows[0].name,
      description: result.rows[0].description,
      category: result.rows[0].category,
      image: result.rows[0].image,
      price: result.rows[0].price,
      dosage: result.rows[0].dosage,
      overview: result.rows[0].overview,
      howItWorks: result.rows[0].how_it_works,
      shipping: result.rows[0].shipping,
      support: result.rows[0].support,
      sideEffects: result.rows[0].side_effects ? result.rows[0].side_effects.split(',').map((s: string) => s.trim()).filter(Boolean) : [],
      benefits: result.rows[0].benefits ? result.rows[0].benefits.split(',').map((b: string) => b.trim()).filter(Boolean) : [],
      inStock: result.rows[0].in_stock,
    };

    return NextResponse.json(medicine, { status: 201 });
  } catch (error) {
    console.error('Error creating medicine:', error);
    return NextResponse.json(
      { error: 'Failed to create medicine' },
      { status: 500 }
    );
  }
}
