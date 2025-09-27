import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState } from 'react';

import logout from '@/app/actions/logout';

export default function Header() {
  const [tags, setTags] = useState(['Chats', 'Feature Requests']);
  const params = useParams();

  const [selectedTag, setSelectedTag] = useState('Chats');

  const handleTagClick = (tag: any) => {
    setSelectedTag(tag);
    console.log('Selected tag:', tag);
  };

  return (
    <div className='bg-white border-b border-gray-200'>
      <div className='px-4 py-2 font-bold'>
        <button
          onClick={() => logout()}
          type='button'
          className='underline cursor-pointer'
        >
          Logout
        </button>
      </div>

      {/* Tags Horizontal Scroll */}
      <div className='max-w-[calc(100vw-25rem)] p-4 pt-0'>
        <div className='flex overflow-x-auto scrollbar-hide gap-2'>
          {tags.map((tag, index) => (
            <div key={index} className='flex items-center flex-shrink-0 group'>
              <button
                onClick={() => handleTagClick(tag)}
                type='button'
                className={`px-4 py-2 cursor-pointer rounded-full text-xs font-medium whitespace-nowrap transition-all duration-200 ${
                  selectedTag === tag
                    ? 'bg-black text-white'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200 hover:text-black'
                }`}
              >
                {tag}
              </button>
            </div>
          ))}

          <Link
            href={`/spaces/${params.id}/notes`}
            className='cursor-pointer flex items-center justify-center flex-shrink-0 px-4 py-0 rounded-full text-xs font-medium bg-white text-gray-600 hover:bg-gray-100 hover:text-black border-2 border-dashed border-gray-300 hover:border-gray-400 transition-all duration-200'
          >
            + Add notes
          </Link>
        </div>
      </div>

      {/* Custom scrollbar styles */}
      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
