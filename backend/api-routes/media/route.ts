
import { NextResponse } from 'next/server';
import { fetchMedia } from '@/lib/data/media';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') as 'Movies' | 'Series' | null;

    if (!type || !['Movies', 'Series'].includes(type)) {
        return NextResponse.json({ error: 'Type parameter (Movies or Series) is required' }, { status: 400 });
    }

    try {
        const media = await fetchMedia(type);
        return NextResponse.json(media);
    } catch (error) {
        console.error(`Failed to fetch media for type: ${type}`, error);
        return NextResponse.json({ error: 'Failed to fetch media' }, { status: 500 });
    }
}