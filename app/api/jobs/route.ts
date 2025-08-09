// app/api/jobs/route.ts
import { NextRequest, NextResponse } from "next/server";
import { JobApiResponse, JobSearchParams } from "@/app/types";
import { optimizeSearchQuery } from "@/app/lib/searchEnhancer";
import { 
  getCachedSearchResults, 
  cacheSearchResults, 
  getCachedJobsByIds,
  cleanupExpiredJobs 
} from "@/app/lib/jobCacheService";

// Request counter to manage API rate limits
let adzunaRequestsToday = 0;
let lastResetDate = new Date().toDateString();

// Reset counter if it's a new day
function checkAndResetCounter() {
  const today = new Date().toDateString();
  if (today !== lastResetDate) {
    adzunaRequestsToday = 0;
    lastResetDate = today;
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get search parameters from URL
    const searchParams = request.nextUrl.searchParams;
    const title = searchParams.get("title") || "";
    const location = searchParams.get("location") || "";
    const jobType = searchParams.get("job_type") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const results_per_page = parseInt(searchParams.get("results_per_page") || "10");
    const skipCache = searchParams.get("skip_cache") === "true"; // Option to skip cache
    
    // Build search params object for cache lookup
    const params: JobSearchParams = {
      title,
      location,
      job_type: jobType,
      page,
      results_per_page
    };
    
    // Check cache first (unless skipCache is true)
    let cachedResults = null;
    if (!skipCache) {
      try {
        cachedResults = await getCachedSearchResults(params);
      } catch (cacheError) {
        console.error("Cache error (will fetch fresh data):", cacheError);
        // Continue with API fetch if cache fails
      }
    }
    
    if (cachedResults) {
      console.log("Cache hit for search:", params);
      
      // Get the cached jobs
      const jobs = await getCachedJobsByIds(cachedResults.jobIds);
      
      // Return cached results
      return NextResponse.json({
        jobs,
        totalJobs: cachedResults.totalJobs,
        totalPages: cachedResults.totalPages,
        currentPage: page,
        fromCache: true
      });
    }

    // Check for required API credentials
    const appId = process.env.ADZUNA_APP_ID;
    const apiKey = process.env.ADZUNA_API_KEY;
    const baseUrl = process.env.ADZUNA_BASE_URL;

    if (!appId || !apiKey || !baseUrl) {
      return NextResponse.json(
        { error: "API credentials not configured" },
        { status: 500 }
      );
    }
    
    // Check API rate limits
    checkAndResetCounter();
    if (adzunaRequestsToday >= 90) { // Leave some buffer below 100
      return NextResponse.json(
        { error: "API rate limit reached for today" },
        { status: 429 }
      );
    }

    // Determine country code based on location
    let countryCode = "us"; // Default to US
    if (location.toLowerCase().includes("toronto") || 
        location.toLowerCase().includes("canada") ||
        location.toLowerCase().includes("ontario")) {
      countryCode = "ca";
    } else if (location.toLowerCase().includes("london") || 
               location.toLowerCase().includes("uk") ||
               location.toLowerCase().includes("england")) {
      countryCode = "gb";
    }
    
    // Build API URL with query parameters
    const apiUrl = new URL(`${baseUrl}/jobs/${countryCode}/search/${page}`);
    console.log(`Using country code: ${countryCode} for location: ${location}`);
    
    // Add required parameters
    apiUrl.searchParams.append("app_id", appId);
    apiUrl.searchParams.append("app_key", apiKey);
    apiUrl.searchParams.append("results_per_page", results_per_page.toString());
    
    // Use search enhancement for job title
    if (title) {
      const optimizedQuery = optimizeSearchQuery(title);
      console.log(`Enhanced search: "${title}" -> "${optimizedQuery}"`);
      apiUrl.searchParams.append("what", optimizedQuery);
    }
    
    // Add location if provided
    if (location) apiUrl.searchParams.append("where", location);
    
    // Add job type filter if provided
    if (jobType) {
      switch (jobType) {
        case "full_time":
          apiUrl.searchParams.append("full_time", "1");
          break;
        case "part_time":
          apiUrl.searchParams.append("part_time", "1");
          break;
        case "contract":
          apiUrl.searchParams.append("contract", "1");
          break;
        case "permanent":
          apiUrl.searchParams.append("permanent", "1");
          break;
        default:
          // No filter
          break;
      }
    }

    console.log("Requesting from Adzuna:", apiUrl.toString());
    
    // Increment API request counter
    adzunaRequestsToday++;
    
    // Fetch data from Adzuna API
    const response = await fetch(apiUrl.toString());
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Adzuna API error:", errorText);
      return NextResponse.json(
        { error: "Failed to fetch job listings" },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    // Format response for frontend
    const responseData: JobApiResponse = {
      jobs: data.results || [],
      totalJobs: data.count || 0,
      totalPages: Math.ceil((data.count || 0) / results_per_page),
      currentPage: page,
    };
    
    // Cache the results
    await cacheSearchResults(
      params,
      responseData.jobs,
      responseData.totalJobs,
      responseData.totalPages
    );
    
    // Trigger background cleanup of expired jobs (non-blocking)
    cleanupExpiredJobs().catch(err => console.error("Error cleaning up expired jobs:", err));

    return NextResponse.json(responseData);
  } catch (error) {
    console.error("Error fetching job listings:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}