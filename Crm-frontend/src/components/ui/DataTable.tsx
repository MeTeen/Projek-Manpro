import React from 'react';

interface Column<T> {
  key: keyof T | string;
  title: string;
  width?: string;
  align?: 'left' | 'center' | 'right';
  render?: (value: any, record: T, index: number) => React.ReactNode;
  sortable?: boolean;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  onRowClick?: (record: T, index: number) => void;
  rowKey?: keyof T | ((record: T) => string | number);
  emptyText?: string;
  pagination?: boolean;
  pageSize?: number;
  className?: string;
  style?: React.CSSProperties;
}

function DataTable<T extends Record<string, any>>({
  data,
  columns,
  loading = false,
  onRowClick,
  rowKey,
  emptyText = 'No data available',
  pagination = false,
  pageSize = 10,
  className = '',
  style = {}
}: DataTableProps<T>) {
  const [currentPage, setCurrentPage] = React.useState(1);
  const [sortConfig, setSortConfig] = React.useState<{
    key: string;
    direction: 'asc' | 'desc';
  } | null>(null);

  // Handle sorting
  const handleSort = (columnKey: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === columnKey && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key: columnKey, direction });
  };

  // Sort data
  const sortedData = React.useMemo(() => {
    if (!sortConfig) return data;
    
    return [...data].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data, sortConfig]);

  // Paginate data
  const paginatedData = React.useMemo(() => {
    if (!pagination) return sortedData;
    
    const startIndex = (currentPage - 1) * pageSize;
    return sortedData.slice(startIndex, startIndex + pageSize);
  }, [sortedData, currentPage, pageSize, pagination]);

  const totalPages = Math.ceil(data.length / pageSize);

  const getRowKey = (record: T, index: number): string | number => {
    if (typeof rowKey === 'function') {
      return rowKey(record);
    }
    if (rowKey) {
      return record[rowKey];
    }
    return index;
  };
  const getValue = (record: T, key: keyof T | string): any => {
    if (typeof key === 'string' && key.includes('.')) {
      return key.split('.').reduce((obj, k) => obj?.[k], record);
    }
    return record[key as keyof T];
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-10 bg-white rounded-lg shadow-sm">
        <div className="w-6 h-6 border-[3px] border-gray-200 border-t-indigo-600 rounded-full animate-spin" />
        <span className="ml-3 text-gray-500">Loading...</span>
      </div>
    );
  }
  return (
    <div className="mb-8">
      <table 
        className={`w-full border-collapse bg-white rounded-lg overflow-hidden shadow-sm ${className}`}
        style={style}
      >
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            {columns.map((column, index) => (
              <th
                key={index}
                className={`px-4 py-3 text-left font-semibold text-gray-700 text-sm relative ${
                  column.sortable ? 'cursor-pointer' : ''
                }`}
                style={{ 
                  width: column.width,
                  textAlign: column.align || 'left'
                }}
                onClick={() => column.sortable && handleSort(column.key as string)}
              >
                <div className="flex items-center gap-1">
                  {column.title}
                  {column.sortable && (
                    <span className="text-xs text-gray-400">
                      {sortConfig?.key === column.key ? (
                        sortConfig.direction === 'asc' ? '↑' : '↓'
                      ) : '↕'}
                    </span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {paginatedData.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-10 text-center text-gray-500 italic"
              >
                {emptyText}
              </td>
            </tr>
          ) : (
            paginatedData.map((record, index) => (
              <tr
                key={getRowKey(record, index)}
                className={`transition-colors duration-200 ${
                  onRowClick ? 'cursor-pointer hover:bg-gray-50' : 'cursor-default'
                }`}
                onClick={() => onRowClick?.(record, index)}
              >
                {columns.map((column, columnIndex) => {
                  const value = getValue(record, column.key);
                  return (
                    <td
                      key={columnIndex}
                      className="px-4 py-4 text-sm border-b border-gray-100"
                      style={{ textAlign: column.align || 'left' }}
                    >
                      {column.render ? column.render(value, record, index) : value}
                    </td>
                  );
                })}
              </tr>
            ))
          )}
        </tbody>
      </table>

      {pagination && totalPages > 1 && (
        <div className="flex justify-between items-center mt-4 p-4 bg-white rounded-lg shadow-sm">
          <div className="text-sm text-gray-500">
            Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, data.length)} of {data.length} entries
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className={`px-3 py-2 border border-gray-300 rounded text-sm ${
                currentPage === 1 
                  ? 'bg-gray-50 text-gray-400 cursor-not-allowed' 
                  : 'bg-white text-gray-700 hover:bg-gray-50 cursor-pointer'
              }`}
            >
              Previous
            </button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-2 border border-gray-300 rounded text-sm cursor-pointer ${
                  currentPage === page 
                    ? 'bg-indigo-600 text-white font-semibold' 
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                {page}
              </button>
            ))}
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className={`px-3 py-2 border border-gray-300 rounded text-sm ${
                currentPage === totalPages 
                  ? 'bg-gray-50 text-gray-400 cursor-not-allowed' 
                  : 'bg-white text-gray-700 hover:bg-gray-50 cursor-pointer'
              }`}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default DataTable;
