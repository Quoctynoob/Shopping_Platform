"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import LoginForm from "../components/auth/LoginForm";

export default function LoginPage() {
  const { user } = useAuth();
  const router = useRouter();

  // Redirect if user is already logged in
  useEffect(() => {
    if (user) {
      router.push("/");
    }
  }, [user, router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">Welcome to OpusLink</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Sign in to track your job applications
          </p>
        </div>

        <LoginForm />
      </div>
    </div>
  );
}