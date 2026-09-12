import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';

import { AuthShell } from '@/components/auth-shell';
import { LoginForm } from './login-form';

export const metadata: Metadata = { title: 'Sign in' };
export const dynamic = 'force-dynamic';

export default function LoginPage() {
  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in with the email address your workspace owner registered."
      panelTitle="From challan to cash, on one ledger"
      panelBody="Stock into the store, stock out to your reps, sales in the market, deposits back to the office, and the month's expenses — reconciled, not estimated."
      panelPoints={[
        'Purchase cost stays with the owner alone',
        'A rep can only sell what is actually in their van',
        'Cash in hand and market dues, tracked per rep',
        'Profit and margin, month by month',
      ]}
      footer={
        <>
          New here?{' '}
          <Link href="/signup" className="font-medium text-brand-600 hover:underline">
            Create a workspace
          </Link>
        </>
      }
    >
      <Suspense fallback={<div className="mt-8 h-56 skeleton" />}>
        <LoginForm />
      </Suspense>
    </AuthShell>
  );
}
