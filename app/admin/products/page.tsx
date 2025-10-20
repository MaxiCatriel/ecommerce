import { prisma } from 'lib/db';
import { getDictionary, getLocale } from 'lib/i18n/server';
import { revalidatePath } from 'next/cache';

async function deleteProduct(formData: FormData) {
  'use server';
  const id = String(formData.get('id') || '');
  if (!id) return;
  await prisma.$transaction([
    prisma.image.deleteMany({ where: { productId: id } }),
    prisma.variant.deleteMany({ where: { productId: id } }),
    prisma.product.delete({ where: { id } })
  ]);
  revalidatePath('/admin/products');
}

async function updateProduct(formData: FormData) {
  'use server';
  const id = String(formData.get('id') || '');
  if (!id) return;
  const title = String(formData.get('title') || '');
  const rawHandle = String(formData.get('handle') || '');
  const handle = rawHandle
    .normalize('NFKD')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/[\s_]+/g, '-')
    .toLowerCase();
  const price = String(formData.get('price') || '0');
  const currency = String(formData.get('currency') || 'ARS');
  const description = String(formData.get('description') || '');
  const featuredImageUrl = String(formData.get('featuredImageUrl') || '');
  const homepageFeatured = formData.get('homepageFeatured');
  const homepageCarousel = formData.get('homepageCarousel');
  const tags = [homepageFeatured ? 'homepage-featured' : null, homepageCarousel ? 'homepage-carousel' : null]
    .filter(Boolean)
    .join(',');
  const imagesInput = String(formData.get('images') || '').trim();

  const images = imagesInput
    ? imagesInput
        .split(/\r?\n/)
        .map((s) => s.trim())
        .filter(Boolean)
        .map((url) => ({ url, altText: title, width: 1200, height: 1200 }))
    : [];

  await prisma.$transaction([
    prisma.product.update({
      where: { id },
      data: {
        title,
        handle,
        description,
        descriptionHtml: description,
        priceAmount: price,
        currencyCode: currency,
        featuredImageUrl,
        tags
      }
    }),
    prisma.image.deleteMany({ where: { productId: id } }),
    images.length ? prisma.image.createMany({ data: images.map((i) => ({ ...i, productId: id })) }) : prisma.image.findMany({ where: { productId: id } })
  ]);
  revalidatePath('/admin/products');
}

