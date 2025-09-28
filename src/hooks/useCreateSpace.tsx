import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

import { queryClient } from '@/lib/queryClient';

import createSpace from '@/app/actions/createSpace';
import { CreateSpaceData, CreateSpaceSchema } from '@/schemas/createSpace';

export default function useCreateSpace(
  onSuccess?: (space: any) => void,
  onCancel?: () => void
) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateSpaceData>({
    resolver: zodResolver(CreateSpaceSchema),
    defaultValues: {
      name: '',
      description: '',
    },
  });

  const onSubmit = (data: CreateSpaceData) => {
    startTransition(async () => {
      const result = await createSpace(data);

      if (result.success) {
        reset();
        if (onSuccess) {
          onSuccess(result.data);
        } else {
          router.push(`/spaces/${result.data?.id}`);
          router.refresh();
          queryClient.invalidateQueries({
            queryKey: ['spaces'],
            refetchType: 'active',
          });
          setOpen(false);
        }
      } else {
        toast.error(result.error || 'Failed to create space');
      }
    });
  };

  return {
    open,
    setOpen,
    isPending,
    onSubmit,
    register,
    handleSubmit,
    errors,
    onCancel,
    onSuccess,
  };
}

export type UseCreateSpace = ReturnType<typeof useCreateSpace>;
