import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'MockTest System',
  description: 'Create, take, and review mock tests.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="border-b">
          <div className="container py-4 flex items-center justify-between">
            <a href="/" className="text-xl font-semibold">MockTest</a>
            <nav className="flex gap-4">
              <a className="hover:underline" href="/">Home</a>
              <a className="hover:underline" href="/admin">Admin</a>
            </nav>
          </div>
        </header>
        <main className="container py-6">{children}</main>
        <footer className="border-t mt-12">
          <div className="container py-6 text-sm text-gray-500">? {new Date().getFullYear()} MockTest</div>
        </footer>
      </body>
    </html>
  );
}
