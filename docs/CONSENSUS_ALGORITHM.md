# Consensus Analysis Algorithm

This document outlines the algorithm for analyzing and grouping similar responses from multiple LLMs in the Consensus Benchmark application.

## Overview

The consensus analysis algorithm takes single-word responses from multiple LLMs and groups them based on similarity to identify patterns and consensus among the models. The algorithm handles variations in capitalization, punctuation, and minor spelling differences.

## Algorithm Steps

### 1. Response Normalization

Before comparing responses, we normalize them to ensure consistent comparison:

```typescript
function normalizeResponse(response: string): string {
  return response
    .toLowerCase()           // Convert to lowercase
    .trim()                  // Remove leading/trailing whitespace
    .replace(/[^\w\s]/g, '') // Remove punctuation and special characters
    .replace(/\s+/g, ' ');   // Normalize whitespace
}
```

### 2. Exact Matching

First, we group responses that are exactly the same after normalization:

```typescript
function groupExactMatches(responses: Array<{model: string, text: string}>): Map<string, string[]> {
  const groups = new Map<string, string[]>();
  
  for (const response of responses) {
    const normalized = normalizeResponse(response.text);
    
    if (!groups.has(normalized)) {
      groups.set(normalized, []);
    }
    
    groups.get(normalized)!.push(response.model);
  }
  
  return groups;
}
```

### 3. Similarity Matching (Optional)

For responses that aren't exact matches, we can optionally apply similarity measures to group near-matches:

```typescript
function calculateSimilarity(a: string, b: string): number {
  // Levenshtein distance implementation
  // Returns a value between 0 (completely different) and 1 (identical)
}

function groupSimilarResponses(
  exactGroups: Map<string, string[]>,
  similarityThreshold: number = 0.8
): Map<string, string[]> {
  const finalGroups = new Map<string, string[]>();
  const processedWords = new Set<string>();
  
  // Sort normalized responses by frequency (most common first)
  const sortedResponses = Array.from(exactGroups.entries())
    .sort((a, b) => b[1].length - a[1].length);
  
  for (const [word, models] of sortedResponses) {
    if (processedWords.has(word)) continue;
    
    processedWords.add(word);
    const similarWords = [word];
    const allModels = [...models];
    
    // Find similar words
    for (const [otherWord, otherModels] of sortedResponses) {
      if (processedWords.has(otherWord)) continue;
      
      const similarity = calculateSimilarity(word, otherWord);
      if (similarity >= similarityThreshold) {
        similarWords.push(otherWord);
        allModels.push(...otherModels);
        processedWords.add(otherWord);
      }
    }
    
    // Use the most frequent word as the group name
    const groupName = similarWords[0];
    finalGroups.set(groupName, allModels);
  }
  
  return finalGroups;
}
```

### 4. Color Assignment

Assign distinct colors to each consensus group for visualization:

```typescript
function assignColors(groups: Map<string, string[]>): Map<string, {models: string[], color: string}> {
  const coloredGroups = new Map<string, {models: string[], color: string}>();
  const colorScale = generateColorScale(groups.size);
  
  let i = 0;
  for (const [groupName, models] of groups.entries()) {
    coloredGroups.set(groupName, {
      models,
      color: colorScale[i]
    });
    i++;
  }
  
  return coloredGroups;
}

function generateColorScale(numColors: number): string[] {
  // Generate an array of distinct, visually pleasing colors
  // This could use a library like d3-scale-chromatic
  // Example implementation:
  return d3.quantize(d3.interpolateRainbow, numColors);
}
```

### 5. Complete Algorithm

Putting it all together:

