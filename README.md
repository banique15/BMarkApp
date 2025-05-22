# LLM Consensus Benchmark

A specialized benchmarking tool for comparing single-word responses from multiple Large Language Models (LLMs) and visualizing their consensus.

## Project Overview

This application allows you to:

- Input a prompt that requires a single-word answer
- Send the prompt to multiple top LLMs simultaneously via OpenRouter
- View responses in real-time with loading indicators
- Visualize consensus by grouping and color-coding similar responses
- Add or remove models from the benchmark suite
- Store historical results in Supabase

## Tech Stack

This project uses:
- **Frontend**: Astro with React components and Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **LLM Integration**: OpenRouter for unified access to top models from all providers
- **Visualization**: Chart.js/D3.js for consensus visualization

For a detailed breakdown of all technologies used, see [TECH_STACK.md](./docs/TECH_STACK.md).

## Detailed Architecture

For a comprehensive overview of the application architecture, data model, component structure, and implementation plan, see [LLM_BENCHMARK_PLAN.md](./docs/LLM_BENCHMARK_PLAN.md).

## Key Features

- **Simple Prompt Interface**: Enter a prompt that elicits a single-word response
- **Top LLM Access**: Test the latest models from OpenAI, Anthropic, Google, xAI, and more through OpenRouter
- **Real-time Results**: See responses appear as they come in
- **Consensus Visualization**: Automatically group and color-code similar responses
- **Response Time Tracking**: Compare performance across different models
- **Historical Data**: Review past benchmark results

## Documentation

All project documentation is available in the [docs](./docs) directory:

- [PROJECT_OVERVIEW.md](./docs/PROJECT_OVERVIEW.md) - High-level project overview
- [TECH_STACK.md](./docs/TECH_STACK.md) - Detailed technology stack
- [LLM_BENCHMARK_PLAN.md](./docs/LLM_BENCHMARK_PLAN.md) - Comprehensive architecture plan
- [API_DESIGN.md](./docs/API_DESIGN.md) - API endpoints and data flow
- [CONSENSUS_ALGORITHM.md](./docs/CONSENSUS_ALGORITHM.md) - Consensus analysis algorithm
- [ENV_SETUP.md](./docs/ENV_SETUP.md) - Environment setup guide
- [IMPLEMENTATION_STEPS.md](./docs/IMPLEMENTATION_STEPS.md) - Step-by-step implementation guide
- [TESTING_STRATEGY.md](./docs/TESTING_STRATEGY.md) - Testing approach
- [UI_DESIGN.md](./docs/UI_DESIGN.md) - User interface design

## Getting Started

### Prerequisites

- Node.js (v18+)
- npm or yarn
- Supabase account
- OpenRouter API key

### Installation

1. Clone this repository
   ```bash
   git clone https://github.com/yourusername/llm-consensus-benchmark.git
   cd llm-consensus-benchmark
   ```

2. Install dependencies
   ```bash
   npm install
   # or
   yarn install
   ```

3. Set up environment variables
   ```bash
   cp .env.example .env
   # Edit .env with your Supabase credentials and OpenRouter API key
   ```

4. Start the development server
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. Open your browser and navigate to `http://localhost:3000`

## Implementation Plan

The implementation will proceed in phases:

1. **Setup and Basic Structure**: Project initialization, Supabase setup, basic UI
2. **OpenRouter Integration**: Connect to OpenRouter API to access multiple LLM providers
3. **Visualization and Analysis**: Implement the consensus grouping and visualization
4. **Refinement and Optimization**: Performance improvements and UX enhancements

## License

This project is licensed under the MIT License - see the LICENSE file for details.