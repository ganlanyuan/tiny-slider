import { redirect } from 'next/navigation';

import { DashboardShell } from '@/components/dashboard/shell';
import { WorkspaceProvider } from '@/components/workspace';
import { capabilitiesFor, getAuthContext } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const ctx = await getAuthContext();
  // The middleware already gates this path; resolving the user from the
  // database here is what makes a deactivated account lose access immediately.
  if (!ctx) redirect('/login?next=/dashboard');

  return (
    <WorkspaceProvider
      initialUser={ctx.user}
      initialOrg={ctx.org}
      capabilities={capabilitiesFor(ctx.role)}
    >
      <DashboardShell>{children}</DashboardShell>
    </WorkspaceProvider>
  );
}
