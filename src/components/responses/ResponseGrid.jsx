import React from 'react';
import ResponseCard from './ResponseCard';

/**
 * ResponseGrid component displays a grid of LLM responses
 * 
 * @param {Object} props
 * @param {Array} props.responses - Array of response objects
 * @param {Array} props.models - Array of model objects
 * @param {Array} props.consensusGroups - Array of consensus group objects
 * @param {boolean} props.loading - Whether responses are still loading
 */
export default function ResponseGrid({ 
  responses = [], 
  models = [], 
  consensusGroups = [],
  loading = false 
}) {
  // If loading and no responses yet, create placeholder cards for each model
  const displayItems = loading && responses.length === 0
    ? models.filter(model => model.enabled).map(model => ({
        id: model.id,
        model: {
          id: model.id,
          name: model.name,
          provider: model.provider
        },
        loading: true
      }))
    : responses;

  // Find the consensus group color for a response
  const getColorForResponse = (responseText) => {
    if (!responseText || consensusGroups.length === 0) return '#ffffff';
    
    const normalizedResponse = responseText.toLowerCase().trim();
    const group = consensusGroups.find(group => 
      group.groupName.toLowerCase() === normalizedResponse
    );
    
    return group ? group.color : '#ffffff';
  };

  return (
    <div data-testid="response-grid" className="mt-8">
      <h3 className="text-xl font-semibold mb-4">Responses</h3>
      
      {displayItems.length === 0 && !loading ? (
        <div className="text-center py-8 text-gray-500">
          No responses yet. Enter a prompt and click Submit to see responses from the selected models.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {displayItems.map((item) => (
            <ResponseCard
              key={item.id || `${item.model.id}-loading`}
              modelName={item.model.name}
              provider={item.model.provider}
              response={item.response_text || ''}
              responseTime={item.response_time_ms || 0}
              loading={loading || item.loading}
              color={getColorForResponse(item.response_text)}
            />
          ))}
        </div>
      )}
    </div>
  );
}