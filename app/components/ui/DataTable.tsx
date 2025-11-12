'use client';

import { useState, useMemo } from 'react';
import { Search, ChevronUp, ChevronDown, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './Button';
import { Input } from './Input';
import { Select } from './Select';
import type { ColumnDef, FilterOption } from '@/lib/types';
import { filterByText, sortByField } from '@/lib/filters';
import { paginate, getTotalPages, getPaginationInfo } from '@/lib/pagination';

type DataTableProps<T> = {
  columns: ColumnDef<T>[];
  rows: T[];
  searchKeys?: (keyof T)[];
  filters?: FilterOption[];
  defaultPageSize?: number;
  compact?: boolean;
  onRowClick?: (row: T) => void;
};

export const DataTable = <T extends Record<string, any>>({
  columns,
  rows,
  searchKeys = [],
  filters = [],
  defaultPageSize = 10,
  compact = false,
  onRowClick,
}: DataTableProps<T>) => {
  const [searchText, setSearchText] = useState('');
  const [sortField, setSortField] = useState<keyof T | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});
  
  // Apply filters and search
  const filteredRows = useMemo(() => {
    let result = [...rows];
    
    // Apply search
    if (searchText && searchKeys.length > 0) {
      result = filterByText(result, searchText, searchKeys);
    }
    
    // Apply facet filters
    Object.entries(activeFilters).forEach(([key, value]) => {
      if (value) {
        result = result.filter((row) => row[key] === value);
      }
    });
    
    // Apply sorting
    if (sortField) {
      result = sortByField(result, sortField, sortDirection);
    }
    
    return result;
  }, [rows, searchText, searchKeys, activeFilters, sortField, sortDirection]);
  
  // Paginate
  const paginatedRows = useMemo(() => {
    return paginate(filteredRows, currentPage, pageSize);
  }, [filteredRows, currentPage, pageSize]);
  
  const totalPages = getTotalPages(filteredRows.length, pageSize);
  
  const handleSort = (field: keyof T) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };
  
  const handleFilterChange = (filterKey: string, value: string) => {
    setActiveFilters((prev) => ({ ...prev, [filterKey]: value }));
    setCurrentPage(1);
  };
  
  const handlePageSizeChange = (newSize: string) => {
    setPageSize(Number(newSize));
    setCurrentPage(1);
  };
  
  const handleExportCSV = () => {
    const csvHeaders = columns.map((col) => col.label).join(',');
    const csvRows = filteredRows.map((row) =>
      columns
        .map((col) => {
          const value = row[col.key];
          // Escape commas and quotes
          const escaped = String(value ?? '').replace(/"/g, '""');
          return `"${escaped}"`;
        })
        .join(',')
    );
    
    const csv = [csvHeaders, ...csvRows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `export-${Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };
  
  return (
    <div className="w-full space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-4">
        {/* Search */}
        {searchKeys.length > 0 && (
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]"
                size={18}
              />
              <Input
                type="text"
                placeholder="Search..."
                value={searchText}
                onChange={(e) => {
                  setSearchText(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-10"
                fullWidth
              />
            </div>
          </div>
        )}
        
        {/* Filters */}
        {filters.map((filter) => (
          <Select
            key={filter.key}
            value={activeFilters[filter.key] || ''}
            onChange={(e) => handleFilterChange(filter.key, e.target.value)}
            options={[{ value: '', label: `All ${filter.label}` }, ...filter.options]}
            className="min-w-[150px]"
          />
        ))}
        
        {/* Export */}
        <Button
          variant="secondary"
          size="sm"
          icon={Download}
          onClick={handleExportCSV}
        >
          Export CSV
        </Button>
      </div>
      
      {/* Table */}
      <div className="overflow-x-auto border border-[var(--border)] rounded-lg">
        <table className="w-full">
          <thead className="bg-[var(--muted)] border-b border-[var(--border)]">
            <tr>
              {columns.map((column) => (
                <th
                  key={String(column.key)}
                  className={`${compact ? 'px-3 py-2' : 'px-6 py-3'} text-left text-xs font-medium text-[var(--text-color)] uppercase tracking-wider ${column.sortable ? 'cursor-pointer hover:bg-[var(--border)]' : ''}`}
                  onClick={() => column.sortable && handleSort(column.key as keyof T)}
                >
                  <div className="flex items-center gap-2">
                    {column.label}
                    {column.sortable && (
                      <span className="flex flex-col">
                        {sortField === column.key ? (
                          sortDirection === 'asc' ? (
                            <ChevronUp size={14} />
                          ) : (
                            <ChevronDown size={14} />
                          )
                        ) : (
                          <ChevronUp size={14} className="opacity-30" />
                        )}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-[var(--card-bg)] divide-y divide-[var(--border)]">
            {paginatedRows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className={`${compact ? 'px-3 py-8' : 'px-6 py-12'} text-center text-[var(--muted-foreground)]`}
                >
                  No data found
                </td>
              </tr>
            ) : (
              paginatedRows.map((row, idx) => (
                <tr
                  key={idx}
                  className={`${onRowClick ? 'cursor-pointer hover:bg-[var(--muted)]' : ''}`}
                  onClick={() => onRowClick?.(row)}
                >
                  {columns.map((column) => (
                    <td
                      key={String(column.key)}
                      className={`${compact ? 'px-3 py-2' : 'px-6 py-4'} text-sm text-[var(--text-color)]`}
                    >
                      {column.render ? column.render(row) : String(row[column.key] ?? '-')}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-[var(--muted-foreground)]">
              {getPaginationInfo({ currentPage, pageSize, totalItems: filteredRows.length })}
            </span>
            <Select
              value={String(pageSize)}
              onChange={(e) => handlePageSizeChange(e.target.value)}
              options={[
                { value: '10', label: '10 per page' },
                { value: '25', label: '25 per page' },
                { value: '50', label: '50 per page' },
                { value: '100', label: '100 per page' },
              ]}
              className="w-auto"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              icon={ChevronLeft}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-3 py-1 rounded text-sm ${
                      currentPage === pageNum
                        ? 'bg-[var(--foreground)] text-[var(--background)]'
                        : 'bg-[var(--muted)] text-[var(--text-color)] hover:bg-[var(--border)]'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            
            <Button
              variant="secondary"
              size="sm"
              icon={ChevronRight}
              iconPosition="right"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

