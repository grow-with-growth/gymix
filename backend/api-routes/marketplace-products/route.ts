
import { NextResponse } from 'next/server';
import { fetchMarketplaceProducts } from '@/lib/data/marketplace';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    if (!category) {
        return NextResponse.json({ error: 'Category parameter is required' }, { status: 400 });
    }

    try {
        const products = await fetchMarketplaceProducts(category);
        return NextResponse.json(products);
    } catch (error) {
        console.error(`Failed to fetch products for category: ${category}`, error);
        return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
    }
}