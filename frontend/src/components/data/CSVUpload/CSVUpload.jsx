import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import {
  FiUpload,
  FiFile,
  FiCheck,
  FiAlertCircle,
  FiX,
  FiInfo,
} from 'react-icons/fi';
import Papa from 'papaparse';
import styles from './CSVUpload.module.css';

const CSVUpload = ({ onUploadComplete, onClose }) => {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [previewData, setPreviewData] = useState(null);
  const [errors, setErrors] = useState([]);
  const [success, setSuccess] = useState(false);
  const [step, setStep] = useState(1); // 1: upload, 2: preview, 3: mapping, 4: confirm

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file && file.type === 'text/csv' || file.name.endsWith('.csv')) {
      setFile(file);
      setStep(2);
      parseCSV(file);
    } else {
      setErrors(['Please upload a valid CSV file']);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv']
    },
    maxFiles: 1,
  });

  const parseCSV = (file) => {
    Papa.parse(file, {
      header: true,
      preview: 10,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          setErrors(results.errors.map(e => e.message));
        } else {
          setPreviewData({
            headers: results.meta.fields,
            rows: results.data.slice(0, 5),
            totalRows: results.data.length,
          });
        }
      },
      error: (error) => {
        setErrors([`Error parsing CSV: ${error.message}`]);
      },
    });
  };

  const simulateUpload = () => {
    setIsUploading(true);
    setProgress(0);
    
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          setSuccess(true);
          setStep(4);
          
          if (onUploadComplete) {
            onUploadComplete({
              filename: file.name,
              rowsProcessed: previewData.totalRows,
              status: 'success'
            });
          }
          
          return 100;
        }
        return prev + 5;
      });
    }, 100);
  };

  const handleUpload = () => {
    setStep(3);
    simulateUpload();
  };

  const handleReset = () => {
    setFile(null);
    setPreviewData(null);
    setErrors([]);
    setSuccess(false);
    setProgress(0);
    setStep(1);
  };

  const handleDone = () => {
    if (onClose) onClose();
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <motion.div
      className={styles.container}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
    >
      <div className={styles.header}>
        <h2 className={styles.title}>Upload Sales Data</h2>
        {onClose && (
          <button className={styles.closeButton} onClick={onClose}>
            <FiX size={24} />
          </button>
        )}
      </div>

      <div className={styles.steps}>
        <div className={`${styles.step} ${step >= 1 ? styles.active : ''}`}>
          <div className={styles.stepNumber}>1</div>
          <span className={styles.stepLabel}>Upload</span>
        </div>
        <div className={`${styles.step} ${step >= 2 ? styles.active : ''}`}>
          <div className={styles.stepNumber}>2</div>
          <span className={styles.stepLabel}>Preview</span>
        </div>
        <div className={`${styles.step} ${step >= 3 ? styles.active : ''}`}>
          <div className={styles.stepNumber}>3</div>
          <span className={styles.stepLabel}>Process</span>
        </div>
        <div className={`${styles.step} ${step >= 4 ? styles.active : ''}`}>
          <div className={styles.stepNumber}>4</div>
          <span className={styles.stepLabel}>Complete</span>
        </div>
      </div>

      <div className={styles.content}>
        {step === 1 && (
          <motion.div
            className={styles.uploadSection}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div
              {...getRootProps()}
              className={`${styles.dropzone} ${
                isDragActive ? styles.dragActive : ''
              }`}
            >
              <input {...getInputProps()} />
              <div className={styles.dropzoneContent}>
                <FiUpload size={48} className={styles.uploadIcon} />
                <h3 className={styles.dropzoneTitle}>
                  {isDragActive ? 'Drop your CSV file here' : 'Upload CSV File'}
                </h3>
                <p className={styles.dropzoneSubtitle}>
                  Drag & drop your sales data CSV file here, or click to browse
                </p>
                <div className={styles.fileRequirements}>
                  <FiInfo size={16} />
                  <span>Supported format: CSV (Max 100MB)</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {step === 2 && previewData && (
          <motion.div
            className={styles.previewSection}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className={styles.fileInfo}>
              <div className={styles.fileIcon}>
                <FiFile size={32} />
              </div>
              <div className={styles.fileDetails}>
                <h4 className={styles.fileName}>{file.name}</h4>
                <div className={styles.fileMeta}>
                  <span>{formatFileSize(file.size)}</span>
                  <span>•</span>
                  <span>{previewData.totalRows} rows</span>
                  <span>•</span>
                  <span>{previewData.headers.length} columns</span>
                </div>
              </div>
            </div>

            <div className={styles.dataPreview}>
              <h4 className={styles.previewTitle}>Data Preview</h4>
              <div className={styles.previewTableContainer}>
                <table className={styles.previewTable}>
                  <thead>
                    <tr>
                      {previewData.headers.map((header, index) => (
                        <th key={index}>{header}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {previewData.rows.map((row, rowIndex) => (
                      <tr key={rowIndex}>
                        {previewData.headers.map((header, colIndex) => (
                          <td key={colIndex}>
                            {row[header] || '-'}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className={styles.previewNote}>
                Showing first 5 rows of {previewData.totalRows} total rows
              </p>
            </div>

            {errors.length > 0 && (
              <div className={styles.errors}>
                <FiAlertCircle className={styles.errorIcon} />
                <div className={styles.errorList}>
                  {errors.map((error, index) => (
                    <p key={index} className={styles.errorItem}>{error}</p>
                  ))}
                </div>
              </div>
            )}

            <div className={styles.previewActions}>
              <button className={styles.secondaryButton} onClick={handleReset}>
                Choose Different File
              </button>
              <button className={styles.primaryButton} onClick={handleUpload}>
                Process File
              </button>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            className={styles.processingSection}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className={styles.processingContent}>
              <div className={styles.processingIcon}>
                <div className={styles.spinner} />
              </div>
              <h3 className={styles.processingTitle}>Processing Your Data</h3>
              <p className={styles.processingText}>
                Analyzing {previewData?.totalRows} rows of sales data...
              </p>
              
              <div className={styles.progressContainer}>
                <div className={styles.progressBar}>
                  <motion.div
                    className={styles.progressFill}
                    initial={{ width: '0%' }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
                <div className={styles.progressInfo}>
                  <span className={styles.progressPercentage}>{progress}%</span>
                  <span className={styles.progressStatus}>
                    {progress < 50 && 'Validating data...'}
                    {progress >= 50 && progress < 80 && 'Analyzing trends...'}
                    {progress >= 80 && 'Finalizing...'}
                  </span>
                </div>
              </div>

              <div className={styles.processingStats}>
                <div className={styles.statItem}>
                  <span className={styles.statLabel}>Rows Processed</span>
                  <span className={styles.statValue}>
                    {Math.floor((progress / 100) * (previewData?.totalRows || 0))}
                  </span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statLabel}>Time Remaining</span>
                  <span className={styles.statValue}>
                    {Math.max(0, Math.floor((100 - progress) / 5))}s
                  </span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statLabel}>Status</span>
                  <span className={styles.statValue}>
                    {isUploading ? 'Processing' : 'Complete'}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {step === 4 && (
          <motion.div
            className={styles.successSection}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className={styles.successContent}>
              <div className={styles.successIcon}>
                <FiCheck size={48} />
              </div>
              <h3 className={styles.successTitle}>Upload Complete!</h3>
              <p className={styles.successText}>
                Your sales data has been successfully uploaded and processed.
              </p>
              
              <div className={styles.successStats}>
                <div className={styles.successStat}>
                  <span className={styles.successStatValue}>
                    {previewData?.totalRows}
                  </span>
                  <span className={styles.successStatLabel}>Records Processed</span>
                </div>
                <div className={styles.successStat}>
                  <span className={styles.successStatValue}>0</span>
                  <span className={styles.successStatLabel}>Errors Found</span>
                </div>
                <div className={styles.successStat}>
                  <span className={styles.successStatValue}>100%</span>
                  <span className={styles.successStatLabel}>Success Rate</span>
                </div>
              </div>

              <div className={styles.successActions}>
                <button className={styles.secondaryButton} onClick={handleReset}>
                  Upload Another File
                </button>
                <button className={styles.primaryButton} onClick={handleDone}>
                  View Dashboard
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {step < 4 && (
        <div className={styles.footer}>
          <div className={styles.tips}>
            <FiInfo size={16} />
            <span>Make sure your CSV contains columns for date, item, quantity, and price</span>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default CSVUpload;