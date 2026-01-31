import { auth, currentUser } from '@clerk/nextjs/server';

export async function checkAdminRole() {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');
  
  const user = await currentUser();
  const role = user?.publicMetadata?.role as string;
  
  return role === 'admin';
}
