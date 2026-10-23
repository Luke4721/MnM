import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Save,
  Eye,
  Lock,
  Unlock,
  Sparkles,
  Tag,
  Globe,
  BookOpen,
  HelpCircle,
  Plus,
  Trash2,
  Image as ImageIcon,
  MapPin,
  MoveUp,
  MoveDown,
  UploadCloud,
  CheckCircle2,
} from 'lucide-react';
import { RichTextEditor } from '../components/RichTextEditor';
import { ImageUpload } from '../components/ImageUpload';
import { uploadImageToS3 } from '../lib/s3Service';
import { generateSlug, blogFormSchema } from '../lib/blogValidation';
import type { BlogItem, BlogFormData } from '../../types/blogAdmin';
import { PageHeader } from '../components/ui/PageHeader';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input, Textarea } from '../components/ui/Input';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { useToast } from '../context/ToastContext';
import { getAdminToken } from '../auth';

export const AdminBlogEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isEditMode = Boolean(id);

  const [loading, setLoading] = useState(isEditMode);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [autoSlugLocked, setAutoSlugLocked] = useState(!isEditMode);
  const [allBlogsList, setAllBlogsList] = useState<BlogItem[]>([]);
  const [lastAutoSaved, setLastAutoSaved] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<BlogFormData>({
    title: '',
    slug: '',
    category: 'India',
    tags: [],
    publishedAt: new Date().toISOString().slice(0, 16),
    status: 'draft',
    featured: false,
    author: 'MNM Team',
    excerpt: '',
    content: '',
    featuredImage: '',
    imageAlt: '',
    seo: {
      title: '',
      description: '',
      keywords: '',
      ogImage: '',
    },
    relatedBlogIds: [],
    imageGallery: [],
    faqs: [],
  });

  const [tagInput, setTagInput] = useState('');

  // Fetch all blogs for the "Related Blogs" selector
  useEffect(() => {
    fetch('/api/admin/blogs?limit=1000')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.blogs)) {
          setAllBlogsList(data.blogs);
        }
      })
      .catch((err) => console.error('[AdminBlogEditor] Failed to fetch blog catalog:', err));
  }, []);

  // Fetch blog data if in edit mode
  useEffect(() => {
    if (isEditMode && id) {
      setLoading(true);
      fetch(`/api/admin/blogs?id=${id}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.blog) {
            const b: BlogItem = data.blog;
            setFormData({
              title: b.title || '',
              slug: b.slug || '',
              category: (b.category as any) || 'India',
              tags: Array.isArray(b.tags) ? b.tags : [],
              publishedAt: b.publishedAt
                ? b.publishedAt.slice(0, 16)
                : new Date().toISOString().slice(0, 16),
              status: b.status === 'published' ? 'published' : 'draft',
              featured: !!b.featured,
              author: b.author || 'MNM Team',
              excerpt: b.excerpt || '',
              content: b.content || '',
              featuredImage: b.featuredImage || b.image || '',
              imageAlt: b.imageAlt || b.title || '',
              seo: {
                title: b.seo?.title || '',
                description: b.seo?.description || '',
                keywords: b.seo?.keywords || '',
                ogImage: b.seo?.ogImage || '',
              },
              relatedBlogIds: Array.isArray(b.relatedBlogIds) ? b.relatedBlogIds : [],
              imageGallery: Array.isArray(b.imageGallery) ? b.imageGallery : [],
              faqs: Array.isArray(b.faqs) ? b.faqs : [],
            });
            setAutoSlugLocked(false);
          } else {
            toast.error('Blog not found');
            navigate('/admin/blogs');
          }
        })
        .catch((err) => {
          console.error('[AdminBlogEditor] Load error:', err);
          toast.error('Failed to load blog details');
        })
        .finally(() => setLoading(false));
    }
  }, [id, isEditMode, navigate, toast]);

  // Handle Title change -> auto-generate slug if locked
  const handleTitleChange = (val: string) => {
    setFormData((prev) => ({
      ...prev,
      title: val,
      slug: autoSlugLocked ? generateSlug(val) : prev.slug,
      imageAlt: prev.imageAlt || val,
      seo: {
        ...prev.seo,
        title: prev.seo.title || val,
      },
    }));
  };

  // Add / Remove Tags
  const handleAddTag = () => {
    const trimmed = tagInput.trim();
    if (trimmed && !formData.tags.includes(trimmed)) {
      setFormData((prev) => ({ ...prev, tags: [...prev.tags, trimmed] }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tagToRemove),
    }));
  };

  // Auto-save draft every 2 minutes
  useEffect(() => {
    const timer = setInterval(() => {
      if (formData.title.trim().length > 0) {
        try {
          const draftKey = `mnm_blog_draft_${id || 'new'}`;
          localStorage.setItem(draftKey, JSON.stringify(formData));
          const timeString = new Date().toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          });
          setLastAutoSaved(timeString);
        } catch {
          // ignore local storage failures
        }
      }
    }, 120000); // 2 minutes

    return () => clearInterval(timer);
  }, [formData, id]);

  const validate = (dataToValidate = formData): boolean => {
    console.log('[AdminBlogEditor] Validating form data:', dataToValidate);
    const result = blogFormSchema.safeParse(dataToValidate);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        const fullPath = issue.path.join('.');
        fieldErrors[fullPath] = issue.message;
        const rootKey = issue.path[0]?.toString() || 'form';
        if (!fieldErrors[rootKey]) {
          fieldErrors[rootKey] = issue.message;
        }
      });
      setErrors(fieldErrors);
      const firstError =
        result.error.issues[0]?.message || 'Please check required form fields.';
      toast.error(`Validation Error: ${firstError}`);
      console.warn('[AdminBlogEditor] Validation failed with issues:', result.error.issues);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return false;
    }
    setErrors({});
    return true;
  };

  const handleAddFaq = () => {
    setFormData((prev) => ({
      ...prev,
      faqs: [...(prev.faqs || []), { question: '', answer: '' }],
    }));
  };

  const handleUpdateFaq = (idx: number, field: 'question' | 'answer', val: string) => {
    setFormData((prev) => {
      const updated = [...(prev.faqs || [])];
      updated[idx] = { ...updated[idx], [field]: val };
      return { ...prev, faqs: updated };
    });
  };

  const handleRemoveFaq = (idx: number) => {
    setFormData((prev) => ({
      ...prev,
      faqs: (prev.faqs || []).filter((_, i) => i !== idx),
    }));
  };

  // Gallery handlers
  const [galleryUploadProgress, setGalleryUploadProgress] = useState<Record<string, number>>({});
  const [isUploadingGallery, setIsUploadingGallery] = useState(false);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const handleGalleryUpload = async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const validFiles = fileArray.filter((f) =>
      ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(f.type.toLowerCase()),
    );
    if (validFiles.length === 0) {
      toast.error('Please select valid images (JPG, PNG, WebP).');
      return;
    }

    setIsUploadingGallery(true);
    const slug = formData.slug || generateSlug(formData.title || 'blog');

    for (let i = 0; i < validFiles.length; i++) {
      const file = validFiles[i];
      const taskId = `${file.name}-${Date.now()}-${i}`;
      setGalleryUploadProgress((prev) => ({ ...prev, [taskId]: 5 }));

      try {
        const result = await uploadImageToS3({
          file,
          folder: 'blog-images',
          slug,
          maxWidth: 1920,
          onProgress: (p) => {
            setGalleryUploadProgress((prev) => ({ ...prev, [taskId]: p }));
          },
        });

        // Derive auto location / alt suggestion from file name
        const baseName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');

        setFormData((prev) => ({
          ...prev,
          imageGallery: [
            ...(prev.imageGallery || []),
            {
              url: result.url,
              location: baseName,
              alt: baseName || prev.title,
            },
          ],
        }));

        setGalleryUploadProgress((prev) => {
          const next = { ...prev };
          delete next[taskId];
          return next;
        });
      } catch (err: any) {
        toast.error(`Failed to upload ${file.name}: ${err.message}`);
      }
    }

    setIsUploadingGallery(false);
    toast.success('Gallery images uploaded to S3 successfully!');
  };

  const handleUpdateGalleryImage = (
    index: number,
    field: 'location' | 'alt' | 'url',
    value: string,
  ) => {
    setFormData((prev) => {
      const updated = [...(prev.imageGallery || [])];
      if (field === 'location') {
        // Auto-populate alt text based on Location Name for accessibility
        updated[index] = {
          ...updated[index],
          location: value,
          alt: value ? value : prev.title,
        };
      } else {
        updated[index] = {
          ...updated[index],
          [field]: value,
        };
      }
      return { ...prev, imageGallery: updated };
    });
  };

  const handleMoveGalleryImage = (fromIndex: number, toIndex: number) => {
    setFormData((prev) => {
      const gallery = [...(prev.imageGallery || [])];
      if (toIndex < 0 || toIndex >= gallery.length) return prev;
      const [moved] = gallery.splice(fromIndex, 1);
      gallery.splice(toIndex, 0, moved);
      return { ...prev, imageGallery: gallery };
    });
  };

  const handleRemoveGalleryImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      imageGallery: (prev.imageGallery || []).filter((_, idx) => idx !== index),
    }));
  };

  const handleSubmit = async (overrideStatus?: 'draft' | 'published') => {
    const currentStatus = overrideStatus || formData.status;
    console.log('[AdminBlogEditor] handleSubmit invoked with status:', currentStatus);

    const submissionData = {
      ...formData,
      status: currentStatus,
      // Auto-fallback slug if empty
      slug: (formData.slug || generateSlug(formData.title || 'travel-journal')).trim(),
      // Fallback featured image if empty when publishing
      featuredImage:
        formData.featuredImage ||
        (currentStatus === 'published' ? '/images/blog_image_1.jpg' : ''),
    };

    console.log('[AdminBlogEditor] Prepared submission payload:', submissionData);

    if (!validate(submissionData)) {
      console.warn('[AdminBlogEditor] Form validation failed. Halting submission.');
      return;
    }

    setIsSaving(true);
    try {
      const url = isEditMode ? `/api/admin/blogs?id=${id}` : '/api/admin/blogs';
      const method = isEditMode ? 'PUT' : 'POST';

      console.log(`[AdminBlogEditor] Sending ${method} to ${url}...`);

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': getAdminToken(),
        },
        body: JSON.stringify({
          ...submissionData,
          id,
        }),
      });

      const data = await res.json();
      console.log('[AdminBlogEditor] Received server response:', data);

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to save blog');
      }

      toast.success(
        isEditMode
          ? currentStatus === 'published'
            ? 'Blog updated and published successfully!'
            : 'Draft updated successfully!'
          : currentStatus === 'published'
          ? 'Blog created and published successfully!'
          : 'Draft saved successfully!'
      );

      try {
        localStorage.removeItem(`mnm_blog_draft_${id || 'new'}`);
      } catch {}

      setTimeout(() => {
        navigate('/admin/blogs');
      }, 800);
    } catch (err: any) {
      console.error('[AdminBlogEditor] Error during submit:', err);
      toast.error('Error saving blog: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  // Auto-suggest related blogs
  const suggestedBlogs = useMemo(() => {
    return allBlogsList
      .filter((b) => b.id !== id && b.category === formData.category)
      .slice(0, 10);
  }, [allBlogsList, id, formData.category]);

  const toggleRelatedBlog = (blogId: string) => {
    setFormData((prev) => {
      const current = prev.relatedBlogIds;
      if (current.includes(blogId)) {
        return { ...prev, relatedBlogIds: current.filter((x) => x !== blogId) };
      }
      if (current.length >= 4) {
        toast.info('You can select a maximum of 4 related blogs.');
        return prev;
      }
      return { ...prev, relatedBlogIds: [...current, blogId] };
    });
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto p-16 text-center text-gray-500">
        <LoadingSpinner size="lg" variant="primary" className="mx-auto mb-3" />
        <p className="text-[13px] font-medium">Loading blog editor data...</p>
      </div>
    );
  }

  return (
    <div className="max-w-[1100px] mx-auto space-y-8 pb-32">
      {/* Top Header & Quick Actions */}
      <PageHeader
        title={isEditMode ? 'Edit Blog Post' : 'Create New Blog Post'}
        description={`Status: ${formData.status.toUpperCase()} ${
          lastAutoSaved ? `• Auto-saved at ${lastAutoSaved}` : ''
        }`}
        breadcrumbs={[
          { label: 'Management', href: '/admin/blogs' },
          { label: 'Blogs', href: '/admin/blogs' },
          { label: isEditMode ? 'Edit' : 'Create' },
        ]}
        actions={
          <>
            {formData.slug && (
              <Button
                variant="secondary"
                size="sm"
                iconLeft={<Eye size={14} />}
                onClick={() =>
                  window.open(
                    `/blog/${formData.slug}`,
                    '_blank',
                    'noopener,noreferrer'
                  )
                }
              >
                Preview
              </Button>
            )}

            <Button
              variant="secondary"
              size="sm"
              disabled={isSaving}
              onClick={() => handleSubmit('draft')}
            >
              Save Draft
            </Button>

            <Button
              variant="primary"
              size="sm"
              loading={isSaving}
              iconLeft={<Save size={14} />}
              onClick={() => handleSubmit('published')}
            >
              Publish Blog
            </Button>
          </>
        }
      />

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
        className="space-y-8"
      >
        {/* ============================================================== */}
        {/* SECTION A: Basic Information */}
        {/* ============================================================== */}
        <Card className="p-6 md:p-8 space-y-6">
          <div className="border-b border-white/40 pb-3">
            <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-200/60">
              Section A
            </span>
            <h2 className="text-lg font-bold text-gray-900 mt-2">
              Basic Information
            </h2>
          </div>

          <div className="space-y-5">
            {/* Title */}
            <Input
              label="Blog Title"
              required
              value={formData.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="e.g. 10 Spectacular Hidden Treks in Northeast India"
              error={errors.title}
            />

            {/* Slug */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[12px] font-semibold text-gray-700 tracking-wide">
                  URL Slug <span className="text-rose-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setAutoSlugLocked(!autoSlugLocked)}
                  className="text-[11px] text-gray-500 hover:text-indigo-600 flex items-center gap-1 font-medium"
                >
                  {autoSlugLocked ? (
                    <>
                      <Lock size={12} /> Auto-generating from title
                    </>
                  ) : (
                    <>
                      <Unlock size={12} /> Custom editable slug
                    </>
                  )}
                </button>
              </div>
              <div className="flex items-center rounded-xl border border-white/60 bg-white/60 px-3.5 py-2 text-xs text-gray-400 shadow-sm focus-within:bg-white/95 focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-500/20">
                <span className="font-mono text-gray-500">
                  https://www.mnmtravels.com/blog/
                </span>
                <input
                  type="text"
                  required
                  readOnly={autoSlugLocked}
                  value={formData.slug}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      slug: generateSlug(e.target.value),
                    }))
                  }
                  className="flex-1 bg-transparent text-gray-900 font-mono font-bold outline-none pl-1"
                />
              </div>
              {errors.slug && (
                <p className="text-[11px] text-rose-500 font-medium mt-1">
                  {errors.slug}
                </p>
              )}
            </div>

            {/* Category & Status & Publish Date & Author */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-1">
              <div>
                <label className="block text-[12px] font-semibold text-gray-700 tracking-wide mb-1.5">
                  Category <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      category: e.target.value as any,
                    }))
                  }
                  className="w-full px-3.5 py-2 text-[13px] font-semibold border border-white/60 rounded-xl bg-white/60 text-gray-900 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 shadow-sm outline-none"
                >
                  <option value="India">India</option>
                  <option value="International">International</option>
                </select>
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-gray-700 tracking-wide mb-1.5">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      status: e.target.value as any,
                    }))
                  }
                  className="w-full px-3.5 py-2 text-[13px] font-semibold border border-white/60 rounded-xl bg-white/60 text-gray-900 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 shadow-sm outline-none"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-gray-700 tracking-wide mb-1.5">
                  Publish Date
                </label>
                <input
                  type="datetime-local"
                  value={formData.publishedAt}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      publishedAt: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 text-[13px] border border-white/60 rounded-xl bg-white/60 text-gray-900 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 shadow-sm outline-none"
                />
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-gray-700 tracking-wide mb-1.5">
                  Author
                </label>
                <input
                  type="text"
                  value={formData.author}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      author: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 text-[13px] border border-white/60 rounded-xl bg-white/60 text-gray-900 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 shadow-sm outline-none"
                />
              </div>
            </div>

            {/* Homepage feature toggle */}
            <div className="pt-2 flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={formData.featured}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      featured: e.target.checked,
                    }))
                  }
                  className="w-4 h-4 text-[#FF9933] rounded focus:ring-[#FF9933] cursor-pointer"
                />
                <span className="text-[13px] font-semibold text-gray-800 flex items-center gap-1.5">
                  <Sparkles size={14} className="text-[#FF9933]" /> Display in
                  Homepage Featured Stories
                </span>
              </label>
            </div>

            {/* Excerpt */}
            <Textarea
              label="Short Excerpt / Summary"
              showCount
              maxLength={2000}
              value={formData.excerpt}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, excerpt: e.target.value }))
              }
              rows={3}
              placeholder="A compelling 1-2 sentence teaser for cards and preview snippets..."
              error={errors.excerpt}
            />

            {/* Tags */}
            <div>
              <label className="block text-[12px] font-semibold text-gray-700 tracking-wide mb-1.5 flex items-center gap-1.5">
                <Tag size={13} /> Tags
              </label>
              <div className="flex items-center gap-2 mb-2.5">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                  placeholder="Type tag and press Add or Enter..."
                  className="flex-1 px-3.5 py-2 text-[13px] border border-white/60 rounded-xl bg-white/60 text-gray-900 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 shadow-sm outline-none"
                />
                <Button variant="secondary" size="md" onClick={handleAddTag}>
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {formData.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-50 text-indigo-700 text-xs font-semibold rounded-lg border border-indigo-200/60 shadow-sm"
                  >
                    #{tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="text-indigo-400 hover:text-indigo-700 ml-1 text-xs"
                      aria-label={`Remove tag ${tag}`}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* ============================================================== */}
        {/* SECTION B: Content Editor */}
        {/* ============================================================== */}
        <Card className="p-6 md:p-8 space-y-4">
          <div className="border-b border-white/40 pb-3">
            <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-200/60">
              Section B
            </span>
            <h2 className="text-lg font-bold text-gray-900 mt-2">
              Article Content <span className="text-rose-500">*</span>
            </h2>
          </div>

          <RichTextEditor
            value={formData.content}
            onChange={(html) =>
              setFormData((prev) => ({ ...prev, content: html }))
            }
            minHeight="420px"
          />
          {errors.content && (
            <p className="text-[11px] text-rose-500 font-medium mt-1">
              {errors.content}
            </p>
          )}
        </Card>

        {/* ============================================================== */}
        {/* SECTION C: Featured Image Upload (AWS S3) */}
        {/* ============================================================== */}
        <Card className="p-6 md:p-8 space-y-4">
          <div className="border-b border-white/40 pb-3">
            <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-200/60">
              Section C
            </span>
            <h2 className="text-lg font-bold text-gray-900 mt-2">
              Featured Image (AWS S3)
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Bucket: <code className="text-indigo-600 font-mono">mnm-travels-images-105943719409-ap-south-1-an</code> (ap-south-1)
            </p>
          </div>

          <ImageUpload
            value={formData.featuredImage}
            onChange={(url) =>
              setFormData((prev) => ({ ...prev, featuredImage: url }))
            }
            altText={formData.imageAlt}
            onAltChange={(alt) =>
              setFormData((prev) => ({ ...prev, imageAlt: alt }))
            }
            slug={formData.slug}
            titleSuggestion={formData.title}
            folder="blog-images"
            label="Main Featured Image"
          />
          {errors.featuredImage && (
            <p className="text-[11px] text-rose-500 font-medium mt-1">
              {errors.featuredImage}
            </p>
          )}
        </Card>

        {/* ============================================================== */}
        {/* SECTION D: Blog Image Gallery (Interactive Slideshow) */}
        {/* ============================================================== */}
        <Card className="p-6 md:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-white/40 pb-4 gap-3">
            <div>
              <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-200/60">
                Section D
              </span>
              <h2 className="text-lg font-bold text-gray-900 mt-2 flex items-center gap-2">
                <ImageIcon size={18} className="text-indigo-600" /> Blog Image Gallery (with Locations)
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Upload photos with destination or landmark location names for the interactive hero slideshow.
              </p>
            </div>
            <div>
              <input
                ref={galleryInputRef}
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    handleGalleryUpload(e.target.files);
                    e.target.value = '';
                  }
                }}
              />
              <Button
                type="button"
                variant="secondary"
                size="sm"
                loading={isUploadingGallery}
                iconLeft={<UploadCloud size={14} />}
                onClick={() => galleryInputRef.current?.click()}
              >
                Upload Gallery Images
              </Button>
            </div>
          </div>

          {/* Upload Progress Bar if active */}
          {Object.keys(galleryUploadProgress).length > 0 && (
            <div className="p-4 bg-indigo-50/70 rounded-xl border border-indigo-100 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-indigo-900">
                <span>Uploading {Object.keys(galleryUploadProgress).length} image(s) to S3...</span>
                <span>In Progress</span>
              </div>
              <div className="w-full bg-indigo-200/50 rounded-full h-1.5 overflow-hidden">
                <div className="bg-indigo-600 h-full rounded-full animate-pulse w-3/4"></div>
              </div>
            </div>
          )}

          {(!formData.imageGallery || formData.imageGallery.length === 0) ? (
            <div
              onClick={() => galleryInputRef.current?.click()}
              className="text-center py-10 border-2 border-dashed border-gray-200 hover:border-indigo-400 rounded-2xl bg-gray-50/40 hover:bg-indigo-50/20 transition-all cursor-pointer group"
            >
              <UploadCloud size={32} className="mx-auto text-gray-400 group-hover:text-indigo-600 mb-2 transition-colors" />
              <p className="text-sm font-bold text-gray-700 group-hover:text-indigo-900">
                Click to upload multiple gallery images
              </p>
              <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
                Upload photos with location tags to enable the animated hero slideshow on the published blog.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-gray-500 font-medium">
                <span>Total Photos: {formData.imageGallery.length} (use arrow buttons to reorder)</span>
                <span className="text-indigo-600 font-semibold flex items-center gap-1">
                  <CheckCircle2 size={13} /> Alt text auto-synced with Location Name
                </span>
              </div>

              <div className="space-y-3">
                {formData.imageGallery.map((img, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-white/70 rounded-2xl border border-gray-200/80 shadow-sm flex flex-col md:flex-row items-start md:items-center gap-4 group"
                  >
                    {/* Thumbnail */}
                    <div className="w-24 h-20 sm:w-28 sm:h-20 rounded-xl overflow-hidden bg-zinc-950 shrink-0 border border-gray-200 relative group/thumb">
                      <img
                        src={img.url}
                        alt={img.alt || img.location || 'Gallery image'}
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-black/70 text-white font-mono text-[9px]">
                        #{idx + 1}
                      </span>
                    </div>

                    {/* Location Name & Accessibility Alt Text */}
                    <div className="flex-1 w-full space-y-2">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-[12px] font-semibold text-gray-700 flex items-center gap-1">
                            <MapPin size={13} className="text-[#FF9933]" /> Location Name
                          </label>
                          <span className="text-[10px] text-gray-400 font-medium">
                            Displayed on hero badge
                          </span>
                        </div>
                        <input
                          type="text"
                          value={img.location}
                          onChange={(e) => handleUpdateGalleryImage(idx, 'location', e.target.value)}
                          placeholder="e.g. Hadimba Devi Temple, Manali"
                          className="w-full px-3.5 py-2 text-[13px] font-medium border border-gray-200 rounded-xl bg-gray-50/50 text-gray-900 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 shadow-sm outline-none"
                        />
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-[11px] text-gray-500">
                        <span className="font-semibold text-gray-600">SEO Alt Text:</span>
                        <span className="font-mono text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100 truncate max-w-md">
                          {img.alt || img.location || formData.title || 'Travel Photo'}
                        </span>
                      </div>
                    </div>

                    {/* Action Controls: Move Up, Move Down, Delete */}
                    <div className="flex items-center gap-1.5 self-end md:self-center shrink-0">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => handleMoveGalleryImage(idx, idx - 1)}
                        className="p-2 rounded-xl text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 disabled:opacity-30 disabled:pointer-events-none transition-colors border border-gray-200"
                        title="Move Up"
                        aria-label="Move Up"
                      >
                        <MoveUp size={15} />
                      </button>
                      <button
                        type="button"
                        disabled={!formData.imageGallery || idx === formData.imageGallery.length - 1}
                        onClick={() => handleMoveGalleryImage(idx, idx + 1)}
                        className="p-2 rounded-xl text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 disabled:opacity-30 disabled:pointer-events-none transition-colors border border-gray-200"
                        title="Move Down"
                        aria-label="Move Down"
                      >
                        <MoveDown size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveGalleryImage(idx)}
                        className="p-2 rounded-xl text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors border border-gray-200"
                        title="Remove Image"
                        aria-label="Remove Image"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>

        {/* ============================================================== */}
        {/* SECTION E: SEO & Meta Data */}
        {/* ============================================================== */}
        <Card className="p-6 md:p-8 space-y-4">
          <div className="border-b border-white/40 pb-3">
            <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-200/60">
              Section E
            </span>
            <h2 className="text-lg font-bold text-gray-900 mt-2 flex items-center gap-2">
              <Globe size={18} className="text-indigo-600" /> Search Engine Optimization (SEO)
            </h2>
          </div>

          <div className="space-y-4">
            {/* Meta Title */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[12px] font-semibold text-gray-700 tracking-wide">
                  Meta Title
                </label>
                <span className="text-[10px] font-mono text-gray-400">
                  {formData.seo.title.length} chars (approx 60-70 recommended)
                </span>
              </div>
              <input
                type="text"
                value={formData.seo.title}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    seo: { ...prev.seo, title: e.target.value },
                  }))
                }
                placeholder="e.g. Travel Guide to Reiek Peak, Mizoram | Monks & Monkeys Travels"
                className="w-full px-3.5 py-2 text-[13px] border border-white/60 rounded-xl bg-white/60 text-gray-900 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 shadow-sm outline-none"
              />
              {errors['seo.title'] && (
                <p className="text-[11px] text-rose-500 font-medium mt-1">
                  {errors['seo.title']}
                </p>
              )}
            </div>

            {/* Meta Description */}
            <div>
              <Textarea
                label="Meta Description"
                showCount
                maxLength={1000}
                value={formData.seo.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    seo: { ...prev.seo, description: e.target.value },
                  }))
                }
                rows={2}
                placeholder="Concise, high-impact summary displayed in Google search results..."
                error={errors['seo.description']}
              />
            </div>

            {/* Meta Keywords */}
            <Input
              label="Meta Keywords (comma-separated)"
              value={formData.seo.keywords}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  seo: { ...prev.seo, keywords: e.target.value },
                }))
              }
              placeholder="e.g. Mizoram Tourism, Reiek Peak, Trekking in Northeast India, Travel Guide"
            />
          </div>
        </Card>

        {/* ============================================================== */}
        {/* SECTION F: Related Blogs */}
        {/* ============================================================== */}
        <Card className="p-6 md:p-8 space-y-4">
          <div className="border-b border-white/40 pb-3 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-200/60">
                Section F
              </span>
              <h2 className="text-lg font-bold text-gray-900 mt-2 flex items-center gap-2">
                <BookOpen size={18} className="text-indigo-600" /> Related Blogs
              </h2>
            </div>
            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-200/60">
              Selected: {formData.relatedBlogIds.length}/4
            </span>
          </div>

          <p className="text-xs text-gray-500">
            Pick 3 to 4 related articles to feature at the bottom of this blog.
            Suggested posts from the same category are shown below:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-72 overflow-y-auto p-1">
            {suggestedBlogs.map((rel) => {
              const isSelected = formData.relatedBlogIds.includes(rel.id);
              return (
                <div
                  key={rel.id}
                  onClick={() => toggleRelatedBlog(rel.id)}
                  className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-center gap-3 ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/70 shadow-sm'
                      : 'border-white/60 hover:border-white/90 bg-white/50 hover:bg-white/70'
                  }`}
                >
                  <div className="w-12 h-10 rounded-lg overflow-hidden bg-gray-100 shrink-0 border border-white/80">
                    <img
                      src={
                        rel.featuredImage || rel.image || '/images/default-blog.jpg'
                      }
                      alt={rel.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="truncate flex-1">
                    <div className="font-bold text-xs text-gray-900 truncate">
                      {rel.title}
                    </div>
                    <span className="text-[10px] text-gray-500 font-medium">
                      {rel.category}
                    </span>
                  </div>
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-600 text-white'
                        : 'border-gray-300'
                    }`}
                  >
                    {isSelected && (
                      <span className="text-[10px] font-black leading-none">✓</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* ============================================================== */}
        {/* SECTION G: Frequently Asked Questions (FAQPage Schema) */}
        {/* ============================================================== */}
        <Card className="p-6 md:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-white/40 pb-3">
            <div>
              <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-200/60">
                Section G
              </span>
              <h2 className="text-lg font-bold text-gray-900 mt-2">
                Frequently Asked Questions (FAQ)
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Included in page body and indexed by Google as FAQPage JSON-LD rich snippets.
              </p>
            </div>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              iconLeft={<Plus size={14} />}
              onClick={handleAddFaq}
            >
              Add FAQ
            </Button>
          </div>

          {(!formData.faqs || formData.faqs.length === 0) ? (
            <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-xl">
              <HelpCircle size={28} className="mx-auto text-gray-400 mb-2" />
              <p className="text-sm font-medium text-gray-600">No FAQs added yet</p>
              <p className="text-xs text-gray-400 mt-1">
                Click "Add FAQ" to provide questions and answers for readers and Google search snippets.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {formData.faqs.map((faq, idx) => (
                <div
                  key={idx}
                  className="p-4 bg-gray-50/70 rounded-xl border border-gray-200/80 space-y-3 relative group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                      FAQ #{idx + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveFaq(idx)}
                      className="text-gray-400 hover:text-rose-600 transition-colors p-1"
                      title="Remove FAQ"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                  <Input
                    label="Question"
                    value={faq.question}
                    onChange={(e) => handleUpdateFaq(idx, 'question', e.target.value)}
                    placeholder="e.g. What are the visiting hours?"
                  />
                  <Textarea
                    label="Answer"
                    rows={2}
                    value={faq.answer}
                    onChange={(e) => handleUpdateFaq(idx, 'answer', e.target.value)}
                    placeholder="Provide a clear, direct answer..."
                  />
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Bottom Save Bar */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/admin/blogs')}
          >
            Discard
          </Button>
          <Button
            variant="secondary"
            disabled={isSaving}
            onClick={() => handleSubmit('draft')}
          >
            Save as Draft
          </Button>
          <Button
            variant="primary"
            loading={isSaving}
            iconLeft={<Save size={14} />}
            onClick={() => handleSubmit('published')}
          >
            Publish Blog
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AdminBlogEditor;
