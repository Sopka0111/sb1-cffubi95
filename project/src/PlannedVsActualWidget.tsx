import React, { useEffect, useRef, useState } from 'react';
import Chart from 'chart.js/auto';
import Papa from 'papaparse';

const PlannedVsActualWidget: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [chart, setChart] = useState<Chart | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  // Create the chart once data is parsed
  const createChart = (csvData: any[]) => {
    // Adjust these keys if your CSV columns are named differently
    const labels = csvData.map(row => row['Date']);
    const plannedData = csvData.map(row => parseFloat(row['Planned']));
    const actualData = csvData.map(row => parseFloat(row['Actual']));

    const config = {
      type: 'line' as const,
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Planned',
            data: plannedData,
            fill: false,
            borderColor: 'rgba(75, 192, 192, 1)',
            tension: 0.1
          },
          {
            label: 'Actual',
            data: actualData,
            fill: false,
            borderColor: 'rgba(255, 99, 132, 1)',
            tension: 0.1
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false, // Chart takes the container's dimensions
        scales: {
          x: {
            display: true,
            title: { display: true, text: 'Date' }
          },
          y: {
            display: true,
            title: { display: true, text: 'Performance Values' }
          }
        },
        plugins: {
          legend: {
            display: true,
            position: 'top'
          }
        }
      }
    };

    // Ensure the canvas element exists
    if (canvasRef.current) {
      // If there's an existing chart (from a previous render), destroy it
      if (chart) {
        chart.destroy();
      }
      const newChart = new Chart(canvasRef.current, config);
      setChart(newChart);
    } else {
      console.error('Canvas element not found.');
    }
  };

  // Parse CSV data and create the chart on mount
  useEffect(() => {
    Papa.parse('/mnt/data/cleaned_ontime_performance_202503.csv', {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        console.log('CSV parsed results:', results);
        createChart(results.data as any[]);
      },
      error: (error) => {
        console.error('Error parsing CSV:', error);
      }
    });

    // Cleanup: destroy the chart instance on unmount
    return () => {
      if (chart) {
        chart.destroy();
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Listen for changes in container expansion and resize the chart after transition
  useEffect(() => {
    if (chart) {
      const timeoutId = setTimeout(() => {
        chart.resize();
      }, 600);
      return () => clearTimeout(timeoutId);
    }
  }, [isExpanded, chart]);

  const toggleExpand = () => {
    setIsExpanded(prev => !prev);
  };

  return (
    <div
      onClick={toggleExpand}
      style={{
        /* Outer container: responsive width and a border for visualization */
        width: isExpanded ? '90%' : '350px',
        margin: '20px auto',
        border: '1px solid #ccc',
        padding: '10px',
        boxSizing: 'border-box',
        transition: 'all 0.5s ease',
        cursor: 'pointer'
      }}
    >
      <div
        style={{
          /* Inner container: controls the height and provides a relative positioning */
          height: isExpanded ? '500px' : '300px',
          transition: 'height 0.5s ease',
          position: 'relative'
        }}
      >
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
};

export default PlannedVsActualWidget;
