import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Clock, Sparkles } from 'lucide-react';
import { featuredBlogs, latestBlogs, formatBlogDate } from '../lib/blogs';

/**
 * Homepage blog sections: "Featured Stories" (the 6 legacy display_home
 * blogs) and "Latest from the Journal" (6 most recent), with a
 * "View All Blogs" link. Lazy-loaded by Home.tsx so the multi-megabyte
 * blog data stays out of the initial page bundle.
 */
export const HomeBlogSection: React.FC = () => {
  // Pad featured with recent posts if fewer than 6 are flagged.
  const featured = [
    ...featuredBlogs,
    ...latestBlogs.filter((b) => !b.featured),
  ].slice(0, 6);
  const latest = latestBlogs;

  if (featured.length === 0) return null;

  return (
    <section className="bg-white dark:bg-black py-24 border-t border-gray-100 dark:border-gray-900">
      <div className="max-w-7xl mx-auto px-6">

        {/* Featured Stories */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 text-[#FF9933] text-xs font-bold tracking-[0.2em] uppercase mb-4">
              <Sparkles size={14} /> Featured Stories
            </div>
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white font-serif leading-tight">
              Editor&rsquo;s picks from <br className="hidden md:block" />our travel journal.
            </h2>
          </div>
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-sm font-bold tracking-widest uppercase text-gray-500 dark:text-gray-400 hover:text-[#FF9933] transition-colors no-underline group shrink-0"
          >
            View All Blogs
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-24">
          {featured.map((blog, idx) => (
            <motion.div
              key={blog.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ delay: (idx % 3) * 0.08 }}
              className="h-full"
            >
              <Link to={`/blog/${blog.slug}`} className="block h-full group no-underline">
                <div className="h-full bg-white/40 dark:bg-zinc-900/40 backdrop-blur-xl border border-gray-100 dark:border-white/10 rounded-3xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)] hover:shadow-[0_8px_30px_rgb(217,119,54,0.1)] transition-all duration-500 hover:-translate-y-2 flex flex-col">
                  <div className="h-48 relative overflow-hidden shrink-0">
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
                  </div>
                  <div className="p-6 flex flex-col grow">
                    <div className="flex items-center gap-2 mb-3 text-[11px] font-bold uppercase tracking-widest text-[#FF9933]">
                      <span>{formatBlogDate(blog)}</span>
                      <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-700"></span>
                      <span className="flex items-center gap-1"><Clock size={11} /> {blog.readTime}</span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-2 leading-snug group-hover:text-[#FF9933] transition-colors">
                      {blog.title}
                    </h3>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Latest Stories */}
        <div className="mb-12">
          <div className="flex items-center gap-2 text-[#FF9933] text-xs font-bold tracking-[0.2em] uppercase mb-4">
            <ArrowRight size={14} /> Latest from the Journal
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white font-serif leading-tight">
            Fresh off the press.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {latest.map((blog, idx) => (
            <motion.div
              key={blog.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ delay: (idx % 3) * 0.08 }}
              className="h-full"
            >
              <Link to={`/blog/${blog.slug}`} className="block h-full group no-underline">
                <div className="h-full bg-white/40 dark:bg-zinc-900/40 backdrop-blur-xl border border-gray-100 dark:border-white/10 rounded-3xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)] hover:shadow-[0_8px_30px_rgb(217,119,54,0.1)] transition-all duration-500 hover:-translate-y-2 flex flex-col">
                  <div className="h-48 relative overflow-hidden shrink-0">
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
                  </div>
                  <div className="p-6 flex flex-col grow">
                    <div className="flex items-center gap-2 mb-3 text-[11px] font-bold uppercase tracking-widest text-[#FF9933]">
                      <span>{formatBlogDate(blog)}</span>
                      <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-700"></span>
                      <span className="flex items-center gap-1"><Clock size={11} /> {blog.readTime}</span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-2 leading-snug group-hover:text-[#FF9933] transition-colors">
                      {blog.title}
                    </h3>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Mobile View All */}
        <div className="mt-12 text-center md:hidden">
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-[#FF9933] text-white text-sm font-bold tracking-widest uppercase no-underline hover:bg-[#e68a2e] transition-colors"
          >
            View All Blogs <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HomeBlogSection;
