'use client';

import useCreateNote from '@/hooks/useCreateNote';

import Component from '@/components/forms/TakeNote';

export default function CreateNote() {
  const props = useCreateNote();
  return <Component {...props} />;
}
