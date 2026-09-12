import type { Metadata } from 'next';
import Link from 'next/link';

import { AuthShell } from '@/components/auth-shell';
import { AcceptInviteForm } from './accept-form';

export const metadata: Metadata = { title: 'Join a workspace' };
export const dynamic = 'force-dynamic';

export default async function InvitePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  return (
    <AuthShell
      title="Join the team"
      subtitle="Set a password and you are in. Your role was chosen by the workspace owner."
      panelTitle="Everything you need, nothing you don't"
      panelBody="Your screens are scoped to your role. A sales rep sees their own stock, invoices and cash; a manager runs the whole operation; a dealer browses the catalogue."
      panelPoints={[
        'Sell only what is actually loaded in your van',
        'Raise demand from the field in a few taps',
        'See exactly what you have collected and deposited',
        'Purchase cost is never shown to anyone but the owner',
      ]}
      footer={
        <>
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-brand-600 hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <AcceptInviteForm token={token} />
    </AuthShell>
  );
}
