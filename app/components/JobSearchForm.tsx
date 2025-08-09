"use client";

import { useState } from "react";
import { JobSearchParams } from "../types";

interface JobSearchFormProps {
  onSearch: (params: JobSearchParams) => void;
  isLoading: boolean;
}

export default function JobSearchForm({
  onSearch,
  isLoading,
}: JobSearchFormProps) {
  const [jobTitle, setJobTitle] = useState("");
  const [location, setLocation] = useState("");
  const [jobType, setJobType] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({
      title: jobTitle,
      location: location,
      job_type: jobType,
      page: 1, // Reset to first page on new search
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-4xl mx-auto bg-white dark:bg-black p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-800"
    >
      <h2 className="text-2xl font-semibold mb-6 text-center">
        Find Your Next Job
      </h2>
      
      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <div className="flex-1">
          <label
            htmlFor="jobTitle"
            className="block text-sm font-medium mb-1"
          >
            Job Title
          </label>
          <input
            type="text"
            id="jobTitle"
            placeholder="e.g. Software Engineer"
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
            className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800"
          />
        </div>
        
        <div className="flex-1">
          <label
            htmlFor="location"
            className="block text-sm font-medium mb-1"
          >
            Location
          </label>
          <input
            type="text"
            id="location"
            placeholder="e.g. New York"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800"
          />
        </div>
      </div>

      {/* Job Type Filter */}
      <div className="mb-4">
        <label
          htmlFor="jobType"
          className="block text-sm font-medium mb-1"
        >
          Job Type
        </label>
        <select
          id="jobType"
          value={jobType}
          onChange={(e) => setJobType(e.target.value)}
          className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800"
        >
          <option value="">All Job Types</option>
          <option value="full_time">Full-Time</option>
          <option value="part_time">Part-Time</option>
          <option value="contract">Contract/Intern</option>
          <option value="permanent">Permanent</option>
        </select>
      </div>

      <div className="flex justify-center mt-6">
        <button
          type="submit"
          disabled={isLoading}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-md transition duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Searching..." : "Search Jobs"}
        </button>
      </div>
    </form>
  );
}