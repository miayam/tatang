'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import SpaceList from '@/features/SpaceList';
import CreateSpace from '@/features/CreateSpace';

const queryClient = new QueryClient();

function Sidebar() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className='flex flex-col overflow-auto text-lg'>
        <SpaceList />
        <CreateSpace />
      </div>
    </QueryClientProvider>
  );
}

export default Sidebar;
