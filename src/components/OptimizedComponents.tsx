/**
 * Performance-Optimized React Components
 * Using React.memo, useMemo, and useCallback for better performance
 */

import React, { memo, useMemo, useCallback, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// Memoized form input component to prevent unnecessary re-renders
export const MemoizedInput = memo<{
  id: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
  disabled?: boolean;
  required?: boolean;
  error?: string;
}>(({
  id,
  type = "text",
  placeholder,
  value,
  onChange,
  className = "",
  disabled = false,
  required = false,
  error
}) => {
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(e.target.value);
    },
    [onChange]
  );

  const inputClassName = useMemo(
    () => `${className} ${error ? 'border-destructive' : ''}`,
    [className, error]
  );

  return (
    <div className="space-y-1">
      <Input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        className={inputClassName}
        disabled={disabled}
        required={required}
      />
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  );
});

MemoizedInput.displayName = 'MemoizedInput';

// Optimized list component with virtualization considerations
export const OptimizedList = memo<{
  items: Array<{ id: string; [key: string]: any }>;
  renderItem: (item: any, index: number) => React.ReactNode;
  className?: string;
  maxVisible?: number;
}>(({ items, renderItem, className = "", maxVisible = 50 }) => {
  const [visibleCount, setVisibleCount] = useState(maxVisible);

  const visibleItems = useMemo(
    () => items.slice(0, visibleCount),
    [items, visibleCount]
  );

  const hasMoreItems = useMemo(
    () => items.length > visibleCount,
    [items.length, visibleCount]
  );

  const loadMore = useCallback(() => {
    setVisibleCount(prev => Math.min(prev + maxVisible, items.length));
  }, [maxVisible, items.length]);

  return (
    <div className={className}>
      <div className="space-y-2">
        {visibleItems.map((item, index) => (
          <div key={item.id}>
            {renderItem(item, index)}
          </div>
        ))}
      </div>
      
      {hasMoreItems && (
        <div className="flex justify-center mt-4">
          <Button
            variant="outline"
            onClick={loadMore}
            className="text-sm"
          >
            Load More ({items.length - visibleCount} remaining)
          </Button>
        </div>
      )}
    </div>
  );
});

OptimizedList.displayName = 'OptimizedList';

// Memoized card component
export const MemoizedCard = memo<{
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}>(({ title, description, children, className = "", onClick }) => {
  const cardProps = useMemo(
    () => ({
      className: `p-4 border rounded-lg bg-card hover:shadow-md transition-shadow ${className} ${
        onClick ? 'cursor-pointer hover:bg-accent/50' : ''
      }`,
      onClick
    }),
    [className, onClick]
  );

  return (
    <div {...cardProps}>
      <div className="mb-3">
        <h3 className="font-semibold text-lg">{title}</h3>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      <div>{children}</div>
    </div>
  );
});

MemoizedCard.displayName = 'MemoizedCard';

// Optimized table component with sorting and pagination
export const OptimizedTable = memo<{
  data: Array<Record<string, any>>;
  columns: Array<{
    key: string;
    header: string;
    sortable?: boolean;
    render?: (value: any, row: Record<string, any>) => React.ReactNode;
  }>;
  pageSize?: number;
  className?: string;
}>(({ data, columns, pageSize = 10, className = "" }) => {
  const [sortKey, setSortKey] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(0);

  const sortedData = useMemo(() => {
    if (!sortKey) return data;

    return [...data].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      
      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data, sortKey, sortOrder]);

  const paginatedData = useMemo(() => {
    const start = currentPage * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, currentPage, pageSize]);

  const totalPages = useMemo(
    () => Math.ceil(sortedData.length / pageSize),
    [sortedData.length, pageSize]
  );

  const handleSort = useCallback((key: string) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  }, [sortKey, sortOrder]);

  return (
    <div className={className}>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-border">
          <thead>
            <tr className="bg-muted">
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`border border-border p-2 text-left ${
                    column.sortable ? 'cursor-pointer hover:bg-muted/80' : ''
                  }`}
                  onClick={column.sortable ? () => handleSort(column.key) : undefined}
                >
                  <div className="flex items-center gap-2">
                    {column.header}
                    {column.sortable && sortKey === column.key && (
                      <span>{sortOrder === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((row, index) => (
              <tr key={index} className="hover:bg-accent/50">
                {columns.map((column) => (
                  <td key={column.key} className="border border-border p-2">
                    {column.render
                      ? column.render(row[column.key], row)
                      : row[column.key]
                    }
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-4">
          <p className="text-sm text-muted-foreground">
            Showing {currentPage * pageSize + 1}-{Math.min((currentPage + 1) * pageSize, sortedData.length)} of {sortedData.length}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 0}
              onClick={() => setCurrentPage(prev => prev - 1)}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage >= totalPages - 1}
              onClick={() => setCurrentPage(prev => prev + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
});

OptimizedTable.displayName = 'OptimizedTable';

export default {
  MemoizedInput,
  OptimizedList,
  MemoizedCard,
  OptimizedTable
};
