/* eslint-disable @typescript-eslint/no-empty-function */

import NoteList from '@/features/NoteList';
export default function Header() {
  return (
    <div className='bg-white border-b border-gray-200'>
      <div className='px-6 py-4 flex items-center justify-between'>
        <div>
          <p className='text-sm text-gray-600'>
            Organize your thoughts and ideas
          </p>
        </div>

        {/* Add Note Button */}
        <button
          onClick={() => {}}
          className='inline-flex items-center px-4 py-1 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors'
        >
          Logout
        </button>
      </div>
      <NoteList />
    </div>
  );
}
