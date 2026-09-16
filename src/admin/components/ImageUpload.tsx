import React, { useState, useRef } from 'react';
import { UploadCloud, Trash2, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';
import { uploadImageToS3 } from '../lib/s3Service';

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  altText?: string;
  onAltChange?: (alt: string) => void;
  slug?: string;
  titleSuggestion?: string;
  folder?: 'blog-images' | 'package-images';
  label?: string;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  value,
  onChange,
  altText = '',
  onAltChange,
  slug = 'general',
  titleSuggestion = '',
  folder = 'blog-images',
  label = 'Featured Image',
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (file: File) => {
    setErrorMessage(null);
    setIsUploading(true);
    setUploadProgress(5);

    try {
      const result = await uploadImageToS3({
        file,
        folder,
        slug: slug || 'general',
        maxWidth: 1920,
        onProgress: (p) => setUploadProgress(p),
      });

      onChange(result.url);

      // Auto-suggest alt text if empty
      if (!altText && onAltChange) {
        onAltChange(titleSuggestion || file.name.replace(/\.[^/.]+$/, ''));
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to upload image to S3. Please retry.');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-zinc-300">
          {label}
        </label>
        {value && (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md">
            <CheckCircle2 size={12} /> Uploaded to S3
          </span>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleFileSelect(e.target.files[0]);
          }
        }}
      />

      {value ? (
        <div className="relative group rounded-2xl overflow-hidden border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900 shadow-sm">
          <div className="h-56 w-full relative overflow-hidden bg-zinc-950">
            <img src={value} alt={altText || 'Featured image'} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 bg-white text-gray-900 text-xs font-bold rounded-xl shadow-md hover:bg-gray-100 transition-all flex items-center gap-1.5"
              >
                <RefreshCw size={14} /> Replace
              </button>
              <button
                type="button"
                onClick={() => onChange('')}
                className="px-4 py-2 bg-rose-600 text-white text-xs font-bold rounded-xl shadow-md hover:bg-rose-700 transition-all flex items-center gap-1.5"
              >
                <Trash2 size={14} /> Remove
              </button>
            </div>
          </div>

          <div className="p-3 bg-white/70 dark:bg-zinc-900 text-[11px] text-gray-500 truncate border-t border-gray-100 dark:border-zinc-800">
            {value}
          </div>
        </div>
      ) : (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={onDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3 ${
            isDragging
              ? 'border-[#FF9933] bg-[#FF9933]/5'
              : 'border-gray-300 dark:border-zinc-700 hover:border-[#FF9933] bg-white/40 dark:bg-zinc-900/40'
          }`}
        >
          <div className="w-12 h-12 rounded-2xl bg-orange-100 dark:bg-orange-950/40 text-[#FF9933] flex items-center justify-center shadow-inner">
            {isUploading ? <RefreshCw size={22} className="animate-spin" /> : <UploadCloud size={24} />}
          </div>

          <div>
            <div className="text-sm font-bold text-gray-800 dark:text-zinc-200">
              {isUploading ? 'Uploading to AWS S3...' : 'Click or Drag & Drop Image Here'}
            </div>
            <p className="text-xs text-gray-400 mt-1">Supports JPG, PNG, WebP up to 5MB (auto-compressed)</p>
          </div>

          {isUploading && (
            <div className="w-full max-w-xs mt-2">
              <div className="w-full bg-gray-200 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-orange-500 to-[#FF9933] h-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <span className="text-[10px] font-semibold text-gray-500 mt-1 block">{uploadProgress}%</span>
            </div>
          )}
        </div>
      )}

      {/* Manual URL input option */}
      <div className="flex items-center gap-2 pt-1">
        <span className="text-[11px] font-bold text-gray-400 uppercase">Or direct URL:</span>
        <input
          type="url"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://..."
          className="flex-1 text-xs px-3 py-1.5 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-gray-800 dark:text-zinc-200 outline-none focus:ring-1 focus:ring-[#FF9933]"
        />
      </div>

      {/* Alt Text Field */}
      {onAltChange && (
        <div className="pt-1">
          <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1">
            Image Alt Text (SEO & Accessibility)
          </label>
          <input
            type="text"
            value={altText}
            onChange={(e) => onAltChange(e.target.value)}
            placeholder="e.g. Scenic mountain view of Reiek Peak in Mizoram"
            className="w-full text-xs px-3 py-2 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-gray-800 dark:text-zinc-200 outline-none focus:ring-1 focus:ring-[#FF9933]"
          />
        </div>
      )}

      {/* Error Alert */}
      {errorMessage && (
        <div className="flex items-center gap-2 p-3 bg-rose-50 dark:bg-rose-950/40 text-rose-600 rounded-xl text-xs font-medium border border-rose-200 dark:border-rose-900">
          <AlertCircle size={16} className="shrink-0" />
          <span className="flex-1">{errorMessage}</span>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="underline font-bold hover:text-rose-800"
          >
            Retry
          </button>
        </div>
      )}
    </div>
  );
};
