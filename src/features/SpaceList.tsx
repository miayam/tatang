import useSpaceList from '@/hooks/useSpaceList';

import Component from '@/components/lists/SpaceList';

export default function SpaceList() {
  const props = useSpaceList();
  return <Component {...props} />;
}
