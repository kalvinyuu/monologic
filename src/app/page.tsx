'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import DataMarketplace from "@/app/components/DataMarketplace";
import DataSubmissionForm from "@/app/components/DataSubmissionForm";
import AIChat from "@/app/components/AIChat";
import TokenDashboard from "@/app/components/TokenDashboard";
import TrainingSimulation from "@/app/components/TrainingSimulation";

const WalletMultiButtonDynamic = dynamic(
  async () => (await import('@solana/wallet-adapter-react-ui')).WalletMultiButton,
  { ssr: false }
);

export default function Home() {
  const [tokenBalance, setTokenBalance] = useState(1000);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-4">Monologic</h1>
      <p className="text-lg text-center mb-8">
        A decentralized AI training platform.
      </p>
      <div className="mb-4">
        <WalletMultiButtonDynamic />
      </div>
      <DataMarketplace />
      <DataSubmissionForm setTokenBalance={setTokenBalance} />
      <AIChat />
      <TokenDashboard tokenBalance={tokenBalance} />
      <TrainingSimulation />
    </main>
  );
}
