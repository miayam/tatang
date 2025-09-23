'use client';
import Sidebar from '@/components/structure/Sidebar';
import Default from '@/components/templates/Default';

import logout from '@/app/actions/logout';

export default function Page() {
  return (
    <Default sidebar={<Sidebar />}>
      <main>
        <section className='grid place-content-center h-full'>
          <h1 className='text-5xl font-bold'>Space</h1>
          <button
            onClick={() => logout()}
            type='button'
            className='underline cursor-pointer'
          >
            Logout
          </button>
        </section>
      </main>
    </Default>
  );
}
