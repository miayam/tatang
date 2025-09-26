import { zodResolver } from '@hookform/resolvers/zod';
import { useParams } from 'next/navigation';
import { useTransition } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

import {
  CreateMessageData,
  CreateMessageSchema,
} from '@/schemas/createMessage';
import useMessageList from './useMessageList';
import { queryClient } from '@/lib/queryClient';

export default function useCreateMessage() {
  const [isPending, startTransition] = useTransition();
  const params = useParams();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateMessageData>({
    resolver: zodResolver(CreateMessageSchema),
    defaultValues: {
      content: '',
      messageType: 'TEXT',
    },
  });

  const onSubmit = (data: CreateMessageData) => {
    startTransition(async () => {
      const result = await fetch(`/api/spaces/${params.id}/messages`, {
        method: 'POST',
        body: JSON.stringify(data),
      });

      if (!result.ok) {
        toast.error(`Response status: ${result.status}`);
        return;
      }

      reset();
      queryClient.invalidateQueries({
        queryKey: [`messages-${params.id}`],
        refetchType: 'active',
      });
    });
  };

  return {
    isPending,
    errors,
    register,
    handleSubmit,
    onSubmit,
  };
}

export type UseCreateMessage = ReturnType<typeof useCreateMessage>;
