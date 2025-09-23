import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';

import createSpace from '@/app/actions/createSpace';
import { CreateSpaceData, CreateSpaceSchema } from '@/schemas/createSpace';

export default function useCreateSpace(
  onSuccess?: (space: any) => void,
  onCancel?: () => void
) {
  const [isPending, startTransition] = useTransition();
  const [submitError, setSubmitError] = useState<string>('');
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
      setSubmitError('');

      const result = await createSpace(data);

      if (result.success) {
        reset();
        if (onSuccess) {
          onSuccess(result.data);
        } else {
          router.push(`/spaces/${result.data?.id}`);
          router.refresh();
        }
      } else {
        setSubmitError(result.error || 'Failed to create space');
      }
    });
  };

  return {
    isPending,
    onSubmit,
    register,
    handleSubmit,
    errors,
    submitError,
    onCancel,
    onSuccess,
  };
}

export type UseCreateSpace = ReturnType<typeof useCreateSpace>;
