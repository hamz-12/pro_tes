  // In SalesChart.jsx, update the component to handle date range changes
  import React, { useState, useRef, useEffect } from 'react';
  import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    Filler,
    TimeScale,
  } from 'chart.js';
  import 'chartjs-adapter-date-fns';
  import { Line, Bar } from 'react-chartjs-2';
  import { motion } from 'framer-motion';
  import {
    FiBarChart2,
    FiTrendingUp,
    FiDownload,
    FiFilter,
    FiMaximize2,
    FiCalendar,
  } from 'react-icons/fi';
  import styles from './SalesChart.module.css';
  import { formatCurrency, formatDate } from '../../../utils/formatters';

  ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    Filler,
    TimeScale
  );

  const SalesChart = ({
    data = [],
    type = 'line',
    title = 'Sales Overview',
    height = 400,
    loading = false,
    showControls = true,
    compareData = null,
    onDateRangeChange, // Add this prop
    onFilterClick, // Add this prop
  }) => {
    const chartRef = useRef(null);
    const [chartType, setChartType] = useState(type);
    const [timeRange, setTimeRange] = useState('30d'); // Default to 30d
    const [showCompare, setShowCompare] = useState(false);
    const [fullscreen, setFullscreen] = useState(false);
    const [selectedPoint, setSelectedPoint] = useState(null);

    const timeRanges = [
      { value: '1d', label: '1 Day' },
      { value: '7d', label: '7 Days' },
      { value: '30d', label: '30 Days' },
      { value: '90d', label: '90 Days' },
    ];

    const chartTypes = [
      { value: 'line', label: 'Line', icon: <FiTrendingUp /> },
      { value: 'bar', label: 'Bar', icon: <FiBarChart2 /> },
    ];

    // Handle time range change
    const handleTimeRangeChange = (newTimeRange) => {
      setTimeRange(newTimeRange);
      if (onDateRangeChange) {
        onDateRangeChange(newTimeRange);
      }
    };

    // Handle filter click
    const handleFilterClick = () => {
      if (onFilterClick) {
        onFilterClick();
      }
    };

    // Handle fullscreen with proper cleanup
    const handleFullscreen = () => {
      if (!fullscreen) {
        setFullscreen(true);
        // Add a small delay to ensure the state is updated before applying styles
        setTimeout(() => {
          const elem = document.documentElement;
          if (elem.requestFullscreen) {
            elem.requestFullscreen();
          } else if (elem.webkitRequestFullscreen) { /* Safari */
            elem.webkitRequestFullscreen();
          } else if (elem.msRequestFullscreen) { /* IE11 */
            elem.msRequestFullscreen();
          }
        }, 100);
      } else {
        setFullscreen(false);
        // Exit fullscreen
        if (document.exitFullscreen) {
          document.exitFullscreen();
        } else if (document.webkitExitFullscreen) { /* Safari */
          document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) { /* IE11 */
          document.msExitFullscreen();
        }
      }
    };

    // Listen for fullscreen changes
    useEffect(() => {
      const handleFullscreenChange = () => {
        if (!document.fullscreenElement && !document.webkitFullscreenElement && 
            !document.mozFullScreenElement && !document.msFullscreenElement) {
          setFullscreen(false);
        }
      };

      document.addEventListener('fullscreenchange', handleFullscreenChange);
      document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.addEventListener('mozfullscreenchange', handleFullscreenChange);
      document.addEventListener('MSFullscreenChange', handleFullscreenChange);

      return () => {
        document.removeEventListener('fullscreenchange', handleFullscreenChange);
        document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
        document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
        document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
      };
    }, []);

    const getChartData = () => {
      // Ensure data is an array
      const dataArray = Array.isArray(data) ? data : [];
      
      // Ensure compareData is an array
      const compareArray = Array.isArray(compareData) ? compareData : [];
      
      const baseData = {
        labels: dataArray.map(d => d.date),
        datasets: [
          {
            label: 'Sales Revenue',
            data: dataArray.map(d => d.total_sales || d.total_amount || 0),
            borderColor: '#6366f1',
            backgroundColor: 'rgba(99, 102, 241, 0.1)',
            borderWidth: 3,
            fill: chartType === 'line',
            tension: 0.4,
            pointBackgroundColor: '#6366f1',
            pointBorderColor: '#ffffff',
            pointBorderWidth: 2,
            pointRadius: 5,
            pointHoverRadius: 8,
          },
        ],
      };

      if (showCompare && compareArray.length > 0) {
        baseData.datasets.push({
          label: 'Previous Period',
          data: compareArray.map(d => d.total_sales || d.total_amount || 0),
          borderColor: '#8b5cf6',
          backgroundColor: 'rgba(139, 92, 246, 0.1)',
          borderWidth: 2,
          borderDash: [5, 5],
          fill: false,
          tension: 0.4,
          pointRadius: 0,
        });
      }

      return baseData;
    };

    const chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: 'top',
          labels: {
            color: '#94a3b8',
            font: {
              family: 'Inter',
              size: 12,
            },
            padding: 20,
            usePointStyle: true,
          },
        },
        tooltip: {
          backgroundColor: 'rgba(30, 33, 57, 0.95)',
          titleColor: '#f1f5f9',
          bodyColor: '#94a3b8',
          borderColor: '#334155',
          borderWidth: 1,
          padding: 12,
          cornerRadius: 8,
          displayColors: false,
          callbacks: {
            label: (context) => {
              return `Revenue: ${formatCurrency(context.parsed.y)}`;
            },
            title: (context) => {
              return formatDate(context[0].label);
            },
          },
        },
      },
      scales: {
        x: {
          grid: {
            color: 'rgba(51, 65, 85, 0.2)',
            drawBorder: false,
          },
          ticks: {
            color: '#64748b',
            font: {
              family: 'Inter',
              size: 11,
            },
          },
        },
        y: {
          beginAtZero: true,
          grid: {
            color: 'rgba(51, 65, 85, 0.2)',
            drawBorder: false,
          },
          ticks: {
            color: '#64748b',
            font: {
              family: 'Inter',
              size: 11,
            },
            callback: (value) => formatCurrency(value),
          },
        },
      },
      interaction: {
        intersect: false,
        mode: 'index',
      },
      onHover: (event, elements) => {
        if (elements.length > 0) {
          const point = elements[0];
          const dataArray = Array.isArray(data) ? data : [];
          setSelectedPoint({
            date: dataArray[point.index]?.date,
            value: dataArray[point.index]?.total_sales || dataArray[point.index]?.total_amount || 0,
            transactions: dataArray[point.index]?.transactions || 0,
          });
        } else {
          setSelectedPoint(null);
        }
      },
      animation: {
        duration: 1000,
        easing: 'easeOutQuart',
      },
    };

    const handleDownload = (format = 'png') => {
      if (chartRef.current) {
        const link = document.createElement('a');
        link.download = `sales-chart-${Date.now()}.${format}`;
        link.href = chartRef.current.toBase64Image();
        link.click();
      }
    };

    const containerVariants = {
      hidden: { opacity: 0, y: 20 },
      visible: {
        opacity: 1,
        y: 0,
        transition: {
          duration: 0.6,
          staggerChildren: 0.1,
        },
      },
    };

    if (loading) {
      return (
        <div className={styles.chartContainer}>
          <div className={styles.skeletonHeader} />
          <div className={styles.skeletonChart} />
        </div>
      );
    }

    // Check if we have valid data
    const dataArray = Array.isArray(data) ? data : [];
    const hasData = dataArray.length > 0;

    return (
      <motion.div
        className={`${styles.chartContainer} ${fullscreen ? styles.fullscreen : ''}`}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className={styles.chartHeader}>
          <div className={styles.headerLeft}>
            <h3 className={styles.chartTitle}>{title}</h3>
            {selectedPoint && (
              <div className={styles.selectedPointInfo}>
                <span className={styles.pointDate}>
                  {formatDate(selectedPoint.date)}
                </span>
                <span className={styles.pointValue}>
                  {formatCurrency(selectedPoint.value)}
                </span>
                <span className={styles.pointTransactions}>
                  {selectedPoint.transactions} transactions
                </span>
              </div>
            )}
          </div>
          
          {showControls && (
            <div className={styles.chartControls}>
              <div className={styles.timeRangeSelector}>
                <FiCalendar className={styles.controlIcon} />
                <select
                  value={timeRange}
                  onChange={(e) => handleTimeRangeChange(e.target.value)}
                  className={styles.controlSelect}
                >
                  {timeRanges.map((range) => (
                    <option key={range.value} value={range.value}>
                      {range.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className={styles.chartTypeSelector}>
                {chartTypes.map((type) => (
                  <button
                    key={type.value}
                    className={`${styles.chartTypeButton} ${
                      chartType === type.value ? styles.active : ''
                    }`}
                    onClick={() => setChartType(type.value)}
                    title={type.label}
                  >
                    {type.icon}
                  </button>
                ))}
              </div>
              
              <button
                className={styles.controlButton}
                onClick={handleFilterClick}
                title="Filter data"
              >
                <FiFilter />
              </button>
              
              <button
                className={styles.controlButton}
                onClick={handleFullscreen}
                title="Toggle fullscreen"
              >
                <FiMaximize2 />
              </button>
              
              <button
                className={styles.controlButton}
                onClick={() => handleDownload('png')}
                title="Download chart"
              >
                <FiDownload />
              </button>
            </div>
          )}
        </div>
        
        <div className={styles.chartWrapper} style={{ height }}>
          {hasData ? (
            chartType === 'line' ? (
              <Line
                ref={chartRef}
                data={getChartData()}
                options={chartOptions}
              />
            ) : (
              <Bar
                ref={chartRef}
                data={getChartData()}
                options={chartOptions}
              />
            )
          ) : (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>
                <FiTrendingUp size={48} />
              </div>
              <h3>No Sales Data</h3>
              <p>Upload sales data to see revenue trends</p>
            </div>
          )}
        </div>
        
        {fullscreen && (
          <button
            className={styles.closeFullscreen}
            onClick={handleFullscreen}
          >
            Exit Fullscreen
          </button>
        )}
      </motion.div>
    );
  };

  export default SalesChart;