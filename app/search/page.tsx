import Link from 'next/link';
import Grid from 'components/grid';
import ProductGridItems from 'components/layout/product-grid-items';
import { defaultSort, sorting } from 'lib/constants';
import { getProducts } from 'lib/shopify';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth';
import { getDictionary, getLocale } from 'lib/i18n/server';
import { PersonalizedRecommendations } from 'components/personalized-recommendations';
import { NewsletterSignup } from 'components/newsletter';

export const metadata = {
  title: 'Buscar Productos - Tienda Online',
  description: 'Encuentra los mejores productos con envío gratis y ofertas exclusivas.'
};

export default async function SearchPage(props: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const { sort, q: searchValue } = searchParams as { [key: string]: string };
  const { sortKey, reverse } = sorting.find((item) => item.slug === sort) || defaultSort;
  const dict = await getDictionary(await getLocale());

  const pageParam = Number((searchParams as any)?.page || '1');
  const page = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1;
  const pageSize = 12;
  const skip = (page - 1) * pageSize;

  // Fetch one extra to detect if there's a next page
  const pagePlusOne = await getProducts({ sortKey, reverse, query: searchValue, skip, take: pageSize + 1 });
  const hasNext = pagePlusOne.length > pageSize;
  const display = pagePlusOne.slice(0, pageSize);
  const hasPrev = page > 1;
  const resultsText = pagePlusOne.length > 1 ? dict.search.results : dict.search.result;
  const session = await getServerSession(authOptions);
  const showPrices = Boolean(session);

  // Mock data for recommendations
  const mockRecommendations = [
    {
      id: 'rec-1',
      title: 'Producto Recomendado',
      handle: 'producto-recomendado',
      price: '$49.99',
      image: '/placeholder-product.jpg',
      rating: 4.5,
      reviews: 89
    }
  ];

  return (
    <>
      {/* Hero Section for Search Page */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              {searchValue ? `Resultados para "${searchValue}"` : 'Descubre Nuestros Productos'}
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              {searchValue
                ? `Encontramos ${display.length} productos`
                : 'Miles de productos con envío gratis y ofertas exclusivas'
              }
            </p>

            {/* Search Stats */}
            {searchValue && display.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6 max-w-md mx-auto mb-8">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-blue-600">{display.length}</div>
                    <div className="text-sm text-gray-500">Productos</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">24h</div>
                    <div className="text-sm text-gray-500">Envío</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-purple-600">100%</div>
                    <div className="text-sm text-gray-500">Seguro</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Search Results */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {searchValue ? (
            <div className="mb-8">
              <p className="text-lg text-gray-600">
                {display.length === 0
                  ? `${dict.search.noMatch}`
                  : `Mostrando ${display.length} ${resultsText} para `}
                <span className="font-bold text-gray-900">&quot;{searchValue}&quot;</span>
              </p>

              {/* Filters/Sorting could go here */}
              <div className="flex justify-between items-center mt-4">
                <div className="text-sm text-gray-500">
                  Ordenar por: {sort || 'relevancia'}
                </div>
                <div className="text-sm text-gray-500">
                  Página {page} de {Math.ceil(display.length / pageSize) || 1}
                </div>
              </div>
            </div>
          ) : null}

          {display.length > 0 ? (
            <Grid className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              <ProductGridItems products={display} showPrices={showPrices} />
            </Grid>
          ) : (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl">🔍</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No encontramos productos
              </h3>
              <p className="text-gray-600 mb-6">
                Prueba con otros términos de búsqueda o explora nuestras categorías.
              </p>
              <Link
                href="/search"
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Ver todos los productos
              </Link>
            </div>
          )}

          {/* Pagination */}
          {(hasPrev || hasNext) && (
            <div className="flex justify-center mt-12">
              <nav className="flex items-center space-x-2">
                {hasPrev && (
                  <PaginationButton
                    disabled={!hasPrev}
                    href={{ sort, q: searchValue, page: String(page - 1) }}
                  >
                    Anterior
                  </PaginationButton>
                )}

                {/* Page numbers */}
                {Array.from({ length: Math.min(5, Math.ceil(display.length / pageSize) || 1) }, (_, i) => {
                  const pageNum = i + 1;
                  return (
                    <PaginationButton
                      key={pageNum}
                      disabled={false}
                      href={{ sort, q: searchValue, page: String(pageNum) }}
                      isActive={pageNum === page}
                    >
                      {pageNum}
                    </PaginationButton>
                  );
                })}

                {hasNext && (
                  <PaginationButton
                    disabled={!hasNext}
                    href={{ sort, q: searchValue, page: String(page + 1) }}
                  >
                    Siguiente
                  </PaginationButton>
                )}
              </nav>
            </div>
          )}
        </div>
      </section>

      {/* Personalized Recommendations */}
      {!searchValue && (
        <PersonalizedRecommendations
          recommendations={mockRecommendations}
          className="bg-gray-50"
        />
      )}

      {/* Newsletter Signup */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-white mb-8">
            <h2 className="text-3xl font-bold mb-4">
              ¡No te pierdas nuestras ofertas!
            </h2>
            <p className="text-xl opacity-90">
              Suscríbete y recibe descuentos exclusivos
            </p>
          </div>
          <NewsletterSignup
            variant="hero"
            placeholder="Tu email para ofertas exclusivas"
            buttonText="¡Suscribirme ahora!"
          />
        </div>
      </section>
    </>
  );
}

function PaginationButton({
  href,
  disabled,
  children,
  isActive = false
}: {
  href: { [k: string]: string | undefined };
  disabled?: boolean;
  children: React.ReactNode;
  isActive?: boolean;
}) {
  const params = new URLSearchParams();
  if (href.q) params.set('q', href.q);
  if (href.sort) params.set('sort', href.sort);
  if (href.page) params.set('page', href.page);
  const url = `/search${params.toString() ? `?${params.toString()}` : ''}`;
  return (
    <Link
      href={url}
      prefetch={true}
      className={`rounded border px-3 py-2 text-sm ${
        disabled
          ? 'cursor-not-allowed opacity-50 dark:border-neutral-800'
          : isActive
          ? 'bg-blue-600 text-white border-blue-600'
          : 'hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-900'
      }`}
      aria-disabled={disabled}
      tabIndex={disabled ? -1 : 0}
    >
      {children}
    </Link>
  );
}
