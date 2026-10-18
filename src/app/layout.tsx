import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900',
});

const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
  weight: '100 900',
});

export const metadata: Metadata = {
  title: 'Kaali Raani (Black Queen) — Multiplayer Card Game',
  description:
    'Play Kaali Raani (Black Queen) online with friends. The 150-point Indian card game featuring bidding, hidden partner, and Hukum trump.',
  keywords: ['Kaali Raani', 'Black Queen', 'Cards Game', 'Multiplayer', 'Hukum', 'Bidding'],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-black text-white selection:bg-white selection:text-black`}
      >
        {children}
      </body>
    </html>
  );
}
