import { useInfiniteQuery } from '@tanstack/react-query';
import { useVirtualizer } from '@tanstack/react-virtual';
import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';

import { getSpaces } from '@/lib/api';

export default function useSpaceList() {
  const {
    status,
    data,
    error,
    isFetchingNextPage,
    refetch,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteQuery({
    queryKey: ['spaces'],
    queryFn: (ctx) => getSpaces(ctx.pageParam || undefined, 10),
    getNextPageParam: (lastGroup) => lastGroup.nextCursor,
    initialPageParam: undefined,
  });

  const pathname = usePathname();

  const allRows = data ? data.pages.flatMap((d) => d.spaces) : [];

  const parentRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: hasNextPage ? allRows.length + 1 : allRows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 85,
    overscan: 5,
  });

  useEffect(() => {
    const [lastItem] = [...rowVirtualizer.getVirtualItems()].reverse();

    if (!lastItem) {
      return;
    }

    if (
      lastItem.index >= allRows.length - 1 &&
      hasNextPage &&
      !isFetchingNextPage
    ) {
      fetchNextPage();
    }
  }, [
    hasNextPage,
    fetchNextPage,
    allRows.length,
    isFetchingNextPage,
    rowVirtualizer.getVirtualItems(),
  ]);

  return {
    error,
    allRows,
    hasNextPage,
    refetch,
    status,
    rowVirtualizer,
    parentRef,
    pathname,
  };
}

export type UseSpaceList = ReturnType<typeof useSpaceList>;
