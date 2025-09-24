import { AiOutlinePlus } from 'react-icons/ai';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

import CreateSpace from '@/features/CreateSpace';

export default function SpaceCreator() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type='button'
          className='rounded-full shadow-md bg-black border-gray-t00 p-3 cursor-pointer bottom-5 right-5 absolute'
        >
          <AiOutlinePlus size={30} color='white' />
        </button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle hidden>Create New Space</DialogTitle>
        </DialogHeader>
        <div className='grid gap-4'>
          <CreateSpace />
        </div>
      </DialogContent>
    </Dialog>
  );
}
