import {
    MarketplaceProduct,
} from '../../types';
import { getData } from '../utils';

export const dbMarketplaceProducts: MarketplaceProduct[] = Array.from({ length: 16 }, (_, i) => ({
    id: `prod_${i + 1}`,
    name: `Course Material #${i + 1}`,
    category: i % 4 === 0 ? 'Textbooks' : i % 4 === 1 ? 'Software' : i % 4 === 2 ? 'Supplies' : 'Apparel',
    price: parseFloat((Math.random() * (100 - 10) + 10).toFixed(2)),
    imageUrl: `https://source.unsplash.com/random/400x400?product,${i}`,
    stock: Math.floor(Math.random() * 100),
}));


export const fetchMarketplaceProducts = (category: string) => {
    if (category === 'All Products' || category === 'Overview') {
        return getData(dbMarketplaceProducts);
    }
    const filtered = dbMarketplaceProducts.filter(p => p.category === category);
    return getData(filtered);
};
