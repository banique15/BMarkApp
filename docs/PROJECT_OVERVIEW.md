# LLM Consensus Benchmark - Project Overview

This document provides a high-level overview of the LLM Consensus Benchmark project and serves as a guide to the detailed documentation.

## Project Purpose

The LLM Consensus Benchmark is a specialized application designed to:

1. Send the same prompt to multiple top LLMs simultaneously via OpenRouter
2. Collect single-word responses from each model
3. Group and visualize similar responses to identify consensus patterns
4. Store historical results for comparison and analysis

This tool enables researchers, developers, and AI enthusiasts to quickly compare how different LLMs respond to the same prompt and identify patterns in their responses.

## Key Features

- **Simple Prompt Interface**: Enter a prompt that elicits a single-word response
- **Top LLM Access**: Test the latest models from OpenAI, Anthropic, Google, xAI, and more through OpenRouter
- **Real-time Results**: See responses appear as they come in with loading indicators
- **Consensus Visualization**: Automatically group and color-code similar responses
- **Response Time Tracking**: Compare performance across different models
- **Historical Data**: Review past benchmark results

## Technology Stack

- **Frontend**: Astro with React components and Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **LLM Integration**: OpenRouter for unified access to top models from all providers
- **Visualization**: Chart.js/D3.js for consensus visualization

## Documentation Guide

### Project Setup and Architecture

1. [**README.md**](../README.md) - Project introduction and getting started guide
2. [**TECH_STACK.md**](./TECH_STACK.md) - Detailed breakdown of the technology stack
3. [**LLM_BENCHMARK_PLAN.md**](./LLM_BENCHMARK_PLAN.md) - Comprehensive project architecture and implementation plan
4. [**ENV_SETUP.md**](./ENV_SETUP.md) - Environment variables configuration guide

### Implementation Details

5. [**IMPLEMENTATION_STEPS.md**](./IMPLEMENTATION_STEPS.md) - Step-by-step guide for implementing the application
6. [**API_DESIGN.md**](./API_DESIGN.md) - API endpoints, data flow, and integration details
7. [**CONSENSUS_ALGORITHM.md**](./CONSENSUS_ALGORITHM.md) - Detailed explanation of the consensus analysis algorithm
8. [**UI_DESIGN.md**](./UI_DESIGN.md) - User interface design specifications and guidelines
9. [**TESTING_STRATEGY.md**](./TESTING_STRATEGY.md) - Comprehensive testing approach and examples

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
│   └── utils/              # Utility functions
│       ├── supabase.ts     # Supabase client
│       ├── openrouter.ts   # OpenRouter API client
│       └── consensus.ts    # Consensus analysis logic
├── public/                 # Static assets
├── supabase/               # Supabase configuration
│   └── migrations/         # Database migrations
└── tests/                  # Test files
```

## Implementation Phases

### Phase 1: Setup and Basic Structure
- Initialize Astro project with Tailwind CSS
- Set up Supabase and create database schema
- Create basic UI components
- Implement OpenRouter API client

### Phase 2: LLM Integration
- Implement model fetching from OpenRouter
- Create model selection interface
- Build prompt submission flow
- Implement parallel request handling

### Phase 3: Visualization and Analysis
- Develop response grid with real-time updates
- Implement consensus analysis algorithm
- Create visualization components
- Add historical data view

### Phase 4: Refinement and Optimization
- Optimize API calls for performance
- Improve error handling
- Enhance UI/UX
- Add export functionality

## Data Model

### Key Entities

1. **Models**: Information about available LLMs
2. **Prompts**: User-submitted prompts
3. **Responses**: Individual LLM responses to prompts
4. **Consensus Groups**: Grouped similar responses

### Database Schema

The application uses Supabase (PostgreSQL) with the following tables:

- `models`: Stores information about available LLMs
- `prompts`: Stores user-submitted prompts
- `responses`: Stores individual LLM responses
- `consensus_groups`: Stores grouped consensus data

## User Flow

1. User selects which LLMs to include in the benchmark
2. User enters a prompt that elicits a single-word response
3. The prompt is sent to all selected LLMs via OpenRouter
4. Responses appear in real-time as they arrive
5. Similar responses are automatically grouped and color-coded
6. User can view the consensus visualization and compare results
7. Results are stored for future reference

## Development Approach

The project follows these development principles:

1. **Iterative Development**: Build incrementally, starting with core functionality
2. **Type Safety**: Use TypeScript throughout for better developer experience
3. **Component-Based Architecture**: Create reusable, modular components
4. **Responsive Design**: Ensure the application works well on all devices
5. **Performance Optimization**: Optimize for fast loading and response times
6. **Comprehensive Testing**: Test all aspects of the application

## Next Steps

To begin implementation:

1. Set up the development environment
2. Create a Supabase project
3. Sign up for OpenRouter API access
4. Follow the step-by-step guide in [IMPLEMENTATION_STEPS.md](./IMPLEMENTATION_STEPS.md)

## Future Enhancements

Potential future enhancements include:

1. Multi-user support with authentication
2. Advanced prompt templates
3. Export results to CSV/JSON
4. Prompt history and favorites
5. Detailed analytics on model performance
6. Support for multi-word or paragraph responses with semantic clustering
7. A/B testing of different prompt formulations