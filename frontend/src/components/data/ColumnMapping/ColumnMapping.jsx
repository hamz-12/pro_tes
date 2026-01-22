import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiArrowRight,
  FiCheck,
  FiX,
  FiHelpCircle,
  FiAlertCircle,
  FiColumns,
  FiDatabase,
  FiTarget,
} from 'react-icons/fi';
import styles from './ColumnMapping.module.css';

const ColumnMapping = ({
  sourceColumns = [],
  targetColumns = [],
  currentMapping = {},
  onMappingChange,
  onAutoDetect,
  onValidate,
  loading = false,
}) => {
  const [mappings, setMappings] = useState(currentMapping);
  const [detectedMapping, setDetectedMapping] = useState({});
  const [validationErrors, setValidationErrors] = useState([]);
  const [selectedSource, setSelectedSource] = useState(null);
  const [selectedTarget, setSelectedTarget] = useState(null);

  const availableTargetColumns = useMemo(() => {
    const usedTargets = Object.values(mappings);
    return targetColumns.filter(col => !usedTargets.includes(col.id));
  }, [targetColumns, mappings]);

  const availableSourceColumns = useMemo(() => {
    const usedSources = Object.keys(mappings);
    return sourceColumns.filter(col => !usedSources.includes(col));
  }, [sourceColumns, mappings]);

  const handleAutoDetect = useCallback(() => {
    if (onAutoDetect) {
      const detected = onAutoDetect(sourceColumns, targetColumns);
      setDetectedMapping(detected);
      
      // Apply detected mappings
      const newMappings = { ...mappings };
      Object.entries(detected).forEach(([source, target]) => {
        if (!mappings[source]) {
          newMappings[source] = target;
        }
      });
      setMappings(newMappings);
      onMappingChange(newMappings);
    }
  }, [sourceColumns, targetColumns, mappings, onAutoDetect, onMappingChange]);

  const handleMap = useCallback((sourceColumn, targetColumn) => {
    const newMappings = { ...mappings, [sourceColumn]: targetColumn };
    setMappings(newMappings);
    onMappingChange(newMappings);
    setSelectedSource(null);
    setSelectedTarget(null);
  }, [mappings, onMappingChange]);

  const handleUnmap = useCallback((sourceColumn) => {
    const newMappings = { ...mappings };
    delete newMappings[sourceColumn];
    setMappings(newMappings);
    onMappingChange(newMappings);
  }, [mappings, onMappingChange]);

  const handleValidate = useCallback(() => {
    if (onValidate) {
      const errors = onValidate(mappings);
      setValidationErrors(errors);
    }
  }, [mappings, onValidate]);

  const getColumnType = (columnName) => {
    const lowerName = columnName.toLowerCase();
    
    if (lowerName.includes('date') || lowerName.includes('time')) return 'date';
    if (lowerName.includes('price') || lowerName.includes('amount') || lowerName.includes('total')) return 'currency';
    if (lowerName.includes('quantity') || lowerName.includes('count') || lowerName.includes('number')) return 'number';
    if (lowerName.includes('email')) return 'email';
    if (lowerName.includes('phone')) return 'phone';
    if (lowerName.includes('name') || lowerName.includes('title')) return 'text';
    
    return 'unknown';
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'date': return '📅';
      case 'currency': return '💰';
      case 'number': return '🔢';
      case 'email': return '📧';
      case 'phone': return '📞';
      case 'text': return '📝';
      default: return '❓';
    }
  };

  const getTargetDescription = (targetId) => {
    const target = targetColumns.find(col => col.id === targetId);
    return target?.description || 'No description available';
  };

  const mappingStatus = useMemo(() => {
    const mappedCount = Object.keys(mappings).length;
    const totalTargets = targetColumns.length;
    const percentage = (mappedCount / totalTargets) * 100;
    
    if (percentage === 0) return { status: 'empty', color: '#ef4444', label: 'No columns mapped' };
    if (percentage < 50) return { status: 'partial', color: '#f59e0b', label: `${mappedCount}/${totalTargets} mapped` };
    if (percentage < 100) return { status: 'good', color: '#84cc16', label: `${mappedCount}/${totalTargets} mapped` };
    return { status: 'complete', color: '#10b981', label: 'All columns mapped' };
  }, [mappings, targetColumns.length]);

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.skeletonHeader} />
        <div className={styles.skeletonColumns} />
      </div>
    );
  }

  return (
    <motion.div
      className={styles.container}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h3 className={styles.title}>Column Mapping</h3>
          <p className={styles.subtitle}>
            Map your CSV columns to database fields
          </p>
        </div>
        
        <div className={styles.headerRight}>
          <div className={styles.mappingStatus}>
            <div
              className={styles.statusIndicator}
              style={{ backgroundColor: mappingStatus.color }}
            />
            <span className={styles.statusLabel}>{mappingStatus.label}</span>
          </div>
          
          <div className={styles.headerActions}>
            <button
              className={styles.autoDetectButton}
              onClick={handleAutoDetect}
              disabled={sourceColumns.length === 0}
            >
              <FiTarget size={18} />
              Auto-detect
            </button>
            
            <button
              className={styles.validateButton}
              onClick={handleValidate}
              disabled={Object.keys(mappings).length === 0}
            >
              <FiCheck size={18} />
              Validate
            </button>
          </div>
        </div>
      </div>

      {/* Mapping Instructions */}
      <div className={styles.instructions}>
        <FiHelpCircle className={styles.instructionsIcon} />
        <p>
          Drag and drop source columns to target columns, or click to select and map.
          Required columns are marked with <span className={styles.requiredMarker}>*</span>
        </p>
      </div>

      {/* Validation Errors */}
      <AnimatePresence>
        {validationErrors.length > 0 && (
          <motion.div
            className={styles.validationErrors}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className={styles.errorsHeader}>
              <FiAlertCircle className={styles.errorIcon} />
              <h4>Mapping Validation Errors</h4>
              <button
                className={styles.clearErrorsButton}
                onClick={() => setValidationErrors([])}
              >
                Clear
              </button>
            </div>
            
            <div className={styles.errorList}>
              {validationErrors.map((error, index) => (
                <div key={index} className={styles.errorItem}>
                  {error}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Columns Container */}
      <div className={styles.columnsContainer}>
        {/* Source Columns */}
        <div className={styles.columnSection}>
          <div className={styles.sectionHeader}>
            <FiDatabase className={styles.sectionIcon} />
            <h4>Source Columns ({sourceColumns.length})</h4>
            <span className={styles.sectionSubtitle}>From your CSV file</span>
          </div>
          
          <div className={styles.columnList}>
            {sourceColumns.map((column, index) => {
              const isMapped = mappings[column];
              const isSelected = selectedSource === column;
              const type = getColumnType(column);
              
              return (
                <motion.div
                  key={column}
                  className={`${styles.columnItem} ${styles.sourceColumn} ${
                    isMapped ? styles.mapped : ''
                  } ${isSelected ? styles.selected : ''}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => setSelectedSource(isSelected ? null : column)}
                  whileHover={{ x: 4 }}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData('sourceColumn', column);
                  }}
                >
                  <div className={styles.columnHeader}>
                    <span className={styles.columnType}>{getTypeIcon(type)}</span>
                    <span className={styles.columnName}>{column}</span>
                    <span className={styles.columnTypeLabel}>{type}</span>
                  </div>
                  
                  {isMapped && (
                    <div className={styles.mappingIndicator}>
                      <FiArrowRight className={styles.mappingArrow} />
                      <span className={styles.mappedTo}>
                        → {targetColumns.find(t => t.id === mappings[column])?.label}
                      </span>
                      <button
                        className={styles.unmapButton}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUnmap(column);
                        }}
                        title="Remove mapping"
                      >
                        <FiX size={14} />
                      </button>
                    </div>
                  )}
                  
                  {isSelected && !isMapped && (
                    <div className={styles.selectionHint}>
                      Select a target column to map
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Mapping Area */}
        <div className={styles.mappingArea}>
          <div className={styles.mappingConnections}>
            {Object.entries(mappings).map(([source, target]) => (
              <div key={source} className={styles.connection}>
                <div className={styles.connectionLine} />
                <div className={styles.connectionInfo}>
                  {source} → {targetColumns.find(t => t.id === target)?.label}
                </div>
              </div>
            ))}
          </div>
          
          <div className={styles.mappingInstructions}>
            <FiArrowRight size={24} className={styles.mappingArrowLarge} />
            <p>Drag or click to map columns</p>
          </div>
        </div>

        {/* Target Columns */}
        <div className={styles.columnSection}>
          <div className={styles.sectionHeader}>
            <FiColumns className={styles.sectionIcon} />
            <h4>Target Columns ({targetColumns.length})</h4>
            <span className={styles.sectionSubtitle}>Database fields</span>
          </div>
          
          <div className={styles.columnList}>
            {targetColumns.map((column, index) => {
              const isMapped = Object.values(mappings).includes(column.id);
              const isSelected = selectedTarget === column.id;
              const sourceColumn = Object.keys(mappings).find(key => mappings[key] === column.id);
              const isAvailable = !isMapped || (selectedSource && selectedTarget === column.id);
              
              return (
                <motion.div
                  key={column.id}
                  className={`${styles.columnItem} ${styles.targetColumn} ${
                    isMapped ? styles.mapped : ''
                  } ${isSelected ? styles.selected : ''} ${
                    !isAvailable ? styles.unavailable : ''
                  } ${column.required ? styles.required : ''}`}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => {
                    if (!isAvailable) return;
                    
                    if (selectedSource) {
                      handleMap(selectedSource, column.id);
                    } else {
                      setSelectedTarget(isSelected ? null : column.id);
                    }
                  }}
                  whileHover={{ x: -4 }}
                  onDragOver={(e) => {
                    if (isAvailable) e.preventDefault();
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    const sourceColumn = e.dataTransfer.getData('sourceColumn');
                    if (sourceColumn && isAvailable) {
                      handleMap(sourceColumn, column.id);
                    }
                  }}
                >
                  <div className={styles.columnHeader}>
                    <div className={styles.columnInfo}>
                      <span className={styles.columnName}>{column.label}</span>
                      {column.required && (
                        <span className={styles.requiredMarker}>*</span>
                      )}
                    </div>
                    
                    <div className={styles.columnMeta}>
                      {column.type && (
                        <span className={styles.columnTypeBadge}>{column.type}</span>
                      )}
                      {isMapped && (
                        <span className={styles.mappedBadge}>Mapped</span>
                      )}
                    </div>
                  </div>
                  
                  <p className={styles.columnDescription}>
                    {column.description || 'No description'}
                  </p>
                  
                  {sourceColumn && (
                    <div className={styles.mappedFrom}>
                      <FiArrowRight className={styles.mappedFromArrow} />
                      <span>← {sourceColumn}</span>
                    </div>
                  )}
                  
                  {isSelected && selectedSource && (
                    <div className={styles.confirmMapping}>
                      <button
                        className={styles.confirmButton}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMap(selectedSource, column.id);
                        }}
                      >
                        <FiCheck size={16} />
                        Map to {selectedSource}
                      </button>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Quick Mapping */}
      <div className={styles.quickMapping}>
        <h4 className={styles.quickMappingTitle}>Quick Mapping Suggestions</h4>
        
        <div className={styles.suggestions}>
          {detectedMapping && Object.keys(detectedMapping).length > 0 && (
            <div className={styles.detectedMapping}>
              <span className={styles.suggestionLabel}>Auto-detected:</span>
              <div className={styles.suggestionItems}>
                {Object.entries(detectedMapping).slice(0, 3).map(([source, target]) => (
                  <div key={source} className={styles.suggestionItem}>
                    {source} → {targetColumns.find(t => t.id === target)?.label}
                  </div>
                ))}
                {Object.keys(detectedMapping).length > 3 && (
                  <div className={styles.moreSuggestions}>
                    +{Object.keys(detectedMapping).length - 3} more
                  </div>
                )}
              </div>
            </div>
          )}
          
          <div className={styles.commonMappings}>
            <span className={styles.suggestionLabel}>Common patterns:</span>
            <div className={styles.suggestionItems}>
              {sourceColumns
                .filter(col => 
                  col.toLowerCase().includes('date') || 
                  col.toLowerCase().includes('time')
                )
                .slice(0, 2)
                .map(col => (
                  <button
                    key={col}
                    className={styles.suggestionButton}
                    onClick={() => {
                      const dateTarget = targetColumns.find(t => 
                        t.id === 'date' || t.label.toLowerCase().includes('date')
                      );
                      if (dateTarget) handleMap(col, dateTarget.id);
                    }}
                  >
                    Map "{col}" as Date
                  </button>
                ))}
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className={styles.actions}>
        <button
          className={styles.resetButton}
          onClick={() => {
            setMappings({});
            onMappingChange({});
            setSelectedSource(null);
            setSelectedTarget(null);
          }}
          disabled={Object.keys(mappings).length === 0}
        >
          Reset All Mappings
        </button>
        
        <div className={styles.actionStatus}>
          <div className={styles.mappingProgress}>
            <div
              className={styles.progressBar}
              style={{ width: `${(Object.keys(mappings).length / targetColumns.length) * 100}%` }}
            />
          </div>
          <span className={styles.progressText}>
            {Object.keys(mappings).length} of {targetColumns.length} columns mapped
          </span>
        </div>
        
        <button
          className={styles.completeButton}
          onClick={() => {
            if (onValidate) {
              const errors = onValidate(mappings);
              if (errors.length === 0) {
                // Proceed with mapping
                console.log('Mapping complete:', mappings);
              } else {
                setValidationErrors(errors);
              }
            }
          }}
          disabled={Object.keys(mappings).length === 0}
        >
          Complete Mapping
          <FiCheck className={styles.completeIcon} />
        </button>
      </div>
    </motion.div>
  );
};

export default ColumnMapping;