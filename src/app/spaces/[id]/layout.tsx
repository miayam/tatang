'use client';

import Header from '@/components/structure/Header';
import Sidebar from '@/components/structure/Sidebar';
import Default from '@/components/templates/Default';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Default sidebar={<Sidebar />}>
      <Header />
      {children}
    </Default>
  );
}
