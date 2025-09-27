/* eslint-disable @typescript-eslint/no-empty-function */
import { Block } from '@blocknote/core';
import { useCreateBlockNote } from '@blocknote/react';
import { useMutation } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';
import toast from 'react-hot-toast';

export default function useCreateNote() {
  const params = useParams();
  const router = useRouter();
  const editor = useCreateBlockNote();
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [title, setTitle] = useState('Untitled');

  const mutation = useMutation({
    mutationKey: ['newNote'],
    mutationFn: (formData) => {
      return fetch(`/api/spaces/${params.id}/notes`, {
        method: 'POST',
        body: JSON.stringify(formData),
      });
    },
    retry: 2,
  });

  const onEditorChange = (block: Block[]) => {
    setBlocks(block);
  };

  const saveNote = useCallback(async () => {
    if (!title) {
      toast.error('Title cannot be empty');
      return;
    }

    const asyncMutation = await mutation.mutateAsync({
      title,
      content: blocks,
    } as any);

    const data = await asyncMutation.json();

    toast.success('✨ Note published successfully!');
    router.push(`/spaces/${params.id}/notes/${data.note.id}`);
  }, [blocks, mutation, params.id, router, title]);

  return {
    saveNote,
    title,
    setTitle,
    deleteNote: async () => {},
    isEdit: false,
    isLoading: false,
    editor,
    onEditorChange,
    isSaving: mutation.isPending,
    isDeleting: false,
  };
}

export type UseCreateNote = ReturnType<typeof useCreateNote>;
