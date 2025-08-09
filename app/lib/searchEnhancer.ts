// app/lib/searchEnhancer.ts

// Job categories and related terms
const JOB_CATEGORIES: { [key: string]: string[] } = {
  // Tech/Software
  'software': ['software engineer', 'software developer', 'programmer', 'coder', 'developer'],
  'frontend': ['frontend developer', 'front-end developer', 'react developer', 'angular developer', 'vue developer', 'ui developer', 'javascript developer', 'web developer'],
  'backend': ['backend developer', 'back-end developer', 'api developer', 'server developer', 'php developer', 'python developer', 'java developer', 'node developer'],
  'fullstack': ['full stack developer', 'full-stack developer', 'web developer'],
  'mobile': ['mobile developer', 'android developer', 'ios developer', 'react native developer', 'app developer'],
  'devops': ['devops engineer', 'cloud engineer', 'sre', 'site reliability engineer', 'infrastructure engineer'],
  
  // Data
  'data': ['data scientist', 'data analyst', 'data engineer', 'business analyst', 'database administrator'],
  'analytics': ['analytics', 'business intelligence', 'bi analyst', 'data visualization', 'tableau'],
  'machine learning': ['ml engineer', 'ai engineer', 'artificial intelligence', 'deep learning', 'nlp'],
  
  // Design
  'design': ['ui designer', 'ux designer', 'graphic designer', 'web designer', 'product designer'],
  'product': ['product designer', 'product manager', 'product owner', 'ux researcher'],
  
  // Business
  'marketing': ['digital marketing', 'content marketing', 'seo specialist', 'social media manager', 'marketing manager'],
  'sales': ['sales representative', 'account executive', 'business development', 'sales manager'],
  'finance': ['financial analyst', 'accountant', 'controller', 'finance manager', 'bookkeeper'],
  
  // Management
  'manager': ['project manager', 'team lead', 'director', 'program manager', 'scrum master'],
  'executive': ['cto', 'ceo', 'vp', 'vice president', 'chief'],
  
  // Common prefixes/suffixes to handle
  'intern': ['internship', 'co-op', 'student', 'graduate', 'junior'],
  'senior': ['sr', 'lead', 'principal', 'architect', 'expert'],
  'junior': ['jr', 'entry level', 'associate', 'trainee', 'beginner'],
};

/**
 * Find the most relevant job category for a search term
 */
export function findRelevantCategory(term: string): string | null {
  const normalizedTerm = term.toLowerCase();
  
  // Check direct matches first
  for (const [category, keywords] of Object.entries(JOB_CATEGORIES)) {
    if (normalizedTerm.includes(category)) {
      return category;
    }
    
    // Check if any keywords match
    for (const keyword of keywords) {
      if (normalizedTerm.includes(keyword)) {
        return category;
      }
    }
  }
  
  return null;
}

/**
 * Get multiple enhanced terms for the query
 * Returns up to 3 related terms
 */
export function getEnhancedTerms(originalQuery: string, maxTerms = 3): string[] {
  const query = originalQuery.toLowerCase().trim();
  const category = findRelevantCategory(query);
  
  if (!category) {
    return [originalQuery];
  }
  
  // Get the keywords for this category
  const relatedTerms = JOB_CATEGORIES[category];
  
  // Start with the original query
  const result = [originalQuery];
  
  // Add up to maxTerms-1 additional terms (that don't overlap)
  for (const term of relatedTerms) {
    // Skip terms that are already part of the original query
    if (!query.includes(term.toLowerCase()) && result.length < maxTerms) {
      result.push(term);
    }
    
    if (result.length >= maxTerms) {
      break;
    }
  }
  
  return result;
}

/**
 * Generate an optimized search query for Adzuna
 * Instead of just 1 additional term, use up to 3 to get better coverage
 */
export function optimizeSearchQuery(query: string): string {
  if (!query || query.trim() === '') {
    return '';
  }
  
  // Don't enhance complex queries
  if (query.includes(' OR ') || query.includes(' AND ')) {
    return query;
  }
  
  // Get up to 3 terms for better search coverage
  const enhancedTerms = getEnhancedTerms(query, 3);
  
  if (enhancedTerms.length === 1) {
    return enhancedTerms[0];
  }
  
  // Join with OR operator
  return enhancedTerms.join(' OR ');
}