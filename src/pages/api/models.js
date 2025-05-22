import { supabase } from '../../utils/supabase';
import OpenRouterClient from '../../utils/openrouter';

/**
 * API endpoint to fetch and manage models
 * 
 * GET: Fetches all models from Supabase
 * POST: Syncs models from OpenRouter to Supabase
 * PUT: Updates a model's enabled status
 */

// GET: Fetch all models
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('models')
      .select('*')
      .order('provider', { ascending: true })
      .order('name', { ascending: true });
    
    if (error) {
      return new Response(
        JSON.stringify({
          error: `Failed to fetch models: ${error.message}`
        }),
        { status: 500 }
      );
    }
    
    return new Response(
      JSON.stringify({ models: data }),
      { status: 200 }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: `Failed to fetch models: ${error.message}`
      }),
      { status: 500 }
    );
  }
}

// POST: Sync models from OpenRouter
export async function POST() {
  try {
    // Get OpenRouter API key from environment variables
    const openRouterApiKey = import.meta.env.OPENROUTER_API_KEY;
    if (!openRouterApiKey) {
      return new Response(
        JSON.stringify({
          error: 'OpenRouter API key is not configured.'
        }),
        { status: 500 }
      );
    }
    
    // Initialize OpenRouter client
    const openRouter = new OpenRouterClient(openRouterApiKey);
    
    // Fetch models from OpenRouter
    const openRouterModels = await openRouter.getModels();
    
    if (!openRouterModels || !openRouterModels.data) {
      return new Response(
        JSON.stringify({
          error: 'Failed to fetch models from OpenRouter.'
        }),
        { status: 500 }
      );
    }
    
    // Filter out models that are not suitable for our use case
    // We want to exclude models with ":free" suffix, vision models, and instruct models
    const filteredModels = openRouterModels.data.filter(model => {
      const modelId = model.id.toLowerCase();
      return !modelId.includes(':free') && 
             !modelId.includes('vision') && 
             !modelId.includes('instruct') &&
             !modelId.includes('preview');
    });
    
    // Select top models from each provider (up to 5 per provider)
    const providerModels = {};
    filteredModels.forEach(model => {
      const [provider] = model.id.split('/');
      if (!providerModels[provider]) {
        providerModels[provider] = [];
      }
      
      if (providerModels[provider].length < 5) {
        providerModels[provider].push(model);
      }
    });
    
    // Flatten the provider models
    const selectedModels = Object.values(providerModels).flat();
    
    // Process models
    const models = selectedModels.map(model => {
      // Extract provider from model ID (e.g., "openai/gpt-4" -> "OpenAI")
      const [provider, modelName] = model.id.split('/');
      const formattedProvider = provider.charAt(0).toUpperCase() + provider.slice(1);
      
      // Format model name (e.g., "gpt-4" -> "GPT-4")
      const formattedName = modelName
        .split('-')
        .map(part => {
          // Check if part is all numbers
          if (/^\d+$/.test(part)) {
            return part;
          }
          // Otherwise capitalize first letter
          return part.charAt(0).toUpperCase() + part.slice(1);
        })
        .join(' ');
      
      return {
        name: formattedName,
        provider: formattedProvider,
        model_id: model.id,
        enabled: true,
        context_length: model.context_length || 4096
      };
    });
    
    // Add our recommended models to ensure they're always available
    const recommendedModels = [
      { id: 'openai/gpt-4o', name: 'GPT-4o', provider: 'OpenAI', context_length: 128000 },
      { id: 'anthropic/claude-3-sonnet', name: 'Claude 3 Sonnet', provider: 'Anthropic', context_length: 200000 },
      { id: 'google/gemini-pro-1.5', name: 'Gemini Pro 1.5', provider: 'Google', context_length: 2000000 },
      { id: 'meta-llama/llama-3-70b-instruct', name: 'Llama 3 70B', provider: 'Meta', context_length: 8192 },
      { id: 'mistralai/mistral-large', name: 'Mistral Large', provider: 'Mistral AI', context_length: 128000 },
      { id: 'cohere/command-r', name: 'Command R', provider: 'Cohere', context_length: 128000 }
    ];
    
    // Add recommended models if they're not already in the list
    recommendedModels.forEach(recModel => {
      if (!models.some(m => m.model_id === recModel.id)) {
        models.push({
          name: recModel.name,
          provider: recModel.provider,
          model_id: recModel.id,
          enabled: true,
          context_length: recModel.context_length
        });
      }
    });
    
    // Fetch existing models from Supabase
    const { data: existingModels, error: fetchError } = await supabase
      .from('models')
      .select('model_id, enabled');
    
    if (fetchError) {
      return new Response(
        JSON.stringify({
          error: `Failed to fetch existing models: ${fetchError.message}`
        }),
        { status: 500 }
      );
    }
    
    // Create a map of existing models
    const existingModelMap = new Map();
    existingModels.forEach(model => {
      existingModelMap.set(model.model_id, model.enabled);
    });
    
    // Upsert models to Supabase, preserving enabled status for existing models
    const modelsToUpsert = models.map(model => ({
      ...model,
      enabled: existingModelMap.has(model.model_id) 
        ? existingModelMap.get(model.model_id) 
        : true
    }));
    
    const { data, error } = await supabase
      .from('models')
      .upsert(modelsToUpsert, { onConflict: 'model_id' })
      .select();
    
    if (error) {
      return new Response(
        JSON.stringify({
          error: `Failed to sync models: ${error.message}`
        }),
        { status: 500 }
      );
    }
    
    return new Response(
      JSON.stringify({
        message: `Successfully synced ${data.length} models.`,
        models: data
      }),
      { status: 200 }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: `Failed to sync models: ${error.message}`
      }),
      { status: 500 }
    );
  }
}

// PUT: Update model enabled status
export async function PUT({ request }) {
  try {
    const body = await request.json();
    const { id, enabled } = body;
    
    if (!id || typeof enabled !== 'boolean') {
      return new Response(
        JSON.stringify({
          error: 'Invalid request. Model ID and enabled status are required.'
        }),
        { status: 400 }
      );
    }
    
    const { data, error } = await supabase
      .from('models')
      .update({ enabled })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      return new Response(
        JSON.stringify({
          error: `Failed to update model: ${error.message}`
        }),
        { status: 500 }
      );
    }
    
    return new Response(
      JSON.stringify({ model: data }),
      { status: 200 }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: `Failed to update model: ${error.message}`
      }),
      { status: 500 }
    );
  }
}