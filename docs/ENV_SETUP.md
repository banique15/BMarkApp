# Environment Variables Setup

This document outlines the environment variables needed for the LLM Consensus Benchmark application.

## Required Environment Variables

Create a `.env` file in the root of your project with the following variables:

```
# Server Configuration
PORT=3000
NODE_ENV=development

# Supabase Configuration
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# OpenRouter Configuration
OPENROUTER_API_KEY=your_openrouter_api_key

# Application Configuration
DEFAULT_TIMEOUT_MS=30000
MAX_TOKENS_PER_REQUEST=10
CACHE_RESULTS=true
CACHE_TTL_SECONDS=86400

# Authentication (if needed)
JWT_SECRET=your_jwt_secret_here
SESSION_SECRET=your_session_secret_here
```

## Environment Variables Explanation

### Server Configuration
- `PORT`: The port on which the server will run (default: 3000)
- `NODE_ENV`: The environment mode (development, production, test)

### Supabase Configuration
- `SUPABASE_URL`: The URL of your Supabase project
- `SUPABASE_ANON_KEY`: The anonymous key for your Supabase project
- `SUPABASE_SERVICE_ROLE_KEY`: The service role key for your Supabase project (for admin operations)

### OpenRouter Configuration
- `OPENROUTER_API_KEY`: Your API key for OpenRouter, which provides access to multiple LLM providers

### Application Configuration
- `DEFAULT_TIMEOUT_MS`: The default timeout for LLM API requests in milliseconds
- `MAX_TOKENS_PER_REQUEST`: Maximum number of tokens to request from LLMs (set low for single-word responses)
- `CACHE_RESULTS`: Whether to cache LLM responses (true/false)
- `CACHE_TTL_SECONDS`: How long to cache responses in seconds

### Authentication (Optional)
- `JWT_SECRET`: Secret for JWT token generation (if implementing authentication)
- `SESSION_SECRET`: Secret for session management (if implementing authentication)

## Setting Up Supabase

1. Create a new project on [Supabase](https://supabase.com/)
2. Go to Project Settings > API to find your project URL and API keys
3. Copy the URL, anon key, and service role key to your `.env` file

## Setting Up OpenRouter

1. Create an account on [OpenRouter](https://openrouter.ai/)
2. Generate an API key from your dashboard
3. Copy the API key to your `.env` file

## Development vs Production

For production deployment, make sure to:
1. Use a proper secret management system
2. Set `NODE_ENV=production`
3. Use more restrictive CORS settings
4. Consider using a different Supabase project for production

## Local Development

For local development, you can use the `.env` file as described above. Make sure not to commit this file to version control.

## CI/CD Integration

When setting up CI/CD pipelines, configure the environment variables as secrets in your CI/CD platform.