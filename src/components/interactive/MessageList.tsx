import { UseMessageList } from '@/hooks/useMessageList';

import Skeleton from '@/components/indicators/Skeleton';

type IMessageList = UseMessageList;

export default function MessageList({
  status,
  parentRef,
  params,
  refetch,
  rowVirtualizer,
  allRows,
  isFetchingNextPage,
}: IMessageList) {
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
