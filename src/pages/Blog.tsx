import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, ChevronLeft, ChevronRight, Clock, Calendar } from 'lucide-react';
import {
  searchBlogs, formatBlogDate, truncateExcerpt, getBlogCategories,
} from '../lib/blogs';
import { useSeo } from '../lib/useSeo';
import { Footer } from '../components/Footer';

const PAGE_SIZE = 20;
const CATEGORIES = ['All', 'India', 'International'] as const;

export const Blog: React.FC = () => {
  const [category, setCategory] = useState<string>('All');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const categories = getBlogCategories();

  const results = useMemo(
    () => searchBlogs(category, query),
    [category, query],
  );

  const totalPages = Math.max(1, Math.ceil(results.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageBlogs = useMemo(
    () => results.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE),
    [results, currentPage],
  );

  const goToPage = (p: number) => {
    setPage(Math.min(Math.max(1, p), totalPages));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useSeo({
    title: 'Travel Journal | Monks & Monkeys Travels',
    description: 'Stories, tips, and guides from our expert travelers — destination guides, heritage deep-dives, and travel tips across India and the world.',
    canonicalPath: '/blog',
  });

  // Compact page-number window around the current page.
  const pageNumbers = useMemo(() => {
    const window = 2;
    const start = Math.max(1, currentPage - window);
    const end = Math.min(totalPages, currentPage + window);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }, [currentPage, totalPages]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black w-full relative z-10 transition-colors duration-500 pt-32">
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden">
        <div className="absolute top-[-10%] right-[-5%] w-[40vw] h-[40vw] rounded-full bg-gradient-to-br from-[#FF9933]/20 to-transparent blur-[100px] opacity-50 dark:opacity-30"></div>
        <div className="absolute bottom-[-10%] left-[-5%] w-[50vw] h-[50vw] rounded-full bg-gradient-to-tr from-[#FF9933]/10 to-transparent blur-[120px] opacity-50 dark:opacity-30"></div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pb-24">
        {/* Header */}
        <div className="text-center mb-12 flex flex-col items-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-6xl font-extrabold text-gray-900 dark:text-white mb-6"
          >
            Travel Journal
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl text-center mb-8"
          >
            Stories, tips, and guides from our expert travelers around the world.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="w-12 h-1 bg-[#FF9933]"
          />
        </div>

        {/* Search + Category Filters */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-12">
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => {
              const count = cat === 'All'
                ? categories.total
                : categories.counts[cat] ?? 0;
              const active = category === cat;
              return (
                <button
                  key={cat}
                  onClick={() => { setCategory(cat); setPage(1); }}
                  className={`px-5 py-2.5 rounded-full text-sm font-bold tracking-wide transition-all duration-300 border ${
                    active
                      ? 'bg-[#FF9933] text-white border-[#FF9933] shadow-lg shadow-[#FF9933]/25'
                      : 'bg-white/40 dark:bg-zinc-900/40 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-white/10 hover:border-[#FF9933] hover:text-[#FF9933]'
                  }`}
                >
                  {cat}
                  <span className={`ml-2 text-xs ${active ? 'text-white/75' : 'text-gray-400'}`}>({count})</span>
                </button>
              );
            })}
          </div>

          <div className="relative md:w-80">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              type="search"
              value={query}
              onChange={(e) => { setQuery(e.target.value); setPage(1); }}
              placeholder="Search stories & destinations…"
              className="w-full pl-11 pr-4 py-3 rounded-full bg-white/40 dark:bg-zinc-900/40 backdrop-blur-xl border border-gray-200 dark:border-white/10 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF9933] focus:border-transparent transition-all"
            />
          </div>
        </div>

        {/* Results meta */}
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          {results.length > 0 ? (
            <>Showing <span className="font-bold text-gray-900 dark:text-white">{(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, results.length)}</span> of <span className="font-bold text-gray-900 dark:text-white">{results.length}</span> {results.length === 1 ? 'story' : 'stories'}{query && <> for “{query}”</>}</>
          ) : (
            <>No stories found{query && <> for “{query}”</>}. Try a different search or category.</>
          )}
        </p>

        {/* Grid: 3 cols desktop, 2 tablet, 1 mobile */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {pageBlogs.map((blog, idx) => (
            <motion.div
              key={blog.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(idx, 6) * 0.06 }}
              className="h-full"
            >
              <Link
                to={`/blog/${blog.slug}`}
                className="block h-full group no-underline"
              >
                <div className="h-full bg-white/40 dark:bg-zinc-900/40 backdrop-blur-xl border border-white/60 dark:border-white/10 rounded-3xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:hover:shadow-[0_8px_30px_rgb(217,119,54,0.1)] transition-all duration-500 hover:-translate-y-2 flex flex-col relative">

                  <div className="h-56 relative overflow-hidden shrink-0">
                    <img
                      src={blog.featuredImage}
                      alt={blog.imageAlt || blog.title}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <span className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-black/55 backdrop-blur-md text-[10px] font-bold uppercase tracking-widest text-white">
                      {blog.category}
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  </div>

                  <div className="p-8 flex flex-col grow">
                    <div className="flex items-center gap-2 mb-4 text-xs font-bold uppercase tracking-widest text-[#FF9933]">
                      <span className="flex items-center gap-1.5"><Calendar size={12} /> {formatBlogDate(blog)}</span>
                      <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-700"></span>
                      <span className="flex items-center gap-1.5"><Clock size={12} /> {blog.readTime}</span>
                    </div>

                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 line-clamp-2 leading-snug group-hover:text-[#FF9933] transition-colors">
                      {blog.title}
                    </h2>

                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 mb-6 grow">
                      {truncateExcerpt(blog.excerpt, 150)}
                    </p>

                    <div className="mt-auto flex items-center gap-3 pt-4 border-t border-gray-200/50 dark:border-white/10">
                      <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center text-xs font-bold text-gray-600 dark:text-gray-300">
                        {blog.author.charAt(0)}
                      </div>
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">
                        {blog.author}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-16 flex-wrap">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="w-10 h-10 rounded-full border border-gray-200 dark:border-white/10 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:border-[#FF9933] hover:text-[#FF9933] transition-colors disabled:opacity-30 disabled:pointer-events-none"
              aria-label="Previous page"
            >
              <ChevronLeft size={18} />
            </button>

            {pageNumbers[0] > 1 && (
              <>
                <button onClick={() => goToPage(1)} className="w-10 h-10 rounded-full text-sm font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-900 transition-colors">1</button>
                {pageNumbers[0] > 2 && <span className="px-1 text-gray-400">…</span>}
              </>
            )}

            {pageNumbers.map((p) => (
              <button
                key={p}
                onClick={() => goToPage(p)}
                className={`w-10 h-10 rounded-full text-sm font-bold transition-all ${
                  p === currentPage
                    ? 'bg-[#FF9933] text-white shadow-lg shadow-[#FF9933]/25'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-900'
                }`}
                aria-current={p === currentPage ? 'page' : undefined}
              >
                {p}
              </button>
            ))}

            {pageNumbers[pageNumbers.length - 1] < totalPages && (
              <>
                {pageNumbers[pageNumbers.length - 1] < totalPages - 1 && <span className="px-1 text-gray-400">…</span>}
                <button onClick={() => goToPage(totalPages)} className="w-10 h-10 rounded-full text-sm font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-900 transition-colors">{totalPages}</button>
              </>
            )}

            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="w-10 h-10 rounded-full border border-gray-200 dark:border-white/10 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:border-[#FF9933] hover:text-[#FF9933] transition-colors disabled:opacity-30 disabled:pointer-events-none"
              aria-label="Next page"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        )}
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Blog;
