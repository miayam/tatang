import { Block } from '@blocknote/core';
import { useCreateBlockNote } from '@blocknote/react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';

import { queryClient } from '@/lib/queryClient';

export default function useEditNote() {
  const params = useParams();
  const router = useRouter();
  const editor = useCreateBlockNote();
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [title, setTitle] = useState('Untitled');

  const { data, isPending: isLoading } = useQuery({
    queryKey: ['note', params.noteId],
    queryFn: async () => {
      const response = await fetch(
        `/api/spaces/${params.id}/notes/${params.noteId}`
      );
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    },
  });

  useEffect(() => {
    if (data && 'note' in data && 'content' in data.note) {
      editor.replaceBlocks(editor.document, data.note.content);
      setTitle(data.note.title);
    }
  }, [data, editor]);

  const update = useMutation({
    mutationKey: ['note', params.noteId],
    mutationFn: (formData) => {
      return fetch(`/api/spaces/${params.id}/notes/${params.noteId}`, {
        method: 'PATCH',
        body: JSON.stringify(formData),
      });
    },
  });

  const deletion = useMutation({
    mutationKey: ['note', params.noteId],
    mutationFn: () => {
      return fetch(`/api/spaces/${params.id}/notes/${params.noteId}`, {
        method: 'DELETE',
      });
    },
  });

  const onEditorChange = (block: Block[]) => {
    setBlocks(block);
  };

  const saveNote = useCallback(async () => {
    if (!title) {
      toast.error('Title cannot be empty');
      return;
    }

    const asyncMutation = await update.mutateAsync({
      title,
      content: blocks,
    } as any);

    const data = await asyncMutation.json();

    queryClient.invalidateQueries({
      queryKey: ['notes'],
      refetchType: 'active',
    });

    router.push(`/spaces/${params.id}/notes/${data.note.id}`);
    toast.success('🚀 Changes saved and live!');
  }, [blocks, update, params.id, router, title]);

  const deleteNote = async () => {
    await deletion.mutateAsync();
    router.push(`/spaces/${params.id}`);
    toast.success('Notes deleted!');
  };

  return {
    saveNote,
    deleteNote,
    isEdit: true,
    isLoading,
    title,
    setTitle,
    editor,
    onEditorChange,
    isSaving: update.isPending,
    isDeleting: deletion.isPending,
  };
}

export type UseEditNote = ReturnType<typeof useEditNote>;
