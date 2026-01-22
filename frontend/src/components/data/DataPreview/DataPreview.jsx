import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  FiEye, 
  FiEyeOff, 
  FiFilter, 
  FiDownload, 
  FiCheck, 
  FiX,
  FiAlertCircle,
  FiBarChart2
} from 'react-icons/fi';
import styles from './DataPreview.module.css';
import { formatCurrency, formatDate, formatNumber } from '../../../utils/formatters';

const DataPreview = ({ 
  data = [], 
  columns = [], 
  onValidate,
  onProcess,
  onExport,
  loading = false 
}) => {
  const [selectedRows, setSelectedRows] = useState([]);
  const [columnVisibility, setColumnVisibility] = useState(
    columns.reduce((acc, col) => ({ ...acc, [col.id]: true }), {})
  );
  const [filters, setFilters] = useState({});
  const [validationErrors, setValidationErrors] = useState([]);

  const visibleColumns = useMemo(() => 
    columns.filter(col => columnVisibility[col.id]), 
    [columns, columnVisibility]
  );

  const filteredData = useMemo(() => {
    let filtered = [...data];
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        filtered = filtered.filter(row => {
          const cellValue = row[key];
          if (cellValue === null || cellValue === undefined) return false;
          return String(cellValue).toLowerCase().includes(value.toLowerCase());
        });
      }
    });
    
    return filtered;
  }, [data, filters]);

  const stats = useMemo(() => {
    const totalRows = data.length;
    const validRows = data.filter(row => !row.errors || row.errors.length === 0).length;
    const errorRows = totalRows - validRows;
    
    const revenueStats = data.reduce((acc, row) => {
      if (row.total_amount) {
        acc.total += parseFloat(row.total_amount) || 0;
        acc.count++;
      }
      return acc;
    }, { total: 0, count: 0 });
    
    const avgRevenue = revenueStats.count > 0 ? revenueStats.total / revenueStats.count : 0;
    
    return {
      totalRows,
      validRows,
      errorRows,
      totalRevenue: revenueStats.total,
      avgRevenue,
      errorRate: totalRows > 0 ? (errorRows / totalRows) * 100 : 0,
    };
  }, [data]);

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedRows(filteredData.map(row => row.id));
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
    setColumnVisibility(prev => ({
      ...prev,
      [columnId]: !prev[columnId]
    }));
  };

  const handleValidate = () => {
    if (onValidate) {
      const errors = onValidate(data);
      setValidationErrors(errors);
    }
  };

  const handleProcess = () => {
    if (onProcess) {
      onProcess(selectedRows.length > 0 ? selectedRows : data.map(row => row.id));
    }
  };

  const getCellValue = (row, column) => {
    const value = row[column.id];
    
    if (column.format === 'currency') {
      return formatCurrency(value);
    }
    
    if (column.format === 'date') {
      return formatDate(value);
    }
    
    if (column.format === 'number') {
      return formatNumber(value);
    }
    
    return value;
  };

  const getErrorType = (error) => {
    if (error.includes('date') || error.includes('Date')) return 'date';
    if (error.includes('price') || error.includes('amount')) return 'numeric';
    if (error.includes('required') || error.includes('missing')) return 'required';
    return 'general';
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.skeletonHeader} />
        <div className={styles.skeletonStats} />
        <div className={styles.skeletonTable} />
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className={styles.container}>
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>
            <FiBarChart2 size={48} />
          </div>
          <h3>No Data to Preview</h3>
          <p>Upload a file to preview your data</p>
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
      {/* Stats Overview */}
      <div className={styles.statsOverview}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <FiBarChart2 size={20} />
          </div>
          <div className={styles.statContent}>
            <span className={styles.statValue}>{formatNumber(stats.totalRows)}</span>
            <span className={styles.statLabel}>Total Records</span>
          </div>
        </div>
        
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: 'rgba(16, 185, 129, 0.1)' }}>
            <FiCheck size={20} style={{ color: '#10b981' }} />
          </div>
          <div className={styles.statContent}>
            <span className={styles.statValue}>{formatNumber(stats.validRows)}</span>
            <span className={styles.statLabel}>Valid Records</span>
          </div>
        </div>
        
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: 'rgba(239, 68, 68, 0.1)' }}>
            <FiX size={20} style={{ color: '#ef4444' }} />
          </div>
          <div className={styles.statContent}>
            <span className={styles.statValue}>{formatNumber(stats.errorRows)}</span>
            <span className={styles.statLabel}>Error Records</span>
          </div>
        </div>
        
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: 'rgba(99, 102, 241, 0.1)' }}>
            <FiDownload size={20} style={{ color: '#6366f1' }} />
          </div>
          <div className={styles.statContent}>
            <span className={styles.statValue}>{formatCurrency(stats.totalRevenue)}</span>
            <span className={styles.statLabel}>Total Revenue</span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className={styles.controls}>
        <div className={styles.controlGroup}>
          <button
            className={`${styles.controlButton} ${styles.validateButton}`}
            onClick={handleValidate}
          >
            Validate Data
          </button>
          
          <button
            className={`${styles.controlButton} ${styles.processButton}`}
            onClick={handleProcess}
            disabled={selectedRows.length === 0 && stats.errorRows > 0}
          >
            Process {selectedRows.length > 0 ? selectedRows.length : stats.validRows} Records
          </button>
          
          <button
            className={`${styles.controlButton} ${styles.exportButton}`}
            onClick={onExport}
          >
            <FiDownload size={18} />
            Export Preview
          </button>
        </div>
        
        <div className={styles.columnControls}>
          <div className={styles.columnToggle}>
            <span>Columns:</span>
            <div className={styles.columnButtons}>
              {columns.map(column => (
                <button
                  key={column.id}
                  className={`${styles.columnButton} ${
                    columnVisibility[column.id] ? styles.active : ''
                  }`}
                  onClick={() => handleColumnToggle(column.id)}
                  title={`${columnVisibility[column.id] ? 'Hide' : 'Show'} ${column.label}`}
                >
                  {columnVisibility[column.id] ? (
                    <FiEye size={14} />
                  ) : (
                    <FiEyeOff size={14} />
                  )}
                  <span>{column.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <div className={styles.validationErrors}>
          <div className={styles.errorsHeader}>
            <FiAlertCircle className={styles.errorIcon} />
            <h4>Validation Errors ({validationErrors.length})</h4>
            <button
              className={styles.clearErrorsButton}
              onClick={() => setValidationErrors([])}
            >
              Clear
            </button>
          </div>
          
          <div className={styles.errorList}>
            {validationErrors.slice(0, 5).map((error, index) => (
              <div key={index} className={styles.errorItem}>
                <div className={styles.errorType} data-type={getErrorType(error)}>
                  {getErrorType(error)}
                </div>
                <span className={styles.errorMessage}>{error}</span>
              </div>
            ))}
            {validationErrors.length > 5 && (
              <div className={styles.moreErrors}>
                +{validationErrors.length - 5} more errors
              </div>
            )}
          </div>
        </div>
      )}

      {/* Data Preview */}
      <div className={styles.previewContainer}>
        <div className={styles.previewHeader}>
          <div className={styles.selectAll}>
            <input
              type="checkbox"
              checked={selectedRows.length === filteredData.length}
              onChange={handleSelectAll}
              className={styles.selectCheckbox}
            />
            <span>Select All</span>
          </div>
          
          <div className={styles.previewStats}>
            Showing {filteredData.length} of {data.length} records
            {selectedRows.length > 0 && (
              <span className={styles.selectionInfo}>
                • {selectedRows.length} selected
              </span>
            )}
          </div>
        </div>
        
        <div className={styles.tableContainer}>
          <table className={styles.previewTable}>
            <thead>
              <tr>
                <th className={styles.selectHeader}></th>
                {visibleColumns.map(column => (
                  <th key={column.id} className={styles.columnHeader}>
                    <div className={styles.headerContent}>
                      <span>{column.label}</span>
                      <div className={styles.headerActions}>
                        <input
                          type="text"
                          placeholder={`Filter ${column.label}...`}
                          value={filters[column.id] || ''}
                          onChange={(e) => setFilters(prev => ({
                            ...prev,
                            [column.id]: e.target.value
                          }))}
                          className={styles.columnFilter}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            
            <tbody>
              {filteredData.slice(0, 20).map((row, rowIndex) => (
                <tr
                  key={row.id || rowIndex}
                  className={`${styles.tableRow} ${
                    selectedRows.includes(row.id) ? styles.selected : ''
                  } ${row.errors && row.errors.length > 0 ? styles.hasError : ''}`}
                >
                  <td className={styles.selectCell}>
                    <input
                      type="checkbox"
                      checked={selectedRows.includes(row.id)}
                      onChange={() => handleSelectRow(row.id)}
                      className={styles.rowCheckbox}
                    />
                  </td>
                  
                  {visibleColumns.map(column => (
                    <td
                      key={column.id}
                      className={styles.tableCell}
                      title={row.errors && row.errors.find(e => e.includes(column.id))}
                    >
                      <div className={styles.cellContent}>
                        {getCellValue(row, column)}
                        {row.errors && row.errors.some(e => e.includes(column.id)) && (
                          <FiAlertCircle className={styles.cellErrorIcon} />
                        )}
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredData.length > 20 && (
          <div className={styles.previewFooter}>
            <p>
              Showing first 20 records. Use filters to narrow down results.
            </p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className={styles.actions}>
        <div className={styles.actionGroup}>
          <button
            className={styles.actionButton}
            onClick={() => setSelectedRows([])}
            disabled={selectedRows.length === 0}
          >
            Clear Selection
          </button>
          
          <button
            className={styles.actionButton}
            onClick={() => setSelectedRows(filteredData.filter(row => !row.errors || row.errors.length === 0).map(row => row.id))}
          >
            Select Valid Records
          </button>
          
          <button
            className={styles.actionButton}
            onClick={() => setSelectedRows(filteredData.filter(row => row.errors && row.errors.length > 0).map(row => row.id))}
            disabled={stats.errorRows === 0}
          >
            Select Error Records
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default DataPreview;