/* eslint-disable @typescript-eslint/no-empty-function */
import { Plus } from 'lucide-react';
export default function Header() {
  return (
    <div className='bg-white border-b border-gray-200'>
      <div className='px-6 py-4 flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-bold text-black'>Notes</h1>
          <p className='text-sm text-gray-600 mt-1'>
            Organize your thoughts and ideas
          </p>
        </div>

        {/* Add Note Button */}
        <button
          onClick={() => {}}
          className='inline-flex items-center px-4 py-2 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors'
        >
          <Plus className='w-4 h-4 mr-2' />
          Add notes
        </button>
      </div>
    </div>
  );
}
