// app/api/cart/route.ts
import { NextResponse } from 'next/server';
import { db } from '../../lib/db';

export async function GET(request: Request) {
  try {
    // Get user from session
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/auth/me`, {
      headers: {
        cookie: request.headers.get('cookie') || '',
      },
    });
    if (!response.ok) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }
    const user = await response.json();
    
    // Get cart items for the user
    const cartItems = await db.cart.findMany({ userId: user.id });
    // Get product details for each cart item
    const products = await db.products.findMany();
    const productMap = new Map(products.map(p => [p.id, p]));
    // Combine cart items with product details
    const items = cartItems
      .map(item => {
        const product = productMap.get(item.productId);
        return product ? {
          ...item,
          product: {
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image
          }
        } : null;
      })
      .filter(Boolean);
    return NextResponse.json({ items });
  } catch (error) {
    console.error('Failed to fetch cart items', error);
    return NextResponse.json(
      { error: 'Failed to fetch cart items' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { productId, quantity = 1 } = await request.json();
    
    // Get user from session
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/auth/me`, {
      headers: {
        cookie: request.headers.get('cookie') || '',
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const user = await response.json();
    
    // Add or update item in cart
    const cartItem = await db.cart.upsert(
      { userId: user.id, productId },
      { quantity }
    );

    return NextResponse.json(cartItem);
  } catch (error) {
    console.error('Failed to add to cart', error);
    return NextResponse.json(
      { error: 'Failed to add to cart' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');
    
    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    // Get user from session
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/auth/me`, {
      headers: {
        cookie: request.headers.get('cookie') || '',
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const user = await response.json();
    
    // Remove item from cart
    const deletedItem = await db.cart.delete({
      userId: user.id,
      productId
    });

    if (!deletedItem) {
      return NextResponse.json(
        { error: 'Item not found in cart' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to remove from cart', error);
    return NextResponse.json(
      { error: 'Failed to remove from cart' },
      { status: 500 }
    );
  }
}