import { useInfiniteQuery } from '@tanstack/react-query';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useParams } from 'next/navigation';
import { useCallback, useEffect, useLayoutEffect, useRef } from 'react';

import useKeepBottomDistance from '@/hooks/useKeepBottomDistance';
import Skeleton from '@/components/indicators/Skeleton';

async function getMessages(
  cursor: string | undefined,
  spaceId: string,
  limit: number
) {
  const params = new URLSearchParams({
    limit: limit.toString(),
    direction: 'older',
  });

  if (!spaceId) {
    return;
  }

  if (cursor) {
    params.append('cursor', cursor);
  }

  const response = await fetch(
    `/api/spaces/${spaceId}/messages/?${params.toString()}`
  );

  const data = await response.json();
  return data;
}

export default function Messages() {
  const params = useParams();

  // The scrollable element for your list
  const parentRef = useRef(null);

  const { status, data, refetch, isFetchingNextPage, fetchNextPage } =
    useInfiniteQuery({
      queryKey: [`messages-${params?.id}`],
      queryFn: (ctx) =>
        getMessages(ctx.pageParam || undefined, params.id as string, 10),
      getNextPageParam: (lastGroup) => lastGroup.nextCursor,
      initialPageParam: undefined,
    });

  const allRows = data
    ? data.pages
        .flatMap((d) => d.messages)
        .sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        )
    : [];

  // The virtualizer
  const rowVirtualizer = useVirtualizer({
    count: allRows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 100,
    getItemKey: useCallback((index: number) => allRows[index]?.id, [allRows]),
    onChange: (...args) => {
      onChange(...args);
    },
  });

  const { onChange, keepBottomDistance } =
    useKeepBottomDistance(rowVirtualizer);

  // auto load more when component mounted
  const autoLoadedDataRef = useRef(false);
  useEffect(() => {
    if (autoLoadedDataRef.current) return;
    autoLoadedDataRef.current = true;
    fetchNextPage();
  }, [fetchNextPage]);

  const autoScrolledToBottomRef = useRef(false);

  // load more when top reached
  const [firstItem] = rowVirtualizer.getVirtualItems();
  useEffect(() => {
    if (!autoScrolledToBottomRef.current) return;
    if (firstItem?.index === 0) fetchNextPage();
  }, [fetchNextPage, firstItem]);

  // scroll to bottom when initial data loaded
  useLayoutEffect(() => {
    if (allRows.length === 0 || autoScrolledToBottomRef.current) return;
    rowVirtualizer.scrollToIndex(allRows.length - 1, { align: 'end' });
    setTimeout(() => {
      autoScrolledToBottomRef.current = true;
    }, 100);
  }, [allRows.length, rowVirtualizer]);

  // keep bottom distance when data length changed
  const prevDataLenghtRef = useRef(allRows.length);
  useLayoutEffect(() => {
    if (allRows.length > prevDataLenghtRef.current) {
      keepBottomDistance();
    }
    prevDataLenghtRef.current = allRows.length;
  }, [allRows.length, keepBottomDistance]);

  return (
    <div>
      <div
        key={params.id?.toString()}
        ref={parentRef}
        style={{
          width: '400px',
          height: `400px`,
          overflow: 'auto', // Make it scroll!
        }}
      >
        <div
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
            width: '100%',
            position: 'relative',
          }}
        >
          {isFetchingNextPage ? <Skeleton /> : null}
          {rowVirtualizer.getVirtualItems().map((virtualItem) => {
            return (
              <div
                key={virtualItem.key || virtualItem.index}
                data-index={virtualItem.index}
                ref={rowVirtualizer.measureElement}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  height: '100px',
                  width: '100%',
                  transform: `translateY(${virtualItem.start}px)`,
                  borderBottom: '1px solid red',
                }}
              >
                {allRows[virtualItem.index]?.content}
              </div>
            );
          })}
        </div>
      </div>

      <button
        type='button'
        className='group relative cursor-pointer  flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-gray-900 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-700 disabled:opacity-50 disabled:cursor-not-allowed'
        onClick={() => refetch()}
      >
        Refresh {JSON.stringify(status)}
      </button>
    </div>
  );
}
