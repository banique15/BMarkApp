import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

/**
 * ConsensusView component visualizes the consensus among LLM responses
 * 
 * @param {Object} props
 * @param {Array} props.consensusGroups - Array of consensus group objects
 * @param {boolean} props.loading - Whether responses are still loading
 */
export default function ConsensusView({ consensusGroups = [], loading = false }) {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    // If loading or no consensus groups, don't render the chart
    if (loading || consensusGroups.length === 0) {
      return;
    }

    // Clean up previous chart instance if it exists
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    // Prepare data for the chart
    const labels = consensusGroups.map(group => group.groupName);
    const data = consensusGroups.map(group => group.count);
    const backgroundColors = consensusGroups.map(group => group.color);
    
    // Create the chart
    const ctx = chartRef.current.getContext('2d');
    chartInstance.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Number of Models',
          data,
          backgroundColor: backgroundColors,
          borderColor: backgroundColors.map(color => color),
          borderWidth: 1
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              afterLabel: function(context) {
                const groupIndex = context.dataIndex;
                const group = consensusGroups[groupIndex];
                return `Models: ${group.models.join(', ')}`;
              }
            }
          }
        },
        scales: {
          x: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Number of Models'
            },
            ticks: {
              precision: 0
            }
          },
          y: {
            title: {
              display: true,
              text: 'Response'
            }
          }
        }
      }
    });

    // Clean up chart on component unmount
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [consensusGroups, loading]);

  return (
    <div data-testid="consensus-visualization" className="mt-8">
      <h3 className="text-xl font-semibold mb-4">Consensus Visualization</h3>
      
      {consensusGroups.length === 0 ? (
        <div className="text-center py-8 text-gray-500 bg-white rounded-lg shadow p-6">
          {loading ? (
            <div className="animate-pulse flex space-x-2 justify-center items-center">
              <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
              <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
              <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
            </div>
          ) : (
            "No consensus data available yet. Submit a prompt to see consensus visualization."
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="h-64 md:h-80">
            <canvas ref={chartRef}></canvas>
          </div>
          
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {consensusGroups.map((group) => (
              <div 
                key={group.groupName} 
                className="flex items-center p-2 rounded"
                style={{ backgroundColor: `${group.color}20` }}
              >
                <div 
                  className="w-4 h-4 rounded-full mr-2" 
                  style={{ backgroundColor: group.color }}
                ></div>
                <div>
                  <span className="font-medium">{group.groupName}</span>
                  <span className="text-sm text-gray-500 ml-2">
                    {group.count} ({group.percentage.toFixed(1)}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}