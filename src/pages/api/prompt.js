import { supabase } from '../../utils/supabase';
import OpenRouterClient from '../../utils/openrouter';
import { analyzeConsensus } from '../../utils/consensusAnalyzer';

/**
 * API endpoint to handle prompt submissions
 * 
 * This endpoint:
 * 1. Receives a prompt and list of model IDs
 * 2. Stores the prompt in Supabase
 * 3. Sends the prompt to each selected model via OpenRouter
 * 4. Stores the responses in Supabase
 * 5. Analyzes the consensus among responses
 * 6. Stores the consensus groups in Supabase
 * 7. Returns the prompt ID, responses, and consensus groups
 */
export async function POST({ request }) {
  try {
    // Parse request body
    const body = await request.json();
    const { text, modelIds } = body;
    
    if (!text || !modelIds || !Array.isArray(modelIds) || modelIds.length === 0) {
      return new Response(
        JSON.stringify({
          error: 'Invalid request. Prompt text and at least one model ID are required.'
        }),
        { status: 400 }
      );
    }
    
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
    
    // Store prompt in Supabase
    const { data: promptData, error: promptError } = await supabase
      .from('prompts')
      .insert({ text })
      .select()
      .single();
    
    if (promptError) {
      return new Response(
        JSON.stringify({
          error: `Failed to store prompt: ${promptError.message}`
        }),
        { status: 500 }
      );
    }
    
    const promptId = promptData.id;
    
    // Get model details from Supabase
    const { data: modelsData, error: modelsError } = await supabase
      .from('models')
      .select('*')
      .in('id', modelIds);
    
    if (modelsError || !modelsData || modelsData.length === 0) {
      return new Response(
        JSON.stringify({
          error: modelsError ? `Failed to fetch models: ${modelsError.message}` : 'No models found with the provided IDs'
        }),
        { status: 500 }
      );
    }
    
    // Send prompt to each model
    const responsePromises = modelsData.map(async (model) => {
      try {
        console.log(`Sending prompt to model: ${model.name} (${model.model_id})`);
        
        // Get response from OpenRouter
        const result = await openRouter.getCompletion(model.model_id, text);
        
        console.log(`Received response from ${model.name}: "${result.text}" (${result.timeMs}ms)`);
        
        // Store response in Supabase
        const { data, error } = await supabase
          .from('responses')
          .insert({
            prompt_id: promptId,
            model_id: model.id,
            response_text: result.text,
            response_time_ms: result.timeMs
          })
          .select()
          .single();
        
        if (error) {
          console.error(`Failed to store response for model ${model.id}:`, error);
          return null;
        }
        
        return {
          id: data.id,
          prompt_id: data.prompt_id,
          model_id: data.model_id,
          model: {
            id: model.id,
            name: model.name,
            provider: model.provider
          },
          response_text: data.response_text,
          response_time_ms: data.response_time_ms,
          created_at: data.created_at
        };
      } catch (error) {
        console.error(`Error getting response from model ${model.id} (${model.model_id}):`, error);
        
        // Return a partial response object with error information
        return {
          model_id: model.id,
          model: {
            id: model.id,
            name: model.name,
            provider: model.provider
          },
          response_text: `Error: ${error.message}`,
          response_time_ms: 0,
          error: true
        };
      }
    });
    
    // Wait for all responses
    const responses = await Promise.all(responsePromises);
    
    // Filter out null responses
    const validResponses = responses.filter(Boolean);
    
    if (validResponses.length === 0) {
      return new Response(
        JSON.stringify({
          error: 'Failed to get responses from any models.'
        }),
        { status: 500 }
      );
    }
    
    // Analyze consensus (only for successful responses)
    const successfulResponses = validResponses.filter(r => !r.error);
    const consensusGroups = analyzeConsensus(
      successfulResponses.map(r => ({ model: r.model.name, text: r.response_text }))
    );
    
    // Store consensus groups in Supabase
    const consensusPromises = consensusGroups.map(async (group) => {
      const { data, error } = await supabase
        .from('consensus_groups')
        .insert({
          prompt_id: promptId,
          group_name: group.groupName,
          count: group.count,
          color: group.color
        })
        .select()
        .single();
      
      if (error) {
        console.error(`Failed to store consensus group ${group.groupName}:`, error);
        return null;
      }
      
      return data;
    });
    
    await Promise.all(consensusPromises);
    
    // Return results
    return new Response(
      JSON.stringify({
        prompt_id: promptId,
        responses: validResponses,
        consensus_groups: consensusGroups
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error('Error processing prompt:', error);
    
    return new Response(
      JSON.stringify({
        error: `Failed to process prompt: ${error.message}`
      }),
      { status: 500 }
    );
  }
}