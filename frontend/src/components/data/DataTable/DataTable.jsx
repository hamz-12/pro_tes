import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiSearch,
  FiFilter,
  FiChevronLeft,
  FiChevronRight,
  FiDownload,
  FiEye,
  FiEdit,
  FiTrash2,
  FiColumns,
  FiChevronDown,
  FiChevronUp,
} from 'react-icons/fi';
import styles from './DataTable.module.css';
import { formatCurrency, formatDate } from '../../../utils/formatters';

const DataTable = ({
  data = [],
  columns = [],
  loading = false,
  pageSize = 10,
  onRowClick,
  onEdit,
  onDelete,
  onExport,
  searchable = true,
  selectable = true,
  sortable = true,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');
  const [selectedRows, setSelectedRows] = useState([]);
  const [visibleColumns, setVisibleColumns] = useState(
    columns.map(col => col.id)
  );
  const [filters, setFilters] = useState({});

  // Process data
  const processedData = useMemo(() => {
    let filtered = [...data];

    // Apply search
    if (searchTerm) {
      filtered = filtered.filter(row =>
        Object.values(row).some(value =>
          String(value).toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        filtered = filtered.filter(row => row[key] === value);
      }
    });

    // Apply sorting
    if (sortColumn && sortable) {
      filtered.sort((a, b) => {
        const aVal = a[sortColumn];
        const bVal = b[sortColumn];
        
        if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [data, searchTerm, filters, sortColumn, sortDirection, sortable]);

  // Pagination
  const totalPages = Math.ceil(processedData.length / pageSize);
  const paginatedData = processedData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleSort = (columnId) => {
    if (columnId === sortColumn) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(columnId);
      setSortDirection('asc');
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedRows(paginatedData.map(row => row.id));
    } else {
      setSelectedRows([]);
    }
  };

  const handleSelectRow = (rowId) => {
    setSelectedRows(prev =>
      prev.includes(rowId)
        ? prev.filter(id => id !== rowId)
        : [...prev, rowId]
    );
  };

  const handleColumnToggle = (columnId) => {
    setVisibleColumns(prev =>
      prev.includes(columnId)
        ? prev.filter(id => id !== columnId)
        : [...prev, columnId]
    );
  };

  const handleFilterChange = (columnId, value) => {
    setFilters(prev => ({
      ...prev,
      [columnId]: value || undefined,
    }));
    setCurrentPage(1);
  };

  const getColumnValue = (row, column) => {
    const value = row[column.id];
    
    if (column.format === 'currency') {
      return formatCurrency(value);
    }
    
    if (column.format === 'date') {
      return formatDate(value);
    }
    
    // if (column.format === 'datetime') {
    //   return formatDateTime(value);
    // }
    
    if (column.render) {
      return column.render(value, row);
    }
    
    return value;
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.skeletonHeader} />
        <div className={styles.skeletonTable} />
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className={styles.container}>
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>📊</div>
          <h3>No Data Available</h3>
          <p>Upload your sales data to see records</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className={styles.container}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Table Controls */}
      <div className={styles.controls}>
        {searchable && (
          <div className={styles.searchContainer}>
            <FiSearch className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search records..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className={styles.searchInput}
            />
          </div>
        )}

        <div className={styles.controlActions}>
          {selectable && selectedRows.length > 0 && (
            <div className={styles.selectionInfo}>
              {selectedRows.length} selected
            </div>
          )}

          <div className={styles.actionButtons}>
            <button
              className={styles.actionButton}
              onClick={() => {
                const columnDialog = document.createElement('div');
                columnDialog.className = styles.columnDialog;
                // Column selection dialog implementation
              }}
              title="Column Visibility"
            >
              <FiColumns size={18} />
            </button>

            <button
              className={styles.actionButton}
              onClick={onExport}
              title="Export Data"
            >
              <FiDownload size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Column Filters */}
      <div className={styles.columnFilters}>
        {columns.map(column => (
          <div key={column.id} className={styles.filterGroup}>
            <label className={styles.filterLabel}>{column.label}</label>
            {column.filterable !== false && (
              <input
                type="text"
                placeholder={`Filter ${column.label.toLowerCase()}...`}
                value={filters[column.id] || ''}
                onChange={(e) => handleFilterChange(column.id, e.target.value)}
                className={styles.filterInput}
              />
            )}
          </div>
        ))}
      </div>

      {/* Table */}
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              {selectable && (
                <th className={styles.selectColumn}>
                  <input
                    type="checkbox"
                    checked={selectedRows.length === paginatedData.length}
                    onChange={handleSelectAll}
                    className={styles.selectCheckbox}
                  />
                </th>
              )}
              
              {columns
                .filter(col => visibleColumns.includes(col.id))
                .map(column => (
                  <th
                    key={column.id}
                    className={`${styles.tableHeader} ${
                      sortable && column.sortable !== false ? styles.sortable : ''
                    }`}
                    onClick={() => sortable && column.sortable !== false && handleSort(column.id)}
                    style={{ width: column.width }}
                  >
                    <div className={styles.headerContent}>
                      <span>{column.label}</span>
                      {sortable && column.sortable !== false && (
                        <div className={styles.sortIndicator}>
                          {sortColumn === column.id ? (
                            sortDirection === 'asc' ? (
                              <FiChevronUp className={styles.sortIcon} />
                            ) : (
                              <FiChevronDown className={styles.sortIcon} />
                            )
                          ) : (
                            <FiFilter className={styles.filterIcon} />
                          )}
                        </div>
                      )}
                    </div>
                  </th>
                ))}
              
              {(onEdit || onDelete || onRowClick) && (
                <th className={styles.actionsColumn}>Actions</th>
              )}
            </tr>
          </thead>
          
          <tbody>
            <AnimatePresence>
              {paginatedData.map((row, rowIndex) => (
                <motion.tr
                  key={row.id || rowIndex}
                  className={`${styles.tableRow} ${
                    selectedRows.includes(row.id) ? styles.selected : ''
                  }`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: rowIndex * 0.02 }}
                  whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
                  onClick={() => onRowClick && onRowClick(row)}
                >
                  {selectable && (
                    <td className={styles.selectCell}>
                      <input
                        type="checkbox"
                        checked={selectedRows.includes(row.id)}
                        onChange={() => handleSelectRow(row.id)}
                        onClick={(e) => e.stopPropagation()}
                        className={styles.rowCheckbox}
                      />
                    </td>
                  )}
                  
                  {columns
                    .filter(col => visibleColumns.includes(col.id))
                    .map(column => (
                      <td key={column.id} className={styles.tableCell}>
                        <div className={styles.cellContent}>
                          {getColumnValue(row, column)}
                        </div>
                      </td>
                    ))}
                  
                  {(onEdit || onDelete || onRowClick) && (
                    <td className={styles.actionsCell}>
                      <div className={styles.rowActions}>
                        {onRowClick && (
                          <button
                            className={styles.rowAction}
                            onClick={(e) => {
                              e.stopPropagation();
                              onRowClick(row);
                            }}
                            title="View Details"
                          >
                            <FiEye size={16} />
                          </button>
                        )}
                        
                        {onEdit && (
                          <button
                            className={styles.rowAction}
                            onClick={(e) => {
                              e.stopPropagation();
                              onEdit(row);
                            }}
                            title="Edit"
                          >
                            <FiEdit size={16} />
                          </button>
                        )}
                        
                        {onDelete && (
                          <button
                            className={`${styles.rowAction} ${styles.deleteAction}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              onDelete(row);
                            }}
                            title="Delete"
                          >
                            <FiTrash2 size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className={styles.pagination}>
          <div className={styles.paginationInfo}>
            Showing {((currentPage - 1) * pageSize) + 1} to{' '}
            {Math.min(currentPage * pageSize, processedData.length)} of{' '}
            {processedData.length} records
          </div>
          
          <div className={styles.paginationControls}>
            <button
              className={styles.paginationButton}
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              <FiChevronLeft size={18} />
              Previous
            </button>
            
            <div className={styles.pageNumbers}>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
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
                    key={pageNum}
                    className={`${styles.pageButton} ${
                      currentPage === pageNum ? styles.active : ''
                    }`}
                    onClick={() => setCurrentPage(pageNum)}
                  >
                    {pageNum}
                  </button>
                );
              })}
              
              {totalPages > 5 && (
                <>
                  {currentPage < totalPages - 2 && <span className={styles.pageEllipsis}>...</span>}
                  <button
                    className={`${styles.pageButton} ${
                      currentPage === totalPages ? styles.active : ''
                    }`}
                    onClick={() => setCurrentPage(totalPages)}
                  >
                    {totalPages}
                  </button>
                </>
              )}
            </div>
            
            <button
              className={styles.paginationButton}
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              Next
              <FiChevronRight size={18} />
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default DataTable;