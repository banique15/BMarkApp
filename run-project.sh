#!/bin/bash

# LLM Consensus Benchmark - Run Script
# This script sets up and runs the application

# Check if .env file exists
if [ ! -f .env ]; then
  echo "Creating .env file..."
  cp .env.example .env
  echo "Please edit the .env file with your API keys"
  exit 1
fi

# Check if OpenRouter API key is set
if ! grep -q "OPENROUTER_API_KEY" .env || grep -q "OPENROUTER_API_KEY=your_openrouter_api_key_here" .env; then
  echo "Please set your OpenRouter API key in the .env file"
  exit 1
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
  echo "Installing dependencies..."
  npm install
fi

# Run the application
echo "Starting the application..."
echo "Open http://localhost:4321 in your browser"
npm run dev