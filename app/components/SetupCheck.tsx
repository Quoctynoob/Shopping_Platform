"use client";

import { useState, useEffect } from "react";

interface SetupStatus {
  status: "success" | "setup_required" | "error" | "checking";
  message: string;
  collections?: {
    exists: boolean;
    missing: string[];
  };
  instructions?: string;
  error?: string;
}

export default function SetupCheck() {
  const [setupStatus, setSetupStatus] = useState<SetupStatus>({
    status: "checking",
    message: "Checking Firestore setup..."
  });
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    const checkSetup = async () => {
      try {
        const response = await fetch("/api/setup");
        const data = await response.json();
        
        setSetupStatus(data);
        
        // Close automatically if everything is good
        if (data.status === "success") {
          setTimeout(() => setIsOpen(false), 3000);
        }
      } catch (error) {
        setSetupStatus({
          status: "error",
          message: "Error checking Firestore setup.",
          error: error instanceof Error ? error.message : "Unknown error"
        });
      }
    };

    checkSetup();
  }, []);

  // If everything is good and notification is closed, don't show anything
  if (setupStatus.status === "success" && !isOpen) {
    return null;
  }

  // Generate color classes based on status
  const getBgColor = () => {
    switch (setupStatus.status) {
      case "success":
        return "bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-900/30";
      case "setup_required":
        return "bg-yellow-50 dark:bg-yellow-900/10 border-yellow-200 dark:border-yellow-900/30";
      case "error":
        return "bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-900/30";
      case "checking":
      default:
        return "bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-900/30";
    }
  };

  const getTextColor = () => {
    switch (setupStatus.status) {
      case "success":
        return "text-green-800 dark:text-green-300";
      case "setup_required":
        return "text-yellow-800 dark:text-yellow-300";
      case "error":
        return "text-red-800 dark:text-red-300";
      case "checking":
      default:
        return "text-blue-800 dark:text-blue-300";
    }
  };

  return (
    <div className={`w-full p-4 mb-4 rounded-lg border ${getBgColor()}`}>
      <div className="flex justify-between items-start">
        <div>
          <h3 className={`text-lg font-medium ${getTextColor()}`}>
            {setupStatus.status === "checking" ? "Checking Setup..." : "Firestore Setup Check"}
          </h3>
          <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
            {setupStatus.message}
          </p>
          
          {setupStatus.status === "setup_required" && setupStatus.collections?.missing && (
            <div className="mt-2">
              <p className="font-medium text-sm">Missing Collections:</p>
              <ul className="list-disc list-inside text-sm text-gray-700 dark:text-gray-300 pl-2">
                {setupStatus.collections.missing.map(collection => (
                  <li key={collection}>{collection}</li>
                ))}
              </ul>
              
              {setupStatus.instructions && (
                <div className="mt-2 p-3 bg-white dark:bg-gray-800 rounded text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line">
                  {setupStatus.instructions}
                </div>
              )}
            </div>
          )}
          
          {setupStatus.status === "error" && setupStatus.error && (
            <p className="mt-2 text-sm text-red-700 dark:text-red-300">
              Error: {setupStatus.error}
            </p>
          )}
        </div>
        
        <button 
          onClick={() => setIsOpen(false)} 
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
      
      {setupStatus.status === "checking" && (
        <div className="flex justify-center mt-3">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 dark:border-blue-400"></div>
        </div>
      )}
      
      {setupStatus.status === "setup_required" && (
        <div className="flex justify-end mt-3">
          <a 
            href="https://console.firebase.google.com/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition-colors"
          >
            Open Firebase Console
          </a>
        </div>
      )}
    </div>
  );
}