#!/bin/bash

# LLM Consensus Benchmark Project Initialization Script
# This script helps set up the initial project structure

echo "🚀 Initializing LLM Consensus Benchmark project..."

# Create Astro project
echo "📦 Creating Astro project..."
npm create astro@latest . --template=minimal --install --typescript --yes

# Add integrations
echo "🔌 Adding React and Tailwind CSS integrations..."
npx astro add react tailwind --yes

# Create project directories
echo "📁 Creating project directories..."
mkdir -p src/components/prompt
mkdir -p src/components/models
mkdir -p src/components/responses
mkdir -p src/components/consensus
mkdir -p src/layouts
mkdir -p src/pages/api
mkdir -p src/utils
mkdir -p public
mkdir -p supabase/migrations
mkdir -p tests

# Create basic utility files
echo "📝 Creating utility files..."

# Supabase client
cat > src/utils/supabase.ts << 'EOL'
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
EOL

# OpenRouter client
cat > src/utils/openrouter.ts << 'EOL'
class OpenRouterClient {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.baseUrl = 'https://openrouter.ai/api/v1';
  }

  async getModels() {
    const response = await fetch(`${this.baseUrl}/models`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch models: ${response.statusText}`);
    }
    
    return response.json();
  }

  async getCompletion(modelId: string, prompt: string, options = {}) {
    const startTime = Date.now();
    
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
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
        temperature: 0.7,
        stream: false,
        ...options
      })
    });
    
    if (!response.ok) {
      throw new Error(`Failed to get completion: ${response.statusText}`);
    }
    
    const data = await response.json();
    const endTime = Date.now();
    
    return {
      text: data.choices[0].message.content.trim(),
      timeMs: endTime - startTime
    };
  }

  async batchCompletion(modelIds: string[], prompt: string, options = {}) {
    return Promise.all(
      modelIds.map(modelId => this.getCompletion(modelId, prompt, options))
    );
  }
}

export default OpenRouterClient;
EOL

# Consensus analyzer
cat > src/utils/consensusAnalyzer.ts << 'EOL'
interface Response {
  model: string;
  text: string;
}

interface ConsensusGroup {
  groupName: string;
  count: number;
  percentage: number;
  color: string;
  models: string[];
}

function normalizeResponse(response: string): string {
  return response
    .toLowerCase()
    .trim()
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, ' ');
}

function generateColorScale(numColors: number): string[] {
  // Simple color generation
  const colors = [
    '#3B82F6', // blue
    '#10B981', // green
    '#8B5CF6', // purple
    '#F59E0B', // amber
    '#EF4444', // red
    '#EC4899', // pink
    '#06B6D4', // cyan
    '#F97316', // orange
    '#6366F1', // indigo
    '#14B8A6', // teal
    '#84CC16', // lime
    '#7C3AED', // violet
    '#D946EF', // fuchsia
    '#0EA5E9', // sky
    '#F43F5E'  // rose
  ];
  
  // If we need more colors than in our predefined list
  if (numColors > colors.length) {
    // Just cycle through the colors we have
    const extendedColors = [];
    for (let i = 0; i < numColors; i++) {
      extendedColors.push(colors[i % colors.length]);
    }
    return extendedColors;
  }
  
  return colors.slice(0, numColors);
}

export function analyzeConsensus(
  responses: Response[],
  options: {
    useSimilarityMatching: boolean;
    similarityThreshold: number;
  } = { useSimilarityMatching: false, similarityThreshold: 0.8 }
): ConsensusGroup[] {
  // Group exact matches
  const groups = new Map<string, string[]>();
  
  for (const response of responses) {
    const normalized = normalizeResponse(response.text);
    
    if (!groups.has(normalized)) {
      groups.set(normalized, []);
    }
    
    groups.get(normalized)!.push(response.model);
  }
  
  // TODO: Implement similarity matching if needed
  
  // Assign colors
  const colorScale = generateColorScale(groups.size);
  const result: ConsensusGroup[] = [];
  
  let i = 0;
  const totalResponses = responses.length;
  
  for (const [groupName, models] of groups.entries()) {
    result.push({
      groupName,
      count: models.length,
      percentage: (models.length / totalResponses) * 100,
      color: colorScale[i],
      models
    });
    i++;
  }
  
  // Sort by count (descending)
  return result.sort((a, b) => b.count - a.count);
}
EOL

# Create main layout
cat > src/layouts/MainLayout.astro << 'EOL'
---
interface Props {
  title: string;
}

const { title } = Astro.props;
---

<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>{title} - LLM Consensus Benchmark</title>
    <meta name="description" content="Compare single-word responses from multiple LLMs and visualize their consensus" />
  </head>
  <body class="min-h-screen bg-gray-50">
    <header class="bg-white shadow">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <h1 class="text-2xl font-bold text-gray-900">LLM Consensus Benchmark</h1>
      </div>
    </header>
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <slot />
    </main>
    <footer class="bg-white border-t border-gray-200 mt-12">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center text-gray-500 text-sm">
        &copy; 2025 LLM Consensus Benchmark
      </div>
    </footer>
  </body>
</html>
EOL

# Create index page
cat > src/pages/index.astro << 'EOL'
---
import MainLayout from '../layouts/MainLayout.astro';
---

<MainLayout title="Home">
  <div class="text-center">
    <h2 class="text-3xl font-bold text-gray-900 mb-4">
      Compare LLM Responses and Visualize Consensus
    </h2>
    <p class="text-lg text-gray-600 mb-8">
      Send the same prompt to multiple LLMs and see how they respond with single-word answers.
    </p>
    
    <div class="bg-white shadow rounded-lg p-6 mb-8">
      <h3 class="text-xl font-semibold mb-4">Enter a Prompt</h3>
      <p class="text-gray-600 mb-4">
        Enter a prompt that will elicit a single-word response from the LLMs.
      </p>
      <div class="flex">
        <input 
          type="text" 
          placeholder="e.g., What is the capital of France?"
          class="flex-1 px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button class="bg-blue-600 text-white px-6 py-2 rounded-r-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
          Submit
        </button>
      </div>
    </div>
    
    <div class="bg-white shadow rounded-lg p-6">
      <h3 class="text-xl font-semibold mb-4">Model Selection</h3>
      <p class="text-gray-600 mb-4">
        Select which LLMs to include in the benchmark.
      </p>
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        <div class="flex items-center">
          <input type="checkbox" id="model1" class="h-4 w-4 text-blue-600" checked />
          <label for="model1" class="ml-2 text-gray-700">GPT-4</label>
        </div>
        <div class="flex items-center">
          <input type="checkbox" id="model2" class="h-4 w-4 text-blue-600" checked />
          <label for="model2" class="ml-2 text-gray-700">Claude 3 Opus</label>
        </div>
        <div class="flex items-center">
          <input type="checkbox" id="model3" class="h-4 w-4 text-blue-600" checked />
          <label for="model3" class="ml-2 text-gray-700">Gemini Pro</label>
        </div>
        <div class="flex items-center">
          <input type="checkbox" id="model4" class="h-4 w-4 text-blue-600" checked />
          <label for="model4" class="ml-2 text-gray-700">Llama 3</label>
        </div>
      </div>
    </div>
    
    <!-- Response grid and consensus visualization will be added here -->
  </div>
</MainLayout>
EOL

# Create .env file
cat > .env << 'EOL'
PUBLIC_SUPABASE_URL=your_supabase_url
PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
OPENROUTER_API_KEY=your_openrouter_api_key
EOL

# Update package.json with additional dependencies
echo "📦 Updating package.json..."
npm pkg set dependencies.@supabase/supabase-js="^2.39.0"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

echo "✅ Project initialization complete!"
echo "🚀 Next steps:"
echo "1. Update the .env file with your Supabase and OpenRouter credentials"
echo "2. Run 'npm run dev' to start the development server"
echo "3. Follow the implementation steps in docs/IMPLEMENTATION_STEPS.md"