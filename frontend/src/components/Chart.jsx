import React, { useRef, useEffect, useState } from 'react';
import { Chart as ChartJS, registerables } from 'chart.js';
import { Chart as ReactChart } from 'react-chartjs-2';
import 'chartjs-adapter-date-fns';

// Register all Chart.js components
ChartJS.register(...registerables);

/**
 * Chart Component
 * 
 * A reusable chart component built on top of Chart.js and react-chartjs-2.
 * 
 * @param {Object} props - Component props
 * @param {string} props.type - Chart type ('line', 'bar', 'pie', 'doughnut', 'radar', 'polarArea', 'bubble', 'scatter')
 * @param {Object} props.data - Chart data
 * @param {Object} props.options - Chart options
 * @param {string} props.height - Chart height
 * @param {string} props.width - Chart width
 * @param {boolean} props.responsive - Whether the chart is responsive
 * @param {string} props.className - Additional CSS classes for the chart container
 * @param {function} props.onDataPointClick - Function to call when a data point is clicked
 * @param {boolean} props.loading - Whether the chart is loading
 * @param {React.ReactNode} props.loadingComponent - Custom loading component
 * @param {React.ReactNode} props.emptyComponent - Custom empty component
 * @param {boolean} props.isEmpty - Whether the chart has no data
 */
const Chart = ({
  type = 'bar',
  data,
  options = {},
  height,
  width,
  responsive = true,
  className = '',
  onDataPointClick,
  loading = false,
  loadingComponent,
  emptyComponent,
  isEmpty = false,
}) => {
  const chartRef = useRef(null);
  const [chartInstance, setChartInstance] = useState(null);

  // Default options
  const defaultOptions = {
    responsive,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          boxWidth: 6,
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        titleFont: {
          size: 12,
        },
        bodyFont: {
          size: 12,
        },
        padding: 10,
        cornerRadius: 4,
        displayColors: true,
      },
    },
  };

  // Merge default options with provided options
  const mergedOptions = {
    ...defaultOptions,
    ...options,
    plugins: {
      ...defaultOptions.plugins,
      ...options.plugins,
    },
  };

  // Handle data point click
  useEffect(() => {
    if (chartInstance && onDataPointClick) {
      const handleClick = (e) => {
        const points = chartInstance.getElementsAtEventForMode(e, 'nearest', { intersect: true }, false);
        if (points.length) {
          const firstPoint = points[0];
          const datasetIndex = firstPoint.datasetIndex;
          const index = firstPoint.index;
          const dataPoint = {
            dataset: data.datasets[datasetIndex],
            datasetIndex,
            index,
            value: data.datasets[datasetIndex].data[index],
            label: data.labels ? data.labels[index] : null,
          };
          onDataPointClick(dataPoint, e);
        }
      };

      chartInstance.canvas.addEventListener('click', handleClick);

      return () => {
        chartInstance.canvas.removeEventListener('click', handleClick);
      };
    }
  }, [chartInstance, data, onDataPointClick]);

  // Handle chart instance
  const handleChartRef = (chart) => {
    if (chart) {
      setChartInstance(chart);
    }
  };

  // Determine chart style
  const chartStyle = {
    position: 'relative',
    height: height || '300px',
    width: width || '100%',
  };

  // Loading component
  const renderLoading = () => {
    if (loadingComponent) return loadingComponent;
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-70">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
          <span className="mt-2 text-sm text-gray-600">Loading chart data...</span>
        </div>
      </div>
    );
  };

  // Empty component
  const renderEmpty = () => {
    if (emptyComponent) return emptyComponent;
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-white">
        <div className="text-center">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No data available</h3>
          <p className="mt-1 text-sm text-gray-500">There is no data to display for this chart.</p>
        </div>
      </div>
    );
  };

  return (
    <div className={`relative ${className}`} style={chartStyle}>
      <ReactChart
        ref={handleChartRef}
        type={type}
        data={data}
        options={mergedOptions}
        height={height}
        width={width}
      />
      {loading && renderLoading()}
      {isEmpty && !loading && renderEmpty()}
    </div>
  );
};

/**
 * Chart.Line Component
 * 
 * A specialized line chart component.
 * 
 * @param {Object} props - Component props
 */
Chart.Line = (props) => <Chart {...props} type="line" />;

/**
 * Chart.Bar Component
 * 
 * A specialized bar chart component.
 * 
 * @param {Object} props - Component props
 */
Chart.Bar = (props) => <Chart {...props} type="bar" />;

