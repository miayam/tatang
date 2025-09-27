'use client';

import useCreateSpace from '@/hooks/useCreateSpace';

import Component from '@/components/forms/CreateSpace';

export default function CreateSpace() {
  const props = useCreateSpace();
  return <Component {...props} />;
}
