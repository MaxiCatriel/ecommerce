export default {
  navbar: { login: 'Ingresar', register: 'Registrarse', admin: 'Admin', logout: 'Salir' },
  login: { title: 'Ingresar', email: 'Email', password: 'Contraseña', submit: 'Entrar', error: 'Credenciales inválidas' },
  register: { title: 'Crear cuenta', name: 'Nombre', email: 'Email', password: 'Contraseña', submit: 'Registrarme' },
  product: { related: 'Productos relacionados' },
  common: {
    create: 'Crear', save: 'Guardar', delete: 'Eliminar',
    price: 'Precio', currency: 'Moneda', description: 'Descripción',
    imageFeaturedUrl: 'Imagen destacada URL', images: 'Imágenes (una URL por línea)',
    addToCart: 'Agregar al carrito', outOfStock: 'Sin stock', stock: 'Stock', available: 'Disponible',
    loginToSeePrices: 'Iniciá sesión para ver precios',
    loginToBuy: 'Iniciá sesión para comprar'
  },
  search: {
    title: 'Buscar', results: 'resultados', result: 'resultado',
    noMatch: 'No hay productos que coincidan con ',
    previous: 'Anterior', next: 'Siguiente'
  },
  cart: {
    myCart: 'Mi carrito', empty: 'Tu carrito está vacío.', taxes: 'Impuestos', shipping: 'Envío',
    calcAtCheckout: 'Se calcula en el checkout', total: 'Total', checkout: 'Ir al pago',
    openCart: 'Abrir carrito', closeCart: 'Cerrar carrito'
  },
  admin: {
    panel: 'Panel de Administración', restricted: 'Acceso restringido. Iniciá sesión como administrador.', goToLogin: 'Ir a login',
    products: 'Productos', users: 'Usuarios'
  },
  adminProducts: {
    title: 'Productos', featured: 'Destacados', carousel: 'Carrusel', showOnHome: 'Mostrar en inicio',
    handle: 'Handle (URL)',
    variants: 'Variantes', size: 'Talle', color: 'Color', addVariant: 'Agregar variante', availableShort: 'Disp.'
  },
  adminUsers: { title: 'Usuarios registrados', name: 'Nombre', email: 'Email', role: 'Rol', created: 'Creado', actions: 'Acciones', save: 'Guardar' }
} as const;
