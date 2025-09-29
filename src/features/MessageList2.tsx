import { useInfiniteQuery } from '@tanstack/react-query';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useParams } from 'next/navigation';
import React, { useCallback, useEffect, useRef } from 'react';

import { getMessages } from '@/lib/api';
import useCreateMessage from '@/hooks/useCreateMessage';

import CreateMessage from '@/components/forms/CreateMessage';

async function fetchData(
  limit: number,
  offset = 0
): Promise<{ rows: string[]; nextOffset: number }> {
  const start = offset * limit;
  const rows = Array.from(
    { length: limit },
    (_, i) => `Async loaded row ${start + i}`
  );
  await new Promise((r) => setTimeout(r, 500));
  return {
    rows,
    nextOffset: offset + 1,
  };
}

export default function MessageList2() {
  const params = useParams();
  const parentRef = useRef<HTMLDivElement | null>(null);
  const isInitialLoadRef = useRef(true);

  const scrollMetaRef = useRef<{
    prevScrollHeight: number;
    prevScrollTop: number;
  } | null>(null);

  const { data, fetchNextPage, isFetchingNextPage, hasNextPage, isSuccess } =
    useInfiniteQuery({
      queryKey: [`messages-${params?.id}`],
      queryFn: (ctx) =>
        getMessages(ctx.pageParam || undefined, params.id as string, 10),
      getNextPageParam: (lastGroup) => lastGroup.nextCursor,
      initialPageParam: undefined,
    });

  const items = data
    ? data?.pages
        .flatMap((page) => page.messages)
        .sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        )
    : [];

  const rowVirtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 100,
  });

  const createMessageProps = useCreateMessage(rowVirtualizer, items);

  const loadMore = useCallback(async () => {
    if (isFetchingNextPage || !hasNextPage || !parentRef.current) return;

    const el = parentRef.current;

    scrollMetaRef.current = {
      prevScrollHeight: el.scrollHeight,
      prevScrollTop: el.scrollTop,
    };

    await fetchNextPage();
  }, [hasNextPage, fetchNextPage, isFetchingNextPage]);

  useEffect(() => {
    const el = parentRef.current;
    if (!el) return;

    if (isInitialLoadRef.current && isSuccess && items.length > 0) {
      el.scrollTop = el.scrollHeight;
      isInitialLoadRef.current = false;
      return;
    }

    const meta = scrollMetaRef.current;
    if (meta) {
      el.scrollTop =
        el.scrollHeight - meta.prevScrollHeight + meta.prevScrollTop;
      scrollMetaRef.current = null;
    }
  }, [items.length, isSuccess]);

  useEffect(() => {
    const el = parentRef.current;
    if (!el) return;

    const onScroll = () => {
      if (el.scrollTop <= 30 && !isFetchingNextPage && hasNextPage) {
        loadMore();
      }
    };

    el.addEventListener('scroll', onScroll);
    return () => el.removeEventListener('scroll', onScroll);
  }, [loadMore, isFetchingNextPage, hasNextPage]);

  return (
    <div className='p-4'>
      <div
        ref={parentRef}
        className='h-[55vh] w-full max-w-2xl overflow-auto flex flex-col justify-end  m-auto'
        style={{ position: 'relative' }}
      >
        <div
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
            width: '100%',
            position: 'relative',
          }}
        >
          {isFetchingNextPage && (
            <div className='absolute top-0 left-0 w-full text-center text-sm text-gray-400 py-1'>
              Loading...
            </div>
          )}

          {rowVirtualizer.getVirtualItems().map((virtualRow) => (
            <div
              key={virtualRow.key}
              data-index={virtualRow.index}
              ref={rowVirtualizer.measureElement}
              className='flex'
              style={{
                position: 'absolute',
                width: '100%',
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`,
                padding: '4px',
                boxSizing: 'border-box',
              }}
            >
              <div className='bg-gray-800 text-white w-2/3 h-full p-4 rounded-md'>
                {items[virtualRow.index]?.content}
              </div>
            </div>
          ))}
        </div>
      </div>
      <CreateMessage {...createMessageProps} />
    </div>
  );
}
