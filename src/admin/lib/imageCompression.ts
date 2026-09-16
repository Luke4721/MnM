/**
 * Client-side image compression using HTML5 Canvas.
 * Resizes images down to a maximum width (e.g. 1920px for packages, 1400px for blogs),
 * maintaining aspect ratio and reducing upload bandwidth to AWS S3.
 */

export interface CompressionResult {
  file: File;
  originalSize: number;
  compressedSize: number;
  width: number;
  height: number;
  reductionPercentage: number;
}

export async function compressImage(
  file: File,
  maxWidth: number = 1920,
  maxHeight: number = 1920,
  quality: number = 0.85,
): Promise<CompressionResult> {
  const originalSize = file.size;

  // If already under 300KB and JPEG/WebP, return as-is
  if (originalSize < 300 * 1024 && (file.type === 'image/jpeg' || file.type === 'image/webp')) {
    return {
      file,
      originalSize,
      compressedSize: originalSize,
      width: 0,
      height: 0,
      reductionPercentage: 0,
    };
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      let { width, height } = img;

      // Calculate constrained dimensions
      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }
      if (height > maxHeight) {
        width = Math.round((width * maxHeight) / height);
        height = maxHeight;
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve({
          file,
          originalSize,
          compressedSize: originalSize,
          width: img.width,
          height: img.height,
          reductionPercentage: 0,
        });
        return;
      }

      // Smooth resizing
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, width, height);

      // Determine output MIME type (use webp if supported, or jpeg)
      const mimeType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve({
              file,
              originalSize,
              compressedSize: originalSize,
              width,
              height,
              reductionPercentage: 0,
            });
            return;
          }

          const compressedSize = blob.size;
          // If compressed is somehow larger than original, keep original
          if (compressedSize >= originalSize) {
            resolve({
              file,
              originalSize,
              compressedSize: originalSize,
              width: img.width,
              height: img.height,
              reductionPercentage: 0,
            });
            return;
          }

          const compressedFile = new File([blob], file.name, {
            type: mimeType,
            lastModified: Date.now(),
          });

          const reduction = Math.round(((originalSize - compressedSize) / originalSize) * 100);

          resolve({
            file: compressedFile,
            originalSize,
            compressedSize,
            width,
            height,
            reductionPercentage: reduction,
          });
        },
        mimeType,
        quality,
      );
    };

    img.onerror = (err) => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Failed to load image for compression: ' + err));
    };

    img.src = objectUrl;
  });
}
