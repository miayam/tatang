import clsx from 'clsx';
import Link from 'next/link';
import { AiOutlineUsergroupAdd } from 'react-icons/ai';

import { UseSpaceList } from '@/hooks/useSpaceList';

type ISpaceList = UseSpaceList;

export default function SpaceList({
  parentRef,
  status,
  hasNextPage,
  error,
  pathname,
  allRows,
  rowVirtualizer,
}: ISpaceList) {
  return (
    <>
      {status === 'pending' ? (
        <p>Loading...</p>
      ) : status === 'error' ? (
        <span>Error: {error?.message}</span>
      ) : (
        <div
          ref={parentRef}
          className='list'
          style={{
            height: `100vh`,
            width: `100%`,
            overflow: 'auto',
          }}
        >
          <div
            style={{
              height: `${rowVirtualizer.getTotalSize()}px`,
              width: '100%',
              position: 'relative',
            }}
          >
            {rowVirtualizer.getVirtualItems().map((virtualRow) => {
              const isLoaderRow = virtualRow.index > allRows.length - 1;
              const post = allRows[virtualRow.index];

              return (
                <div
                  key={virtualRow.index}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: `${virtualRow.size}px`,
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                >
                  <Link
                    className={clsx({
                      'flex h-full justify-start items-center gap-4 px-2': true,
                      'px-4 py-3 font-sans': true,
                      'bg-black text-white': pathname === `/spaces/${post?.id}`,
                    })}
                    href={`/spaces/${post?.id}`}
                  >
                    <span className='rounded-full flex items-center justify-center h-10 w-10 border border-gray-500'>
                      <AiOutlineUsergroupAdd size={24} />
                    </span>
                    <div className='h-full flex flex-col py-2'>
                      <span className='text-ellipsis truncate w-[18rem]'>
                        {isLoaderRow
                          ? hasNextPage
                            ? 'Loading more...'
                            : 'Nothing more to load'
                          : post?.name}
                      </span>
                      <span className='text-sm text-ellipsis truncate w-[18rem]'>
                        {post?.description}
                      </span>
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}
