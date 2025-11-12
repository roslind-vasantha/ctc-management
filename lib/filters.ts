export const filterByText = <T extends Record<string, any>>(
  items: T[],
  searchText: string,
  searchKeys: (keyof T)[]
): T[] => {
  if (!searchText.trim()) return items;
  
  const lowerSearch = searchText.toLowerCase();
  return items.filter((item) =>
    searchKeys.some((key) => {
      const value = item[key];
      if (value == null) return false;
      return String(value).toLowerCase().includes(lowerSearch);
    })
  );
};

export const filterByDateRange = <T extends { createdAt: string }>(
  items: T[],
  startDate?: string,
  endDate?: string
): T[] => {
  if (!startDate && !endDate) return items;
  
  return items.filter((item) => {
    const itemDate = new Date(item.createdAt);
    if (startDate && itemDate < new Date(startDate)) return false;
    if (endDate && itemDate > new Date(endDate)) return false;
    return true;
  });
};

export const filterByField = <T extends Record<string, any>>(
  items: T[],
  field: keyof T,
  value: any
): T[] => {
  if (value === '' || value === null || value === undefined) return items;
  return items.filter((item) => item[field] === value);
};

export const filterByMultipleFields = <T extends Record<string, any>>(
  items: T[],
  filters: Partial<Record<keyof T, any>>
): T[] => {
  let filtered = items;
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== '' && value !== null && value !== undefined) {
      filtered = filterByField(filtered, key as keyof T, value);
    }
  });
  
  return filtered;
};

export const sortByField = <T extends Record<string, any>>(
  items: T[],
  field: keyof T,
  direction: 'asc' | 'desc' = 'asc'
): T[] => {
  return [...items].sort((a, b) => {
    const aVal = a[field];
    const bVal = b[field];
    
    if (aVal == null && bVal == null) return 0;
    if (aVal == null) return 1;
    if (bVal == null) return -1;
    
    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return direction === 'asc' ? aVal - bVal : bVal - aVal;
    }
    
    const aStr = String(aVal);
    const bStr = String(bVal);
    
    if (direction === 'asc') {
      return aStr.localeCompare(bStr);
    }
    return bStr.localeCompare(aStr);
  });
};

export const getLastNDays = (days: number): { start: string; end: string } => {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - days);
  
  return {
    start: start.toISOString().split('T')[0],
    end: end.toISOString().split('T')[0],
  };
};

