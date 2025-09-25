import type { Virtualizer, VirtualizerOptions } from '@tanstack/react-virtual';
import { useCallback, useRef } from 'react';

export default function useKeepBottomDistance<
  TScrollElement extends Element | Window,
  TItemElement extends Element
>(virtualizer: Virtualizer<TScrollElement, TItemElement>) {
  const prevBottomDistanceRef = useRef(0);

  const onChange: VirtualizerOptions<TScrollElement, TItemElement>['onChange'] =
    useCallback(
      (instance: Virtualizer<TScrollElement, TItemElement>, sync: boolean) => {
        if (!sync) return;
        prevBottomDistanceRef.current =
          instance.getTotalSize() - (instance.scrollOffset ?? 0);
      },
      []
    );

  const keepBottomDistance = useCallback(() => {
    const totalSize = virtualizer.getTotalSize();
    virtualizer.scrollToOffset(totalSize - prevBottomDistanceRef.current, {
      align: 'start',
    });
    // NOTE: This line is required to make "position keepping" works in my real project,
    //       But it seems fine here without it.
    //       I don't have time to dig into it, but very curious about the reason,
    //       plz comment if you find out.
    // virtualizer.scrollOffset = totalSize - prevBottomDistanceRef.current;
  }, [virtualizer]);

  return {
    onChange,
    keepBottomDistance,
  };
}
