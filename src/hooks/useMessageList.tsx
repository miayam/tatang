import { useInfiniteQuery } from '@tanstack/react-query';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useParams } from 'next/navigation';
import { useCallback, useEffect, useRef } from 'react';

import { getMessages } from '@/lib/api';
import useCreateMessage from '@/hooks/useCreateMessage';

export default function useMessageList() {
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

  return {
    items,
    parentRef,
    rowVirtualizer,
    isFetchingNextPage,
    createMessageProps,
  };
}

export type UseMessageList = ReturnType<typeof useMessageList>;
