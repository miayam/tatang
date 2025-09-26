import useCreateMessage from '@/hooks/useCreateMessage';

import Component from '@/components/forms/CreateMessage';

export default function CreateMessage() {
  const props = useCreateMessage();
  return <Component {...props} />;
}
