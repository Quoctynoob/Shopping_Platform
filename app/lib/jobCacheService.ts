// app/lib/jobCacheService.ts
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  deleteDoc, 
  doc, 
  getDoc, 
  updateDoc,
  Timestamp,
  orderBy,
  setDoc,
  writeBatch,
  limit
} from "firebase/firestore";
import { db } from "./firebase";
import { JobListing, JobSearchParams, CachedJobSearchResult } from "../types";

// Collection names
const JOBS_COLLECTION = "cachedJobs";
const SEARCH_RESULTS_COLLECTION = "cachedSearchResults";

// Default expiration time (20 days in milliseconds)
const DEFAULT_EXPIRATION_MS = 20 * 24 * 60 * 60 * 1000;

/**
 * Get a cache key for search parameters
 */
export function getSearchCacheKey(params: JobSearchParams): string {
  return `${params.title || ''}_${params.location || ''}_${params.job_type || ''}_${params.page || 1}`;
}

/**
 * Check if a job search is in cache
 */
export async function getCachedSearchResults(params: JobSearchParams): Promise<CachedJobSearchResult | null> {
  try {
    const cacheKey = getSearchCacheKey(params);
    const searchResultRef = doc(db, SEARCH_RESULTS_COLLECTION, cacheKey);
    const searchResultDoc = await getDoc(searchResultRef);
    
    if (!searchResultDoc.exists()) {
      return null;
    }
    
    const data = searchResultDoc.data() as CachedJobSearchResult;
    
    // Check if expired
    const expirationTime = new Date(data.createdAt.toDate().getTime() + DEFAULT_EXPIRATION_MS);
    if (new Date() > expirationTime) {
      // Cache is expired
      console.log("Search cache expired:", cacheKey);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error("Error getting cached search:", error);
    return null;
  }
}

/**
 * Sanitize job data for Firestore
 * Removes fields that start and end with "__" which Firestore doesn't allow
 */
function sanitizeJobForFirestore(job: JobListing): any {
  // Create a deep copy to avoid modifying the original
  const sanitized = JSON.parse(JSON.stringify(job));
  
  // Function to recursively sanitize an object
  const sanitizeObject = (obj: any) => {
    if (!obj || typeof obj !== 'object') return;
    
    // Process all keys in the object
    Object.keys(obj).forEach(key => {
      // Remove fields that start and end with "__"
      if (key.startsWith('__') && key.endsWith('__')) {
        delete obj[key];
      } 
      // Recursively sanitize nested objects
      else if (obj[key] && typeof obj[key] === 'object') {
        sanitizeObject(obj[key]);
      }
    });
  };
  
  sanitizeObject(sanitized);
  return sanitized;
}

/**
 * Cache job search results
 */
export async function cacheSearchResults(
  params: JobSearchParams,
  jobs: JobListing[],
  totalJobs: number,
  totalPages: number
): Promise<boolean> {
  try {
    const cacheKey = getSearchCacheKey(params);
    const batch = writeBatch(db);
    
    // Cache the search results
    const searchResultRef = doc(db, SEARCH_RESULTS_COLLECTION, cacheKey);
    batch.set(searchResultRef, {
      params,
      jobIds: jobs.map(job => job.id),
      totalJobs,
      totalPages,
      createdAt: Timestamp.now(),
    });
    
    // Cache individual jobs - sanitize first to remove problematic fields
    for (const job of jobs) {
      const sanitizedJob = sanitizeJobForFirestore(job);
      const jobRef = doc(db, JOBS_COLLECTION, job.id);
      batch.set(jobRef, {
        ...sanitizedJob,
        createdAt: Timestamp.now(),
        verifiedAt: null, // Initially not verified
        isValid: true, // Assume valid initially
        verificationAttempts: 0, // No verification attempts yet
      });
    }
    
    await batch.commit();
    console.log(`Cached ${jobs.length} jobs and search results for "${cacheKey}"`);
    return true;
  } catch (error) {
    console.error("Error caching search results:", error);
    return false;
  }
}

/**
 * Get cached jobs by IDs
 */
export async function getCachedJobsByIds(jobIds: string[]): Promise<JobListing[]> {
  try {
    const jobs: JobListing[] = [];
    
    // Process in batches of 10 to avoid large queries
    for (let i = 0; i < jobIds.length; i += 10) {
      const batch = jobIds.slice(i, i + 10);
      
      for (const jobId of batch) {
        const jobRef = doc(db, JOBS_COLLECTION, jobId);
        const jobDoc = await getDoc(jobRef);
        
        if (jobDoc.exists()) {
          const jobData = jobDoc.data() as JobListing & { isValid: boolean };
          
          // Only include if job is still valid
          if (jobData.isValid) {
            jobs.push(jobData);
          }
        }
      }
    }
    
    return jobs;
  } catch (error) {
    console.error("Error getting cached jobs:", error);
    return [];
  }
}

/**
 * Clean up expired jobs
 */
export async function cleanupExpiredJobs(batchSize = 100): Promise<number> {
  try {
    // Calculate expiration date (20 days ago)
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() - 20);
    const expirationTimestamp = Timestamp.fromDate(expirationDate);
    
    // Query for expired jobs
    const jobsRef = collection(db, JOBS_COLLECTION);
    const expiredJobsQuery = query(
      jobsRef,
      where("createdAt", "!=", null), // Only jobs with a createdAt timestamp
      where("createdAt", "<", expirationTimestamp),
      limit(batchSize)
    );
    
    const expiredJobsSnapshot = await getDocs(expiredJobsQuery);
    
    if (expiredJobsSnapshot.empty) {
      return 0;
    }
    
    // Delete expired jobs
    const batch = writeBatch(db);
    expiredJobsSnapshot.forEach((jobDoc) => {
      batch.delete(jobDoc.ref);
    });
    
    await batch.commit();
    return expiredJobsSnapshot.size;
  } catch (error) {
    console.error("Error cleaning up expired jobs:", error);
    return 0;
  }
}

/**
 * Get a single job by ID
 */
export async function getCachedJob(jobId: string): Promise<JobListing | null> {
  try {
    const jobRef = doc(db, JOBS_COLLECTION, jobId);
    const jobDoc = await getDoc(jobRef);
    
    if (!jobDoc.exists()) {
      return null;
    }
    
    const jobData = jobDoc.data() as JobListing;
    
    // Check if job has a createdAt date
    if (!jobData.createdAt) {
      console.log(`Job ${jobId} has no createdAt timestamp`);
      return jobData; // Return anyway, but it won't have expiration info
    }
    
    // Check if job is expired
    const expirationTime = new Date(jobData.createdAt.toDate().getTime() + DEFAULT_EXPIRATION_MS);
    if (new Date() > expirationTime) {
      return null;
    }
    
    return jobData;
  } catch (error) {
    console.error("Error getting cached job:", error);
    return null;
  }
}

/**
 * Update job validity status
 */
export async function updateJobValidity(
  jobId: string, 
  isValid: boolean
): Promise<boolean> {
  try {
    const jobRef = doc(db, JOBS_COLLECTION, jobId);
    await updateDoc(jobRef, {
      isValid,
      verifiedAt: Timestamp.now(),
      verificationAttempts: (await getDoc(jobRef)).data()?.verificationAttempts + 1 || 1
    });
    
    return true;
  } catch (error) {
    console.error("Error updating job validity:", error);
    return false;
  }
}