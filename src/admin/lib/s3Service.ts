import type { S3UploadResult } from '../../types/blogAdmin';
import { compressImage } from './imageCompression';

export interface UploadOptions {
  file: File;
  folder: 'blog-images' | 'package-images';
  slug: string;
  maxWidth?: number;
  onProgress?: (progress: number) => void;
}

/**
 * Upload an image file to AWS S3 bucket via the serverless API endpoint.
 * Performs client-side image compression first, then uploads using XMLHttpRequest
 * to provide accurate real-time progress events.
 */
export async function uploadImageToS3({
  file,
  folder,
  slug,
  maxWidth = 1920,
  onProgress,
}: UploadOptions): Promise<S3UploadResult> {
  // Validate format
  const validMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!validMimes.includes(file.type.toLowerCase())) {
    throw new Error('Unsupported format. Please upload JPG, PNG, or WebP images only.');
  }

  // Validate size (max 5MB)
  const MAX_SIZE = 5 * 1024 * 1024;
  if (file.size > MAX_SIZE) {
    throw new Error('File size exceeds 5MB limit.');
  }

  // Report initial compression stage
  if (onProgress) onProgress(10);

  // Compress image before upload
  let uploadFile = file;
  try {
    const compression = await compressImage(file, maxWidth, maxWidth, 0.85);
    uploadFile = compression.file;
  } catch (compErr) {
    console.warn('[s3Service] Compression skipped due to error, proceeding with original:', compErr);
  }

  if (onProgress) onProgress(25);

  // Convert to Base64 to transmit cleanly through serverless endpoint
  const base64Data = await fileToBase64(uploadFile);

  if (onProgress) onProgress(40);

  return new Promise<S3UploadResult>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/api/admin/upload-image', true);
    xhr.setRequestHeader('Content-Type', 'application/json');

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        const percent = 40 + Math.round((event.loaded / event.total) * 55);
        onProgress(Math.min(95, percent));
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const res = JSON.parse(xhr.responseText);
          if (res.success && res.url) {
            if (onProgress) onProgress(100);
            resolve({
              url: res.url,
              key: res.key,
              fileName: res.fileName || uploadFile.name,
              size: uploadFile.size,
            });
          } else {
            reject(new Error(res.error || 'Server rejected the image upload'));
          }
        } catch (e: any) {
          reject(new Error('Invalid response from server: ' + e.message));
        }
      } else {
        try {
          const errRes = JSON.parse(xhr.responseText);
          reject(new Error(errRes.error || `Upload failed with status ${xhr.status}`));
        } catch {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      }
    };

    xhr.onerror = () => {
      reject(new Error('Network error occurred during image upload to S3'));
    };

    const payload = {
      folder,
      slug: slug || 'general',
      fileName: uploadFile.name,
      fileType: uploadFile.type,
      fileData: base64Data,
    };

    xhr.send(JSON.stringify(payload));
  });
}

/**
 * Delete an image from S3 bucket.
 */
export async function deleteImageFromS3(urlOrKey: string): Promise<boolean> {
  try {
    const res = await fetch('/api/admin/delete-image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ urlOrKey }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || 'Failed to delete image');
    }
    return true;
  } catch (err) {
    console.error('[s3Service] delete error:', err);
    return false;
  }
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // Strip metadata prefix (e.g. data:image/jpeg;base64,)
      const base64 = result.split(',')[1] || result;
      resolve(base64);
    };
    reader.onerror = (error) => reject(error);
  });
}
