'use client';

import Header from '@/components/structure/Header';
import dynamic from 'next/dynamic';

const EditNote = dynamic(() => import('@/features/EditNote'), { ssr: false });

export default function Page() {
  return (
    <div>
      <Header />
      <div className='h-[calc(100vh-6.5rem)] overflow-auto pt-10 bg-white w-full'>
        <div className='max-w-3xl m-auto relative'>
          <EditNote />
        </div>
      </div>
    </div>
  );
}
