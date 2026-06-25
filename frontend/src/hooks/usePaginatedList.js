import { useEffect, useState } from 'react';
import { parsePaginated } from '../utils/pagination';

export function useListPage(initialPage = 1) {
  const [page, setPage] = useState(initialPage);
  return { page, setPage, resetPage: () => setPage(1) };
}

export function useResetPageOnChange(page, setPage, ...deps) {
  useEffect(() => {
    setPage(1);
  }, deps);
}

export function usePaginatedData(data, pageSize = 20) {
  return parsePaginated(data, pageSize);
}
