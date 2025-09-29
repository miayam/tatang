import type { UseMessageList } from '@/hooks/useMessageList';
import CreateMessage from '@/components/forms/CreateMessage';

type IMessageList = UseMessageList;

export default function MessageList({
  items,
  parentRef,
  rowVirtualizer,
  isFetchingNextPage,
  createMessageProps,
}: IMessageList) {
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
