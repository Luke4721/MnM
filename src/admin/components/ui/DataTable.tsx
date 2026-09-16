import React from 'react';
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Inbox } from 'lucide-react';
import { LoadingSpinner } from './LoadingSpinner';

export interface Column<T> {
  key: string;
  title: React.ReactNode;
  render?: (item: T, index: number) => React.ReactNode;
  sortable?: boolean;
  align?: 'left' | 'center' | 'right';
  width?: string;
  className?: string;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  rowKey: (item: T) => string;
  loading?: boolean;
  emptyMessage?: string;
  emptyIcon?: React.ReactNode;

  // Sorting
  sortColumn?: string;
  sortDirection?: 'asc' | 'desc';
  onSort?: (columnKey: string) => void;

  // Selection
  selectable?: boolean;
  selectedKeys?: string[];
  onSelectionChange?: (keys: string[]) => void;

  // Pagination
  pagination?: {
    currentPage: number;
    pageSize: number;
    totalItems: number;
    onPageChange: (page: number) => void;
  };
}

export function DataTable<T>({
  columns,
  data,
  rowKey,
  loading = false,
  emptyMessage = 'No records found',
  emptyIcon,
  sortColumn,
  sortDirection,
  onSort,
  selectable = false,
  selectedKeys = [],
  onSelectionChange,
  pagination,
}: DataTableProps<T>) {
  const allRowKeys = data.map(rowKey);
  const isAllSelected =
    data.length > 0 && allRowKeys.every((k) => selectedKeys.includes(k));
  const isPartiallySelected =
    data.length > 0 &&
    allRowKeys.some((k) => selectedKeys.includes(k)) &&
    !isAllSelected;

  const handleSelectAll = () => {
    if (!onSelectionChange) return;
    if (isAllSelected) {
      // Unselect all in current page
      onSelectionChange(selectedKeys.filter((k) => !allRowKeys.includes(k)));
    } else {
      // Add all in current page
      const newKeys = Array.from(new Set([...selectedKeys, ...allRowKeys]));
      onSelectionChange(newKeys);
    }
  };

  const handleSelectRow = (key: string) => {
    if (!onSelectionChange) return;
    if (selectedKeys.includes(key)) {
      onSelectionChange(selectedKeys.filter((k) => k !== key));
    } else {
      onSelectionChange([...selectedKeys, key]);
    }
  };

  const totalPages = pagination
    ? Math.max(1, Math.ceil(pagination.totalItems / pagination.pageSize))
    : 1;

  return (
    <div className="w-full flex flex-col">
      {/* Table Container */}
      <div className="overflow-x-auto rounded-2xl border border-white/60 bg-white/50 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.04)]" data-lenis-prevent>
        <table className="w-full border-collapse text-left text-[13px]">
          <thead>
            <tr className="border-b border-white/60 bg-white/40 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
              {selectable && (
                <th className="w-12 px-4 py-3.5 text-center">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = isPartiallySelected;
                    }}
                    onChange={handleSelectAll}
                    aria-label="Select all rows"
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500/30 border-gray-300 cursor-pointer"
                  />
                </th>
              )}

              {columns.map((col) => {
                const isSorted = sortColumn === col.key;
                const alignClass =
                  col.align === 'center'
                    ? 'text-center'
                    : col.align === 'right'
                    ? 'text-right'
                    : 'text-left';

                return (
                  <th
                    key={col.key}
                    style={{ width: col.width }}
                    className={`px-4 py-3.5 ${alignClass} ${col.className || ''}`}
                  >
                    {col.sortable && onSort ? (
                      <button
                        type="button"
                        onClick={() => onSort(col.key)}
                        className="inline-flex items-center gap-1.5 hover:text-gray-900 transition-colors uppercase font-bold"
                      >
                        {col.title}
                        <span className="flex flex-col text-gray-400">
                          {isSorted && sortDirection === 'asc' ? (
                            <ChevronUp size={13} className="text-indigo-600" />
                          ) : isSorted && sortDirection === 'desc' ? (
                            <ChevronDown size={13} className="text-indigo-600" />
                          ) : (
                            <div className="opacity-40">
                              <ChevronUp size={10} className="-mb-1" />
                              <ChevronDown size={10} />
                            </div>
                          )}
                        </span>
                      </button>
                    ) : (
                      col.title
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody className="divide-y divide-white/40">
            {loading ? (
              <tr>
                <td
                  colSpan={columns.length + (selectable ? 1 : 0)}
                  className="py-16 text-center"
                >
                  <div className="flex flex-col items-center justify-center gap-3 text-gray-500">
                    <LoadingSpinner size="lg" variant="primary" />
                    <span className="text-[13px] font-medium">Loading data...</span>
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (selectable ? 1 : 0)}
                  className="py-16 text-center"
                >
                  <div className="flex flex-col items-center justify-center gap-3 text-gray-400">
                    {emptyIcon || <Inbox size={40} className="stroke-[1.5] text-gray-300" />}
                    <p className="text-sm font-medium text-gray-500">{emptyMessage}</p>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((item, index) => {
                const key = rowKey(item);
                const isSelected = selectedKeys.includes(key);

                return (
                  <tr
                    key={key}
                    className={`transition-colors ${
                      isSelected
                        ? 'bg-indigo-50/40 hover:bg-indigo-50/60'
                        : 'hover:bg-white/60'
                    }`}
                  >
                    {selectable && (
                      <td className="w-12 px-4 py-3.5 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleSelectRow(key)}
                          aria-label={`Select row ${index + 1}`}
                          className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500/30 border-gray-300 cursor-pointer"
                        />
                      </td>
                    )}

                    {columns.map((col) => {
                      const alignClass =
                        col.align === 'center'
                          ? 'text-center'
                          : col.align === 'right'
                          ? 'text-right'
                          : 'text-left';

                      return (
                        <td
                          key={col.key}
                          className={`px-4 py-3.5 text-gray-700 ${alignClass} ${
                            col.className || ''
                          }`}
                        >
                          {col.render
                            ? col.render(item, index)
                            : (item as any)[col.key]}
                        </td>
                      );
                    })}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {pagination && !loading && data.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4 px-2">
          <div className="text-[12px] text-gray-500">
            Showing{' '}
            <span className="font-semibold text-gray-800">
              {(pagination.currentPage - 1) * pagination.pageSize + 1}
            </span>{' '}
            to{' '}
            <span className="font-semibold text-gray-800">
              {Math.min(
                pagination.currentPage * pagination.pageSize,
                pagination.totalItems
              )}
            </span>{' '}
            of{' '}
            <span className="font-semibold text-gray-800">
              {pagination.totalItems}
            </span>{' '}
            results
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={pagination.currentPage <= 1}
              onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
              className="p-1.5 rounded-xl border border-white/60 bg-white/60 hover:bg-white text-gray-700 disabled:opacity-40 disabled:pointer-events-none transition-all shadow-sm"
              aria-label="Previous page"
            >
              <ChevronLeft size={16} />
            </button>

            <span className="text-[12px] font-medium text-gray-700 px-3 py-1 rounded-xl bg-white/50 border border-white/60 shadow-sm">
              Page {pagination.currentPage} of {totalPages}
            </span>

            <button
              type="button"
              disabled={pagination.currentPage >= totalPages}
              onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
              className="p-1.5 rounded-xl border border-white/60 bg-white/60 hover:bg-white text-gray-700 disabled:opacity-40 disabled:pointer-events-none transition-all shadow-sm"
              aria-label="Next page"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
