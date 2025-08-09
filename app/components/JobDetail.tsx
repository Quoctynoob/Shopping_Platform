"use client";

import { useState, useEffect } from "react";
import { JobListing } from "../types";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";
import { addAppliedJob, isJobApplied } from "../lib/appliedJobsService";
import Image from "next/image";

interface JobDetailProps {
  job: JobListing;
  onClose: () => void;
}

export default function JobDetail({ job, onClose }: JobDetailProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [isJobInAppliedList, setIsJobInAppliedList] = useState(false);
  const [isAddingToList, setIsAddingToList] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<{
    isValid: boolean;
    verifiedAt: Date | null;
    attempts: number;
  } | null>(null);

  // Calculate job age in days
  const jobAge = job.createdAt 
    ? Math.floor((Date.now() - job.createdAt.toDate().getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  // Format the date to be more readable
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      dateStyle: "medium",
    }).format(date);
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

  // When the component mounts, if the job is older than 10 days, verify it
  useEffect(() => {
    const verifyJobIfNeeded = async () => {
      if (job.id && jobAge > 10 && !isVerifying) {
        await verifyJob();
      }
    };

    verifyJobIfNeeded();
  }, [job.id]);

  // Verify job validity
  const verifyJob = async () => {
    setIsVerifying(true);
    try {
      const response = await fetch(`/api/jobs/verify/${job.id}`);
      
      if (response.ok) {
        const data = await response.json();
        setVerificationStatus({
          isValid: data.isValid,
          verifiedAt: data.verificationStatus.verifiedAt 
            ? new Date(data.verificationStatus.verifiedAt.seconds * 1000) 
            : null,
          attempts: data.verificationStatus.attempts
        });
      }
    } catch (error) {
      console.error("Error verifying job:", error);
    } finally {
      setIsVerifying(false);
    }
  };

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

  // Get verification status badge
  const getVerificationBadge = () => {
    if (isVerifying) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300">
          <svg className="animate-spin -ml-1 mr-2 h-3 w-3 text-blue-700 dark:text-blue-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Verifying
        </span>
      );
    }
    
    if (job.isValid === false) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300">
          May be expired
        </span>
      );
    }
    
    if (verificationStatus?.isValid === true) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">
          Verified active
        </span>
      );
    }
    
    if (jobAge > 15) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300">
          <button onClick={verifyJob} className="focus:outline-none">
            Older listing - Click to verify
          </button>
        </span>
      );
    }
    
    return null;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-900 rounded-lg max-w-3xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {job.title}
            </h2>
            
            <div className="flex items-center mt-1 space-x-2">
              <span className="text-gray-600 dark:text-gray-400">
                Posted: {formatDate(job.created)}
              </span>
              
              {job.createdAt && (
                <span className="text-gray-600 dark:text-gray-400">
                  ({jobAge} days ago)
                </span>
              )}
              
              {getVerificationBadge()}
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mb-6">
          <div className="flex items-center mb-2">
            <span className="font-semibold text-gray-800 dark:text-gray-200 mr-2">
              Company:
            </span>
            <span>{job.company?.display_name || "Not specified"}</span>
          </div>
          
          <div className="flex items-center mb-2">
            <span className="font-semibold text-gray-800 dark:text-gray-200 mr-2">
              Location:
            </span>
            <span>{job.location?.display_name || "Not specified"}</span>
          </div>
          
          {(job.salary_min || job.salary_max) && (
            <div className="flex items-center mb-2">
              <span className="font-semibold text-gray-800 dark:text-gray-200 mr-2">
                Salary:
              </span>
              <span className="text-green-600 dark:text-green-400">
                {job.salary_min && job.salary_max
                  ? `$${job.salary_min.toLocaleString()} - $${job.salary_max.toLocaleString()}`
                  : job.salary_min
                  ? `$${job.salary_min.toLocaleString()}+`
                  : `Up to $${job.salary_max?.toLocaleString()}`}
                {job.salary_is_predicted ? " (estimated)" : ""}
              </span>
            </div>
          )}
          
          <div className="flex items-center mb-2">
            <span className="font-semibold text-gray-800 dark:text-gray-200 mr-2">
              Job Type:
            </span>
            <span>
              {job.contract_type || "Not specified"}
              {job.contract_time && `, ${job.contract_time.replace("_", " ")}`}
            </span>
          </div>
          
          {job.category?.label && (
            <div className="flex items-center mb-2">
              <span className="font-semibold text-gray-800 dark:text-gray-200 mr-2">
                Category:
              </span>
              <span>{job.category.label}</span>
            </div>
          )}
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
            Job Description
          </h3>
          <div 
            className="text-gray-700 dark:text-gray-300 prose prose-sm dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: job.description }}
          />
        </div>

        {verificationStatus && (
          <div className="mb-6 p-3 bg-gray-100 dark:bg-gray-800 rounded-md">
            <h4 className="text-sm font-semibold mb-1">Verification Status</h4>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <p>Status: {verificationStatus.isValid ? "Active" : "May be expired"}</p>
              {verificationStatus.verifiedAt && (
                <p>Last verified: {new Intl.DateTimeFormat("en-US", {
                  dateStyle: "medium",
                  timeStyle: "short"
                }).format(verificationStatus.verifiedAt)}</p>
              )}
            </div>
          </div>
        )}

        <div className="flex justify-between items-center">
          <div>
            {/* Add to Applied List Button */}
            <button
              onClick={handleAddToAppliedList}
              disabled={isJobInAppliedList || isAddingToList}
              className={`flex items-center py-2 px-3 mr-3 rounded transition duration-300 ease-in-out ${
                isJobInAppliedList
                  ? "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400 cursor-default"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-300"
              }`}
            >
              {isJobInAppliedList ? (
                <>
                  <svg className="h-5 w-5 mr-1 text-current" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Added
                </>
              ) : (
                <>
                  <svg className="h-5 w-5 mr-1 text-current" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  {isAddingToList ? "Adding..." : "Track Application"}
                </>
              )}
            </button>
          </div>
          
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
  );
}