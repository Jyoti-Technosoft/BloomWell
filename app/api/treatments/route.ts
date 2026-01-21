import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/app/lib/postgres';

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
    console.error('Error fetching treatments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch treatments', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
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
