import type { Metadata } from 'next';
import './globals.css';
import { ToastProvider } from '@/components/notifications';

export const metadata: Metadata = {
  title: 'GlitchDash14 - Arcade Endless Runner',
  description: 'Self-contained browser-based endless runner arcade game engineered for educational environments.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-surface text-text antialiased">
        <ToastProvider>
          <>{children}</>
        </ToastProvider>
      </body>
    </html>
  );
}
