import useSpaceList from '@/hooks/useSpaceList';
import Component from '@/components/interactive/SpaceList';

export default function SpaceList() {
  const props = useSpaceList();
  return <Component {...props} />;
}
