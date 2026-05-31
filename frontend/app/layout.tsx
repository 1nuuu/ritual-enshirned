import type { Metadata } from 'next';
import { Cinzel, Raleway } from 'next/font/google';
import './globals.css';

const cinzel = Cinzel({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

const raleway = Raleway({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Enshrined',
  description: 'Prove your Ritual. Claim your Badge. Pull your Destiny.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${cinzel.variable} ${raleway.variable}`}>
      <body>
        {children}
      </body>
    </html>
  );
}
