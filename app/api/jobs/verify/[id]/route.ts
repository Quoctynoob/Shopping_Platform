// app/api/jobs/verify/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { verifyJobById } from "@/app/lib/jobVerificationService";
import { getCachedJob } from "@/app/lib/jobCacheService";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const jobId = params.id;
    
    if (!jobId) {
      return NextResponse.json(
        { error: "Job ID is required" },
        { status: 400 }
      );
    }
    
    console.log(`Verification requested for job ID: ${jobId}`);
    
    // First check if job exists in cache
    const cachedJob = await getCachedJob(jobId);
    
    if (!cachedJob) {
      return NextResponse.json(
        { error: "Job not found in cache" },
        { status: 404 }
      );
    }
    
    // Perform the verification
    const isValid = await verifyJobById(jobId);
    
    // Get the updated job with verification status
    const updatedJob = await getCachedJob(jobId);
    
    return NextResponse.json({
      jobId,
      isValid,
      verificationStatus: {
        isValid,
        verifiedAt: updatedJob?.verifiedAt || null,
        attempts: updatedJob?.verificationAttempts || 0
      },
      job: updatedJob
    });
    
  } catch (error) {
    console.error("Error verifying job:", error);
    return NextResponse.json(
      { error: "Failed to verify job" },
      { status: 500 }
    );
  }
}