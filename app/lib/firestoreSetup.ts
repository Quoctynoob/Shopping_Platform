// app/lib/firestoreSetup.ts
import { collection, getDocs, query, limit } from "firebase/firestore";
import { db } from "./firebase";

/**
 * Collections needed for the application
 */
const REQUIRED_COLLECTIONS = [
  "cachedJobs",         // Individual job listings
  "cachedSearchResults", // Search queries and results
  "appliedJobs",        // User's applied jobs
  "verificationHistory" // Job verification history
];

/**
 * Check if a collection exists by attempting to query it
 */
export async function collectionExists(collectionName: string): Promise<boolean> {
  try {
    const collectionRef = collection(db, collectionName);
    const querySnapshot = await getDocs(query(collectionRef, limit(1)));
    
    // If we can run a query without error, the collection exists
    // (even if it's empty)
    return true;
  } catch (error) {
    if (error instanceof Error && 
        error.message.includes("Missing or insufficient permissions")) {
      // This error means the collection exists but we don't have permission
      return true;
    }
    // Any other error suggests the collection doesn't exist
    return false;
  }
}

/**
 * Check if all required collections exist
 */
export async function checkRequiredCollections(): Promise<{exists: boolean, missing: string[]}> {
  const missing: string[] = [];
  
  for (const collectionName of REQUIRED_COLLECTIONS) {
    const exists = await collectionExists(collectionName);
    if (!exists) {
      missing.push(collectionName);
    }
  }
  
  return {
    exists: missing.length === 0,
    missing
  };
}

/**
 * Output instructions for setting up collections
 */
export function getSetupInstructions(missingCollections: string[]): string {
  if (missingCollections.length === 0) {
    return "All required collections exist in Firestore.";
  }
  
  return `
  You need to create the following collections in Firebase Firestore:
  ${missingCollections.map(c => `- ${c}`).join('\n  ')}
  
  To create these collections:
  1. Go to the Firebase Console: https://console.firebase.google.com/
  2. Select your project
  3. Navigate to "Firestore Database"
  4. Click "Start collection" and enter each collection name
  5. Add a dummy document to each collection (you can delete it later)
  
  Alternatively, you can create them automatically the first time
  data is added to each collection.
  `;
}