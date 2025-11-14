'use client';

import { useState, ReactNode } from 'react';
import { Search, ChevronDown, MoreHorizontal } from 'lucide-react';

export type FilterConfig = {
  key: string;
  label: string;
  value: string;
  options: Array<{ value: string; label: string }>;
  onChange: (value: string) => void;
};

type Column<T> = {
  key: string;
  label: string;
  render?: (row: T) => ReactNode;
  align?: 'left' | 'right' | 'center';
};

type GenericTableProps<T> = {
  title: string;
  data: T[];
  columns: Column<T>[];
  searchPlaceholder?: string;
  onSearch?: (query: string) => void;
  filters?: FilterConfig[];
  actions?: ReactNode;
  onRowClick?: (row: T) => void;
  showCheckbox?: boolean;
  selectedRows?: Set<string>;
  onRowSelect?: (id: string) => void;
  getRowId?: (row: T) => string;
  emptyMessage?: string;
};

export function GenericTable<T extends Record<string, any>>({
  title,
  data,
  columns,
  searchPlaceholder = 'Search',
  onSearch,
  filters = [],
  actions,
  onRowClick,
  showCheckbox = false,
  selectedRows = new Set(),
  onRowSelect,
  getRowId = (row) => row.id,
  emptyMessage = 'No data found',
}: GenericTableProps<T>) {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    if (onSearch) {
      onSearch(value);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
      {/* Header */}
      <div className="px-6 py-5 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      </div>

      {/* Filters & Search */}
      {(filters.length > 0 || onSearch) && (
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            {filters.map((filter) => (
              <button
                key={filter.key}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                aria-label={`Filter by ${filter.label}`}
                onClick={() => {
                  // In a real implementation, this would open a dropdown
                }}
              >
                <span className="text-gray-500">{filter.label.toUpperCase()}</span>
                <span className="text-gray-900">
                  {filter.options.find((opt) => opt.value === filter.value)?.label || 'All'}
                </span>
                <ChevronDown size={14} aria-hidden="true" />
              </button>
            ))}
          </div>

          {onSearch && (
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                aria-hidden="true"
              />
              <input
                type="search"
                placeholder={searchPlaceholder}
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-9 pr-4 py-1.5 text-sm border border-gray-300 rounded bg-white focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
                aria-label="Search"
              />
            </div>
          )}
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              {showCheckbox && (
                <th className="px-6 py-3 text-left w-12">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-gray-600 focus:ring-gray-400"
                    aria-label="Select all"
                  />
                </th>
              )}
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`px-6 py-3 text-${column.align || 'left'} text-xs font-medium text-gray-500 uppercase tracking-wide`}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.map((row, index) => {
              const rowId = getRowId(row);
              return (
                <tr
                  key={rowId || index}
                  className={`hover:bg-gray-50 transition-colors ${onRowClick ? 'cursor-pointer' : ''}`}
                  onClick={() => onRowClick?.(row)}
                >
                  {showCheckbox && (
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedRows.has(rowId)}
                        onChange={() => onRowSelect?.(rowId)}
                        onClick={(e) => e.stopPropagation()}
                        className="rounded border-gray-300 text-gray-600 focus:ring-gray-400"
                        aria-label={`Select row ${rowId}`}
                      />
                    </td>
                  )}
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={`px-6 py-4 text-sm text-${column.align || 'left'}`}
                    >
                      {column.render ? column.render(row) : <span className="text-gray-900 font-medium">{row[column.key]}</span>}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {data.length === 0 && (
        <div className="px-6 py-12 text-center">
          <p className="text-sm text-gray-500">{emptyMessage}</p>
        </div>
      )}
    </div>
  );
}
