import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  Star,
  Trash2,
  MoveUp,
  MoveDown,
  GripVertical,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { uploadImageToS3, deleteImageFromS3 } from '../lib/s3Service';
import type { PackageGalleryImage } from '../../types/blogAdmin';

interface PackageImageManagerProps {
  packageSlug: string;
  featuredImage: string;
  galleryImages: PackageGalleryImage[];
  onFeaturedChange: (url: string) => void;
  onGalleryChange: (images: PackageGalleryImage[]) => void;
}

interface UploadTask {
  id: string;
  name: string;
  progress: number;
  error?: string;
  file: File;
}

export const PackageImageManager: React.FC<PackageImageManagerProps> = ({
  packageSlug,
  featuredImage,
  galleryImages = [],
  onFeaturedChange,
  onGalleryChange,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadTasks, setUploadTasks] = useState<UploadTask[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Drag & drop reordering state
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handleFiles = async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const validFiles = fileArray.filter((f) =>
      ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(f.type.toLowerCase()),
    );

    if (validFiles.length === 0) {
      alert('Please upload valid images (JPG, PNG, or WebP).');
      return;
    }

    // Limit to max 10 gallery images
    if (galleryImages.length + validFiles.length > 10) {
      alert(`You can upload at most 10 images. Currently you have ${galleryImages.length} images.`);
    }

    const availableSlots = Math.max(0, 10 - galleryImages.length);
    const filesToUpload = validFiles.slice(0, availableSlots || validFiles.length);

    const newTasks: UploadTask[] = filesToUpload.map((file) => ({
      id: Math.random().toString(36).substring(7),
      name: file.name,
      progress: 5,
      file,
    }));

    setUploadTasks((prev) => [...prev, ...newTasks]);

    // Process uploads concurrently
    for (const task of newTasks) {
      try {
        const result = await uploadImageToS3({
          file: task.file,
          folder: 'package-images',
          slug: packageSlug || 'package',
          maxWidth: 1920,
          onProgress: (percent) => {
            setUploadTasks((prev) =>
              prev.map((t) => (t.id === task.id ? { ...t, progress: percent } : t)),
            );
          },
        });

        // Add to gallery
        const newImage: PackageGalleryImage = {
          url: result.url,
          alt: task.file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
          caption: '',
        };

        // If no featured image yet, set first uploaded as featured
        if (!featuredImage) {
          onFeaturedChange(result.url);
        }

        onGalleryChange([...galleryImages, newImage]);

        // Remove task on completion
        setTimeout(() => {
          setUploadTasks((prev) => prev.filter((t) => t.id !== task.id));
        }, 1000);
      } catch (err: any) {
        setUploadTasks((prev) =>
          prev.map((t) =>
            t.id === task.id ? { ...t, error: err.message || 'Upload failed' } : t,
          ),
        );
      }
    }
  };

  const retryUpload = async (task: UploadTask) => {
    setUploadTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, progress: 10, error: undefined } : t)),
    );

    try {
      const result = await uploadImageToS3({
        file: task.file,
        folder: 'package-images',
        slug: packageSlug || 'package',
        maxWidth: 1920,
        onProgress: (percent) => {
          setUploadTasks((prev) =>
            prev.map((t) => (t.id === task.id ? { ...t, progress: percent } : t)),
          );
        },
      });

      const newImage: PackageGalleryImage = {
        url: result.url,
        alt: task.file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
        caption: '',
      };

      if (!featuredImage) {
        onFeaturedChange(result.url);
      }

      onGalleryChange([...galleryImages, newImage]);

      setUploadTasks((prev) => prev.filter((t) => t.id !== task.id));
    } catch (err: any) {
      setUploadTasks((prev) =>
        prev.map((t) =>
          t.id === task.id ? { ...t, error: err.message || 'Retry failed' } : t,
        ),
      );
    }
  };

  const removeImage = async (index: number) => {
    const img = galleryImages[index];
    if (!img) return;

    if (window.confirm('Delete this image from package?')) {
      const updated = galleryImages.filter((_, i) => i !== index);
      onGalleryChange(updated);

      // If removed image was featured, pick next one or empty
      if (featuredImage === img.url) {
        onFeaturedChange(updated[0]?.url || '');
      }

      // Fire-and-forget deletion from S3
      deleteImageFromS3(img.url);
    }
  };

  const moveImage = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= galleryImages.length) return;

    const copy = [...galleryImages];
    const temp = copy[index];
    copy[index] = copy[targetIndex];
    copy[targetIndex] = temp;
    onGalleryChange(copy);
  };

  // Drag and drop sorting handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDropOnItem = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex) return;

    const copy = [...galleryImages];
    const draggedItem = copy[draggedIndex];
    copy.splice(draggedIndex, 1);
    copy.splice(targetIndex, 0, draggedItem);

    onGalleryChange(copy);
    setDraggedIndex(null);
  };

  const updateImageField = (
    index: number,
    field: 'alt' | 'caption',
    val: string,
  ) => {
    const updated = galleryImages.map((img, i) =>
      i === index ? { ...img, [field]: val } : img,
    );
    onGalleryChange(updated);
  };

  return (
    <div className="space-y-6">
      {/* Upload Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          if (e.dataTransfer.files) handleFiles(e.dataTransfer.files);
        }}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3 ${
          isDragging
            ? 'border-indigo-500 bg-indigo-500/5'
            : 'border-gray-300 dark:border-zinc-700 hover:border-indigo-500 bg-white/40 dark:bg-zinc-900/40'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => {
            if (e.target.files) handleFiles(e.target.files);
          }}
        />

        <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 flex items-center justify-center shadow-inner">
          <UploadCloud size={24} />
        </div>

        <div>
          <div className="text-sm font-bold text-gray-800 dark:text-zinc-200">
            Click or Drag & Drop Multiple Package Images Here
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Supports JPG, PNG, WebP up to 5MB (max 10 images, auto-compressed to 1920px)
          </p>
        </div>
      </div>

      {/* Uploading Tasks Progress */}
      {uploadTasks.length > 0 && (
        <div className="space-y-2">
          {uploadTasks.map((task) => (
            <div
              key={task.id}
              className="p-3 bg-white dark:bg-zinc-900 rounded-xl border border-gray-100 dark:border-zinc-800 shadow-sm flex items-center justify-between gap-4 text-xs"
            >
              <div className="truncate flex-1">
                <span className="font-semibold text-gray-800 dark:text-zinc-200">{task.name}</span>
                {task.error ? (
                  <span className="text-rose-600 ml-2 font-medium flex items-center gap-1 inline-flex">
                    <AlertCircle size={12} /> {task.error}
                  </span>
                ) : (
                  <div className="w-full bg-gray-200 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden mt-1.5">
                    <div
                      className="bg-indigo-600 h-full transition-all duration-300"
                      style={{ width: `${task.progress}%` }}
                    />
                  </div>
                )}
              </div>

              {task.error ? (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    retryUpload(task);
                  }}
                  className="px-2.5 py-1 bg-rose-100 text-rose-700 font-bold rounded-lg hover:bg-rose-200 flex items-center gap-1"
                >
                  <RefreshCw size={12} /> Retry
                </button>
              ) : (
                <span className="font-bold text-indigo-600">{task.progress}%</span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Featured Image Highlight Banner */}
      {featuredImage && (
        <div className="p-4 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-300/40 rounded-2xl flex flex-col sm:flex-row items-center gap-4">
          <div className="w-24 h-20 rounded-xl overflow-hidden shadow-md shrink-0 bg-zinc-950">
            <img src={featuredImage} alt="Main featured" className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider mb-1">
              <Star size={14} className="fill-amber-500 text-amber-500" /> Featured / Hero Image
            </div>
            <p className="text-xs text-gray-600 dark:text-zinc-300 line-clamp-1 truncate max-w-lg">
              {featuredImage}
            </p>
          </div>
          <span className="text-[11px] font-bold text-amber-600 bg-amber-100/80 px-2.5 py-1 rounded-full border border-amber-200">
            Active Main Cover
          </span>
        </div>
      )}

      {/* Gallery Images Grid */}
      {galleryImages.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-zinc-300">
              Gallery Images ({galleryImages.length}/10)
            </h4>
            <span className="text-[11px] text-gray-400">
              Drag handles or use arrows to reorder
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {galleryImages.map((img, index) => {
              const isFeatured = featuredImage === img.url;
              return (
                <div
                  key={img.url || index}
                  draggable
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDropOnItem(e, index)}
                  className={`bg-white dark:bg-zinc-900 border rounded-2xl p-3 shadow-sm transition-all flex flex-col justify-between gap-3 ${
                    isFeatured
                      ? 'border-amber-400 ring-2 ring-amber-400/20'
                      : 'border-gray-200 dark:border-zinc-800 hover:border-gray-300'
                  }`}
                >
                  <div className="flex gap-3 items-start">
                    {/* Reorder Grip & Arrows */}
                    <div className="flex flex-col items-center justify-center gap-1 text-gray-400 shrink-0 pt-1">
                      <div className="cursor-grab active:cursor-grabbing p-1 hover:text-gray-700">
                        <GripVertical size={16} />
                      </div>
                      <button
                        type="button"
                        disabled={index === 0}
                        onClick={() => moveImage(index, 'up')}
                        className="p-1 hover:text-gray-900 disabled:opacity-20 transition-opacity"
                        title="Move Up"
                      >
                        <MoveUp size={12} />
                      </button>
                      <button
                        type="button"
                        disabled={index === galleryImages.length - 1}
                        onClick={() => moveImage(index, 'down')}
                        className="p-1 hover:text-gray-900 disabled:opacity-20 transition-opacity"
                        title="Move Down"
                      >
                        <MoveDown size={12} />
                      </button>
                    </div>

                    {/* Thumbnail */}
                    <div className="w-24 h-24 rounded-xl overflow-hidden bg-zinc-950 shrink-0 relative group shadow-sm">
                      <img src={img.url} alt={img.alt || 'Gallery image'} className="w-full h-full object-cover" />
                      {isFeatured && (
                        <div className="absolute top-1 left-1 bg-amber-500 text-white p-1 rounded-md shadow">
                          <Star size={12} className="fill-white" />
                        </div>
                      )}
                    </div>

                    {/* Alt & Caption Input Fields */}
                    <div className="flex-1 space-y-2 text-xs">
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase mb-0.5">
                          Alt Text
                        </label>
                        <input
                          type="text"
                          value={img.alt}
                          onChange={(e) => updateImageField(index, 'alt', e.target.value)}
                          placeholder="Image description"
                          className="w-full px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-800/50 outline-none focus:ring-1 focus:ring-indigo-500 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase mb-0.5">
                          Caption (Optional)
                        </label>
                        <input
                          type="text"
                          value={img.caption || ''}
                          onChange={(e) => updateImageField(index, 'caption', e.target.value)}
                          placeholder="e.g. Sunset view over valley"
                          className="w-full px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-800/50 outline-none focus:ring-1 focus:ring-indigo-500 text-xs"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Actions Row */}
                  <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-zinc-800/80 text-xs">
                    {isFeatured ? (
                      <span className="text-amber-600 font-bold flex items-center gap-1">
                        <CheckCircle2 size={13} /> Main Featured
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onFeaturedChange(img.url)}
                        className="text-gray-600 dark:text-zinc-400 hover:text-amber-600 font-semibold flex items-center gap-1 transition-colors"
                      >
                        <Star size={13} /> Set as Featured
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="text-rose-500 hover:text-rose-700 font-semibold flex items-center gap-1 transition-colors"
                    >
                      <Trash2 size={13} /> Remove
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

