
'use client';

import { useWallet } from '@solana/wallet-adapter-react';

export default function TokenDashboard({ tokenBalance }: { tokenBalance: number }) {
  const { publicKey } = useWallet();
  
  const desiredData = [
    { id: 1, name: 'Financial News Articles', reward: 100 },
    { id: 2, name: 'Open Source Codebases', reward: 200 },
    { id: 3, name: 'Scientific Research Papers', reward: 150 },
  ];

  if (!publicKey) {
    return <p className="text-white">Please connect your wallet to view your token dashboard.</p>;
  }

  return (
    <div className="w-full max-w-lg p-4 text-white border border-gray-200 rounded-lg mb-4">
      <h3 className="text-lg font-semibold mb-2">Token Dashboard</h3>
      <p className="text-sm text-gray-400 mb-2">Your Wallet: {publicKey.toBase58()}</p>
      <p className="text-lg mb-4">Your Token Balance: <span className="font-bold">{tokenBalance} MONO</span></p>
      <h4 className="text-md font-semibold mb-2">Desired Data</h4>
      <ul className="space-y-2">
        {desiredData.map((data) => (
          <li key={data.id} className="flex justify-between items-center p-2 bg-gray-100 rounded-md">
            <span className="text-gray-900">{data.name}</span>
            <span className="font-semibold text-gray-800">{data.reward} MONO</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
