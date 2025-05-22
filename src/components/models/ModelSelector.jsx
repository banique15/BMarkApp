import React, { useState, useEffect } from 'react';

/**
 * ModelSelector component allows users to select which LLM models to include in the benchmark
 * 
 * @param {Object} props
 * @param {Array} props.models - Array of model objects
 * @param {Function} props.onModelToggle - Function to call when a model is toggled
 * @param {boolean} props.loading - Whether models are still loading
 */
export default function ModelSelector({ 
  models = [], 
  onModelToggle,
  loading = false 
}) {
  const [selectedProvider, setSelectedProvider] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Group models by provider
  const providers = ['all', ...new Set(models.map(model => model.provider))];
  
  // Filter models based on selected provider and search query
  const filteredModels = models.filter(model => {
    const matchesProvider = selectedProvider === 'all' || model.provider === selectedProvider;
    const matchesSearch = model.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          model.provider.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesProvider && matchesSearch;
  });

  // Handle model toggle
  const handleToggle = (modelId) => {
    if (onModelToggle) {
      onModelToggle(modelId);
    }
  };

  // Handle "Select All" button
  const handleSelectAll = () => {
    filteredModels.forEach(model => {
      if (!model.enabled) {
        handleToggle(model.id);
      }
    });
  };

  // Handle "Deselect All" button
  const handleDeselectAll = () => {
    filteredModels.forEach(model => {
      if (model.enabled) {
        handleToggle(model.id);
      }
    });
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h3 className="text-xl font-semibold mb-4">Model Selection</h3>
      <p className="text-gray-600 mb-4">
        Select which LLMs to include in the benchmark.
      </p>
      
      {loading ? (
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-gray-200 rounded"></div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-8 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      ) : (
        <>
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            {/* Provider filter */}
            <div className="flex-1">
              <label htmlFor="provider-filter" className="block text-sm font-medium text-gray-700 mb-1">
                Filter by Provider
              </label>
              <select
                id="provider-filter"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={selectedProvider}
                onChange={(e) => setSelectedProvider(e.target.value)}
              >
                {providers.map(provider => (
                  <option key={provider} value={provider}>
                    {provider === 'all' ? 'All Providers' : provider}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Search box */}
            <div className="flex-1">
              <label htmlFor="model-search" className="block text-sm font-medium text-gray-700 mb-1">
                Search Models
              </label>
              <input
                id="model-search"
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Search by name or provider..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          {/* Select/Deselect All buttons */}
          <div className="flex justify-end gap-2 mb-4">
            <button
              className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800 focus:outline-none"
              onClick={handleSelectAll}
            >
              Select All
            </button>
            <button
              className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800 focus:outline-none"
              onClick={handleDeselectAll}
            >
              Deselect All
            </button>
          </div>
          
          {/* Model checkboxes */}
          {filteredModels.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              No models match your filter criteria.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-80 overflow-y-auto p-2">
              {filteredModels.map(model => (
                <div key={model.id} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`model-${model.id}`}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    checked={model.enabled}
                    onChange={() => handleToggle(model.id)}
                  />
                  <label htmlFor={`model-${model.id}`} className="ml-2 block text-sm text-gray-700">
                    <span className="font-medium">{model.name}</span>
                    <span className="text-xs text-gray-500 block">{model.provider}</span>
                  </label>
                </div>
              ))}
            </div>
          )}
          
          {/* Selected models count */}
          <div className="mt-4 text-sm text-gray-500">
            {models.filter(model => model.enabled).length} of {models.length} models selected
          </div>
        </>
      )}
    </div>
  );
}