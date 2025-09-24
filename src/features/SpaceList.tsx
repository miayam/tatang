/* eslint-disable */
'use client';
import useSWRInfinite from 'swr/infinite';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useEffect, useMemo, useRef } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';

async function getSpaces(cursor: string | undefined, limit: number) {
  const params = cursor
    ? `?cursor=${cursor}&limit=${limit}`
    : `?limit=${limit}`;
  const response = await fetch(`/api/spaces/${params}`);
  const data = await response.json();
  return data;
}

export default function SpaceList() {
  const {
    status,
    data,
    error,
    isFetching,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteQuery({
    queryKey: ['projects'],
    queryFn: (ctx) => getSpaces(ctx.pageParam || undefined, 10),
    getNextPageParam: (lastGroup) => lastGroup.nextCursor,
    initialPageParam: undefined,
  });

  const allRows = data ? data.pages.flatMap((d) => d.spaces) : [];

  const parentRef = useRef<HTMLDivElement>(null);

  console.log('rows', allRows);

  return (
    <div className='h-screen'>
      <h1>Hello</h1>
    </div>
  );
}
