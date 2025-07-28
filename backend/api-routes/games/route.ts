
import { NextResponse } from 'next/server';
import { fetchGames } from '@/lib/data/gamification';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    if (!category) {
        return NextResponse.json({ error: 'Category parameter is required' }, { status: 400 });
    }

    try {
        const games = await fetchGames(category);
        return NextResponse.json(games);
    } catch (error) {
        console.error(`Failed to fetch games for category: ${category}`, error);
        return NextResponse.json({ error: 'Failed to fetch games' }, { status: 500 });
    }
}