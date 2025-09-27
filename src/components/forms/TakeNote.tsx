import { BlockNoteView } from '@blocknote/mantine';
import clsx from 'clsx';
import { CheckIcon, X } from 'lucide-react';

import '@blocknote/core/fonts/inter.css';
import '@blocknote/mantine/style.css';

import { UseEditNote } from '@/hooks/useEditNote';
type ITakeNote = UseEditNote;

export default function TakeNote({
  editor,
  deleteNote,
  saveNote,
  onEditorChange,
  isLoading,
  title,
  isSaving,
  setTitle,
  isDeleting,
  isEdit,
}: ITakeNote) {
  return (
    <div>
      <div
        id='cta'
        className='fixed min-w-2xs right-0 top-[7rem] flex gap-4 z-10'
      >
        <div className='w-full flex gap-4 justify-end pr-8'>
          <button
            type='button'
            className='flex text-sm text-white bg-gray-900 cursor-pointer items-center border border-gray-300 rounded-md gap-2 px-4 py-2'
            onClick={saveNote}
          >
            {isSaving ? (
              'Publishing...'
            ) : (
              <>
                Publish <CheckIcon size={14} />
              </>
            )}
          </button>
          {isEdit ? (
            <button
              type='button'
              className='flex text-sm text-white bg-gray-900 cursor-pointer items-center border border-gray-300 rounded-md gap-2 px-4 py-2'
              onClick={deleteNote}
            >
              {isDeleting ? (
                'Deleting...'
              ) : (
                <>
                  Delete <X size={14} />
                </>
              )}
            </button>
          ) : null}
        </div>
      </div>
      <input
        className='outline-none focus:outline-none ring-0 block border-none focus m-auto font-bold text-4xl text-center py-4 border-b border-gray-300'
        onChange={(e) => {
          setTitle(e.target.value);
        }}
        value={title}
        required
        placeholder='Untitled'
      />
      <hr />
      {isLoading ? <span>Loading...</span> : null}
      <BlockNoteView
        className={clsx({ hidden: isLoading, 'mt-4': true })}
        editor={editor}
        onChange={(editor) => onEditorChange(editor.document)}
      />
    </div>
  );
}
