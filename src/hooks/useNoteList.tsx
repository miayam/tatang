import { useQuery } from '@tanstack/react-query';
import { useParams, usePathname } from 'next/navigation';

export default function useNoteList() {
  const params = useParams();
  const pathname = usePathname();
  const { data } = useQuery({
    queryKey: ['notes'],
    queryFn: async () => {
      const response = await fetch(`/api/spaces/${params.id}/notes?limit=30`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    },
  });

  return { data, pathname, params };
}

export type UseNoteList = ReturnType<typeof useNoteList>;
