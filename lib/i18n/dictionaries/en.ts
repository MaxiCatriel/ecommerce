export default {
  navbar: { login: 'Login', register: 'Register', admin: 'Admin', logout: 'Logout' },
  login: { title: 'Sign In', email: 'Email', password: 'Password', submit: 'Sign In', error: 'Invalid credentials' },
  register: { title: 'Create account', name: 'Name', email: 'Email', password: 'Password', submit: 'Sign Up' },
  product: { related: 'Related Products' },
  common: {
    create: 'Create', save: 'Save', delete: 'Delete',
    price: 'Price', currency: 'Currency', description: 'Description',
    imageFeaturedUrl: 'Featured image URL', images: 'Images (one URL per line)',
    addToCart: 'Add To Cart', outOfStock: 'Out of stock', stock: 'Stock', available: 'Available',
    loginToSeePrices: 'Log in to see prices',
    loginToBuy: 'Log in to buy'
  },
  search: {
    title: 'Search', results: 'results', result: 'result',
    noMatch: 'There are no products that match ',
    previous: 'Previous', next: 'Next'
  },
  cart: {
    myCart: 'My Cart', empty: 'Your cart is empty.', taxes: 'Taxes', shipping: 'Shipping',
    calcAtCheckout: 'Calculated at checkout', total: 'Total', checkout: 'Proceed to Checkout',
    openCart: 'Open cart', closeCart: 'Close cart'
  },
  admin: {
    panel: 'Admin Panel', restricted: 'Restricted access. Log in as administrator.', goToLogin: 'Go to login',
    products: 'Products', users: 'Users'
  },
  adminProducts: {
    title: 'Products', featured: 'Featured', carousel: 'Carousel', showOnHome: 'Show on homepage',
    handle: 'Handle (URL)',
    variants: 'Variants', size: 'Size', color: 'Color', addVariant: 'Add variant', availableShort: 'Avail.'
  },
  adminUsers: { title: 'Registered users', name: 'Name', email: 'Email', role: 'Role', created: 'Created', actions: 'Actions', save: 'Save' }
} as const;
