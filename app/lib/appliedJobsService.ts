import { 
    collection, 
    query, 
    where, 
    getDocs, 
    addDoc, 
    deleteDoc, 
    doc, 
    getDoc, 
    updateDoc,
    Timestamp, 
    orderBy 
  } from "firebase/firestore";
  import { db } from "./firebase";
  import { JobListing } from "../types";
  
  export interface AppliedJob extends JobListing {
    appliedAt: Timestamp;
    notes?: string;
    status: "applied" | "interview" | "offer" | "rejected" | "no-response";
  }
  
  export interface AppliedJobData {
    userId: string;
    jobId: string;
    jobData: JobListing;
    appliedAt: Timestamp;
    notes?: string;
    status: "applied" | "interview" | "offer" | "rejected" | "no-response";
  }
  
  // Check if a job is already in the applied list
  export async function isJobApplied(userId: string, jobId: string): Promise<boolean> {
    try {
      const appliedJobsRef = collection(db, "appliedJobs");
      const q = query(
        appliedJobsRef,
        where("userId", "==", userId),
        where("jobId", "==", jobId)
      );
      
      const querySnapshot = await getDocs(q);
      return !querySnapshot.empty;
    } catch (error) {
      console.error("Error checking if job is applied:", error);
      return false;
    }
  }
  
  // Add a job to the applied list
  export async function addAppliedJob(
    userId: string,
    job: JobListing,
    notes?: string
  ): Promise<string | null> {
    try {
      // Check if already exists
      const isAlreadyApplied = await isJobApplied(userId, job.id);
      
      if (isAlreadyApplied) {
        console.log("Job already in applied list");
        return null;
      }
      
      // Create a simplified job object with only the needed fields
      const simplifiedJobData = {
        id: job.id,
        title: job.title || "Unknown Position",
        company: job.company?.display_name || "Unknown Company",
        location: job.location?.display_name || "Unknown Location",
        redirect_url: job.redirect_url || "",
        created: job.created || new Date().toISOString()
      };
      
      const appliedJobData = {
        userId,
        jobId: job.id,
        jobData: simplifiedJobData,
        appliedAt: Timestamp.now(),
        // Only include notes if it's a non-empty string
        ...(notes && notes.trim() !== "" ? { notes } : {}),
        status: "applied", // Default status
      };
      
      const docRef = await addDoc(collection(db, "appliedJobs"), appliedJobData);
      return docRef.id;
    } catch (error) {
      console.error("Error adding applied job:", error);
      return null;
    }
  }
  
  // Helper function to clean job data for Firestore
  function cleanJobDataForFirestore(job: JobListing): JobListing {
    // Create a deep copy of the job
    const cleanedJob = JSON.parse(JSON.stringify(job));
    
    // Remove fields that start and end with double underscores
    function cleanObject(obj: any) {
      if (!obj || typeof obj !== 'object') return;
      
      Object.keys(obj).forEach(key => {
        // Remove fields like __CLASS__
        if (key.startsWith('__') && key.endsWith('__')) {
          delete obj[key];
        } 
        // Recursively clean nested objects
        else if (typeof obj[key] === 'object' && obj[key] !== null) {
          cleanObject(obj[key]);
        }
      });
    }
    
    cleanObject(cleanedJob);
    return cleanedJob;
  }
  
  // Get all applied jobs for a user
  export async function getAppliedJobs(userId: string): Promise<AppliedJob[]> {
    try {
      const appliedJobsRef = collection(db, "appliedJobs");
      
      let q;
      try {
        // Try with ordering (requires the composite index)
        q = query(
          appliedJobsRef,
          where("userId", "==", userId),
          orderBy("appliedAt", "desc")
        );
      } catch (indexError) {
        console.warn("Index error, falling back to simple query:", indexError);
        // Fallback to a simple query without ordering
        q = query(
          appliedJobsRef,
          where("userId", "==", userId)
        );
      }
      
      const querySnapshot = await getDocs(q);
      const appliedJobs: AppliedJob[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data() as AppliedJobData;
        appliedJobs.push({
          ...data.jobData,
          appliedAt: data.appliedAt,
          notes: data.notes,
          status: data.status,
        });
      });
      
      // If we used the fallback query, sort the results manually
      if (!q.toString().includes("orderBy")) {
        appliedJobs.sort((a, b) => {
          return b.appliedAt.toMillis() - a.appliedAt.toMillis();
        });
      }
      
      return appliedJobs;
    } catch (error) {
      console.error("Error getting applied jobs:", error);
      return [];
    }
  }
  
  // Remove a job from the applied list
  export async function removeAppliedJob(userId: string, jobId: string): Promise<boolean> {
    try {
      const appliedJobsRef = collection(db, "appliedJobs");
      const q = query(
        appliedJobsRef,
        where("userId", "==", userId),
        where("jobId", "==", jobId)
      );
      
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        return false;
      }
      
      // Should only be one document
      const docId = querySnapshot.docs[0].id;
      await deleteDoc(doc(db, "appliedJobs", docId));
      
      return true;
    } catch (error) {
      console.error("Error removing applied job:", error);
      return false;
    }
  }
  
  // Update job status
  export async function updateJobStatus(
    userId: string, 
    jobId: string, 
    status: AppliedJobData["status"],
    notes?: string
  ): Promise<boolean> {
    try {
      const appliedJobsRef = collection(db, "appliedJobs");
      const q = query(
        appliedJobsRef,
        where("userId", "==", userId),
        where("jobId", "==", jobId)
      );
      
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        return false;
      }
      
      const docId = querySnapshot.docs[0].id;
      const docRef = doc(db, "appliedJobs", docId);
      
      const updateData: {status: string, notes?: string} = { status };
      if (notes !== undefined) {
        updateData.notes = notes;
      }
      
      await updateDoc(docRef, updateData);
      return true;
    } catch (error) {
      console.error("Error updating job status:", error);
      return false;
    }
  }