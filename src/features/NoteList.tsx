import useNoteList from '@/hooks/useNoteList';

import Component from '@/components/lists/NoteList';

export default function NoteList() {
  const props = useNoteList();
  return <Component {...props} />;
}
