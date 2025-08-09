"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import AppliedJobsTable from "../components/AppliedJobsTable";

export default function AppliedJobsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to login
  }

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Your Applied Jobs</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Track and manage your job applications
        </p>
      </header>

      <div className="bg-white dark:bg-gray-900 shadow-md rounded-lg overflow-hidden">
        <AppliedJobsTable />
      </div>
    </div>
  );
}