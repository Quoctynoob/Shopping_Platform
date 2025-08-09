"use client";

import { useState, useEffect } from "react";
import { JobApiResponse, JobListing, JobSearchParams } from "../types";
import JobListingCard from "./JobListingCard";
import Pagination from "./Pagination";

interface JobListingsProps {
  searchParams: JobSearchParams;
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
}

export default function JobListings({
  searchParams,
  isLoading,
  setIsLoading,
}: JobListingsProps) {
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [totalJobs, setTotalJobs] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [fromCache, setFromCache] = useState<boolean>(false);

  const fetchJobs = async (params: JobSearchParams) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Build query parameters
      const queryParams = new URLSearchParams();
      // Using the correct parameter names for our API route
      if (params.title) queryParams.append("title", params.title);
      if (params.location) queryParams.append("location", params.location);
      if (params.job_type) queryParams.append("job_type", params.job_type);
      if (params.page) queryParams.append("page", params.page.toString());
      
      const resultsPerPage = 10;
      queryParams.append("results_per_page", resultsPerPage.toString());
      
      console.log("Searching with params:", Object.fromEntries(queryParams.entries()));
      
      // Fetch data from our API endpoint
      const response = await fetch(`/api/jobs?${queryParams.toString()}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("API error:", errorText);
        throw new Error(`Error: ${response.status}`);
      }
      
      const data: JobApiResponse = await response.json();
      
      setJobs(data.jobs);
      setTotalJobs(data.totalJobs);
      setTotalPages(data.totalPages);
      setCurrentPage(data.currentPage);
      setFromCache(data.fromCache || false);
    } catch (err) {
      console.error("Error fetching jobs:", err);
      setError("Failed to fetch job listings. Please try again later.");
      setJobs([]);
      setTotalJobs(0);
      setTotalPages(0);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch jobs when search parameters change
  useEffect(() => {
    if (searchParams.title || searchParams.location) {
      fetchJobs(searchParams);
    }
  }, [searchParams]);

  // Handle page change
  const handlePageChange = (page: number) => {
    fetchJobs({
      ...searchParams,
      page,
    });
  };

  if (error) {
    return (
      <div className="w-full max-w-4xl mx-auto mt-8 p-6 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-900/30">
        <p className="text-red-600 dark:text-red-400 text-center">{error}</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="w-full max-w-4xl mx-auto mt-8 p-6">
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (jobs.length === 0 && (searchParams.title || searchParams.location)) {
    return (
      <div className="w-full max-w-4xl mx-auto mt-8 p-6 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-900/30">
        <p className="text-center text-gray-700 dark:text-gray-300">
          No job listings found for your search criteria. Try different keywords.
        </p>
      </div>
    );
  }

  if (jobs.length === 0) {
    return null; // Don't show anything before the first search
  }

  return (
    <div className="w-full max-w-4xl mx-auto mt-8">
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">
          {totalJobs.toLocaleString()} Jobs Found
        </h2>
        <div className="text-gray-600 dark:text-gray-400">
          {searchParams.title && <span>"{searchParams.title}"</span>}{" "}
          {searchParams.location && <span>in {searchParams.location}</span>}
          {searchParams.job_type && (
            <span className="ml-2">
              • {searchParams.job_type.replace('_', '-').replace(/\b\w/g, l => l.toUpperCase())}
            </span>
          )}
          {fromCache && (
            <span className="ml-2 text-blue-600 dark:text-blue-400">
              • Cached results
            </span>
          )}
        </div>
      </div>

      <div className="space-y-6">
        {jobs.map((job) => (
          <JobListingCard key={job.id} job={job} />
        ))}
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </div>
  );
}