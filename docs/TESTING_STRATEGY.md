# Testing Strategy

This document outlines the testing strategy for the LLM Consensus Benchmark application.

## Testing Levels

### 1. Unit Testing

Unit tests verify that individual components and functions work correctly in isolation.

#### Key Areas for Unit Testing:

- **Consensus Algorithm**: Test the response normalization, grouping, and color assignment functions
- **OpenRouter API Client**: Test the request formatting and response parsing
- **Supabase Data Access**: Test database operations
- **UI Components**: Test component rendering and state management

#### Tools:

- **Vitest**: Fast unit testing framework compatible with Astro
- **Testing Library**: For testing React components
- **MSW (Mock Service Worker)**: For mocking API requests

#### Example Unit Tests:

```typescript
// Testing the consensus algorithm
import { describe, it, expect } from 'vitest';
import { analyzeConsensus } from '../src/utils/consensusAnalyzer';

describe('Consensus Analyzer', () => {
  it('should group identical responses', () => {
    const responses = [
      { model: 'Model A', text: 'Paris' },
      { model: 'Model B', text: 'London' },
      { model: 'Model C', text: 'Paris' },
    ];
    
    const result = analyzeConsensus(responses);
    
    expect(result).toHaveLength(2);
    expect(result[0].groupName).toBe('paris');
    expect(result[0].count).toBe(2);
    expect(result[0].models).toContain('Model A');
    expect(result[0].models).toContain('Model C');
  });
  
  it('should normalize responses before grouping', () => {
    const responses = [
      { model: 'Model A', text: 'Paris' },
      { model: 'Model B', text: 'paris' },
      { model: 'Model C', text: 'PARIS' },
    ];
    
    const result = analyzeConsensus(responses);
    
    expect(result).toHaveLength(1);
    expect(result[0].count).toBe(3);
  });
  
  it('should group similar responses when similarity matching is enabled', () => {
    const responses = [
      { model: 'Model A', text: 'color' },
      { model: 'Model B', text: 'colour' },
    ];
    
    const result = analyzeConsensus(responses, { 
      useSimilarityMatching: true, 
      similarityThreshold: 0.8 
    });
    
    expect(result).toHaveLength(1);
    expect(result[0].count).toBe(2);
  });
});
```

### 2. Integration Testing

Integration tests verify that different parts of the application work together correctly.

#### Key Areas for Integration Testing:

- **API Endpoints**: Test that API endpoints correctly interact with the database and external services
- **Data Flow**: Test the flow of data from user input to storage and display
- **Real-time Updates**: Test that real-time updates work correctly

#### Tools:

- **Vitest**: For running integration tests
- **Supertest**: For testing HTTP endpoints
- **Supabase.js**: For testing Supabase interactions

#### Example Integration Tests:

```typescript
// Testing the prompt submission API
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { app } from '../src/server';
import supertest from 'supertest';
import { supabase } from '../src/utils/supabase';

const request = supertest(app);

describe('Prompt API', () => {
  beforeEach(async () => {
    // Set up test database state
    await supabase.from('models').insert([
      { id: 'test-model-1', name: 'Test Model 1', provider: 'Test', model_id: 'test/model-1', enabled: true },
      { id: 'test-model-2', name: 'Test Model 2', provider: 'Test', model_id: 'test/model-2', enabled: true },
    ]);
  });
  
  afterEach(async () => {
    // Clean up test database state
    await supabase.from('models').delete().match({ provider: 'Test' });
    await supabase.from('prompts').delete().match({ text: 'Test prompt' });
  });
  
  it('should create a new prompt and return its ID', async () => {
    const response = await request
      .post('/api/prompts')
      .send({
        text: 'Test prompt',
        model_ids: ['test-model-1', 'test-model-2']
      });
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('prompt_id');
    
    // Verify the prompt was stored in the database
    const { data } = await supabase
      .from('prompts')
      .select()
      .eq('id', response.body.prompt_id)
      .single();
    
    expect(data).not.toBeNull();
    expect(data.text).toBe('Test prompt');
  });
});
```

### 3. End-to-End Testing

End-to-end tests verify that the entire application works correctly from a user's perspective.

#### Key Areas for E2E Testing:

- **User Flows**: Test complete user journeys through the application
- **UI Interactions**: Test that UI components respond correctly to user input
- **Visual Regression**: Test that the UI appears as expected

#### Tools:

- **Playwright**: For browser automation and E2E testing
- **Percy**: For visual regression testing (optional)

#### Example E2E Tests:

```typescript
// Testing the prompt submission flow
import { test, expect } from '@playwright/test';

test('submitting a prompt and viewing responses', async ({ page }) => {
  // Navigate to the application
  await page.goto('http://localhost:3000');
  
  // Select models
  await page.getByLabel('GPT-4').check();
  await page.getByLabel('Claude 3 Opus').check();
  
  // Enter and submit a prompt
  await page.getByPlaceholder('Enter your prompt...').fill('What is the capital of France?');
  await page.getByRole('button', { name: 'Submit' }).click();
  
  // Wait for responses to appear
  await expect(page.getByTestId('response-grid')).toBeVisible();
  
  // Verify that response cards appear
  await expect(page.getByTestId('response-card')).toHaveCount(2);
  
  // Verify that the consensus visualization appears
  await expect(page.getByTestId('consensus-visualization')).toBeVisible();
});
```

### 4. Performance Testing

