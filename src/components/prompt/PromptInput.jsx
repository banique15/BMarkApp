import React, { useState } from 'react';

/**
 * PromptInput component allows users to enter and submit prompts
 * 
 * @param {Object} props
 * @param {Function} props.onSubmit - Function to call when a prompt is submitted
 * @param {boolean} props.loading - Whether a prompt is currently being processed
 * @param {Array} props.examplePrompts - Array of example prompts to suggest
 */
export default function PromptInput({ 
  onSubmit, 
  loading = false,
  examplePrompts = [
    "What is the capital of France?",
    "What is the largest planet in our solar system?",
    "What color is the sky?",
    "What is the chemical symbol for gold?",
    "What is the tallest mountain on Earth?"
  ]
}) {
  const [prompt, setPrompt] = useState('');
  const [showExamples, setShowExamples] = useState(false);

  // Handle prompt submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (prompt.trim() && onSubmit && !loading) {
      onSubmit(prompt.trim());
    }
  };

  // Handle example prompt selection
  const handleExampleClick = (example) => {
    setPrompt(example);
    setShowExamples(false);
  };

  return (
    <div className="bg-white shadow rounded-lg p-6 mb-8">
      <h3 className="text-xl font-semibold mb-4">Enter a Prompt</h3>
      <p className="text-gray-600 mb-4">
        Enter a prompt that will elicit a single-word response from the LLMs.
      </p>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <div className="flex">
            <input 
              type="text" 
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., What is the capital of France?"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            />
            <button 
              type="submit"
              className={`px-6 py-2 rounded-r-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                loading 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
              disabled={loading || !prompt.trim()}
            >
              {loading ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing
                </div>
              ) : (
                'Submit'
              )}
            </button>
          </div>
          
          {/* Character count */}
          <div className="mt-2 flex justify-between text-sm">
            <button
              type="button"
              className="text-blue-600 hover:text-blue-800 focus:outline-none"
              onClick={() => setShowExamples(!showExamples)}
            >
              {showExamples ? 'Hide examples' : 'Show examples'}
            </button>
            <span className={`${prompt.length > 100 ? 'text-orange-500' : 'text-gray-500'}`}>
              {prompt.length} characters
            </span>
          </div>
        </div>
      </form>
      
      {/* Example prompts */}
      {showExamples && (
        <div className="mt-4 p-4 bg-gray-50 rounded-md">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Example Prompts:</h4>
          <div className="flex flex-wrap gap-2">
            {examplePrompts.map((example, index) => (
              <button
                key={index}
                onClick={() => handleExampleClick(example)}
                className="text-sm bg-white px-3 py-1 rounded border border-gray-300 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {example}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}