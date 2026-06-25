export function parsePaginated(data, pageSize = 20) {
  if (Array.isArray(data)) {
    return { results: data, count: data.length, totalPages: 1 };
  }
  const results = data?.results ?? [];
  const count = data?.count ?? results.length;
  return {
    results,
    count,
    totalPages: Math.max(1, Math.ceil(count / pageSize)),
  };
}
