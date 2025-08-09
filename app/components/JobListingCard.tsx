"use client";

import { useState, useEffect } from "react";
import { JobListing } from "../types";
import { useAuth } from "../context/AuthContext";
import { addAppliedJob, isJobApplied } from "../lib/appliedJobsService";
import { useRouter } from "next/navigation";
import Image from "next/image";
import JobDetail from "./JobDetail";

interface JobListingCardProps {
  job: JobListing;
}

export default function JobListingCard({ job }: JobListingCardProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [isJobInAppliedList, setIsJobInAppliedList] = useState(false);
  const [isAddingToList, setIsAddingToList] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  // Format the date to be more readable
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      dateStyle: "medium",
    }).format(date);
  };

  // Create a shorter description for the card preview
  const shortenDescription = (description: string, maxLength = 200) => {
    if (description.length <= maxLength) return description;
    return description.substring(0, maxLength).trim() + "...";
  };

  // Check if the job is already in the applied list
  useEffect(() => {
    const checkIfJobIsApplied = async () => {
      if (user) {
        const applied = await isJobApplied(user.uid, job.id);
        setIsJobInAppliedList(applied);
      }
    };

    checkIfJobIsApplied();
  }, [user, job.id]);

  // Handle adding job to applied list
  const handleAddToAppliedList = async () => {
    if (!user) {
      // Redirect to login if user is not authenticated
      router.push("/login");
      return;
    }

    setIsAddingToList(true);

    try {
      await addAppliedJob(user.uid, job);
      setIsJobInAppliedList(true);
    } catch (error) {
      console.error("Error adding job to applied list:", error);
    } finally {
      setIsAddingToList(false);
    }
  };

  // Calculate job age for displaying freshness indicator
  const getJobAge = () => {
    if (!job.createdAt) return null;
    
    const now = new Date();
    const jobDate = job.createdAt.toDate();
    const diffTime = Math.abs(now.getTime() - jobDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };

  // Get freshness badge
  const getFreshnessBadge = () => {
    const age = getJobAge();
    
    if (!age) return null;
    
    if (age <= 3) {
      return (
        <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">
          New
        </span>
      );
    }
    
    if (age >= 15) {
      // Show warning for older jobs
      if (job.isValid === false) {
        return (
          <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300">
            May be expired
          </span>
        );
      } else {
        return (
          <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300">
            {age}d old
          </span>
        );
      }
    }
    
    return null;
  };

  return (
    <>
      <div 
        className="bg-white dark:bg-gray-900 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-800 transition-all hover:shadow-lg cursor-pointer"
        onClick={() => setShowDetails(true)}
      >
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">
            {job.title}
            {getFreshnessBadge()}
          </h3>
          {job.salary_min && job.salary_max && (
            <span className="text-green-600 dark:text-green-400 font-medium">
              ${job.salary_min.toLocaleString()} - ${job.salary_max.toLocaleString()}
            </span>
          )}
        </div>

        <div className="mb-4">
          <div className="flex items-center mb-2">
            <span className="font-medium text-gray-800 dark:text-gray-200">
              {job.company?.display_name || "Company"}
            </span>
          </div>
          <div className="flex items-center text-gray-600 dark:text-gray-400 text-sm">
            <span>{job.location?.display_name || "Location not specified"}</span>
            <span className="mx-2">•</span>
            <span>{job.contract_time || "Not specified"}</span>
            {job.category?.label && (
              <>
                <span className="mx-2">•</span>
                <span>{job.category.label}</span>
              </>
            )}
          </div>
        </div>

        <div 
          className="text-gray-700 dark:text-gray-300 mb-4"
          dangerouslySetInnerHTML={{ __html: shortenDescription(job.description) }}
        />

        <div className="flex justify-between items-center mt-4">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Posted: {formatDate(job.created)}
          </span>
          
          <div className="flex space-x-2" onClick={(e) => e.stopPropagation()}>
            {/* Add to Applied List Button */}
            <button
              onClick={handleAddToAppliedList}
              disabled={isJobInAppliedList || isAddingToList}
              className={`flex items-center py-2 px-3 rounded transition duration-300 ease-in-out ${
                isJobInAppliedList
                  ? "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400 cursor-default"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-300"
              }`}
            >
              {isJobInAppliedList ? (
                <>
                  <Image 
                    src="/svg/check-icon.svg"
                    width={20}
                    height={20}
                    alt="Checkmark"
                    className="h-5 w-5 mr-1 text-current"
                  />
                  Added
                </>
              ) : (
                <>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                  {isAddingToList ? "Adding..." : "Track Application"}
                </>
              )}
            </button>
            
            {/* Apply Now Button */}
            <a
              href={job.redirect_url}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition duration-300 ease-in-out"
            >
              Apply Now
            </a>
          </div>
        </div>
      </div>

      {/* Job Detail Modal */}
      {showDetails && (
        <JobDetail
          job={job}
          onClose={() => setShowDetails(false)}
        />
      )}
    </>
  );
}