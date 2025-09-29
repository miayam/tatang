'use client';

import Header from '@/components/structure/Header';
import MessageList2 from '@/features/MessageList2';

export default function Page() {
  return (
    <div>
      <Header />
      <main>
        <section>
          <MessageList2 />
        </section>
      </main>
    </div>
  );
}
