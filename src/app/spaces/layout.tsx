'use client';
import { Toaster } from 'react-hot-toast';

import Sidebar from '@/components/structure/Sidebar';
import Default from '@/components/templates/Default';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Default sidebar={<Sidebar />}>
      {children}
      <Toaster />
    </Default>
  );
}
