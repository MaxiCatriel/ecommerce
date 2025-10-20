import { prisma } from 'lib/db';
import { getDictionary, getLocale } from 'lib/i18n/server';
import { revalidatePath } from 'next/cache';

async function updateUserRole(formData: FormData) {
  'use server';
  const id = String(formData.get('id') || '');
  const role = String(formData.get('role') || 'USER');
  if (!id) return;
  await prisma.user.update({ where: { id }, data: { role } });
  revalidatePath('/admin/users');
}

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({ orderBy: { createdAt: 'desc' } });
  const dict = await getDictionary(await getLocale());

  return (
    <div className="bg-white text-gray-900">
      <h2 className="mb-4 text-xl font-semibold text-gray-900">{dict.adminUsers.title}</h2>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm bg-white">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="p-2 text-gray-900 font-medium">{dict.adminUsers.name}</th>
              <th className="p-2 text-gray-900 font-medium">{dict.adminUsers.email}</th>
              <th className="p-2 text-gray-900 font-medium">{dict.adminUsers.role}</th>
              <th className="p-2 text-gray-900 font-medium">{dict.adminUsers.created}</th>
              <th className="p-2 text-gray-900 font-medium">{dict.adminUsers.actions}</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u: any) => (
              <tr key={u.id} className="border-b hover:bg-gray-50">
                <td className="p-2 text-gray-900">{u.name || '-'}</td>
                <td className="p-2 text-gray-900">{u.email}</td>
                <td className="p-2 text-gray-900">{u.role}</td>
                <td className="p-2 text-gray-900">{new Date(u.createdAt).toLocaleString()}</td>
                <td className="p-2">
                  <form action={updateUserRole} className="flex items-center gap-2">
                    <input type="hidden" name="id" value={u.id} />
                    <select name="role" defaultValue={u.role} className="rounded border p-1 text-sm text-gray-900 bg-white">
                      <option value="USER">USER</option>
                      <option value="ADMIN">ADMIN</option>
                    </select>
                    <button className="rounded bg-blue-600 px-3 py-1 text-white hover:bg-blue-700">{dict.adminUsers.save}</button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
