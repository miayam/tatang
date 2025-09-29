'use client';

import CreateSpace from '@/features/CreateSpace';
import SpaceList from '@/features/SpaceList';

function Sidebar() {
  return (
    <div className='flex flex-col overflow-auto text-lg'>
      <SpaceList />
      <CreateSpace />
    </div>
  );
}

export default Sidebar;
