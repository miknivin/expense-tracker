// app/api/cloudinary-signature/route.ts
import { v2 as cloudinary } from "cloudinary";
import { NextResponse } from "next/server";

// Cloudinary auto-configures from CLOUDINARY_URL env var
cloudinary.config();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { timestamp } = body;

    if (!timestamp) {
      return NextResponse.json({ error: "Timestamp is required" }, { status: 400 });
    }

    // Parameters you want to allow and sign
    const paramsToSign = {
      timestamp,
      folder: "expenses/bills", // Organize in Cloudinary
      // Add more if needed: tags: "bill", resource_type: "auto", etc.
    };

    const signature = cloudinary.utils.api_sign_request(
      paramsToSign,
      process.env.CLOUDINARY_API_SECRET!
    );

    return NextResponse.json({
      signature,
      timestamp,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME!,
      apiKey: process.env.CLOUDINARY_API_KEY!,
    });
  } catch (error) {
    console.error("Signature error:", error);
    return NextResponse.json({ error: "Failed to generate signature" }, { status: 500 });
  }
}