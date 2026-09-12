'use client';

import dynamic from 'next/dynamic';

/**
 * Three.js has no business running on the server, and the bundle is large
 * enough that it should not block first paint either — so the scene is loaded
 * client-side with a styled placeholder standing in until it arrives.
 */
const CrockeryScene = dynamic(() => import('./CrockeryScene'), {
  ssr: false,
  loading: () => (
    <div className="grid h-full w-full place-items-center">
      <div className="relative h-48 w-48">
        <div className="absolute inset-0 animate-float rounded-full bg-gradient-to-br from-brand-400/25 to-clay-400/20 blur-2xl" />
        <div className="absolute inset-8 rounded-full border border-brand-300/40" />
        <div className="absolute inset-14 rounded-full border border-brand-300/30" />
      </div>
    </div>
  ),
});

export function HeroCanvas() {
  return <CrockeryScene className="h-full w-full" />;
}
