import { Collection, Product } from 'lib/shopify/types';
import { PRODUCTS } from './products';

const NOW = new Date().toISOString();

export const COLLECTIONS: Collection[] = [
  {
    handle: '',
    title: 'All',
    description: 'Todos los productos',
    seo: { title: 'All', description: 'Todos los productos' },
    path: '/search',
    updatedAt: NOW
  }
];

export function getCollectionByHandle(handle: string): Collection | undefined {
  if (!handle || handle === 'all') return COLLECTIONS[0];
  return undefined;
}

export function getProductsForCollection(handle: string): Product[] {
  if (!handle || handle === 'all') return PRODUCTS;
  // Example of filtering by tag if you add collections later
  return PRODUCTS;
}