/**
 * Chart.Pie Component
 * 
 * A specialized pie chart component.
 * 
 * @param {Object} props - Component props
 */
Chart.Pie = (props) => <Chart {...props} type="pie" />;

/**
 * Chart.Doughnut Component
 * 
 * A specialized doughnut chart component.
 * 
 * @param {Object} props - Component props
 */
Chart.Doughnut = (props) => <Chart {...props} type="doughnut" />;

/**
 * Chart.Radar Component
 * 
 * A specialized radar chart component.
 * 
 * @param {Object} props - Component props
 */
Chart.Radar = (props) => <Chart {...props} type="radar" />;

/**
 * Chart.PolarArea Component
 * 
 * A specialized polar area chart component.
 * 
 * @param {Object} props - Component props
 */
Chart.PolarArea = (props) => <Chart {...props} type="polarArea" />;

/**
 * Chart.Bubble Component
 * 
 * A specialized bubble chart component.
 * 
 * @param {Object} props - Component props
 */
Chart.Bubble = (props) => <Chart {...props} type="bubble" />;

/**
 * Chart.Scatter Component
 * 
 * A specialized scatter chart component.
 * 
 * @param {Object} props - Component props
 */
Chart.Scatter = (props) => <Chart {...props} type="scatter" />;

/**
 * Chart.getGradient Function
 * 
 * A utility function to create a gradient for chart backgrounds.
 * 
 * @param {string} startColor - Start color in hex or rgba format
 * @param {string} endColor - End color in hex or rgba format
 * @param {number} opacity - Opacity of the gradient (0-1)
 * @returns {function} - A function that takes a chart context and returns a gradient
 */
Chart.getGradient = (startColor, endColor, opacity = 0.7) => {
  return (context) => {
    if (!context) return startColor;
    
    const chart = context.chart;
    const { ctx, chartArea } = chart;
    
    if (!chartArea) return startColor;
    
    const gradient = ctx.createLinearGradient(
      0,
      chartArea.top,
      0,
      chartArea.bottom
    );
    
    gradient.addColorStop(0, startColor);
    gradient.addColorStop(1, endColor);
    
    return gradient;
  };
};

/**
 * Chart.formatTooltip Function
 * 
 * A utility function to format chart tooltips.
 * 
 * @param {string} prefix - Prefix to add before the value
 * @param {string} suffix - Suffix to add after the value
 * @param {function} formatter - Function to format the value
 * @returns {function} - A function that formats the tooltip value
 */
Chart.formatTooltip = (prefix = '', suffix = '', formatter = null) => {
  return (tooltipItem) => {
    let value = tooltipItem.raw;
    
    if (formatter && typeof formatter === 'function') {
      value = formatter(value);
    }
    
    return `${prefix}${value}${suffix}`;
  };
};

/**
 * Chart.getDefaultColors Function
 * 
 * A utility function to get default colors for charts.
 * 
 * @param {number} count - Number of colors needed
 * @param {number} opacity - Opacity of the colors (0-1)
 * @returns {Array} - An array of colors
 */
Chart.getDefaultColors = (count = 8, opacity = 1) => {
  const baseColors = [
    `rgba(59, 130, 246, ${opacity})`,   // Blue
    `rgba(16, 185, 129, ${opacity})`,   // Green
    `rgba(239, 68, 68, ${opacity})`,    // Red
    `rgba(245, 158, 11, ${opacity})`,   // Amber
    `rgba(139, 92, 246, ${opacity})`,   // Purple
    `rgba(236, 72, 153, ${opacity})`,   // Pink
    `rgba(20, 184, 166, ${opacity})`,   // Teal
    `rgba(249, 115, 22, ${opacity})`,   // Orange
    `rgba(107, 114, 128, ${opacity})`,  // Gray
    `rgba(6, 182, 212, ${opacity})`,    // Cyan
    `rgba(168, 85, 247, ${opacity})`,   // Violet
    `rgba(251, 191, 36, ${opacity})`,   // Yellow
  ];

  // If we need more colors than in our base set, generate them
  if (count > baseColors.length) {
    const additionalColors = [];
    for (let i = 0; i < count - baseColors.length; i++) {
      const hue = Math.floor((i * 137.508) % 360); // Use golden angle approximation for even distribution
      additionalColors.push(`hsla(${hue}, 70%, 60%, ${opacity})`);
    }
    return [...baseColors, ...additionalColors];
  }

  return baseColors.slice(0, count);
};

export default Chart;