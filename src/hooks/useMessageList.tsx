import { useInfiniteQuery } from '@tanstack/react-query';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useParams } from 'next/navigation';
import { useCallback, useEffect, useLayoutEffect, useRef } from 'react';

import { getMessages } from '@/lib/api';
import useKeepBottomDistance from '@/hooks/useKeepBottomDistance';

export default function useMessageList() {
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

  console.log(allRows, data);

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

  return {
    params,
    status,
    parentRef,
    rowVirtualizer,
    isFetchingNextPage,
    allRows,
    refetch,
  };
}

export type UseMessageList = ReturnType<typeof useMessageList>;
