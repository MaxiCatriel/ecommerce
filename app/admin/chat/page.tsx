import { AdminChat } from 'components/chat/admin-chat';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '../../../auth';

export default async function AdminChatPage() {
  const session = await getServerSession(authOptions);

  if (!session || !(session as any).user?.role || (session as any).user.role !== 'ADMIN') {
    redirect('/');
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Chat de Soporte
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Gestiona las conversaciones con los clientes
        </p>
      </div>

      <AdminChat />
    </div>
  );
}