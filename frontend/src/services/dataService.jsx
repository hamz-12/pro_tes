import api from './api';

const dataService = {
  // Upload CSV file
  uploadCSV: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const response = await api.post('/data/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          // You can dispatch this to Redux or use callback
          console.log(`Upload progress: ${percentCompleted}%`);
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error uploading CSV:', error);
      throw error;
    }
  },

  // Validate CSV data
  validateData: async (data, schema) => {
    try {
      const response = await api.post('/data/validate', {
        data,
        schema,
      });
      return response.data;
    } catch (error) {
      console.error('Error validating data:', error);
      throw error;
    }
  },

  // Map CSV columns to database fields
  mapColumns: async (data, mapping) => {
    try {
      const response = await api.post('/data/map-columns', {
        data,
        mapping,
      });
      return response.data;
    } catch (error) {
      console.error('Error mapping columns:', error);
      throw error;
    }
  },

  // Get all datasets
  getDatasets: async (params = {}) => {
    try {
      const response = await api.get('/data/datasets', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching datasets:', error);
      throw error;
    }
  },

  // Get dataset by ID
  getDatasetById: async (id) => {
    try {
      const response = await api.get(`/data/datasets/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching dataset:', error);
      throw error;
    }
  },

  // Delete dataset
  deleteDataset: async (id) => {
    try {
      const response = await api.delete(`/data/datasets/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting dataset:', error);
      throw error;
    }
  },

  // Export dataset
  exportDataset: async (id, format = 'csv') => {
    try {
      const response = await api.get(`/data/datasets/${id}/export`, {
        params: { format },
        responseType: 'blob',
      });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `dataset-${id}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      return true;
    } catch (error) {
      console.error('Error exporting dataset:', error);
      throw error;
    }
  },

  // Get data preview
  getDataPreview: async (data, limit = 10) => {
    // This is a client-side implementation for preview
    return {
      columns: Object.keys(data[0] || {}),
      rows: data.slice(0, limit),
      totalRows: data.length,
      sample: true,
    };
  },

  // Process data in chunks
  processInChunks: async (data, chunkSize, processFn) => {
    const results = [];
    const totalChunks = Math.ceil(data.length / chunkSize);
    
    for (let i = 0; i < totalChunks; i++) {
      const chunk = data.slice(i * chunkSize, (i + 1) * chunkSize);
      const result = await processFn(chunk, i);
      results.push(result);
      
      // Emit progress event
      const progress = Math.round(((i + 1) / totalChunks) * 100);
      const event = new CustomEvent('dataProcessingProgress', {
        detail: { progress, currentChunk: i + 1, totalChunks },
      });
      window.dispatchEvent(event);
    }
    
    return results.flat();
  },

  // Generate data statistics
  generateStats: (data) => {
    if (!data || data.length === 0) {
      return {
        count: 0,
        columns: 0,
        numericColumns: [],
        stringColumns: [],
        dateColumns: [],
        sampleValues: {},
      };
    }

    const columns = Object.keys(data[0]);
    const stats = {
      count: data.length,
      columns: columns.length,
      numericColumns: [],
      stringColumns: [],
      dateColumns: [],
      sampleValues: {},
    };

    columns.forEach((column) => {
      const values = data.map(row => row[column]);
      const firstValue = values[0];
      
      // Determine column type
      if (!isNaN(firstValue) && firstValue !== null && firstValue !== '') {
        stats.numericColumns.push(column);
        const numericValues = values.filter(v => !isNaN(v) && v !== null && v !== '');
        stats.sampleValues[column] = {
          type: 'numeric',
          min: Math.min(...numericValues),
          max: Math.max(...numericValues),
          avg: numericValues.reduce((a, b) => a + b, 0) / numericValues.length,
          sample: firstValue,
        };
      } else if (Date.parse(firstValue)) {
        stats.dateColumns.push(column);
        stats.sampleValues[column] = {
          type: 'date',
          sample: firstValue,
        };
      } else {
        stats.stringColumns.push(column);
        stats.sampleValues[column] = {
          type: 'string',
          uniqueCount: new Set(values).size,
          sample: firstValue,
        };
      }
    });

    return stats;
  },

  // Clean data
  cleanData: (data, options = {}) => {
    const {
      removeDuplicates = true,
      fillMissingValues = true,
      standardizeFormats = true,
    } = options;

    let cleanedData = [...data];

    // Remove duplicates
    if (removeDuplicates) {
      const seen = new Set();
      cleanedData = cleanedData.filter((row) => {
        const key = JSON.stringify(row);
        if (seen.has(key)) {
          return false;
        }
        seen.add(key);
        return true;
      });
    }

    // Fill missing values
    if (fillMissingValues) {
      const columns = Object.keys(cleanedData[0] || {});
      cleanedData = cleanedData.map((row) => {
        const newRow = { ...row };
        columns.forEach((col) => {
          if (newRow[col] === null || newRow[col] === undefined || newRow[col] === '') {
            // Try to infer type from other values
            const columnValues = cleanedData.map(r => r[col]).filter(v => v != null && v !== '');
            if (columnValues.length > 0) {
              const sampleValue = columnValues[0];
              if (!isNaN(sampleValue)) {
                newRow[col] = 0; // Default for numeric
              } else if (Date.parse(sampleValue)) {
                newRow[col] = new Date().toISOString(); // Default for date
              } else {
                newRow[col] = 'N/A'; // Default for string
              }
            } else {
              newRow[col] = 'N/A';
            }
          }
        });
        return newRow;
      });
    }

    // Standardize formats (basic implementation)
    if (standardizeFormats) {
      cleanedData = cleanedData.map((row) => {
        const newRow = { ...row };
        Object.keys(newRow).forEach((key) => {
          const value = newRow[key];
          if (typeof value === 'string') {
            // Trim whitespace
            newRow[key] = value.trim();
            // Convert to proper case for names
            if (key.toLowerCase().includes('name')) {
              newRow[key] = value
                .split(' ')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                .join(' ');
            }
          }
        });
        return newRow;
      });
    }

    return cleanedData;
  },
};

export default dataService;