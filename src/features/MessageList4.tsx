import { useVirtualizer, VirtualItem } from '@tanstack/react-virtual';
import React, { CSSProperties, useCallback, useEffect, useRef } from 'react';

export type VirtualListProps<T> = {
  className?: string;
  style?: CSSProperties;
  itemClassName?: string;
  itemStyle?: CSSProperties;
  items: T[];
  getItemKey: (item: T, index: number) => string | number;
  renderItem: (item: T, virtualItem: VirtualItem) => React.ReactNode;
  estimateSize: (index: number) => number;
  overscan?: number;
};

export default function VirtualList<T>({
  style,
  itemStyle,
  items,
  getItemKey,
  estimateSize,
  renderItem,
  overscan,
}: VirtualListProps<T>) {
  const scrollableRef = useRef<HTMLDivElement>(null);

  const getItemKeyCallback = useCallback(
    (index: number) => getItemKey(items[index]!, index),
    [getItemKey, items]
  );

  const virtualizer = useVirtualizer({
    count: items.length,
    getItemKey: getItemKeyCallback,
    getScrollElement: () => scrollableRef.current,
    estimateSize,
    overscan,
    debug: true,
  });

  useEffect(
    function scrollToEnd() {
      virtualizer.scrollToIndex(items.length - 1);
    },
    [items]
  );

  const virtualItems = virtualizer.getVirtualItems();

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column-reverse',
        ...style,
      }}
    >
      <div
        ref={scrollableRef}
        style={{
          overflow: 'auto',
        }}
      >
        <div
          style={{
            width: '100%',
            position: 'relative',
            height: virtualizer.getTotalSize(),
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: '0',
              left: '0',
              width: '100%',
              transform: `translateY(${virtualItems[0]?.start ?? 0}px)`,
            }}
          >
            {virtualItems.map((virtualItem) => {
              const item = items[virtualItem.index]!;

              return (
                <div
                  key={virtualItem.key}
                  ref={virtualizer.measureElement}
                  data-index={virtualItem.index}
                  style={itemStyle}
                >
                  {renderItem(item, virtualItem)}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
