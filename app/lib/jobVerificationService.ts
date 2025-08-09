// app/lib/jobVerificationService.ts
import { updateJobValidity, getCachedJob } from './jobCacheService';
import { JobListing } from '../types';

/**
 * Verifies if a job listing is still valid by checking its redirect URL
 */
export async function verifyJobValidity(job: JobListing): Promise<boolean> {
  try {
    // Skip if no redirect URL
    if (!job.redirect_url) {
      console.log(`Job ${job.id} has no redirect URL, assuming valid`);
      return true;
    }
    
    console.log(`Verifying job ${job.id}: ${job.title}`);
    
    // Make a HEAD request to check if the URL is still valid
    const response = await fetch(job.redirect_url, {
      method: 'HEAD',
      // Timeout after 5 seconds
      signal: AbortSignal.timeout(5000),
      redirect: 'follow'
    });
    
    // Check status code
    const isValid = response.ok && ![404, 410].includes(response.status);
    
    console.log(`Job ${job.id} validity check: ${isValid ? 'Valid' : 'Invalid'} (status: ${response.status})`);
    
    // Update the cached job validity status
    await updateJobValidity(job.id, isValid);
    
    return isValid;
  } catch (error) {
    console.error(`Error verifying job ${job.id}:`, error);
    
    // If we can't verify, don't change validity status
    return true;
  }
}

/**
 * Advanced verification using content analysis
 * This checks the actual content of the page for phrases indicating the job is no longer available
 */
export async function performAdvancedVerification(job: JobListing): Promise<boolean> {
  try {
    if (!job.redirect_url) {
      return true;
    }
    
    console.log(`Performing advanced verification for job ${job.id}`);
    
    // Make a full request to get the page content
    const response = await fetch(job.redirect_url, {
      signal: AbortSignal.timeout(10000),
      redirect: 'follow'
    });
    
    if (!response.ok) {
      console.log(`Job ${job.id} returned non-OK status: ${response.status}`);
      await updateJobValidity(job.id, false);
      return false;
    }
    
    const text = await response.text();
    
    // Check for common phrases that indicate a job is no longer available
    const closedPhrases = [
      'position has been filled',
      'no longer accepting applications',
      'application period closed',
      'this job is no longer available',
      'position is filled',
      'job has been closed',
      'vacancy is now closed'
    ];
    
    const textLower = text.toLowerCase();
    
    for (const phrase of closedPhrases) {
      if (textLower.includes(phrase)) {
        console.log(`Job ${job.id} contains closed phrase: "${phrase}"`);
        await updateJobValidity(job.id, false);
        return false;
      }
    }
    
    // Check for application forms - if they exist, the job is likely still open
    const applicationFormIndicators = [
      'application form',
      'apply now',
      'submit your',
      'upload your',
      'resume',
      'cv',
      'cover letter'
    ];
    
    let hasApplicationForm = false;
    
    for (const indicator of applicationFormIndicators) {
      if (textLower.includes(indicator)) {
        hasApplicationForm = true;
        break;
      }
    }
    
    console.log(`Job ${job.id} appears to be ${hasApplicationForm ? 'still accepting applications' : 'possibly closed'}`);
    
    // Update validity 
    await updateJobValidity(job.id, hasApplicationForm);
    
    return hasApplicationForm;
  } catch (error) {
    console.error(`Error in advanced verification for job ${job.id}:`, error);
    // If we can't verify, don't change validity status
    return true;
  }
}

/**
 * Verify a job by ID
 * This is used for on-demand verification when a user views a job
 */
export async function verifyJobById(jobId: string): Promise<boolean> {
  try {
    const job = await getCachedJob(jobId);
    
    if (!job) {
      console.log(`Job ${jobId} not found in cache`);
      return false;
    }
    
    // If the job is less than 10 days old, don't verify
    // Calculate job age if createdAt exists and is valid
    let jobAge = Infinity; // Default to a large value so we verify by default
    
    if (job.createdAt && typeof job.createdAt.toDate === 'function') {
      jobAge = Date.now() - job.createdAt.toDate().getTime();
    }
    
    const TEN_DAYS_MS = 10 * 24 * 60 * 60 * 1000;
    
    if (jobAge < TEN_DAYS_MS) {
      console.log(`Job ${jobId} is less than 10 days old, skipping verification`);
      return true;
    }
    
    // Perform basic verification first
    const isValidBasic = await verifyJobValidity(job);
    
    if (!isValidBasic) {
      return false;
    }
    
    // For jobs that pass basic verification but are older than 15 days,
    // perform advanced verification
    const FIFTEEN_DAYS_MS = 15 * 24 * 60 * 60 * 1000;
    
    // Only perform advanced verification if we have a valid job age
    if (jobAge !== Infinity && jobAge > FIFTEEN_DAYS_MS) {
      return performAdvancedVerification(job);
    }
    
    return isValidBasic;
  } catch (error) {
    console.error(`Error verifying job ${jobId}:`, error);
    return true;
  }
}