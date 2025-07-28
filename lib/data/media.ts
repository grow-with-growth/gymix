import {
    MediaContent,
} from '../../types';
import { getData } from '../utils';

export const dbMedia: MediaContent[] = [
    ...Array.from({ length: 12 }, (_, i) => ({
        id: `mov_${i + 1}`,
        title: `Epic Movie ${i + 1}`,
        type: 'Movies' as const,
        imageUrl: `https://source.unsplash.com/random/400x600?movie,${i}`,
    })),
    ...Array.from({ length: 12 }, (_, i) => ({
        id: `ser_${i + 1}`,
        title: `Gripping Series ${i + 1}`,
        type: 'Series' as const,
        imageUrl: `https://source.unsplash.com/random/400x600?series,${i}`,
    })),
];

export const fetchMedia = (type: 'Movies' | 'Series') => getData(dbMedia.filter(m => m.type === type));
