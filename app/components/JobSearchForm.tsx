"use client";

import { useState, useEffect } from "react";
import { JobSearchParams } from "../types";
import { getSearchSuggestions } from "../lib/searchEnhancer";

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
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Generate search suggestions when job title changes
  useEffect(() => {
    if (jobTitle.length >= 3) {
      const newSuggestions = getSearchSuggestions(jobTitle);
      setSuggestions(newSuggestions);
      setShowSuggestions(newSuggestions.length > 0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [jobTitle]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSuggestions(false);
    onSearch({
      title: jobTitle,
      location: location,
      job_type: jobType,
      page: 1, // Reset to first page on new search
    });
  };

  const handleSuggestionClick = (suggestion: string) => {
    setJobTitle(suggestion);
    setShowSuggestions(false);
    onSearch({
      title: suggestion,
      location: location,
      job_type: jobType,
      page: 1,
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
        <div className="flex-1 relative">
          <label
            htmlFor="jobTitle"
            className="block text-sm font-medium mb-1"
          >
            Job Title
          </label>
          <input
            type="text"
            id="jobTitle"
            placeholder="e.g. Software Engineer, software eng, dev"
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
            onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
            className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800"
          />
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md shadow-lg max-h-60 overflow-y-auto">
              <div className="p-2 text-xs text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-600">
                Suggestions based on your search:
              </div>
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="w-full text-left p-3 hover:bg-gray-100 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                >
                  <div className="font-medium">{suggestion}</div>
                </button>
              ))}
            </div>
          )}
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