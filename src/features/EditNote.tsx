'use client';

import useEditNote from '@/hooks/useEditNote';

import Component from '@/components/forms/TakeNote';

export default function EditNote() {
  const props = useEditNote();
  return <Component {...props} />;
}
