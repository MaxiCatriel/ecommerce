import { Page } from 'lib/shopify/types';

const NOW = new Date().toISOString();

export const PAGES: Page[] = [
  {
    id: 'page_terminos',
    title: 'Términos y condiciones',
    handle: 'terminos',
    body:
      '<p>Estos son términos y condiciones de ejemplo. Reemplaza este contenido por tus políticas reales.</p>',
    bodySummary: 'Términos y condiciones (ejemplo).',
    createdAt: NOW,
    updatedAt: NOW,
    seo: { title: 'Términos', description: 'Términos y condiciones' }
  }
];

export function findPage(handle: string): Page | undefined {
  return PAGES.find((p) => p.handle === handle);
}

