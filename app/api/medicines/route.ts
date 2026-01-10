import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.NEON_DATABASE_URL,
});

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
    console.error('Error fetching medicines:', error);
    return NextResponse.json(
      { error: 'Failed to fetch medicines' },
      { status: 500 }
    );
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
