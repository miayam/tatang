'use client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';

import Sidebar from '@/components/structure/Sidebar';
import Default from '@/components/templates/Default';
const queryClient = new QueryClient();

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <QueryClientProvider client={queryClient}>
      <Default sidebar={<Sidebar />}>
        {children}
        <Toaster />
      </Default>
    </QueryClientProvider>
  );
}
