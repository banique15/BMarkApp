# LLM Consensus Benchmark Tech Stack

This document outlines the technology stack for building an LLM Consensus Benchmark application using Astro and Supabase.

## Frontend

- **[Astro](https://astro.build/)**: Core frontend framework
  - Partial hydration ("Islands Architecture")
  - Multi-framework support
  - Static site generation with dynamic islands
  - Excellent performance metrics

- **UI Components**: 
  - [React](https://reactjs.org/) components for interactive elements
  - [Tailwind CSS](https://tailwindcss.com/) for styling
  - [Chart.js](https://www.chartjs.org/) or [D3.js](https://d3js.org/) for consensus visualization

## Backend

- **[Astro SSR](https://docs.astro.build/en/guides/server-side-rendering/)**: Server-side rendering capabilities
- **[Node.js](https://nodejs.org/) with [TypeScript](https://www.typescriptlang.org/)**: For type safety and better developer experience

## Database

- **[Supabase](https://supabase.com/)**: PostgreSQL database with built-in authentication and real-time capabilities
  - Store prompts, responses, and consensus data
  - Real-time subscriptions for live updates
  - Row-level security for data protection

## LLM Integration

- **[OpenRouter](https://openrouter.ai/)**: Unified API to access multiple LLM providers
  - Single API endpoint to query top models from each provider
  - Simplified authentication and billing
  - Access to latest models from:
    - OpenAI (GPT-4, GPT-3.5)
    - Anthropic (Claude 3 models)
    - Google (Gemini models)
    - xAI (Grok)
    - Mistral AI (Mistral models)
    - Meta AI (Llama models)
    - And many other providers

## State Management

- **[Nanostores](https://github.com/nanostores/nanostores)**: Lightweight state management compatible with Astro
- **[Supabase Realtime](https://supabase.com/docs/guides/realtime)**: For real-time updates across clients

## Testing & Development

- **[Vitest](https://vitest.dev/)**: For unit and integration testing
- **[Playwright](https://playwright.dev/)**: For end-to-end testing
- **[TypeScript](https://www.typescriptlang.org/)**: For type safety throughout the application

## Deployment

- **[Vercel](https://vercel.com/)** or **[Netlify](https://www.netlify.com/)**: For Astro frontend deployment
- **[Supabase Hosting](https://supabase.com/)**: For database and backend services

## Project Structure

```
llm-consensus-benchmark/
├── src/                    # Astro source files
│   ├── components/         # UI components
│   │   ├── prompt/         # Prompt input components
│   │   ├── models/         # Model selection components
│   │   ├── responses/      # Response display components
│   │   └── consensus/      # Consensus visualization components
│   ├── layouts/            # Page layouts
│   ├── pages/              # Astro pages and API endpoints
│   │   ├── index.astro     # Main benchmark page
│   │   ├── history.astro   # Historical results page
│   │   ├── settings.astro  # Model management page
│   │   └── api/            # API endpoints
│   └── utils/              # Utility functions
│       ├── supabase.ts     # Supabase client
│       ├── openrouter.ts   # OpenRouter API client
│       └── consensus.ts    # Consensus analysis logic
├── public/                 # Static assets
├── supabase/               # Supabase configuration
│   └── migrations/         # Database migrations
└── tests/                  # Test files
```

## Key Technical Features

1. **OpenRouter Integration**: Query multiple top-tier LLMs through a single API
2. **Real-time Response Updates**: Display responses as they arrive using Supabase Realtime
3. **Consensus Algorithm**: Group similar responses using string normalization and similarity measures
4. **Parallel API Requests**: Send requests to multiple LLM models simultaneously
5. **Response Time Tracking**: Measure and display response times for performance comparison
6. **Color-coded Visualization**: Automatically assign colors to different consensus groups
7. **Historical Data Analysis**: Store and retrieve past benchmark results

## Implementation Considerations

- **API Rate Limiting**: Implement proper handling of OpenRouter rate limits
- **Error Handling**: Graceful degradation when LLM APIs fail or timeout
- **Prompt Engineering**: Format prompts to encourage single-word responses from all models
- **Response Normalization**: Standardize responses for accurate consensus grouping (lowercase, stemming, etc.)
- **Accessibility**: Ensure visualizations are accessible with proper ARIA attributes and keyboard navigation
- **Cost Management**: Track token usage across different models for budget control