#!/usr/bin/env node

/**
 * OpenRouter API Test Script
 * 
 * This script tests the OpenRouter API by sending a prompt to multiple LLM models
 * and displaying their responses. It helps verify that your API key is working
 * and shows how different models respond to the same prompt.
 * 
 * Usage:
 *   node test-openrouter.js "Your prompt here"
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

// Get prompt from command line arguments
const prompt = process.argv[2];
if (!prompt) {
  console.error('Error: No prompt provided.');
  console.error('Usage: node test-openrouter.js "Your prompt here"');
  process.exit(1);
}

// Models to test - updated with valid model IDs from OpenRouter
const models = [
  { id: 'openai/gpt-4o', name: 'GPT-4o (OpenAI)' },
  { id: 'anthropic/claude-3-sonnet', name: 'Claude 3 Sonnet (Anthropic)' },
  { id: 'google/gemini-pro-1.5', name: 'Gemini Pro 1.5 (Google)' },
  { id: 'meta-llama/llama-3-70b-instruct', name: 'Llama 3 70B (Meta)' },
  { id: 'mistralai/mistral-large', name: 'Mistral Large (Mistral AI)' },
  { id: 'cohere/command-r', name: 'Command R (Cohere)' }
];

// Function to send a prompt to a model
async function getCompletion(modelId, prompt) {
  console.log(`Querying ${modelId}...`);
  const startTime = Date.now();
  
  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://llm-consensus-benchmark.vercel.app',
        'X-Title': 'LLM Consensus Benchmark'
      },
      body: JSON.stringify({
        model: modelId,
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant. Respond with a single word only.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 10,
        temperature: 0.7
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API error (${response.status}): ${errorText}`);
    }
    
    const data = await response.json();
    const endTime = Date.now();
    
    return {
      text: data.choices[0].message.content.trim(),
      timeMs: endTime - startTime
    };
  } catch (error) {
    return {
      text: `ERROR: ${error.message}`,
      timeMs: Date.now() - startTime
    };
  }
}

// Main function
async function main() {
  console.log('\n🤖 OpenRouter API Test');
  console.log('====================');
  console.log(`Prompt: "${prompt}"\n`);
  
  const results = [];
  
  // Query each model sequentially
  for (const model of models) {
    try {
      const result = await getCompletion(model.id, prompt);
      results.push({
        name: model.name,
        id: model.id,
        ...result
      });
    } catch (error) {
      results.push({
        name: model.name,
        id: model.id,
        text: `ERROR: ${error.message}`,
        timeMs: 0
      });
    }
  }
  
  // Display results
  console.log('\nResults:');
  console.log('========\n');
  
  results.forEach(result => {
    console.log(`${result.name} (${result.timeMs}ms)`);
    console.log(`Response: "${result.text}"`);
    console.log('-'.repeat(50));
  });
  
  // Group similar responses
  const responseGroups = {};
  results.forEach(result => {
    const normalizedResponse = result.text.toLowerCase().trim();
    if (!responseGroups[normalizedResponse]) {
      responseGroups[normalizedResponse] = [];
    }
    responseGroups[normalizedResponse].push(result.name);
  });
  
  // Display consensus
  console.log('\nConsensus Analysis:');
  console.log('==================\n');
  
  Object.entries(responseGroups)
    .sort((a, b) => b[1].length - a[1].length)
    .forEach(([response, models]) => {
      const percentage = (models.length / results.length) * 100;
      console.log(`"${response}" - ${models.length} models (${percentage.toFixed(1)}%)`);
      console.log(`Models: ${models.join(', ')}`);
      console.log();
    });
}

// Run the main function
main().catch(error => {
  console.error('Error:', error);
  process.exit(1);
});