async function createProduct(formData: FormData) {
  'use server';
  const title = String(formData.get('title') || '');
  const rawHandle = String(formData.get('handle') || '');
  const handle = rawHandle
    .normalize('NFKD')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/[\s_]+/g, '-')
    .toLowerCase();
  const price = String(formData.get('price') || '0');
  const currency = String(formData.get('currency') || 'ARS');
  const description = String(formData.get('description') || '');
  const featuredImageUrl = String(formData.get('featuredImageUrl') || '');
  const homepageFeatured = formData.get('homepageFeatured');
  const homepageCarousel = formData.get('homepageCarousel');
  const tags = [homepageFeatured ? 'homepage-featured' : null, homepageCarousel ? 'homepage-carousel' : null]
    .filter(Boolean)
    .join(',');
  if (!title || !handle) return;
  await prisma.product.create({
    data: {
      title,
      handle,
      description,
      descriptionHtml: description,
      priceAmount: price,
      currencyCode: currency,
      featuredImageUrl,
      tags,
      availableForSale: true
    }
  });
  revalidatePath('/admin/products');
}

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: { page?: string; search?: string };
}) {
  const page = parseInt(searchParams.page || '1', 10);
  const search = searchParams.search || '';
  const limit = 10;
  const skip = (page - 1) * limit;

  const where = search
    ? {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { handle: { contains: search, mode: 'insensitive' } },
        ],
      }
    : {};

  const products = await prisma.product.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: { variants: true },
    skip,
    take: limit,
  });

  const totalProducts = await prisma.product.count({ where });
  const totalPages = Math.ceil(totalProducts / limit);

  const dict = await getDictionary(await getLocale());

  return (
    <div className="bg-white">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">{dict.adminProducts.title}</h1>
        <div className="flex items-center gap-4">
          <form method="GET" className="flex items-center gap-2">
            <input
              name="search"
              defaultValue={search}
              placeholder="Buscar productos..."
              className="rounded border px-3 py-2 text-gray-900"
            />
            <button type="submit" className="rounded bg-blue-600 px-4 py-2 text-white">
              Buscar
            </button>
          </form>
          <details className="relative">
            <summary className="cursor-pointer rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700">
              ➕ Nuevo Producto
            </summary>
            <div className="absolute right-0 top-full z-10 mt-2 w-96 rounded-lg border bg-white p-4 shadow-lg">
              <form action={createProduct} className="grid gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-900">Título</label>
                  <input name="title" required className="mt-1 w-full rounded border p-2 text-gray-900" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900">{dict.adminProducts.handle}</label>
                  <input name="handle" required className="mt-1 w-full rounded border p-2 text-gray-900" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-900">{dict.common.price}</label>
                    <input name="price" required defaultValue="0" className="mt-1 w-full rounded border p-2 text-gray-900" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900">{dict.common.currency}</label>
                    <input name="currency" defaultValue="ARS" className="mt-1 w-full rounded border p-2 text-gray-900" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900">{dict.adminProducts.showOnHome}</label>
                  <div className="mt-1 flex gap-4">
                    <label className="flex items-center gap-2 text-gray-900">
                      <input type="checkbox" name="homepageFeatured" />
                      {dict.adminProducts.featured}
                    </label>
                    <label className="flex items-center gap-2 text-gray-900">
                      <input type="checkbox" name="homepageCarousel" />
                      {dict.adminProducts.carousel}
                    </label>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900">{dict.common.imageFeaturedUrl}</label>
                  <input name="featuredImageUrl" className="mt-1 w-full rounded border p-2 text-gray-900" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900">{dict.common.description}</label>
                  <textarea name="description" className="mt-1 w-full rounded border p-2 text-gray-900" rows={3} />
                </div>
                <button className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
                  {dict.common.create}
                </button>
              </form>
            </div>
          </details>
        </div>
      </div>

      {/* Products Table */}
      <div className="overflow-x-auto rounded-lg border shadow">
        <table className="min-w-full table-auto border-collapse bg-white">
          <thead className="bg-gray-50">
            <tr>
              <th className="border-b px-4 py-3 text-left text-sm font-medium text-gray-700">Imagen</th>
              <th className="border-b px-4 py-3 text-left text-sm font-medium text-gray-700">Título</th>
              <th className="border-b px-4 py-3 text-left text-sm font-medium text-gray-700">Handle</th>
              <th className="border-b px-4 py-3 text-left text-sm font-medium text-gray-700">Precio</th>
              <th className="border-b px-4 py-3 text-left text-sm font-medium text-gray-700">Etiquetas</th>
              <th className="border-b px-4 py-3 text-left text-sm font-medium text-gray-700">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p: any) => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="border-b px-4 py-3">
                  {p.featuredImageUrl ? (
                    <img src={p.featuredImageUrl} alt={p.title} className="h-12 w-12 rounded object-cover" />
                  ) : (
                    <div className="h-12 w-12 rounded bg-gray-200 flex items-center justify-center text-xs text-gray-500">
                      Sin img
                    </div>
                  )}
                </td>
                <td className="border-b px-4 py-3 text-gray-900 font-medium">{p.title}</td>
                <td className="border-b px-4 py-3 text-gray-600">/{p.handle}</td>
                <td className="border-b px-4 py-3 text-gray-900">{p.priceAmount} {p.currencyCode}</td>
                <td className="border-b px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {(p.tags || '').includes('homepage-featured') && (
                      <span className="rounded-full bg-green-100 px-2 py-1 text-xs text-green-800">Destacado</span>
                    )}
                    {(p.tags || '').includes('homepage-carousel') && (
                      <span className="rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-800">Carrusel</span>
                    )}
                  </div>
                </td>
                <td className="border-b px-4 py-3">
                  <div className="flex gap-2">
                    <details>
                      <summary className="cursor-pointer text-blue-600 hover:underline text-sm">Editar</summary>
                      <div className="mt-2 w-96 rounded-lg border bg-white p-4 shadow-lg">
                        <form action={updateProduct} className="grid gap-3">
                          <input type="hidden" name="id" value={p.id} />
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-sm text-gray-900">Título</label>
                              <input name="title" defaultValue={p.title} className="mt-1 w-full rounded border p-2 text-gray-900" />
                            </div>
                            <div>
                              <label className="block text-sm text-gray-900">Handle</label>
                              <input name="handle" defaultValue={p.handle} className="mt-1 w-full rounded border p-2 text-gray-900" />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-sm text-gray-900">{dict.common.price}</label>
                              <input name="price" defaultValue={p.priceAmount} className="mt-1 w-full rounded border p-2 text-gray-900" />
                            </div>
                            <div>
                              <label className="block text-sm text-gray-900">{dict.common.currency}</label>
                              <input name="currency" defaultValue={p.currencyCode} className="mt-1 w-full rounded border p-2 text-gray-900" />
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm text-gray-900">{dict.adminProducts.showOnHome}</label>
                            <div className="mt-1 flex gap-4">
                              <label className="flex items-center gap-2 text-gray-900">
                                <input type="checkbox" name="homepageFeatured" defaultChecked={(p.tags || '').includes('homepage-featured')} />
                                {dict.adminProducts.featured}
                              </label>
                              <label className="flex items-center gap-2 text-gray-900">
                                <input type="checkbox" name="homepageCarousel" defaultChecked={(p.tags || '').includes('homepage-carousel')} />
                                {dict.adminProducts.carousel}
                              </label>
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm text-gray-900">{dict.common.imageFeaturedUrl}</label>
                            <input name="featuredImageUrl" defaultValue={p.featuredImageUrl || ''} className="mt-1 w-full rounded border p-2 text-gray-900" />
                          </div>
                          <div>
                            <label className="block text-sm text-gray-900">{dict.common.description}</label>
                            <textarea name="description" defaultValue={p.description} rows={3} className="mt-1 w-full rounded border p-2 text-gray-900" />
                          </div>
                          <div>
                            <label className="block text-sm text-gray-900">{dict.common.images}</label>
                            <textarea name="images" rows={2} placeholder="https://...\nhttps://..." className="mt-1 w-full rounded border p-2 text-gray-900" />
                          </div>
                          <div className="flex gap-2">
                            <button className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">{dict.common.save}</button>
                            <button
                              className="rounded border px-4 py-2 text-red-600 hover:bg-red-50"
                              formAction={deleteProduct}
                            >
                              {dict.common.delete}
                            </button>
                          </div>
                        </form>

                        {/* Variants Section */}
                        <div className="mt-4 border-t pt-4">
                          <h4 className="font-medium text-sm">{dict.adminProducts.variants}</h4>
                          {Array.isArray(p.variants) && p.variants.length ? (
                            <div className="mt-2 overflow-x-auto">
                              <table className="min-w-full table-auto border-collapse border border-gray-200 text-sm">
                                <thead>
                                  <tr className="bg-gray-50">
                                    <th className="border border-gray-200 px-2 py-1">Título</th>
                                    <th className="border border-gray-200 px-2 py-1">Precio</th>
                                    <th className="border border-gray-200 px-2 py-1">Stock</th>
                                    <th className="border border-gray-200 px-2 py-1">Disponible</th>
                                    <th className="border border-gray-200 px-2 py-1">Acciones</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {p.variants.map((v: any) => (
                                    <tr key={v.id} className="hover:bg-gray-25">
                                      <td className="border border-gray-200 px-2 py-1">{v.title}</td>
                                      <td className="border border-gray-200 px-2 py-1">{v.priceAmount}</td>
                                      <td className="border border-gray-200 px-2 py-1">{v.stock || 0}</td>
                                      <td className="border border-gray-200 px-2 py-1">{v.availableForSale ? 'Sí' : 'No'}</td>
                                      <td className="border border-gray-200 px-2 py-1">
                                        <form action={updateVariant} className="inline">
                                          <input type="hidden" name="id" value={v.id} />
                                          <input name="priceAmount" defaultValue={v.priceAmount} className="w-16 rounded border p-1 text-xs text-gray-900" />
                                          <input name="stock" type="number" min="0" defaultValue={v.stock || 0} className="w-12 rounded border p-1 text-xs ml-1 text-gray-900" />
                                          <input name="availableForSale" type="checkbox" defaultChecked={v.availableForSale} className="ml-1" />
                                          <button className="ml-1 rounded bg-green-600 px-2 py-1 text-xs text-white" title="Guardar">{dict.common.save}</button>
                                        </form>
                                        <form action={deleteVariant} className="inline ml-1">
                                          <input type="hidden" name="id" value={v.id} />
                                          <button className="rounded bg-red-600 px-2 py-1 text-xs text-white" title="Eliminar">X</button>
                                        </form>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          ) : (
                            <p className="mt-2 text-sm text-gray-500">No hay variantes.</p>
                          )}

                          {/* Add Variant Form */}
                          <form action={createVariant} className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-4">
                            <input type="hidden" name="productId" value={p.id} />
                            <div>
                              <label className="block text-xs text-gray-900">{dict.adminProducts.size}</label>
                              <input name="size" placeholder="Ej: 40" className="mt-1 w-full rounded border p-1 text-sm text-gray-900" />
                            </div>
                            <div>
                              <label className="block text-xs text-gray-900">{dict.adminProducts.color}</label>
                              <input name="color" placeholder="Ej: Negro" className="mt-1 w-full rounded border p-1 text-sm text-gray-900" />
                            </div>
                            <div>
                              <label className="block text-xs text-gray-900">{dict.common.price}</label>
                              <input name="price" defaultValue={p.priceAmount} className="mt-1 w-full rounded border p-1 text-sm text-gray-900" />
                            </div>
                            <div>
                              <label className="block text-xs text-gray-900">{dict.common.stock}</label>
                              <input name="stock" type="number" min="0" defaultValue={0} className="mt-1 w-full rounded border p-1 text-sm text-gray-900" />
                            </div>
                            <div className="md:col-span-4 flex items-center gap-2">
                              <label className="flex items-center gap-1 text-xs text-gray-900">
                                <input type="checkbox" name="availableForSale" defaultChecked />
                                {dict.common.available}
                              </label>
                              <button className="ml-auto rounded bg-blue-600 px-3 py-1 text-sm text-white">{dict.adminProducts.addVariant}</button>
                            </div>
                          </form>
                        </div>
                      </div>
                    </details>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Mostrando {skip + 1} a {Math.min(skip + limit, totalProducts)} de {totalProducts} productos
          </div>
          <div className="flex gap-2">
            {page > 1 && (
              <a
                href={`?page=${page - 1}${search ? `&search=${encodeURIComponent(search)}` : ''}`}
                className="rounded border px-3 py-2 text-sm text-gray-900 hover:bg-gray-50"
              >
                Anterior
              </a>
            )}
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <a
                key={p}
                href={`?page=${p}${search ? `&search=${encodeURIComponent(search)}` : ''}`}
                className={`rounded border px-3 py-2 text-sm text-gray-900 ${
                  p === page ? 'bg-blue-600 text-white' : 'hover:bg-gray-50'
                }`}
              >
                {p}
              </a>
            ))}
            {page < totalPages && (
              <a
                href={`?page=${page + 1}${search ? `&search=${encodeURIComponent(search)}` : ''}`}
                className="rounded border px-3 py-2 text-sm text-gray-900 hover:bg-gray-50"
              >
                Siguiente
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

async function createVariant(formData: FormData) {
  'use server';
  const productId = String(formData.get('productId') || '');
  const size = String(formData.get('size') || '').trim();
  const color = String(formData.get('color') || '').trim();
  const price = String(formData.get('price') || '0');
  const stock = Number(formData.get('stock') || 0);
  const availableForSale = String(formData.get('availableForSale') || '') === 'on';
  if (!productId) return;
  const selectedOptions = [
    size ? { name: 'Talle', value: size } : null,
    color ? { name: 'Color', value: color } : null
  ].filter(Boolean);
  const title = [size && `Talle ${size}`, color && color].filter(Boolean).join(' · ') || 'Default Title';
  await prisma.variant.create({
    data: {
      productId,
      title,
      priceAmount: price,
      currencyCode: 'ARS',
      availableForSale,
      stock,
      selectedOptions: JSON.stringify(selectedOptions)
    }
  });
  revalidatePath('/admin/products');
}

async function deleteVariant(formData: FormData) {
  'use server';
  const id = String(formData.get('id') || '');
  if (!id) return;
  await prisma.variant.delete({ where: { id } });
  revalidatePath('/admin/products');
}

async function toggleVariantAvailability(formData: FormData) {
  'use server';
  const id = String(formData.get('id') || '');
  const available = String(formData.get('availableForSale') || 'false') === 'true';
  if (!id) return;
  await prisma.variant.update({ where: { id }, data: { availableForSale: available } });
  revalidatePath('/admin/products');
}

async function updateVariant(formData: FormData) {
  'use server';
  const id = String(formData.get('id') || '');
  const priceAmount = String(formData.get('priceAmount') || '0');
  const stock = Number(formData.get('stock') || 0);
  const availableForSale = String(formData.get('availableForSale') || '') === 'on';
  if (!id) return;
  await prisma.variant.update({ where: { id }, data: { priceAmount, stock, availableForSale } });
  revalidatePath('/admin/products');
}
