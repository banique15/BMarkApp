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
