// src/lib/cloudinaryUpload.ts
import { v2 as cloudinary } from "cloudinary";

/**
 * Uploads a bill (image or PDF) to Cloudinary and returns URLs.
 *
 * @param file - The File object from a form input (e.g., <input type="file" />)
 * @param folder - Optional subfolder (default: "expenses/bills")
 * @returns Object with original URL, preview URL, and public ID
 */
export async function uploadBillToCloudinary(
  file: File,
  folder: string = "expenses/bills"
) {
  // Validate file type (optional but recommended)
  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "application/pdf",
  ];
  if (!allowedTypes.includes(file.type)) {
    throw new Error("Only JPEG, PNG, WebP, and PDF files are allowed.");
  }

  // Convert File to Buffer (required for upload_stream)
  const buffer = Buffer.from(await file.arrayBuffer());

  // Upload to Cloudinary using stream (server-side only)
  const result = await new Promise<CloudinaryUploadResult>((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "auto", // "auto" detects image or PDF
        use_filename: true,
        unique_filename: false, // Keeps original filename (e.g., bill-dec25.pdf)
        overwrite: true,
      },
      (error, result) => {
        if (error) reject(error);
        else if (result) resolve(result as CloudinaryUploadResult);
      }
    );

    uploadStream.end(buffer);
  });

  // Return useful URLs
  return {
    originalUrl: result.secure_url,                    // Full file (image or PDF download)
    previewUrl: `${result.secure_url}.jpg`,            // Auto-generated page 1 thumbnail (works for images & PDFs)
    publicId: result.public_id,                        // For future delete/update if needed
    format: result.format,                             // "jpg", "png", "pdf", etc.
    pages: result.pages || 1,                          // Number of pages (for PDFs)
  };
}

// Type for Cloudinary upload result (only fields we care about)
type CloudinaryUploadResult = {
  secure_url: string;
  public_id: string;
  format: string;
  pages?: number;
};