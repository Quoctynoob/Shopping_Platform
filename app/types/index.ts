// app/types/index.ts
import { Timestamp } from "firebase/firestore";

// Adzuna API response types
export interface AdzunaApiResponse {
  results: JobListing[];
  count: number;
  __CLASS__: string;
  mean: number;
}

export interface JobListing {
  id: string;
  title: string;
  description: string;
  company: {
    display_name: string;
  };
  location: {
    display_name: string;
    area: string[];
  };
  redirect_url: string;
  created: string;
  category: {
    label: string;
    tag: string;
  };
  salary_min?: number;
  salary_max?: number;
  salary_is_predicted?: boolean;
  contract_type?: string;
  contract_time?: string;
  __CLASS__?: string;
  createdAt?: Timestamp;
  verifiedAt?: Timestamp | null;
  isValid?: boolean;
  verificationAttempts?: number;
  provider?: string;
}

// Frontend job search params
export interface JobSearchParams {
  title?: string;
  location?: string;
  job_type?: string; // Added job_type parameter
  page?: number;
  results_per_page?: number;
}

// API response format for our frontend
export interface JobApiResponse {
  jobs: JobListing[];
  totalJobs: number;
  totalPages: number;
  currentPage: number;
  fromCache?: boolean;
}

// Related jobs mapping for search enhancement
export interface RelatedJobsMap {
  [key: string]: string[];
}

// Cached job search result
export interface CachedJobSearchResult {
  params: JobSearchParams;
  jobIds: string[];
  totalJobs: number;
  totalPages: number;
  createdAt: Timestamp;
}

// Job provider result
export interface JobProviderResult {
  jobs: JobListing[];
  totalJobs: number;
  totalPages: number;
  currentPage: number;
  provider: string;
}