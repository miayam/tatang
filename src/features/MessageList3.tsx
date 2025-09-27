import { useInfiniteQuery } from '@tanstack/react-query';
import { useWindowVirtualizer } from '@tanstack/react-virtual';
import { useParams } from 'next/navigation';
import { useCallback } from 'react';
import { useInView } from 'react-intersection-observer';

import { getMessages } from '@/lib/api';

function getRandomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const randomHeight = (() => {
  const cache = new Map();
  return (id: number) => {
    const value = cache.get(id);
    if (value !== undefined) {
      return value;
    }
    const v = getRandomInt(25, 250);
    cache.set(id, v);
    return v;
  };
})();

export default function MessageList3() {
  const beforeInView = useInView();
  const params = useParams();

  const {
    status,
    data,
    error,
    isFetching,
    isFetchingNextPage,
    isFetchingPreviousPage,
    fetchNextPage,
    fetchPreviousPage,
    hasNextPage,
    hasPreviousPage,
  } = useInfiniteQuery({
    queryKey: [`messages-${params?.id}`],
    queryFn: (ctx) =>
      getMessages(ctx.pageParam || undefined, params.id as string, 10),
    getNextPageParam: (lastGroup) => lastGroup.nextCursor,
    initialPageParam: undefined,
  });

  let prevId = 0;

  const allRows = data
    ? data.pages
        .flatMap((d) => d.messages)
        .sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        )
    : [];

  const virtualizer = useWindowVirtualizer({
    count: allRows.length,
    scrollMargin: 100, // FIXME
    estimateSize: () => 100,
    overscan: 5,
    getItemKey: useCallback((index: number) => allRows[index]?.id, [allRows]),
    // debug: true
  });

  const firstId = data?.pages[0].nextId ?? 0;
  const addedToTheBeginning = firstId < prevId;
  prevId = firstId;

  if (addedToTheBeginning) {
    const offset = virtualizer?.scrollOffset
      ? virtualizer.scrollOffset + (data?.pages[0].data ?? []).length * 10
      : 0;
    virtualizer.scrollOffset = offset;
    virtualizer.calculateRange();
    virtualizer.scrollToOffset(offset, { align: 'start' });
  }

  console.log(allRows, 'all');

  return (
    <div>
      <h1>Infinite Loading</h1>
      {status === 'pending' ? (
        <p>Loading...</p>
      ) : status === 'error' ? (
        <span>Error: {error.message}</span>
      ) : (
        <>
          <div>
            <button
              ref={beforeInView.ref}
              onClick={() => fetchNextPage()}
              disabled={!hasNextPage || isFetchingNextPage}
            >
              {isFetchingNextPage
                ? 'Loading more...'
                : hasNextPage
                ? 'Load Older'
                : 'Nothing more to load'}
            </button>
          </div>

          <div>
            <div
              style={{
                height: `${virtualizer.getTotalSize()}px`,
                width: '100%',
                position: 'relative',
              }}
            >
              {virtualizer.getVirtualItems().map((item) => {
                const project = allRows[item.index];
                return (
                  <div
                    key={item.key}
                    data-index={item.index}
                    ref={virtualizer.measureElement}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      transform: `translateY(${
                        item.start - virtualizer.options.scrollMargin
                      }px)`,
                      border: '1px solid gray',
                      borderRadius: '5px',
                      background: `hsla(${project?.id || 0 * 30}, 60%, 80%, 1)`,
                    }}
                  >
                    <div style={{ height: randomHeight(project.id) }}>
                      {project.content}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <button
              ref={beforeInView.ref}
              onClick={() => fetchNextPage()}
              disabled={!hasNextPage || isFetchingNextPage}
            >
              {isFetchingNextPage
                ? 'Loading more...'
                : hasNextPage
                ? 'Load Newer'
                : 'Nothing more to load'}
            </button>
          </div>
        </>
      )}
      <hr />
    </div>
  );
}
