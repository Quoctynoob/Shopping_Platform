"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { AppliedJob, getAppliedJobs, updateJobStatus, removeAppliedJob } from "../lib/appliedJobsService";

export default function AppliedJobsTable() {
  const { user } = useAuth();
  const [appliedJobs, setAppliedJobs] = useState<AppliedJob[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<AppliedJob | null>(null);
  const [notes, setNotes] = useState("");

  // Fetch applied jobs when the component mounts
  useEffect(() => {
    const fetchAppliedJobs = async () => {
      if (!user) return;

      setIsLoading(true);
      try {
        const jobs = await getAppliedJobs(user.uid);
        setAppliedJobs(jobs);
      } catch (error) {
        console.error("Error fetching applied jobs:", error);
        
        // Check if it's an indexing error
        const errorMessage = error instanceof Error ? error.message : String(error);
        
        if (errorMessage.includes("requires an index")) {
          alert("Database index is being created. This may take a few minutes. Please click the link in the console error message to create the required index.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchAppliedJobs();
  }, [user]);

  // Format the date to be more readable
  const formatDate = (timestamp: any) => {
    const date = timestamp.toDate();
    return new Intl.DateTimeFormat("en-US", {
      dateStyle: "medium",
    }).format(date);
  };

  // Handle status update
  const handleStatusUpdate = async (
    jobId: string,
    status: AppliedJob["status"]
  ) => {
    if (!user) return;

    try {
      const success = await updateJobStatus(user.uid, jobId, status);
      if (success) {
        setAppliedJobs((prev) =>
          prev.map((job) =>
            job.id === jobId ? { ...job, status } : job
          )
        );
      }
    } catch (error) {
      console.error("Error updating job status:", error);
    }
  };

  // Handle removing job from applied list
  const handleRemoveJob = async (jobId: string) => {
    if (!user) return;

    try {
      const success = await removeAppliedJob(user.uid, jobId);
      if (success) {
        setAppliedJobs((prev) => prev.filter((job) => job.id !== jobId));
      }
    } catch (error) {
      console.error("Error removing job:", error);
    }
  };

  // Handle notes update
  const handleNotesUpdate = async () => {
    if (!user || !selectedJob) return;

    try {
      const success = await updateJobStatus(
        user.uid,
        selectedJob.id,
        selectedJob.status,
        notes
      );
      if (success) {
        setAppliedJobs((prev) =>
          prev.map((job) =>
            job.id === selectedJob.id ? { ...job, notes } : job
          )
        );
        setSelectedJob(null);
      }
    } catch (error) {
      console.error("Error updating notes:", error);
    }
  };

  // Status badge colors
  const getStatusBadgeColor = (status: AppliedJob["status"]) => {
    switch (status) {
      case "applied":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300";
      case "interview":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300";
      case "offer":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300";
      case "rejected":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300";
      case "no-response":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/40 dark:text-gray-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (appliedJobs.length === 0) {
    return (
      <div className="text-center py-16">
        <h3 className="text-xl font-medium mb-4">No Jobs Tracked Yet</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Start tracking your job applications by clicking the "Track Application" button when searching for jobs.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-800">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Job
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Company
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Applied On
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
          {appliedJobs.map((job) => (
            <tr key={job.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
              <td className="px-6 py-4">
                <div className="text-sm font-medium">{job.title}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {job.location?.display_name}
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="text-sm">{job.company?.display_name}</div>
              </td>
              <td className="px-6 py-4 text-sm">
                {formatDate(job.appliedAt)}
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center">
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${getStatusBadgeColor(
                      job.status
                    )}`}
                  >
                    {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                  </span>
                </div>
              </td>
              <td className="px-6 py-4 text-sm font-medium">
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      setSelectedJob(job);
                      setNotes(job.notes || "");
                    }}
                    className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    Notes
                  </button>
                  <div className="relative group">
                    <button className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300">
                      Status ▾
                    </button>
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg z-10 hidden group-hover:block">
                      <div className="py-1">
                        <button
                          onClick={() => handleStatusUpdate(job.id, "applied")}
                          className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          Applied
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(job.id, "interview")}
                          className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          Interview
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(job.id, "offer")}
                          className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          Offer
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(job.id, "rejected")}
                          className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          Rejected
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(job.id, "no-response")}
                          className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          No Response
                        </button>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveJob(job.id)}
                    className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                  >
                    Remove
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Notes Modal */}
      {selectedJob && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-900 rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-medium mb-4">
              Notes for {selectedJob.title}
            </h3>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800"
              rows={5}
              placeholder="Add your notes about this application here..."
            ></textarea>
            <div className="flex justify-end space-x-2 mt-4">
              <button
                onClick={() => setSelectedJob(null)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleNotesUpdate}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Save Notes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}