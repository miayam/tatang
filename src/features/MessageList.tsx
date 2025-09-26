import useMessageList from '@/hooks/useMessageList';
import Component from '@/components/interactive/MessageList';

export default function MessageList() {
  const props = useMessageList();
  return <Component {...props} />;
}
