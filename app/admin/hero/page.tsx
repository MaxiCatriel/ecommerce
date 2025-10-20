import { prisma } from 'lib/db';
import { getDictionary, getLocale } from 'lib/i18n/server';
import { revalidatePath } from 'next/cache';

async function deleteHeroSlide(formData: FormData) {
  'use server';
  const id = String(formData.get('id') || '');
  if (!id) return;
  await prisma.heroSlide.delete({ where: { id } });
  revalidatePath('/admin/hero');
}

async function updateHeroSlide(formData: FormData) {
  'use server';
  const id = String(formData.get('id') || '');
  if (!id) return;
  const title = String(formData.get('title') || '');
  const subtitle = String(formData.get('subtitle') || '');
  const cta = String(formData.get('cta') || '');
  const ctaLink = String(formData.get('ctaLink') || '');
  const background = String(formData.get('background') || '');
  const image = String(formData.get('image') || '');
  const order = parseInt(String(formData.get('order') || '0'), 10);
  const isActive = formData.get('isActive') === 'on';

  await prisma.heroSlide.update({
    where: { id },
    data: { title, subtitle, cta, ctaLink, background, image, order, isActive }
  });
  revalidatePath('/admin/hero');
}

async function createHeroSlide(formData: FormData) {
  'use server';
  const title = String(formData.get('title') || '');
  const subtitle = String(formData.get('subtitle') || '');
  const cta = String(formData.get('cta') || '');
  const ctaLink = String(formData.get('ctaLink') || '');
  const background = String(formData.get('background') || '');
  const image = String(formData.get('image') || '');
  const order = parseInt(String(formData.get('order') || '0'), 10);
  const isActive = formData.get('isActive') !== null;

  if (!title) return;
  await prisma.heroSlide.create({
    data: { title, subtitle, cta, ctaLink, background, image, order, isActive }
  });
  revalidatePath('/admin/hero');
}

export default async function AdminHeroPage() {
  const slides = await prisma.heroSlide.findMany({ orderBy: { order: 'asc' } });
  const dict = await getDictionary(await getLocale());

  return (
    <div className="p-6 bg-white text-gray-900">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Gestión del Hero</h1>

      {/* Create Slide Form */}
      <details className="mb-6 rounded-lg border bg-gray-50 p-4">
        <summary className="cursor-pointer font-medium text-lg text-gray-900">➕ Nuevo Slide</summary>
        <form action={createHeroSlide} className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-900">Título</label>
            <input name="title" required className="mt-1 w-full rounded border p-2 text-gray-900 bg-white" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900">Subtítulo</label>
            <input name="subtitle" className="mt-1 w-full rounded border p-2 text-gray-900 bg-white" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900">Texto del CTA</label>
            <input name="cta" className="mt-1 w-full rounded border p-2 text-gray-900 bg-white" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900">Enlace del CTA</label>
            <input name="ctaLink" className="mt-1 w-full rounded border p-2 text-gray-900 bg-white" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900">Fondo (CSS class)</label>
            <input name="background" placeholder="bg-gradient-to-br from-blue-600 to-purple-700" className="mt-1 w-full rounded border p-2 text-gray-900 bg-white" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900">Imagen</label>
            <input name="image" className="mt-1 w-full rounded border p-2 text-gray-900 bg-white" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900">Orden</label>
            <input name="order" type="number" defaultValue={0} className="mt-1 w-full rounded border p-2 text-gray-900 bg-white" />
          </div>
          <div className="flex items-center">
            <input name="isActive" type="checkbox" defaultChecked className="mr-2" />
            <label className="text-sm font-medium text-gray-900">Activo</label>
          </div>
          <div className="md:col-span-2">
            <button className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">Crear Slide</button>
          </div>
        </form>
      </details>

      {/* Slides Table */}
      <div className="overflow-x-auto rounded-lg border shadow">
        <table className="min-w-full table-auto border-collapse bg-white">
          <thead className="bg-gray-50">
            <tr>
              <th className="border-b px-4 py-3 text-left text-sm font-medium text-gray-900">Título</th>
              <th className="border-b px-4 py-3 text-left text-sm font-medium text-gray-900">CTA</th>
              <th className="border-b px-4 py-3 text-left text-sm font-medium text-gray-900">Orden</th>
              <th className="border-b px-4 py-3 text-left text-sm font-medium text-gray-900">Activo</th>
              <th className="border-b px-4 py-3 text-left text-sm font-medium text-gray-900">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {slides.map((slide: any) => (
              <tr key={slide.id} className="hover:bg-gray-50">
                <td className="border-b px-4 py-3 font-medium text-gray-900">{slide.title}</td>
                <td className="border-b px-4 py-3 text-gray-900">{slide.cta}</td>
                <td className="border-b px-4 py-3 text-gray-900">{slide.order}</td>
                <td className="border-b px-4 py-3 text-gray-900">{slide.isActive ? 'Sí' : 'No'}</td>
                <td className="border-b px-4 py-3">
                  <details>
                    <summary className="cursor-pointer text-blue-600 hover:underline text-sm">Editar</summary>
                    <div className="mt-2 w-96 rounded-lg border bg-white p-4 shadow-lg">
                      <form action={updateHeroSlide} className="grid gap-3">
                        <input type="hidden" name="id" value={slide.id} />
                        <div>
                          <label className="block text-sm text-gray-900">Título</label>
                          <input name="title" defaultValue={slide.title} className="mt-1 w-full rounded border p-2 text-gray-900 bg-white" />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-900">Subtítulo</label>
                          <input name="subtitle" defaultValue={slide.subtitle} className="mt-1 w-full rounded border p-2 text-gray-900 bg-white" />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-900">Texto del CTA</label>
                          <input name="cta" defaultValue={slide.cta} className="mt-1 w-full rounded border p-2 text-gray-900 bg-white" />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-900">Enlace del CTA</label>
                          <input name="ctaLink" defaultValue={slide.ctaLink} className="mt-1 w-full rounded border p-2 text-gray-900 bg-white" />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-900">Fondo (CSS class)</label>
                          <input name="background" defaultValue={slide.background} className="mt-1 w-full rounded border p-2 text-gray-900 bg-white" />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-900">Imagen</label>
                          <input name="image" defaultValue={slide.image || ''} className="mt-1 w-full rounded border p-2 text-gray-900 bg-white" />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-900">Orden</label>
                          <input name="order" type="number" defaultValue={slide.order} className="mt-1 w-full rounded border p-2 text-gray-900 bg-white" />
                        </div>
                        <div className="flex items-center">
                          <input name="isActive" type="checkbox" defaultChecked={slide.isActive} className="mr-2" />
                          <label className="block text-sm text-gray-900">Activo</label>
                        </div>
                        <div className="flex gap-2">
                          <button className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">Guardar</button>
                          <button
                            className="rounded border px-4 py-2 text-red-600 hover:bg-red-50"
                            formAction={deleteHeroSlide}
                          >
                            Eliminar
                          </button>
                        </div>
                      </form>
                    </div>
                  </details>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}