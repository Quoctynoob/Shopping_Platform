// app/api/setup/route.ts
import { NextRequest, NextResponse } from "next/server";
import { checkRequiredCollections, getSetupInstructions } from "@/app/lib/firestoreSetup";

export async function GET(_request: NextRequest) {
  try {
    // Check if all required collections exist
    const { exists, missing } = await checkRequiredCollections();
    
    // If all collections exist, return success
    if (exists) {
      return NextResponse.json({
        status: "success",
        message: "All required collections exist in Firestore.",
        collections: {
          exists: true,
          missing: []
        }
      });
    }
    
    // If some collections are missing, return setup instructions
    return NextResponse.json({
      status: "setup_required",
      message: "Some required Firestore collections are missing.",
      collections: {
        exists: false,
        missing
      },
      instructions: getSetupInstructions(missing)
    });
    
  } catch (error) {
    console.error("Error checking Firestore setup:", error);
    
    return NextResponse.json({
      status: "error",
      message: "Error checking Firestore setup.",
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}