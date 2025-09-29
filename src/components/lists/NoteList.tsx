import { clsx } from 'clsx';
import Link from 'next/link';

import type { UseNoteList } from '@/hooks/useNoteList';

type INoteList = UseNoteList;

export default function NoteList({ data, pathname, params }: INoteList) {
  if (!params.id) {
    return null;
  }

  return (
    <div className='max-w-[calc(100vw-25rem)] p-4 pt-0'>
      <div className='flex overflow-x-auto scrollbar-hide gap-2'>
        {/* Group chat link */}
        <div className='flex items-center flex-shrink-0 group'>
          <Link
            href={`/spaces/${params.id}`}
            className={`px-4 py-2 cursor-pointer rounded-full text-xs font-medium whitespace-nowrap transition-all duration-200 ${
              pathname == `/spaces/${params.id}`
                ? 'bg-black text-white'
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200 hover:text-black'
            }`}
          >
            Chat
          </Link>
        </div>
        {data?.notes?.map((note: any) => (
          <div key={note.id} className='flex items-center flex-shrink-0 group'>
            <Link
              href={`/spaces/${params.id}/notes/${note.id}`}
              className={`px-4 py-2 cursor-pointer rounded-full text-xs font-medium whitespace-nowrap transition-all duration-200 ${
                pathname.includes(`/spaces/${params.id}/notes/${note.id}`)
                  ? 'bg-black text-white'
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200 hover:text-black'
              }`}
            >
              {note.title}
            </Link>
          </div>
        ))}
        <Link
          href={`/spaces/${params.id}/notes`}
          className={clsx({
            'cursor-pointer flex items-center justify-center flex-shrink-0 px-4 py-0 rounded-full text-xs font-medium bg-white text-gray-600 hover:bg-gray-100 hover:text-black border-2 border-dashed  transition-all duration-200':
              true,
            'border border-black text-black': pathname.includes(
              `/spaces/${params.id}/notes`
            ),
            'border-gray-300 hover:border-gray-400':
              pathname !== `/spaces/${params.id}/notes`,
          })}
        >
          + New notes
        </Link>
      </div>
    </div>
  );
}
