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
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '40px', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' }}>
        <div style={{ width: '24px', height: '24px', border: '3px solid #e5e7eb', borderTopColor: '#4f46e5', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <span style={{ marginLeft: '12px', color: '#6b7280' }}>Loading...</span>
      </div>
    );
  }
  return (
    <div style={{ marginBottom: '32px' }}>
      <table 
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          backgroundColor: 'white',
          borderRadius: '8px',
          overflow: 'hidden',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
          ...style
        }}
        className={className}
      >
        <thead style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
          <tr>
            {columns.map((column, index) => (
              <th
                key={index}
                style={{ 
                  padding: '12px 16px',
                  textAlign: column.align || 'left',
                  fontWeight: '600',
                  color: '#374151',
                  fontSize: '14px',
                  position: 'relative',
                  cursor: column.sortable ? 'pointer' : 'default',
                  width: column.width
                }}
                onClick={() => column.sortable && handleSort(column.key as string)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  {column.title}
                  {column.sortable && (
                    <span style={{ fontSize: '12px', color: '#9ca3af' }}>
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
          {paginatedData.length === 0 ? (            <tr>
              <td
                colSpan={columns.length}
                style={{
                  paddingLeft: '16px',
                  paddingRight: '16px',
                  paddingTop: '40px',
                  paddingBottom: '40px',
                  textAlign: 'center',
                  color: '#6b7280',
                  fontStyle: 'italic'
                }}
              >
                {emptyText}
              </td>
            </tr>
          ) : (
            paginatedData.map((record, index) => (              <tr
                key={getRowKey(record, index)}
                style={{
                  transition: 'background-color 0.2s',
                  cursor: onRowClick ? 'pointer' : 'default'
                }}
                onMouseEnter={(e) => {
                  if (onRowClick) e.currentTarget.style.backgroundColor = '#f9fafb';
                }}
                onMouseLeave={(e) => {
                  if (onRowClick) e.currentTarget.style.backgroundColor = 'transparent';
                }}
                onClick={() => onRowClick?.(record, index)}
              >
                {columns.map((column, columnIndex) => {
                  const value = getValue(record, column.key);
                  return (                    <td
                      key={columnIndex}
                      style={{
                        paddingLeft: '16px',
                        paddingRight: '16px',
                        paddingTop: '16px',
                        paddingBottom: '16px',
                        fontSize: '14px',
                        borderBottom: '1px solid #f3f4f6',
                        textAlign: column.align || 'left'
                      }}
                    >
                      {column.render ? column.render(value, record, index) : value}
                    </td>
                  );
                })}
              </tr>
            ))
          )}
        </tbody>
      </table>      {pagination && totalPages > 1 && (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '16px',
          padding: '16px',
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
        }}>
          <div style={{ fontSize: '14px', color: '#6b7280' }}>
            Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, data.length)} of {data.length} entries
          </div>
          
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              style={{
                paddingLeft: '12px',
                paddingRight: '12px',
                paddingTop: '8px',
                paddingBottom: '8px',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                fontSize: '14px',
                backgroundColor: currentPage === 1 ? '#f9fafb' : 'white',
                color: currentPage === 1 ? '#9ca3af' : '#374151',
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
              }}
              onMouseEnter={(e) => {
                if (currentPage !== 1) e.currentTarget.style.backgroundColor = '#f9fafb';
              }}
              onMouseLeave={(e) => {
                if (currentPage !== 1) e.currentTarget.style.backgroundColor = 'white';
              }}
            >
              Previous
            </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                style={{
                  paddingLeft: '12px',
                  paddingRight: '12px',
                  paddingTop: '8px',
                  paddingBottom: '8px',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  fontSize: '14px',
                  cursor: 'pointer',
                  backgroundColor: currentPage === page ? '#4f46e5' : 'white',
                  color: currentPage === page ? 'white' : '#374151',
                  fontWeight: currentPage === page ? '600' : 'normal'
                }}
                onMouseEnter={(e) => {
                  if (currentPage !== page) e.currentTarget.style.backgroundColor = '#f9fafb';
                }}
                onMouseLeave={(e) => {
                  if (currentPage !== page) e.currentTarget.style.backgroundColor = 'white';
                }}
              >
                {page}
              </button>
            ))}
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              style={{
                paddingLeft: '12px',
                paddingRight: '12px',
                paddingTop: '8px',
                paddingBottom: '8px',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                fontSize: '14px',
                backgroundColor: currentPage === totalPages ? '#f9fafb' : 'white',
                color: currentPage === totalPages ? '#9ca3af' : '#374151',
                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'
              }}
              onMouseEnter={(e) => {
                if (currentPage !== totalPages) e.currentTarget.style.backgroundColor = '#f9fafb';
              }}
              onMouseLeave={(e) => {
                if (currentPage !== totalPages) e.currentTarget.style.backgroundColor = 'white';
              }}
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
