import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FiDatabase, 
  FiUpload, 
  FiFilter, 
  FiDownload,
  FiRefreshCw,
  FiSearch,
  FiEye,
  FiTrash2,
  FiCheckCircle,
  FiAlertCircle
} from 'react-icons/fi';
import CSVUpload from '../../components/data/CSVUpload/CSVUpload';
import DataTable from '../../components/data/DataTable/DataTable';
import DataPreview from '../../components/data/DataPreview/DataPreview';
import ColumnMapping from '../../components/data/ColumnMapping/ColumnMapping';
import styles from './DataPage.module.css';

const DataPage = () => {
  const [activeTab, setActiveTab] = useState('upload');
  const [uploadedData, setUploadedData] = useState(null);
  const [dataSets, setDataSets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedDataSet, setSelectedDataSet] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Mock data sets
  useEffect(() => {
    const mockDataSets = [
      {
        id: 1,
        name: 'Sales Data Q4 2023',
        uploadDate: '2024-01-15',
        size: '2.4 MB',
        rows: 12500,
        columns: 8,
        status: 'processed',
        preview: [
          { date: '2023-10-01', revenue: 15000, transactions: 450, avgOrder: 33.33 },
          { date: '2023-10-02', revenue: 16500, transactions: 480, avgOrder: 34.38 },
          { date: '2023-10-03', revenue: 14200, transactions: 430, avgOrder: 33.02 },
        ],
      },
      {
        id: 2,
        name: 'Customer Data December',
        uploadDate: '2024-01-10',
        size: '1.8 MB',
        rows: 8500,
        columns: 6,
        status: 'processing',
        preview: [
          { customerId: 'C001', name: 'John Doe', email: 'john@example.com', orders: 12, totalSpent: 450 },
          { customerId: 'C002', name: 'Jane Smith', email: 'jane@example.com', orders: 8, totalSpent: 320 },
          { customerId: 'C003', name: 'Bob Johnson', email: 'bob@example.com', orders: 15, totalSpent: 580 },
        ],
      },
      {
        id: 3,
        name: 'Menu Items Analysis',
        uploadDate: '2024-01-05',
        size: '3.2 MB',
        rows: 21000,
        columns: 10,
        status: 'processed',
        preview: [
          { itemId: 'I001', name: 'Margherita Pizza', category: 'Main Course', price: 12.99, sales: 450 },
          { itemId: 'I002', name: 'Caesar Salad', category: 'Appetizers', price: 8.99, sales: 320 },
          { itemId: 'I003', name: 'Chocolate Cake', category: 'Desserts', price: 6.99, sales: 280 },
        ],
      },
    ];
    setDataSets(mockDataSets);
  }, []);

  const handleFileUpload = (file, data, mapping) => {
    console.log('File uploaded:', file.name);
    console.log('Data:', data);
    console.log('Mapping:', mapping);
    
    setUploadedData({
      file,
      data,
      mapping,
      timestamp: new Date().toISOString(),
    });
    
    // Add to data sets
    const newDataSet = {
      id: dataSets.length + 1,
      name: file.name,
      uploadDate: new Date().toISOString().split('T')[0],
      size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
      rows: data.length,
      columns: Object.keys(data[0] || {}).length,
      status: 'processed',
      preview: data.slice(0, 3),
    };
    
    setDataSets(prev => [newDataSet, ...prev]);
    setActiveTab('datasets');
  };

  const handleDataSetSelect = (dataSet) => {
    setSelectedDataSet(dataSet);
    setActiveTab('preview');
  };

  const handleDataSetDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this dataset?')) {
      setDataSets(prev => prev.filter(ds => ds.id !== id));
      if (selectedDataSet?.id === id) {
        setSelectedDataSet(null);
        setActiveTab('datasets');
      }
    }
  };

  const filteredDataSets = dataSets.filter(ds =>
    ds.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ds.status.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = [
    { label: 'Total Datasets', value: dataSets.length },
    { label: 'Total Rows', value: dataSets.reduce((sum, ds) => sum + ds.rows, 0).toLocaleString() },
    { label: 'Total Size', value: dataSets.reduce((sum, ds) => sum + parseFloat(ds.size), 0).toFixed(1) + ' MB' },
    { label: 'Processed', value: dataSets.filter(ds => ds.status === 'processed').length },
  ];

  return (
    <motion.div 
      className={styles.dataPage}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.title}>
            <FiDatabase className={styles.titleIcon} />
            Data Management
          </h1>
          <p className={styles.subtitle}>
            Upload, manage, and analyze your restaurant data
          </p>
        </div>
        
        <div className={styles.headerStats}>
          {stats.map((stat, index) => (
            <div key={index} className={styles.statItem}>
              <div className={styles.statValue}>{stat.value}</div>
              <div className={styles.statLabel}>{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className={styles.navigationTabs}>
        <button
          className={`${styles.tab} ${activeTab === 'upload' ? styles.active : ''}`}
          onClick={() => setActiveTab('upload')}
        >
          <FiUpload size={18} />
          <span>Upload CSV</span>
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'datasets' ? styles.active : ''}`}
          onClick={() => setActiveTab('datasets')}
        >
          <FiDatabase size={18} />
          <span>Datasets</span>
          {dataSets.length > 0 && (
            <span className={styles.tabBadge}>{dataSets.length}</span>
          )}
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'preview' ? styles.active : ''}`}
          onClick={() => setActiveTab('preview')}
          disabled={!selectedDataSet}
        >
          <FiEye size={18} />
          <span>Data Preview</span>
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'mapping' ? styles.active : ''}`}
          onClick={() => setActiveTab('mapping')}
          disabled={!uploadedData}
        >
          <FiFilter size={18} />
          <span>Column Mapping</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className={styles.searchBar}>
        <div className={styles.searchContainer}>
          <FiSearch className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search datasets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
          {searchQuery && (
            <button
              className={styles.clearSearch}
              onClick={() => setSearchQuery('')}
            >
              Clear
            </button>
          )}
        </div>
        
        <div className={styles.actionButtons}>
          <button className={styles.actionButton}>
            <FiRefreshCw size={16} />
            <span>Refresh</span>
          </button>
          <button className={styles.actionButton}>
            <FiDownload size={16} />
            <span>Export All</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className={styles.mainContent}>
        {activeTab === 'upload' && (
          <motion.div
            className={styles.tabContent}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <CSVUpload onUploadComplete={handleFileUpload} />
          </motion.div>
        )}

        {activeTab === 'datasets' && (
          <motion.div
            className={styles.tabContent}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            {filteredDataSets.length > 0 ? (
              <div className={styles.datasetsGrid}>
                {filteredDataSets.map((dataSet) => (
                  <motion.div
                    key={dataSet.id}
                    className={styles.datasetCard}
                    whileHover={{ y: -5 }}
                    transition={{ duration: 0.2 }}
                    onClick={() => handleDataSetSelect(dataSet)}
                  >
                    <div className={styles.datasetHeader}>
                      <div className={styles.datasetIcon}>
                        <FiDatabase size={24} />
                      </div>
                      <div className={styles.datasetInfo}>
                        <h4>{dataSet.name}</h4>
                        <div className={styles.datasetMeta}>
                          <span className={styles.metaItem}>
                            {dataSet.uploadDate}
                          </span>
                          <span className={styles.metaItem}>
                            {dataSet.size}
                          </span>
                          <span className={styles.metaItem}>
                            {dataSet.rows.toLocaleString()} rows
                          </span>
                        </div>
                      </div>
                      <div className={styles.datasetStatus}>
                        <span className={`${styles.statusBadge} ${styles[dataSet.status]}`}>
                          {dataSet.status}
                        </span>
                      </div>
                    </div>
                    
                    <div className={styles.datasetPreview}>
                      <DataPreview data={dataSet.preview} maxRows={3} />
                    </div>
                    
                    <div className={styles.datasetActions}>
                      <button
                        className={styles.actionButton}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDataSetSelect(dataSet);
                        }}
                      >
                        <FiEye size={14} />
                        <span>View</span>
                      </button>
                      <button
                        className={styles.actionButton}
                        onClick={(e) => {
                          e.stopPropagation();
                          // Handle download
                        }}
                      >
                        <FiDownload size={14} />
                        <span>Download</span>
                      </button>
                      <button
                        className={styles.deleteButton}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDataSetDelete(dataSet.id);
                        }}
                      >
                        <FiTrash2 size={14} />
                        <span>Delete</span>
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className={styles.emptyState}>
                <FiDatabase size={48} className={styles.emptyIcon} />
                <h3>No Datasets Found</h3>
                <p>
                  {searchQuery
                    ? 'No datasets match your search. Try a different query.'
                    : 'Upload your first CSV file to get started.'}
                </p>
                {!searchQuery && (
                  <button
                    className={styles.uploadButton}
                    onClick={() => setActiveTab('upload')}
                  >
                    <FiUpload size={18} />
                    <span>Upload CSV</span>
                  </button>
                )}
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'preview' && selectedDataSet && (
          <motion.div
            className={styles.tabContent}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className={styles.previewHeader}>
              <div className={styles.previewInfo}>
                <h3>{selectedDataSet.name}</h3>
                <div className={styles.previewMeta}>
                  <span className={styles.metaItem}>
                    <FiDatabase size={14} />
                    {selectedDataSet.rows.toLocaleString()} rows × {selectedDataSet.columns} columns
                  </span>
                  <span className={styles.metaItem}>
                    <FiCheckCircle size={14} />
                    Uploaded on {selectedDataSet.uploadDate}
                  </span>
                  <span className={styles.metaItem}>
                    <FiAlertCircle size={14} />
                    {selectedDataSet.size}
                  </span>
                </div>
              </div>
              <div className={styles.previewActions}>
                <button className={styles.actionButton}>
                  <FiDownload size={16} />
                  <span>Export</span>
                </button>
                <button className={styles.actionButton}>
                  <FiFilter size={16} />
                  <span>Filter</span>
                </button>
              </div>
            </div>
            
            <div className={styles.previewContent}>
              <DataTable
                data={selectedDataSet.preview}
                columns={Object.keys(selectedDataSet.preview[0] || {})}
                pagination={false}
                sortable={true}
                searchable={true}
              />
            </div>
          </motion.div>
        )}

        {activeTab === 'mapping' && uploadedData && (
          <motion.div
            className={styles.tabContent}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <ColumnMapping
              data={uploadedData.data}
              initialMapping={uploadedData.mapping}
              onMappingComplete={(mapping) => {
                console.log('Mapping completed:', mapping);
                // Update mapping in uploaded data
                setUploadedData(prev => ({ ...prev, mapping }));
              }}
            />
          </motion.div>
        )}
      </div>

      {/* Quick Stats */}
      <div className={styles.quickStats}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <FiDatabase size={24} />
          </div>
          <div className={styles.statContent}>
            <h4>Storage Usage</h4>
            <p className={styles.statValue}>2.8 GB / 10 GB</p>
            <div className={styles.statProgress}>
              <div className={styles.progressBar}>
                <div className={styles.progressFill} style={{ width: '28%' }} />
              </div>
              <span className={styles.progressText}>28% used</span>
            </div>
          </div>
        </div>
        
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <FiCheckCircle size={24} />
          </div>
          <div className={styles.statContent}>
            <h4>Processing Status</h4>
            <p className={styles.statValue}>
              {dataSets.filter(ds => ds.status === 'processed').length} of {dataSets.length} processed
            </p>
            <div className={styles.statProgress}>
              <div className={styles.progressBar}>
                <div 
                  className={styles.progressFill} 
                  style={{ 
                    width: `${(dataSets.filter(ds => ds.status === 'processed').length / dataSets.length) * 100 || 0}%` 
                  }} 
                />
              </div>
              <span className={styles.progressText}>
                {dataSets.length > 0 ? 
                  `${Math.round((dataSets.filter(ds => ds.status === 'processed').length / dataSets.length) * 100)}% complete` : 
                  'No data'
                }
              </span>
            </div>
          </div>
        </div>
        
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <FiRefreshCw size={24} />
          </div>
          <div className={styles.statContent}>
            <h4>Recent Activity</h4>
            <div className={styles.activityList}>
              <div className={styles.activityItem}>
                <div className={styles.activityDot} />
                <span className={styles.activityText}>Sales data uploaded</span>
                <span className={styles.activityTime}>2 hours ago</span>
              </div>
              <div className={styles.activityItem}>
                <div className={styles.activityDot} />
                <span className={styles.activityText}>Customer data processed</span>
                <span className={styles.activityTime}>1 day ago</span>
              </div>
              <div className={styles.activityItem}>
                <div className={styles.activityDot} />
                <span className={styles.activityText}>Menu analysis completed</span>
                <span className={styles.activityTime}>3 days ago</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default DataPage;