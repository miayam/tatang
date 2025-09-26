import { AiOutlineSend } from 'react-icons/ai';

import { UseCreateMessage } from '@/hooks/useCreateMessage';

type ICreateMessage = UseCreateMessage;

export default function CreateMessage({
  isPending,
  register,
  errors,
  handleSubmit,
  onSubmit,
}: ICreateMessage) {
  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className='flex w-full gap-2 items-start max-w-2xl m-auto'
    >
      <textarea
        {...register('content')}
        id='content'
        rows={4}
        className={`w-full px-3 py-2 border ${
          errors.content
            ? 'border-red-600 outline-red-600'
            : 'border-gray-300 outline-gray-900 '
        } rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500`}
        placeholder='Type here!'
        disabled={isPending}
      />
      <button
        type='submit'
        className='cursor-pointer h-14 w-14  rounded-full py-2  flex justify-center items-center px-4 border border-transparent  text-white bg-gray-900 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-700 disabled:opacity-50 disabled:cursor-not-allowed'
      >
        <AiOutlineSend size={25} />
      </button>
    </form>
  );
}
