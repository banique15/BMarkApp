interface Response {
  model: string;
  text: string;
}

interface ConsensusGroup {
  groupName: string;
  count: number;
  percentage: number;
  color: string;
  models: string[];
}

function normalizeResponse(response: string): string {
  return response
    .toLowerCase()
    .trim()
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, ' ');
}

function generateColorScale(numColors: number): string[] {
  // Simple color generation
  const colors = [
    '#3B82F6', // blue
    '#10B981', // green
    '#8B5CF6', // purple
    '#F59E0B', // amber
    '#EF4444', // red
    '#EC4899', // pink
    '#06B6D4', // cyan
    '#F97316', // orange
    '#6366F1', // indigo
    '#14B8A6', // teal
    '#84CC16', // lime
    '#7C3AED', // violet
    '#D946EF', // fuchsia
    '#0EA5E9', // sky
    '#F43F5E'  // rose
  ];
  
  // If we need more colors than in our predefined list
  if (numColors > colors.length) {
    // Just cycle through the colors we have
    const extendedColors = [];
    for (let i = 0; i < numColors; i++) {
      extendedColors.push(colors[i % colors.length]);
    }
    return extendedColors;
  }
  
  return colors.slice(0, numColors);
}

export function analyzeConsensus(
  responses: Response[],
  options: {
    useSimilarityMatching: boolean;
    similarityThreshold: number;
  } = { useSimilarityMatching: false, similarityThreshold: 0.8 }
): ConsensusGroup[] {
  // Group exact matches
  const groups = new Map<string, string[]>();
  
  for (const response of responses) {
    const normalized = normalizeResponse(response.text);
    
    if (!groups.has(normalized)) {
      groups.set(normalized, []);
    }
    
    groups.get(normalized)!.push(response.model);
  }
  
  // TODO: Implement similarity matching if needed
  
  // Assign colors
  const colorScale = generateColorScale(groups.size);
  const result: ConsensusGroup[] = [];
  
  let i = 0;
  const totalResponses = responses.length;
  
  for (const [groupName, models] of groups.entries()) {
    result.push({
      groupName,
      count: models.length,
      percentage: (models.length / totalResponses) * 100,
      color: colorScale[i],
      models
    });
    i++;
  }
  
  // Sort by count (descending)
  return result.sort((a, b) => b.count - a.count);
}
