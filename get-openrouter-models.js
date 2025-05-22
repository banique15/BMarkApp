#!/usr/bin/env node

/**
 * OpenRouter Models Fetcher
 * 
 * This script fetches the list of available models from OpenRouter
 * and displays them in a formatted way.
 * 
 * Usage:
 *   node get-openrouter-models.js
 * 
 * Environment variables:
 *   OPENROUTER_API_KEY - Your OpenRouter API key
 */

// Check if API key is provided
const apiKey = process.env.OPENROUTER_API_KEY;
if (!apiKey) {
  console.error('Error: OPENROUTER_API_KEY environment variable is not set.');
  console.error('Please set it before running this script:');
  console.error('  export OPENROUTER_API_KEY=your_api_key_here');
  process.exit(1);
}

// Function to fetch models from OpenRouter
async function getModels() {
  try {
    const response = await fetch('https://openrouter.ai/api/v1/models', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API error (${response.status}): ${errorText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching models:', error.message);
    process.exit(1);
  }
}

// Main function
async function main() {
  console.log('\n📋 OpenRouter Available Models');
  console.log('===========================\n');
  
  const modelsData = await getModels();
  
  if (!modelsData || !modelsData.data || !Array.isArray(modelsData.data)) {
    console.error('Error: Unexpected response format from OpenRouter API');
    process.exit(1);
  }
  
  // Display models
  console.log(`Found ${modelsData.data.length} available models:\n`);
  
  modelsData.data.forEach((model, index) => {
    console.log(`${index + 1}. ${model.id}`);
    console.log(`   Context: ${model.context_length} tokens`);
    if (model.pricing) {
      console.log(`   Pricing: $${model.pricing.prompt} per 1M prompt tokens, $${model.pricing.completion} per 1M completion tokens`);
    }
    console.log();
  });
  
  // Suggest models for test script
  console.log('\nSuggested models for test script:');
  console.log('===============================\n');
  
  const suggestedModels = modelsData.data
    .filter(model => !model.id.includes('instruct') && !model.id.includes('vision'))
    .sort((a, b) => {
      // Sort by provider first, then by model name
      const [aProvider] = a.id.split('/');
      const [bProvider] = b.id.split('/');
      if (aProvider !== bProvider) return aProvider.localeCompare(bProvider);
      return a.id.localeCompare(b.id);
    })
    .slice(0, 6); // Get top 6 models
  
  suggestedModels.forEach(model => {
    const [provider, modelName] = model.id.split('/');
    const formattedProvider = provider.charAt(0).toUpperCase() + provider.slice(1);
    console.log(`{ id: '${model.id}', name: '${modelName} (${formattedProvider})' },`);
  });
}

// Run the main function
main().catch(error => {
  console.error('Error:', error);
  process.exit(1);
});