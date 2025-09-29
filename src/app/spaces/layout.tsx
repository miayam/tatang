'use client';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';

import { queryClient } from '@/lib/queryClient';

import Default from '@/components/templates/Default';
import Sidebar from '@/components/structure/Sidebar';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <QueryClientProvider client={queryClient}>
      <Default sidebar={<Sidebar />}>{children}</Default>
      <Toaster />
    </QueryClientProvider>
  );
}