Performance tests verify that the application performs well under load.

#### Key Areas for Performance Testing:

- **API Response Times**: Test that API endpoints respond quickly
- **Concurrent Requests**: Test handling multiple simultaneous requests
- **Real-time Updates**: Test performance with many concurrent users

#### Tools:

- **k6**: For load testing
- **Lighthouse**: For web performance testing

#### Example Performance Tests:

```javascript
// k6 script for testing prompt submission
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 10,
  duration: '30s',
};

export default function () {
  const payload = JSON.stringify({
    text: 'What is the capital of France?',
    model_ids: ['model-1', 'model-2', 'model-3']
  });
  
  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
  };
  
  const res = http.post('http://localhost:3000/api/prompts', payload, params);
  
  check(res, {
    'status is 200': (r) => r.status === 200,
    'prompt_id is returned': (r) => r.json('prompt_id') !== undefined,
    'response time < 200ms': (r) => r.timings.duration < 200,
  });
  
  sleep(1);
}
```

## Test Data Management

### Mock Data

Create realistic mock data for testing:

```typescript
// src/mocks/models.ts
export const mockModels = [
  {
    id: 'model-1',
    name: 'GPT-4',
    provider: 'OpenAI',
    model_id: 'openai/gpt-4-turbo',
    enabled: true
  },
  {
    id: 'model-2',
    name: 'Claude 3 Opus',
    provider: 'Anthropic',
    model_id: 'anthropic/claude-3-opus',
    enabled: true
  },
  // More models...
];

// src/mocks/responses.ts
export const mockResponses = [
  {
    id: 'response-1',
    prompt_id: 'prompt-1',
    model_id: 'model-1',
    response_text: 'Paris',
    response_time_ms: 1200,
    created_at: '2025-05-21T03:15:02.000Z'
  },
  // More responses...
];
```

### Test Database

Set up a separate test database in Supabase for testing:

1. Create a test project in Supabase
2. Use environment variables to switch between development and test databases
3. Seed the test database with known test data before running tests

## Mocking External Services

### OpenRouter API

Mock the OpenRouter API for testing:

```typescript
// src/mocks/handlers.ts
import { rest } from 'msw';

export const handlers = [
  // Mock the models endpoint
  rest.get('https://openrouter.ai/api/v1/models', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        data: [
          {
            id: 'openai/gpt-4-turbo',
            name: 'GPT-4 Turbo',
            provider: 'OpenAI'
          },
          // More models...
        ]
      })
    );
  }),
  
  // Mock the completions endpoint
  rest.post('https://openrouter.ai/api/v1/chat/completions', (req, res, ctx) => {
    // Extract the model ID and prompt from the request
    const { model, messages } = req.body;
    const prompt = messages.find(m => m.role === 'user')?.content || '';
    
    // Simulate different responses based on the prompt
    let response = 'Unknown';
    if (prompt.includes('capital of France')) {
      response = 'Paris';
    } else if (prompt.includes('largest planet')) {
      response = 'Jupiter';
    }
    
    return res(
      ctx.status(200),
      ctx.json({
        choices: [
          {
            message: {
              content: response
            }
          }
        ],
        usage: {
          completion_ms: Math.floor(Math.random() * 2000) + 500
        }
      })
    );
  })
];
```

### Supabase

Mock Supabase for unit testing:

```typescript
// src/mocks/supabase.ts
export const mockSupabase = {
  from: (table) => ({
    select: () => ({
      eq: () => ({
        single: async () => ({ data: mockData[table][0], error: null }),
        data: mockData[table],
        error: null
      }),
      data: mockData[table],
      error: null
    }),
    insert: async (data) => ({ data, error: null }),
    update: async (data) => ({ data, error: null }),
    delete: () => ({
      match: async () => ({ data: null, error: null })
    })
  }),
  // Mock other Supabase methods as needed
};

const mockData = {
  models: mockModels,
  prompts: [
    {
      id: 'prompt-1',
      text: 'What is the capital of France?',
      created_at: '2025-05-21T03:15:00.000Z'
    }
  ],
  responses: mockResponses
};
```

## Continuous Integration

Set up CI/CD pipelines to run tests automatically:

1. Run unit and integration tests on every pull request
2. Run E2E tests on main branch merges
3. Run performance tests on a schedule or before major releases

### GitHub Actions Example:

```yaml
name: Test

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Set up Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Run unit and integration tests
      run: npm test
      
    - name: Run E2E tests
      run: npm run test:e2e
      
    - name: Run performance tests
      if: github.ref == 'refs/heads/main'
      run: npm run test:performance
```

## Test Coverage

Aim for high test coverage, especially for critical components:

1. Consensus algorithm: 100% coverage
2. API endpoints: 90%+ coverage
3. UI components: 80%+ coverage

Use Vitest's coverage reporting to track coverage metrics:

```json
// package.json
{
  "scripts": {
    "test": "vitest run",
    "test:coverage": "vitest run --coverage"
  }
}
```

## Testing Best Practices

1. **Write tests first**: Consider a test-driven development (TDD) approach
2. **Keep tests independent**: Each test should run in isolation
3. **Use realistic data**: Test with data that resembles real-world usage
4. **Test edge cases**: Include tests for error conditions and boundary cases
5. **Maintain tests**: Update tests when requirements change
6. **Automate testing**: Run tests automatically in CI/CD pipelines
7. **Monitor test performance**: Ensure tests run quickly to maintain developer productivity