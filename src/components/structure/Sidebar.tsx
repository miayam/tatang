'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import SpaceCreator from '@/components/interactive/SpaceCreator';

import SpaceList from '@/features/SpaceList';

const queryClient = new QueryClient();

function Sidebar() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className='flex flex-col overflow-auto text-lg'>
        <SpaceList />
        <SpaceCreator />
      </div>
    </QueryClientProvider>
  );
}

export default Sidebar;
