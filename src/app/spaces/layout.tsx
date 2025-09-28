'use client';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';

import { queryClient } from '@/lib/queryClient';

import Sidebar from '@/components/structure/Sidebar';
import Default from '@/components/templates/Default';

import Header from '@/features/Header';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <QueryClientProvider client={queryClient}>
      <Default sidebar={<Sidebar />}>
        <Header />
        {children}
        <Toaster />
      </Default>
    </QueryClientProvider>
  );
}
