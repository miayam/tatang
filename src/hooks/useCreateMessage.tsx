import { zodResolver } from '@hookform/resolvers/zod';
import type { Virtualizer } from '@tanstack/react-virtual';
import { useParams } from 'next/navigation';
import { useTransition } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

import { queryClient } from '@/lib/queryClient';

import {
  CreateMessageData,
  CreateMessageSchema,
} from '@/schemas/createMessage';

export default function useCreateMessage(
  rowVirtualizer: Virtualizer<HTMLDivElement, Element>,
  items: any[]
) {
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
      await queryClient.invalidateQueries({
        queryKey: [`messages-${params.id}`],
        refetchType: 'active',
      });

      rowVirtualizer.scrollToIndex(items.length - 1);
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
