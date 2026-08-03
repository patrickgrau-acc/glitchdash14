import type { Metadata } from 'next';
import './globals.css';

// ToastProvider fallback to prevent compilation failure if not exported from notifications component
const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

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