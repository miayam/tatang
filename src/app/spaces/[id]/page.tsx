'use client';

import Header from '@/components/structure/Header';
import MessageList from '@/features/MessageList';

export default function Page() {
  return (
    <div>
      <Header />
      <main>
        <section>
          <MessageList />
        </section>
      </main>
    </div>
  );
}
