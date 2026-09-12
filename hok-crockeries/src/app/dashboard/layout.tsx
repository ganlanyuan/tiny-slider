import { redirect } from 'next/navigation';

import { DashboardShell } from '@/components/dashboard/shell';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  // The middleware already gates this path; this is the second lock, and it is
  // what guarantees a deactivated account cannot keep a live session.
  if (!user) redirect('/login?next=/dashboard');

  return <DashboardShell user={user}>{children}</DashboardShell>;
}
