"use client";

import { useState } from "react";
import Image from "next/image";
import JobSearchForm from "./components/JobSearchForm";
import JobListings from "./components/JobListings";
import { JobSearchParams } from "./types";
import SetupCheck from "./components/SetupCheck";

export default function Home() {
  const [searchParams, setSearchParams] = useState<JobSearchParams>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = (params: JobSearchParams) => {
    setSearchParams(params);
  };

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      {/* Setup Check Banner */}
      <SetupCheck />
      
      <header className="max-w-4xl mx-auto mb-12 text-center">
        <h1 className="text-4xl font-bold mb-4">
          Find Your Dream Job
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400">
          Search thousands of job listings from across the web
        </p>
      </header>

      <main className="max-w-4xl mx-auto">
        <JobSearchForm onSearch={handleSearch} isLoading={isLoading} />
        
        <JobListings 
          searchParams={searchParams} 
          isLoading={isLoading} 
          setIsLoading={setIsLoading} 
        />
      </main>

      <footer className="max-w-4xl mx-auto mt-20 pt-8 border-t border-gray-200 dark:border-gray-800 text-center text-gray-500 dark:text-gray-400">
        <p>Powered by the Adzuna API</p>
        <div className="flex justify-center space-x-6 mt-4">
          <a
            className="hover:text-gray-700 dark:hover:text-gray-300"
            href="https://nextjs.org/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Made with Next.js
          </a>
          <a
            className="hover:text-gray-700 dark:hover:text-gray-300"
            href="https://developer.adzuna.com/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Adzuna API
          </a>
        </div>
      </footer>
    </div>
  );
}