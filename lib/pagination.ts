export type PaginationState = {
  currentPage: number;
  pageSize: number;
  totalItems: number;
};

export const paginate = <T>(items: T[], page: number, pageSize: number): T[] => {
  const startIndex = (page - 1) * pageSize;
  return items.slice(startIndex, startIndex + pageSize);
};

export const getTotalPages = (totalItems: number, pageSize: number): number => {
  return Math.ceil(totalItems / pageSize);
};

export const getPageNumbers = (currentPage: number, totalPages: number): number[] => {
  const delta = 2;
  const range: number[] = [];
  
  for (
    let i = Math.max(2, currentPage - delta);
    i <= Math.min(totalPages - 1, currentPage + delta);
    i++
  ) {
    range.push(i);
  }
  
  if (currentPage - delta > 2) {
    range.unshift(-1); // Ellipsis
  }
  if (currentPage + delta < totalPages - 1) {
    range.push(-1); // Ellipsis
  }
  
  range.unshift(1);
  if (totalPages > 1) {
    range.push(totalPages);
  }
  
  return range.filter((n, i, arr) => arr.indexOf(n) === i && n !== -1 || n === -1);
};

export const getPaginationInfo = (state: PaginationState): string => {
  const start = (state.currentPage - 1) * state.pageSize + 1;
  const end = Math.min(state.currentPage * state.pageSize, state.totalItems);
  return `Showing ${start}-${end} of ${state.totalItems}`;
};

