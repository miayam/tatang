export async function getSpaces(cursor: string | undefined, limit: number) {
  const params = new URLSearchParams({
    limit: limit.toString(),
  });

  if (cursor) {
    params.append('cursor', cursor);
  }

  const response = await fetch(`/api/spaces/?${params.toString()}`);
  const data = await response.json();
  return data;
}

export async function getMessages(
  cursor: string | undefined,
  spaceId: string,
  limit: number
) {
  const params = new URLSearchParams({
    limit: limit.toString(),
    direction: 'older',
  });

  if (!spaceId) {
    return;
  }

  if (cursor) {
    params.append('cursor', cursor);
  }

  const response = await fetch(
    `/api/spaces/${spaceId}/messages/?${params.toString()}`
  );

  const data = await response.json();
  return data;
}
