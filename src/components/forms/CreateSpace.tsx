// components/CreateSpaceForm.tsx
'use client';

import { UseCreateSpace } from '@/hooks/useCreateSpace';

import { DialogClose, DialogFooter } from '@/components/ui/dialog';

type ICreateSpace = UseCreateSpace;

export default function CreateSpace({
  isPending,
  errors,
  onCancel,
  register,
  onSubmit,
  handleSubmit,
}: ICreateSpace) {
  return (
    <div className='bg-white rounded-lg'>
      <h2 className='text-2xl font-bold text-gray-900 mb-6'>
        Create New Space
      </h2>

      <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
        <div>
          <label
            htmlFor='name'
            className='block text-sm font-medium text-gray-700 mb-2'
          >
            Space Name *
          </label>
          <input
            {...register('name')}
            type='text'
            className={`relative block w-full px-3 py-2 border ${
              errors.name ? 'border-red-600' : 'border-gray-300'
            } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-gray-700 focus:border-gray-700 sm:text-sm`}
            placeholder='Name'
            disabled={isPending}
          />
          {errors.name && (
            <p className='mt-1 text-sm text-red-600'>{errors.name.message}</p>
          )}
        </div>

        <div>
          <label
            htmlFor='description'
            className='block text-sm font-medium text-gray-700 mb-2'
          >
            Description (optional)
          </label>
          <textarea
            {...register('description')}
            id='description'
            rows={3}
            className={`w-full px-3 py-2 border ${
              errors.description ? 'border-red-600' : 'border-gray-300'
            } rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500`}
            placeholder="What's this space about?"
            disabled={isPending}
          />

          {errors.description && (
            <p className='mt-1 text-sm text-red-600'>
              {errors.description.message}
            </p>
          )}
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <button
              type='button'
              className='cursor-pointer py-2  w-full flex justify-center items-center border border-gray-800 rounded-md px-4'
              onClick={onCancel}
            >
              Cancel
            </button>
          </DialogClose>
          <button
            type='submit'
            className='cursor-pointer w-full py-2  flex justify-center items-center px-4 border border-transparent  rounded-md text-white bg-gray-900 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-700 disabled:opacity-50 disabled:cursor-not-allowed'
          >
            Save changes
          </button>
        </DialogFooter>
      </form>
    </div>
  );
}
