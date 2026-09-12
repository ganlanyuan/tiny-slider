import type { Metadata } from 'next';
import Link from 'next/link';

import { AuthShell } from '@/components/auth-shell';
import { SignupForm } from './signup-form';

export const metadata: Metadata = { title: 'Create your workspace' };

export default function SignupPage() {
  return (
    <AuthShell
      title="Create your workspace"
      subtitle="Two minutes to set up. You become the owner, and only you see purchase cost."
      panelTitle="Run your distribution business on real numbers"
      panelBody="Set up your catalogue, invite your sales reps, and every challan, invoice, deposit and expense lands on one ledger that reconciles."
      panelPoints={[
        'Your own workspace — nobody else can see your data',
        'Invite reps, managers and dealers by email',
        'Purchase cost, SR rate and market price on every product',
        'Import your existing price list as JSON or CSV',
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
      <SignupForm />
    </AuthShell>
  );
}
