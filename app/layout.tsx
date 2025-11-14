import './globals.css';
import type { Metadata } from 'next';
import AppShell from './components/layout/AppShell';

export const metadata: Metadata = {
  title: 'Card-to-Cash Management',
  description: 'Management console for card-to-cash onboarding and oversight.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="color-scheme" content="light" />
        <meta name="theme-color" content="#f9fafb" />
      </head>
      <body>
        <AppShell>{children}</AppShell>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const root = document.documentElement;
                if (root.classList.contains('dark')) {
                  root.classList.remove('dark');
                }
              } catch (e) {}
            `,
          }}
        />
      </body>
    </html>
  );
}
