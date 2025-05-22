import React from 'react';

/**
 * ResponseCard component displays an individual LLM response
 * 
 * @param {Object} props
 * @param {string} props.modelName - Name of the LLM model
 * @param {string} props.provider - Provider of the LLM model
 * @param {string} props.response - The model's response text
 * @param {number} props.responseTime - Response time in milliseconds
 * @param {boolean} props.loading - Whether the response is still loading
 * @param {string} props.color - Color for the card (based on consensus group)
 */
export default function ResponseCard({ 
  modelName, 
  provider, 
  response, 
  responseTime, 
  loading = false,
  color = '#ffffff'
}) {
  // Calculate background color with reduced opacity for better readability
  const bgColor = loading ? '#ffffff' : `${color}20`; // 20 = 12.5% opacity
  const borderColor = loading ? '#e5e7eb' : color;
  
  return (
    <div 
      className="rounded-lg overflow-hidden shadow-sm transition-all duration-300 h-full"
      style={{ 
        backgroundColor: bgColor,
        borderLeft: `4px solid ${borderColor}`
      }}
    >
      <div className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="font-semibold text-gray-900">{modelName}</h3>
            <p className="text-sm text-gray-500">{provider}</p>
          </div>
        </div>
        
        <div className="min-h-16 flex items-center justify-center p-4 mb-3 bg-white rounded border border-gray-100">
          {loading ? (
            <div className="animate-pulse flex space-x-2 justify-center items-center">
              <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
              <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
              <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
            </div>
          ) : (
            <p className="text-xl font-medium text-center break-words">
              "{response}"
            </p>
          )}
        </div>
        
        <div className="text-sm text-gray-500 text-right">
          {loading ? (
            <span>Loading...</span>
          ) : (
            <span>Response time: {responseTime}ms</span>
          )}
        </div>
      </div>
    </div>
  );
}