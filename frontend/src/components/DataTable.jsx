import React, { useState, useEffect, useMemo } from 'react';
import { FaSort, FaSortUp, FaSortDown, FaSearch, FaFilter, FaEllipsisV } from 'react-icons/fa';
import Pagination from './Pagination';
import Dropdown from './Dropdown';
import Skeleton from './Skeleton';

/**
 * DataTable Component
 * 
 * A reusable data table component with sorting, filtering, and pagination.
 * 
 * @param {Object} props - Component props
 * @param {Array} props.data - Array of data objects to display
 * @param {Array} props.columns - Array of column configuration objects
 * @param {boolean} props.loading - Whether the data is loading
 * @param {boolean} props.sortable - Whether the table is sortable
 * @param {boolean} props.filterable - Whether the table is filterable
 * @param {boolean} props.paginate - Whether to paginate the data
 * @param {number} props.pageSize - Number of rows per page
 * @param {function} props.onRowClick - Function to call when a row is clicked
 * @param {boolean} props.striped - Whether to stripe the rows
 * @param {boolean} props.hoverable - Whether to highlight rows on hover
 * @param {string} props.className - Additional CSS classes for the table
 * @param {boolean} props.compact - Whether to use compact styling
 * @param {boolean} props.bordered - Whether to add borders to the table
 * @param {function} props.rowClassName - Function to determine row class names
 * @param {function} props.emptyState - Function to render empty state
 */