```typescript
function analyzeConsensus(
  responses: Array<{model: string, text: string}>,
  options: {
    useSimilarityMatching: boolean,
    similarityThreshold: number
  } = { useSimilarityMatching: true, similarityThreshold: 0.8 }
): Array<{
  groupName: string,
  count: number,
  percentage: number,
  color: string,
  models: string[]
}> {
  // Step 1: Group exact matches
  const exactGroups = groupExactMatches(responses);
  
  // Step 2: Group similar responses (optional)
  const groups = options.useSimilarityMatching
    ? groupSimilarResponses(exactGroups, options.similarityThreshold)
    : exactGroups;
  
  // Step 3: Assign colors
  const coloredGroups = assignColors(groups);
  
  // Step 4: Format results
  const totalResponses = responses.length;
  const result = Array.from(coloredGroups.entries()).map(([groupName, data]) => ({
    groupName,
    count: data.models.length,
    percentage: (data.models.length / totalResponses) * 100,
    color: data.color,
    models: data.models
  }));
  
  // Sort by count (descending)
  return result.sort((a, b) => b.count - a.count);
}
```

## Levenshtein Distance Implementation

For similarity matching, we use the Levenshtein distance algorithm:

```typescript
function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];
  
  // Initialize matrix
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }
  
  // Fill matrix
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      const cost = a[j - 1] === b[i - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,      // deletion
        matrix[i][j - 1] + 1,      // insertion
        matrix[i - 1][j - 1] + cost // substitution
      );
    }
  }
  
  // Calculate similarity (0 to 1)
  const maxLength = Math.max(a.length, b.length);
  if (maxLength === 0) return 1; // Both strings are empty
  
  return 1 - matrix[b.length][a.length] / maxLength;
}
```

## Alternative Similarity Measures

Depending on the specific requirements, other similarity measures could be used:

### Jaro-Winkler Distance

Better for short strings like single words:

```typescript
function jaroWinklerSimilarity(a: string, b: string): number {
  // Implementation of Jaro-Winkler algorithm
  // Returns a value between 0 (completely different) and 1 (identical)
}
```

### Phonetic Matching

For handling responses that sound similar but are spelled differently:

```typescript
function soundexCode(word: string): string {
  // Implementation of Soundex algorithm
  // Returns a phonetic code for the word
}

function phoneticMatching(a: string, b: string): boolean {
  return soundexCode(a) === soundexCode(b);
}
```

## Handling Edge Cases

### Empty or Invalid Responses

```typescript
function isValidResponse(response: string): boolean {
  const normalized = normalizeResponse(response);
  return normalized.length > 0;
}
```

### Single-Character Responses

For very short responses, we might want to use exact matching only:

```typescript
function shouldUseSimilarityMatching(response: string): boolean {
  return normalizeResponse(response).length > 1;
}
```

### Multiple Words in Response

Even though we're targeting single-word responses, some models might return multiple words:

```typescript
function extractPrimaryWord(response: string): string {
  const words = normalizeResponse(response).split(' ');
  return words[0]; // Take the first word
}
```

## Performance Considerations

For large numbers of responses, the similarity matching can become computationally expensive. Some optimizations:

1. **Early termination**: Skip similarity calculation if the length difference is too large
2. **Caching**: Cache similarity results for repeated comparisons
3. **Parallel processing**: Use Web Workers for similarity calculations
4. **Progressive enhancement**: Start with exact matching and add similarity groups asynchronously

## Implementation Example

Here's how the algorithm might be used in the application:

```typescript
// In a React component
useEffect(() => {
  if (responses.length > 0) {
    const consensusGroups = analyzeConsensus(
      responses.map(r => ({ model: r.model.name, text: r.response_text })),
      { useSimilarityMatching: true, similarityThreshold: 0.8 }
    );
    
    setConsensusData(consensusGroups);
  }
}, [responses]);
```

## Future Enhancements

1. **Machine Learning**: Train a model to better group semantically similar responses
2. **Contextual Grouping**: Consider the prompt context when grouping responses
3. **Language-Specific Rules**: Apply different normalization rules for different languages
4. **Synonym Detection**: Use a thesaurus to group synonyms together
5. **Adaptive Thresholds**: Dynamically adjust similarity thresholds based on response patterns