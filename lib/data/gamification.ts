import {
    Game,
} from '../../types';
import { getData } from '../utils';

export const dbGames: Game[] = [
    { id: 'g1', title: 'Calculus Clash', category: 'Math', description: 'Solve derivatives faster than your opponent.', imageUrl: 'https://source.unsplash.com/random/400x400?math,1' },
    { id: 'g2', title: 'Algebra Adventure', category: 'Math', description: 'Explore ancient ruins by solving for x.', imageUrl: 'https://source.unsplash.com/random/400x400?math,2' },
    { id: 'g3', title: 'Chem Lab Chaos', category: 'Science', description: 'Mix virtual chemicals to create new compounds.', imageUrl: 'https://source.unsplash.com/random/400x400?science,1' },
    { id: 'g4', title: 'Biology Builder', category: 'Science', description: 'Assemble a cell from its organelles.', imageUrl: 'https://source.unsplash.com/random/400x400?science,2' },
    { id: 'g5', title: 'World Wanderer', category: 'Adventures', description: 'Identify famous landmarks on a 3D globe.', imageUrl: 'https://source.unsplash.com/random/400x400?adventure,1' },
    { id: 'g6', title: 'Quantum Leap', category: 'Physics', description: 'Navigate a maze using the principles of quantum mechanics.', imageUrl: 'https://source.unsplash.com/random/400x400?physics,1' },
    { id: 'g7', title: 'Verb Voyager', category: 'Languages', description: 'Conjugate verbs correctly to travel through time.', imageUrl: 'https://source.unsplash.com/random/400x400?language,1' },
    { id: 'g8', 'title': 'History Hero', category: 'Knowledge', description: 'Answer trivia questions to rewrite history.', imageUrl: 'https://source.unsplash.com/random/400x400?knowledge,1' },
];

export const fetchGames = (category: string) => getData(dbGames.filter(g => g.category === category));
