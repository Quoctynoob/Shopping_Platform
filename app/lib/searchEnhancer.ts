// app/lib/searchEnhancer.ts

// Job categories and related terms for fuzzy matching
const JOB_CATEGORIES: { [key: string]: string[] } = {
  // Tech/Software
  'software': ['software engineer', 'software developer', 'programmer', 'coder', 'developer', 'swe', 'dev'],
  'frontend': ['frontend developer', 'front-end developer', 'react developer', 'angular developer', 'vue developer', 'ui developer', 'javascript developer', 'web developer', 'fe dev'],
  'backend': ['backend developer', 'back-end developer', 'api developer', 'server developer', 'php developer', 'python developer', 'java developer', 'node developer', 'be dev'],
  'fullstack': ['full stack developer', 'full-stack developer', 'web developer', 'fullstack dev', 'fs dev'],
  'mobile': ['mobile developer', 'android developer', 'ios developer', 'react native developer', 'app developer'],
  'devops': ['devops engineer', 'cloud engineer', 'sre', 'site reliability engineer', 'infrastructure engineer'],
  
  // Data
  'data': ['data scientist', 'data analyst', 'data engineer', 'business analyst', 'database administrator', 'ds'],
  'analytics': ['analytics', 'business intelligence', 'bi analyst', 'data visualization', 'tableau'],
  'machine learning': ['ml engineer', 'ai engineer', 'artificial intelligence', 'deep learning', 'nlp', 'ml'],
  
  // Design
  'design': ['ui designer', 'ux designer', 'graphic designer', 'web designer', 'product designer'],
  'product': ['product designer', 'product manager', 'product owner', 'ux researcher', 'pm'],
  
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

// Common abbreviations and their full forms
const ABBREVIATIONS: { [key: string]: string[] } = {
  'eng': ['engineer', 'engineering'],
  'dev': ['developer', 'development'],
  'mgr': ['manager'],
  'sr': ['senior'],
  'jr': ['junior'],
  'swe': ['software engineer'],
  'fe': ['frontend', 'front-end'],
  'be': ['backend', 'back-end'],
  'fs': ['fullstack', 'full-stack'],
  'pm': ['product manager', 'project manager'],
  'qa': ['quality assurance', 'tester'],
  'ui': ['user interface'],
  'ux': ['user experience'],
  'ai': ['artificial intelligence'],
  'ml': ['machine learning'],
  'bi': ['business intelligence'],
  'ds': ['data scientist'],
  'sci': ['scientist']
};

/**
 * Expand abbreviations in a search term
 */
function expandAbbreviations(term: string): string[] {
  const words = term.toLowerCase().split(/\s+/);
  const expandedTerms = new Set<string>();
  
  // Add original term
  expandedTerms.add(term);
  
  // Check each word for abbreviations
  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    if (ABBREVIATIONS[word]) {
      // Create variations with expanded abbreviations
      ABBREVIATIONS[word].forEach(expansion => {
        const expandedWords = [...words];
        expandedWords[i] = expansion;
        expandedTerms.add(expandedWords.join(' '));
      });
    }
  }
  
  return Array.from(expandedTerms);
}

/**
 * Find fuzzy matches for partial terms
 */
function findFuzzyMatches(term: string): string[] {
  const normalizedTerm = term.toLowerCase().trim();
  const matches = new Set<string>();
  
  // Add original term
  matches.add(term);
  
  // Check all job categories and their keywords
  for (const [category, keywords] of Object.entries(JOB_CATEGORIES)) {
    // Check if term contains the category name
    if (normalizedTerm.includes(category)) {
      keywords.slice(0, 2).forEach(keyword => matches.add(keyword)); // Add top 2 matches
    }
    
    // Check keywords for partial matches
    keywords.forEach(keyword => {
      const keywordLower = keyword.toLowerCase();
      
      // Check for partial matches (at least 3 characters)
      if (normalizedTerm.length >= 3) {
        // Check if the normalized term is contained in the keyword
        if (keywordLower.includes(normalizedTerm)) {
          matches.add(keyword);
        }
        // Check if the keyword starts with the term
        if (keywordLower.startsWith(normalizedTerm)) {
          matches.add(keyword);
        }
        // Check word-by-word matching for multi-word terms
        const termWords = normalizedTerm.split(/\s+/);
        const keywordWords = keywordLower.split(/\s+/);
        
        // If all words in the term match the beginning of words in the keyword
        if (termWords.every(termWord => 
          keywordWords.some(keywordWord => keywordWord.startsWith(termWord) && termWord.length >= 2)
        )) {
          matches.add(keyword);
        }
      }
    });
  }
  
  return Array.from(matches).slice(0, 3); // Limit to top 3 matches
}

/**
 * Generate an optimized search query with better fuzzy matching
 */
export function optimizeSearchQuery(query: string): string {
  if (!query || query.trim() === '') {
    return '';
  }
  
  // Don't enhance complex queries
  if (query.includes(' OR ') || query.includes(' AND ')) {
    return query;
  }
  
  // Step 1: Expand abbreviations
  const expandedTerms = expandAbbreviations(query);
  
  // Step 2: Find fuzzy matches for each expanded term
  const allMatches = new Set<string>();
  
  expandedTerms.forEach(term => {
    const fuzzyMatches = findFuzzyMatches(term);
    fuzzyMatches.forEach(match => allMatches.add(match));
  });
  
  // Convert to array and remove the original query if we have better matches
  const matchesArray = Array.from(allMatches);
  const betterMatches = matchesArray.filter(match => 
    match.toLowerCase() !== query.toLowerCase() && 
    match.length > query.length
  );
  
  // If we found better matches, return the first one
  if (betterMatches.length > 0) {
    // Sort by length (longer terms are usually more specific) and return the first
    const sortedMatches = betterMatches.sort((a, b) => b.length - a.length);
    return sortedMatches[0];
  }
  
  // If no better matches, return original query
  return query;
}

/**
 * Get enhanced search suggestions for user feedback
 */
export function getSearchSuggestions(query: string): string[] {
  if (!query || query.trim() === '') {
    return [];
  }
  
  const expandedTerms = expandAbbreviations(query);
  const allSuggestions = new Set<string>();
  
  expandedTerms.forEach(term => {
    const suggestions = findFuzzyMatches(term);
    suggestions.forEach(suggestion => {
      if (suggestion !== query) { // Don't suggest the original query
        allSuggestions.add(suggestion);
      }
    });
  });
  
  return Array.from(allSuggestions).slice(0, 5);
}