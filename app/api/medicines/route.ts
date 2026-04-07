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
    category: 'Weight Loss',
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
    category: 'Weight Loss',
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
    id: 'semaglutide-tablets',
    name: 'Semaglutide Tablets 3mg',
    description: 'Oral semaglutide for weight management',
    category: "Women's Health",
    image: '/medicines/semaglutide-tablets.jpg',
    price: 329,
    dosage: '30 tablets (3mg each)',
    overview: 'Semaglutide Tablets offer the same powerful weight management benefits as injectable semaglutide in a convenient oral form.',
    howItWorks: 'Oral semaglutide works by activating GLP-1 receptors to regulate appetite and blood sugar levels.',
    shipping: 'Discreet packaging with moisture-protected materials',
    support: '24/7 medical support, weekly check-ins, and nutritional guidance',
    sideEffects: ['Nausea (usually temporary)', 'Decreased appetite', 'Possible digestive discomfort'],
    benefits: ['Convenient oral administration', 'Significant weight loss results', 'No injection discomfort'],
    inStock: true
  },
  {
    id: 'metformin-er',
    name: 'Metformin Extended Release',
    description: 'Weight management and metabolic support',
    category: "Women's Health",
    image: '/medicines/metformin-er.jpg',
    price: 89,
    dosage: '60 tablets (500mg)',
    overview: 'Metformin Extended Release supports weight management and metabolic health, particularly beneficial for women with insulin resistance.',
    howItWorks: 'Metformin improves insulin sensitivity and reduces glucose production in the liver.',
    shipping: 'Standard packaging with moisture protection',
    support: 'Monthly metabolic monitoring and nutritional counseling',
    sideEffects: ['Mild digestive discomfort (usually temporary)', 'Reduced appetite'],
    benefits: ['Improved insulin sensitivity', 'Supports weight management', 'Helps regulate menstrual cycles'],
    inStock: true
  },
  {
    id: 'ozempic-injection',
    name: 'Ozempic Injection',
    description: 'Weekly semaglutide injection',
    category: "Women's Health",
    image: '/medicines/ozempic-injection.jpg',
    price: 379,
    dosage: '4 x 0.5mg prefilled pens',
    overview: 'Ozempic is the brand name version of semaglutide, offering proven weight management and blood sugar control.',
    howItWorks: 'Ozempic activates GLP-1 receptors to regulate appetite, slow digestion, and improve blood sugar control.',
    shipping: 'Temperature-controlled shipping with ice packs and insulated packaging',
    support: 'Weekly progress monitoring and comprehensive medical oversight',
    sideEffects: ['Initial nausea (usually decreases)', 'Decreased appetite', 'Possible injection site reactions'],
    benefits: ['Brand name quality and reliability', 'Once-weekly injection convenience', 'Significant weight loss results'],
    inStock: true
  },
  {
    id: 'tirzepatide-5mg',
    name: 'Tirzepatide 5mg',
    description: 'Dual-action weekly injection',
    category: 'Weight Loss',
    image: '/medicines/tirzepatide-5mg.jpg',
    price: 349,
    dosage: '4 x 5mg vials',
    overview: 'Tirzepatide 5mg is a revolutionary dual-action medication for enhanced weight loss results.',
    howItWorks: 'Tirzepatide works by activating both GIP and GLP-1 receptors.',
    shipping: 'Temperature-controlled shipping with ice packs',
    support: 'Dedicated medical team and regular monitoring',
    sideEffects: ['Nausea (usually decreases)', 'Decreased appetite', 'Possible vomiting'],
    benefits: ['Dual-action formula', 'Significant weight loss', 'Improved A1C levels'],
    inStock: true
  },
  {
    id: 'tirzepatide-10mg',
    name: 'Tirzepatide 10mg',
    description: 'Higher dosage for better results',
    category: 'Weight Loss',
    image: '/medicines/tirzepatide-10mg.jpg',
    price: 449,
    dosage: '4 x 10mg vials',
    overview: 'Tirzepatide 10mg provides enhanced dual-action receptor activation for maximum therapeutic effect.',
    howItWorks: 'Higher dose provides stronger GIP and GLP-1 receptor activation.',
    shipping: 'Premium temperature-controlled shipping',
    support: 'Intensive medical supervision and comprehensive lab monitoring',
    sideEffects: ['Initial gastrointestinal effects', 'Appetite suppression'],
    benefits: ['Maximum therapeutic effectiveness', 'Superior weight loss results'],
    inStock: true
  },
  {
    id: 'lipotropic-injection',
    name: 'Lipotropic Injection',
    description: 'Fat metabolism support',
    category: 'Wellness',
    image: '/medicines/lipotropic-injection.webp',
    price: 149,
    dosage: '10ml multi-dose vial',
    overview: 'Lipotropic Injection contains essential nutrients that support fat metabolism and liver function.',
    howItWorks: 'Combines B-vitamins, amino acids, and other compounds that enhance fat metabolism.',
    shipping: 'Complete injection supplies included',
    support: 'Weekly progress tracking and metabolic monitoring',
    sideEffects: ['Mild injection site discomfort', 'Temporary flushing'],
    benefits: ['Enhanced fat metabolism', 'Increased energy levels', 'Liver detoxification support'],
    inStock: true
  },
  {
    id: 'b12-injection',
    name: 'Vitamin B12 Injection',
    description: 'Energy and metabolism boost',
    category: 'Wellness',
    image: '/medicines/b12-injection.avif',
    price: 89,
    dosage: '1ml vial (1000mcg/ml)',
    overview: 'Vitamin B12 Injection provides a direct boost of this essential nutrient.',
    howItWorks: 'Delivers high-dose B12 directly into the bloodstream for maximum absorption.',
    shipping: 'Professional medical supplies included',
    support: 'Monthly wellness check-ins and B12 level monitoring',
    sideEffects: ['Mild injection site discomfort', 'Temporary redness'],
    benefits: ['Increased energy levels', 'Improved metabolism', 'Enhanced cognitive function'],
    inStock: true
  },
  {
    id: 'glutathione-injection',
    name: 'Glutathione Injection',
    description: 'Powerful antioxidant therapy',
    category: 'Wellness',
    image: '/medicines/glutathione-injection.jpg',
    price: 199,
    dosage: '10ml vial (200mg/ml)',
    overview: 'Glutathione Injection delivers the body\'s master antioxidant directly.',
    howItWorks: 'Provides high concentrations of reduced glutathione to combat oxidative stress.',
    shipping: 'Medical-grade supplies and cold chain shipping',
    support: 'Monthly skin assessments and wellness consultations',
    sideEffects: ['Mild injection site reactions', 'Temporary skin lightening'],
    benefits: ['Powerful antioxidant protection', 'Skin brightening and anti-aging'],
    inStock: true
  }
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    
    let query = 'SELECT * FROM medicines';
    const params: (string | number)[] = [];
    
    if (category) {
      query += ' WHERE category = $1';
      params.push(category);
    }
    
    query += ' ORDER BY id';
    
    const result = await pool.query(query, params);
    
    const medicines = result.rows.map((row: {
      id: string;
      name: string;
      description: string;
      category: string;
      image: string;
      price: number;
      dosage: string;
      in_stock: boolean;
      overview?: string;
      how_it_works?: string;
      shipping?: string;
      support?: string;
      side_effects?: string;
      benefits?: string;
    }) => ({
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
  } catch (error: unknown) {
    console.error('Error creating medicine:', error instanceof Error ? error.message : String(error));
    return NextResponse.json(
      { error: 'Failed to create medicine' },
      { status: 500 }
    );
  }
}
