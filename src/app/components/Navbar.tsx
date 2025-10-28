
'use client';

import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import Link from 'next/link';

const navLinks = [
  { href: '/data-marketplace', label: 'Data Marketplace' },
  { href: '/data-submission', label: 'Data Submission' },
  { href: '/ai-chat', label: 'AI Chat' },
  { href: '/token-dashboard', label: 'Token Dashboard' },
  { href: '/training-simulation', label: 'Training Simulation' },
];

export default function Navbar() {
  return (
    <header className="flex items-center justify-between p-4">
      <nav>
        <ul className="flex items-center space-x-4">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link href={link.href}>
                <p className="text-white">{link.label}</p>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <WalletMultiButton />
    </header>
  );
}
