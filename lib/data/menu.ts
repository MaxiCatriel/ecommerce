import { Menu } from 'lib/shopify/types';

export function getHeaderMenu(): Menu[] {
  return [
    { title: 'Inicio', path: '/' },
    { title: 'Buscar', path: '/search' }
  ];
}

export function getFooterMenu(): Menu[] {
  return [
    { title: 'Contacto', path: '/' },
    { title: 'Términos', path: '/pages/terminos' }
  ];
}

