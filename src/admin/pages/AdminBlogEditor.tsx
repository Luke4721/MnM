import React, { useState, useEffect, useMemo } from 'react';
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
} from 'lucide-react';
import { RichTextEditor } from '../components/RichTextEditor';
import { ImageUpload } from '../components/ImageUpload';
import { generateSlug, blogFormSchema } from '../lib/blogValidation';
import type { BlogItem, BlogFormData } from '../../types/blogAdmin';
import { PageHeader } from '../components/ui/PageHeader';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input, Textarea } from '../components/ui/Input';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { useToast } from '../context/ToastContext';

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
        headers: { 'Content-Type': 'application/json' },
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
        {/* SECTION D: SEO & Meta Data */}
        {/* ============================================================== */}
        <Card className="p-6 md:p-8 space-y-4">
          <div className="border-b border-white/40 pb-3">
            <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-200/60">
              Section D
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
        {/* SECTION E: Related Blogs */}
        {/* ============================================================== */}
        <Card className="p-6 md:p-8 space-y-4">
          <div className="border-b border-white/40 pb-3 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-200/60">
                Section E
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
