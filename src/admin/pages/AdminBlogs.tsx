import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Star,
  CheckCircle2,
  FileText,
  Layers,
  Sparkles,
} from 'lucide-react';
import type { BlogItem } from '../../types/blogAdmin';
import { PageHeader } from '../components/ui/PageHeader';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { ConfirmModal } from '../components/ui/Modal';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { useToast } from '../context/ToastContext';

const PAGE_SIZE = 20;

export const AdminBlogs: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [blogs, setBlogs] = useState<BlogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'India' | 'International'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [currentPage, setCurrentPage] = useState(1);

  // Selection for bulk actions
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [deleteModalId, setDeleteModalId] = useState<string | null>(null);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/blogs?limit=1000');
      if (!res.ok) throw new Error('Failed to fetch blogs');
      const data = await res.json();
      if (data.success && Array.isArray(data.blogs)) {
        setBlogs(data.blogs);
      }
    } catch (err: any) {
      console.error('[AdminBlogs] Error loading blogs:', err);
      toast.error('Failed to load blogs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  // Filtered blogs
  const filteredBlogs = useMemo(() => {
    const q = search.toLowerCase().trim();
    return blogs.filter((blog) => {
      if (statusFilter !== 'all' && blog.status !== statusFilter) return false;
      if (
        categoryFilter !== 'all' &&
        blog.category?.toLowerCase() !== categoryFilter.toLowerCase()
      )
        return false;
      if (q) {
        const matchTitle = blog.title?.toLowerCase().includes(q);
        const matchCat = blog.category?.toLowerCase().includes(q);
        const matchSlug = blog.slug?.toLowerCase().includes(q);
        const matchExcerpt = blog.excerpt?.toLowerCase().includes(q);
        if (!matchTitle && !matchCat && !matchSlug && !matchExcerpt) return false;
      }
      return true;
    });
  }, [blogs, search, categoryFilter, statusFilter]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredBlogs.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedBlogs = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return filteredBlogs.slice(start, start + PAGE_SIZE);
  }, [filteredBlogs, safePage]);

  // Bulk selection helpers
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(paginatedBlogs.map((b) => b.id));
    } else {
      setSelectedIds([]);
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const isAllSelected =
    paginatedBlogs.length > 0 &&
    paginatedBlogs.every((b) => selectedIds.includes(b.id));

  // Single Delete
  const confirmSingleDelete = async () => {
    if (!deleteModalId) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/blogs?id=${deleteModalId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete blog');
      setBlogs((prev) => prev.filter((b) => b.id !== deleteModalId));
      setSelectedIds((prev) => prev.filter((id) => id !== deleteModalId));
      setDeleteModalId(null);
      toast.success('Blog successfully deleted');
    } catch (err: any) {
      toast.error('Error deleting blog: ' + err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  // Bulk Delete
  const confirmBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    setIsDeleting(true);
    try {
      const res = await fetch('/api/admin/blogs', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedIds }),
      });
      if (!res.ok) throw new Error('Failed to bulk delete');
      setBlogs((prev) => prev.filter((b) => !selectedIds.includes(b.id)));
      toast.success(`${selectedIds.length} blogs successfully deleted`);
      setSelectedIds([]);
      setIsBulkDeleteModalOpen(false);
    } catch (err: any) {
      toast.error('Error in bulk delete: ' + err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  // Metrics
  const totalCount = blogs.length;
  const publishedCount = blogs.filter((b) => b.status === 'published').length;
  const draftCount = blogs.filter((b) => b.status === 'draft').length;
  const featuredCount = blogs.filter((b) => b.featured).length;

  return (
    <div className="max-w-[1240px] mx-auto space-y-6 pb-20">
      {/* Page Header */}
      <PageHeader
        title="Blog Management"
        description="Create, publish, edit, and organize travel journal stories across India and International destinations."
        breadcrumbs={[
          { label: 'Management', href: '/admin/blogs' },
          { label: 'Blogs', href: '/admin/blogs' },
        ]}
        actions={
          <Button
            variant="primary"
            iconLeft={<Plus size={16} />}
            onClick={() => navigate('/admin/blogs/create')}
          >
            Create New Blog
          </Button>
        }
      />

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card hoverable className="p-4">
          <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <FileText size={14} className="text-indigo-500" /> Total Blogs
          </div>
          <div className="text-2xl font-black text-gray-900">{totalCount}</div>
        </Card>

        <Card hoverable className="p-4">
          <div className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <CheckCircle2 size={14} /> Published
          </div>
          <div className="text-2xl font-black text-gray-900">{publishedCount}</div>
        </Card>

        <Card hoverable className="p-4">
          <div className="text-[11px] font-bold text-amber-600 uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <Layers size={14} /> Drafts
          </div>
          <div className="text-2xl font-black text-gray-900">{draftCount}</div>
        </Card>

        <Card hoverable className="p-4">
          <div className="text-[11px] font-bold text-[#FF9933] uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <Sparkles size={14} /> Featured
          </div>
          <div className="text-2xl font-black text-gray-900">{featuredCount}</div>
        </Card>
      </div>

      {/* Main Table Card */}
      <Card>
        {/* Toolbar: Search & Filters */}
        <div className="p-4 border-b border-white/40 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search */}
          <div className="w-full md:w-80">
            <Input
              placeholder="Search by title, category, slug..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              iconLeft={<Search size={15} />}
            />
          </div>

          {/* Filters & Bulk Actions */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value as any);
                setCurrentPage(1);
              }}
              aria-label="Filter by category"
              className="text-[13px] px-3.5 py-2 border border-white/60 rounded-xl bg-white/60 font-medium text-gray-700 outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 shadow-sm"
            >
              <option value="all">All Categories</option>
              <option value="India">India</option>
              <option value="International">International</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as any);
                setCurrentPage(1);
              }}
              aria-label="Filter by status"
              className="text-[13px] px-3.5 py-2 border border-white/60 rounded-xl bg-white/60 font-medium text-gray-700 outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 shadow-sm"
            >
              <option value="all">All Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>

            {/* Bulk Delete Trigger */}
            {selectedIds.length > 0 && (
              <Button
                variant="danger"
                size="sm"
                iconLeft={<Trash2 size={14} />}
                onClick={() => setIsBulkDeleteModalOpen(true)}
              >
                Delete Selected ({selectedIds.length})
              </Button>
            )}
          </div>
        </div>

        {/* Table View */}
        <div className="overflow-x-auto" data-lenis-prevent>
          {loading ? (
            <div className="p-16 text-center text-gray-500 text-xs">
              <LoadingSpinner size="lg" variant="primary" className="mx-auto mb-3" />
              <p className="text-[13px] font-medium">Loading blogs collection...</p>
            </div>
          ) : paginatedBlogs.length === 0 ? (
            <div className="p-16 text-center text-gray-500 text-xs">
              No blogs match your filter criteria.
            </div>
          ) : (
            <table className="w-full text-left text-[13px] text-gray-700">
              <thead className="bg-white/40 border-b border-white/60 uppercase font-bold text-gray-500 text-[10px] tracking-wider">
                <tr>
                  <th className="px-4 py-3.5 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      onChange={handleSelectAll}
                      aria-label="Select all blogs on this page"
                      className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500/30 cursor-pointer"
                    />
                  </th>
                  <th className="px-4 py-3.5">Thumbnail</th>
                  <th className="px-4 py-3.5">Title & Excerpt</th>
                  <th className="px-4 py-3.5">Category</th>
                  <th className="px-4 py-3.5">Date</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/40">
                {paginatedBlogs.map((blog) => {
                  const isSelected = selectedIds.includes(blog.id);
                  const imageSrc =
                    blog.featuredImage || blog.image || '/images/default-blog.jpg';

                  return (
                    <tr
                      key={blog.id}
                      className={`hover:bg-white/60 transition-colors ${
                        isSelected ? 'bg-indigo-50/40' : ''
                      }`}
                    >
                      <td className="px-4 py-3.5 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectOne(blog.id)}
                          aria-label={`Select blog ${blog.title}`}
                          className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500/30 cursor-pointer"
                        />
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="w-16 h-12 rounded-xl overflow-hidden bg-gray-100 shrink-0 border border-white/80 shadow-sm relative">
                          <img
                            src={imageSrc}
                            alt={blog.title}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                          {blog.featured && (
                            <div
                              className="absolute top-1 left-1 bg-amber-500 text-white p-0.5 rounded shadow"
                              title="Featured Blog"
                            >
                              <Star size={10} className="fill-white" />
                            </div>
                          )}
                        </div>
                      </td>

                      <td className="px-4 py-3.5 max-w-sm">
                        <div className="font-bold text-gray-900 text-[13px] line-clamp-1 mb-0.5">
                          {blog.title}
                        </div>
                        <p className="text-gray-500 line-clamp-1 text-[11px]">
                          {blog.excerpt || 'No excerpt'}
                        </p>
                        <div className="text-[10px] text-gray-400 font-mono mt-0.5">
                          /{blog.slug}
                        </div>
                      </td>

                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                            blog.category === 'India'
                              ? 'bg-orange-50 text-[#FF9933] border-orange-200'
                              : 'bg-indigo-50 text-indigo-600 border-indigo-200'
                          }`}
                        >
                          {blog.category}
                        </span>
                      </td>

                      <td className="px-4 py-3.5 whitespace-nowrap text-gray-500 font-medium text-xs">
                        {blog.date || blog.publishedAt?.split('T')[0] || 'N/A'}
                      </td>

                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1.5 border ${
                            blog.status === 'published'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              blog.status === 'published'
                                ? 'bg-emerald-500'
                                : 'bg-amber-500'
                            }`}
                          />
                          {blog.status}
                        </span>
                      </td>

                      <td className="px-4 py-3.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            to={`/blog/${blog.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-white/80 rounded-lg transition-colors"
                            title="View on live site"
                          >
                            <ExternalLink size={15} />
                          </Link>

                          <Link
                            to={`/admin/blogs/edit/${blog.id}`}
                            className="px-2.5 py-1.5 bg-white/70 hover:bg-white text-gray-700 font-bold rounded-xl text-xs transition-colors flex items-center gap-1 border border-white/60 shadow-sm no-underline"
                          >
                            <Edit2 size={12} className="text-indigo-600" /> Edit
                          </Link>

                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-rose-500 hover:bg-rose-50 hover:text-rose-700 p-1.5"
                            onClick={() => setDeleteModalId(blog.id)}
                            title="Delete"
                          >
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-white/40 flex items-center justify-between text-xs text-gray-500">
            <div>
              Showing{' '}
              <strong className="text-gray-900">
                {(safePage - 1) * PAGE_SIZE + 1}
              </strong>{' '}
              to{' '}
              <strong className="text-gray-900">
                {Math.min(safePage * PAGE_SIZE, filteredBlogs.length)}
              </strong>{' '}
              of <strong className="text-gray-900">{filteredBlogs.length}</strong> blogs
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={safePage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="p-1.5 rounded-xl border border-white/60 bg-white/60 hover:bg-white text-gray-700 disabled:opacity-30 disabled:pointer-events-none transition-colors shadow-sm"
                aria-label="Previous page"
              >
                <ChevronLeft size={16} />
              </button>

              <span className="px-3 py-1 font-bold text-gray-900 bg-white/50 border border-white/60 rounded-xl shadow-sm">
                {safePage} / {totalPages}
              </span>

              <button
                type="button"
                disabled={safePage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="p-1.5 rounded-xl border border-white/60 bg-white/60 hover:bg-white text-gray-700 disabled:opacity-30 disabled:pointer-events-none transition-colors shadow-sm"
                aria-label="Next page"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </Card>

      {/* Single Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(deleteModalId)}
        onClose={() => setDeleteModalId(null)}
        onConfirm={confirmSingleDelete}
        title="Delete this blog?"
        message="This will soft-delete the blog post and remove it from the active site and travel journal."
        confirmText="Yes, Delete Blog"
        cancelText="Cancel"
        variant="danger"
        loading={isDeleting}
      />

      {/* Bulk Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isBulkDeleteModalOpen}
        onClose={() => setIsBulkDeleteModalOpen(false)}
        onConfirm={confirmBulkDelete}
        title={`Delete ${selectedIds.length} selected blogs?`}
        message={`Are you sure you want to delete all ${selectedIds.length} selected blogs? This action will remove them from the site.`}
        confirmText="Delete Selected"
        cancelText="Cancel"
        variant="danger"
        loading={isDeleting}
      />
    </div>
  );
};

export default AdminBlogs;