const DataTable = ({
  data = [],
  columns = [],
  loading = false,
  sortable = true,
  filterable = true,
  paginate = true,
  pageSize = 10,
  onRowClick,
  striped = true,
  hoverable = true,
  className = '',
  compact = false,
  bordered = false,
  rowClassName,
  emptyState,
}) => {
  // State for sorting
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: 'asc',
  });

  // State for filtering
  const [filters, setFilters] = useState({});
  const [globalFilter, setGlobalFilter] = useState('');

  // State for pagination
  const [currentPage, setCurrentPage] = useState(1);

  // Reset pagination when data changes
  useEffect(() => {
    setCurrentPage(1);
  }, [data, filters, globalFilter]);

  // Handle sorting
  const handleSort = (key) => {
    if (!sortable) return;
    
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Handle filtering
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  // Handle global filtering
  const handleGlobalFilterChange = (e) => {
    setGlobalFilter(e.target.value);
  };

  // Handle pagination
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Apply sorting, filtering, and pagination to data
  const processedData = useMemo(() => {
    // Filter data
    let filteredData = [...data];
    
    // Apply column filters
    if (Object.keys(filters).length > 0) {
      filteredData = filteredData.filter(item => {
        return Object.entries(filters).every(([key, value]) => {
          if (!value) return true;
          
          const column = columns.find(col => col.accessor === key);
          if (column && column.filterFn) {
            return column.filterFn(item[key], value, item);
          }
          
          const itemValue = String(item[key] || '').toLowerCase();
          return itemValue.includes(String(value).toLowerCase());
        });
      });
    }
    
    // Apply global filter
    if (globalFilter) {
      const searchTerm = globalFilter.toLowerCase();
      filteredData = filteredData.filter(item => {
        return columns.some(column => {
          if (column.disableGlobalFilter) return false;
          const value = item[column.accessor];
          if (value == null) return false;
          return String(value).toLowerCase().includes(searchTerm);
        });
      });
    }
    
    // Sort data
    if (sortConfig.key) {
      filteredData.sort((a, b) => {
        const column = columns.find(col => col.accessor === sortConfig.key);
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];
        
        // Use custom sort function if provided
        if (column && column.sortFn) {
          return column.sortFn(aValue, bValue, a, b) * (sortConfig.direction === 'asc' ? 1 : -1);
        }
        
        // Default sorting logic
        if (aValue == null) aValue = '';
        if (bValue == null) bValue = '';
        
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return aValue.localeCompare(bValue) * (sortConfig.direction === 'asc' ? 1 : -1);
        }
        
        return (aValue > bValue ? 1 : -1) * (sortConfig.direction === 'asc' ? 1 : -1);
      });
    }
    
    return filteredData;
  }, [data, columns, filters, globalFilter, sortConfig]);

  // Paginate data
  const paginatedData = useMemo(() => {
    if (!paginate) return processedData;
    
    const startIndex = (currentPage - 1) * pageSize;
    return processedData.slice(startIndex, startIndex + pageSize);
  }, [processedData, currentPage, pageSize, paginate]);

  // Calculate total pages
  const totalPages = useMemo(() => {
    return Math.ceil(processedData.length / pageSize);
  }, [processedData, pageSize]);

  // Get sort icon for column
  const getSortIcon = (key) => {
    if (!sortable) return null;
    
    if (sortConfig.key === key) {
      return sortConfig.direction === 'asc' ? <FaSortUp /> : <FaSortDown />;
    }
    return <FaSort className="text-gray-300" />;
  };

  // Determine if the table has any data to display
  const hasData = data.length > 0;
  const hasFilteredData = processedData.length > 0;

  // Determine table classes
  const tableClasses = [
    'min-w-full divide-y divide-gray-200',
    bordered ? 'border border-gray-200' : '',
    className,
  ].filter(Boolean).join(' ');

  // Determine cell padding based on compact prop
  const cellPadding = compact ? 'px-2 py-1' : 'px-6 py-4';

  return (
    <div className="flex flex-col">
      {/* Table Controls */}
      {(filterable || sortable) && (
        <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          {/* Global Search */}
          {filterable && (
            <div className="relative w-full sm:w-64">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                placeholder="Search..."
                value={globalFilter}
                onChange={handleGlobalFilterChange}
              />
            </div>
          )}

          {/* Column Filters */}
          {filterable && columns.some(col => col.filterable) && (
            <div className="flex items-center">
              <FaFilter className="mr-2 text-gray-400" />
              <span className="text-sm text-gray-500 mr-2">Filters:</span>
              <div className="flex flex-wrap gap-2">
                {columns
                  .filter(column => column.filterable)
                  .map(column => (
                    <div key={column.accessor} className="relative">
                      <input
                        type="text"
                        className="block w-32 px-3 py-1 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-sm"
                        placeholder={column.Header}
                        value={filters[column.accessor] || ''}
                        onChange={(e) => handleFilterChange(column.accessor, e.target.value)}
                      />
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Table Container */}
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className={tableClasses}>
          {/* Table Header */}
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.accessor}
                  scope="col"
                  className={`${cellPadding} text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${column.sortable !== false && sortable ? 'cursor-pointer select-none' : ''}`}
                  onClick={() => column.sortable !== false && handleSort(column.accessor)}
                >
                  <div className="flex items-center space-x-1">
                    <span>{column.Header}</span>
                    {column.sortable !== false && sortable && (
                      <span className="ml-1">{getSortIcon(column.accessor)}</span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              // Loading skeleton
              Array.from({ length: pageSize }).map((_, index) => (
                <tr key={`skeleton-${index}`}>
                  {columns.map((column, colIndex) => (
                    <td key={`skeleton-${index}-${colIndex}`} className={cellPadding}>
                      <Skeleton type="text" height={16} />
                    </td>
                  ))}
                </tr>
              ))
            ) : hasFilteredData ? (
              // Data rows
              paginatedData.map((row, rowIndex) => {
                const rowClass = rowClassName ? rowClassName(row, rowIndex) : '';
                return (
                  <tr
                    key={row.id || rowIndex}
                    className={`${striped && rowIndex % 2 === 1 ? 'bg-gray-50' : ''} ${hoverable ? 'hover:bg-gray-100' : ''} ${rowClass}`}
                    onClick={() => onRowClick && onRowClick(row)}
                    style={onRowClick ? { cursor: 'pointer' } : undefined}
                  >
                    {columns.map((column) => {
                      const cellValue = row[column.accessor];
                      return (
                        <td key={column.accessor} className={cellPadding}>
                          {column.Cell ? column.Cell({ value: cellValue, row }) : cellValue}
                        </td>
                      );
                    })}
                  </tr>
                );
              })
            ) : (
              // Empty state
              <tr>
                <td colSpan={columns.length} className="px-6 py-10 text-center text-gray-500">
                  {emptyState ? emptyState() : (
                    <div className="flex flex-col items-center justify-center">
                      <p className="text-lg font-medium">No data available</p>
                      {globalFilter && (
                        <p className="text-sm mt-1">
                          Try adjusting your search or filter to find what you're looking for.
                        </p>
                      )}
                    </div>
                  )}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {paginate && hasData && (
        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing <span className="font-medium">{hasFilteredData ? (currentPage - 1) * pageSize + 1 : 0}</span> to{' '}
            <span className="font-medium">
              {Math.min(currentPage * pageSize, processedData.length)}
            </span>{' '}
            of <span className="font-medium">{processedData.length}</span> results
          </div>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            siblingCount={1}
          />
        </div>
      )}
    </div>
  );
};

/**
 * DataTable.ActionMenu Component
 * 
 * A specialized component for rendering action menus in table cells.
 * 
 * @param {Object} props - Component props
 * @param {Array} props.actions - Array of action objects
 * @param {Object} props.row - The row data
 */
DataTable.ActionMenu = ({ actions, row }) => {
  const items = actions.map(action => ({
    label: action.label,
    icon: action.icon,
    onClick: () => action.onClick(row),
    disabled: action.disabled ? action.disabled(row) : false,
  }));

  return (
    <Dropdown
      trigger={
        <button className="p-1 rounded-full hover:bg-gray-200 focus:outline-none">
          <FaEllipsisV className="h-4 w-4 text-gray-500" />
        </button>
      }
      items={items}
      align="right"
      width="sm"
    />
  );
};

export default DataTable;