'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { useState } from 'react';

export default function DataSubmissionForm({ setTokenBalance }: { setTokenBalance: (balance: number) => void }) {
  const { publicKey } = useWallet();
  const [data, setData] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate data verification and token minting
    setTimeout(() => {
      setTokenBalance((prevBalance) => prevBalance + 100);
      setSuccessMessage('Successfully submitted data and earned 100 MONO!');
      setData('');
    }, 1000);
  };

  if (!publicKey) {
    return <p className="text-white">Please connect your wallet to submit data.</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-lg p-4 border border-gray-200 rounded-lg">
      <textarea
        value={data}
        onChange={(e) => setData(e.target.value)}
        placeholder="Submit your data (financial/codebase)"
        className="w-full h-32 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <button type="submit" className="mt-4 w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50">
        Submit Data
      </button>
      {successMessage && <p className="mt-4 text-green-500">{successMessage}</p>}
    </form>
  );
}
