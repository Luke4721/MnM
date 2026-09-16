import React, { useEffect, useMemo, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock, Calendar, BookOpen, Link2, Check } from 'lucide-react';
import {
  blogBySlug, relatedBlogs, formatBlogDate, truncateExcerpt, sanitizeBlogHtml, SITE_URL,
} from '../lib/blogs';
import { useSeo } from '../lib/useSeo';
import { SOCIAL_LINKS } from '../components/SocialLinks';
import { Footer } from '../components/Footer';

export const BlogPost: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  const blog = blogBySlug(slug);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (!blog) navigate('/blog');
  }, [slug, blog, navigate]);

  const related = useMemo(() => (blog ? relatedBlogs(blog, 4) : []), [blog]);
  const shareUrl = blog ? `${SITE_URL}/blog/${blog.slug}` : '';

  useSeo(blog ? {
    title: `${blog.seo.title || blog.title} | Monks & Monkeys Travels`,
    description: blog.seo.description || truncateExcerpt(blog.excerpt, 158),
    image: blog.featuredImage,
    canonicalPath: `/blog/${blog.slug}`,
    type: 'article',
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: blog.title,
      description: blog.seo.description || blog.excerpt,
      image: [blog.featuredImage],
      datePublished: blog.publishedAt,
      dateModified: blog.publishedAt,
      articleSection: blog.category,
      keywords: blog.seo.keywords,
      author: { '@type': 'Organization', name: 'Monks & Monkeys Travels' },
      publisher: {
        '@type': 'Organization',
        name: 'Monks & Monkeys Travels',
      },
      mainEntityOfPage: { '@type': 'WebPage', '@id': shareUrl },
    },
  } : { title: 'Travel Journal | Monks & Monkeys Travels', description: '' });

  if (!blog) return null;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API unavailable (e.g. insecure context) — no-op.
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black w-full relative z-10 transition-colors duration-500 pt-32">
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden">
        <div className="absolute top-[20%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-gradient-to-br from-[#FF9933]/10 to-transparent blur-[120px] opacity-40 dark:opacity-20"></div>
      </div>

      <div className="max-w-4xl mx-auto px-6 pb-24">

        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-8"
        >
          <Link to="/blog" className="inline-flex items-center gap-2 text-sm font-bold tracking-widest uppercase text-gray-500 hover:text-[#FF9933] transition-colors no-underline">
            <ArrowLeft size={16} /> Back to Journal
          </Link>
        </motion.div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-12 text-center flex flex-col items-center"
        >
          <Link
            to={`/blog?category=${encodeURIComponent(blog.category)}`}
            className="px-4 py-1.5 rounded-full bg-[#FF9933]/10 text-[#FF9933] text-[10px] font-bold uppercase tracking-widest mb-6 no-underline hover:bg-[#FF9933]/20 transition-colors"
          >
            {blog.category}
          </Link>

          <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-6 flex-wrap justify-center">
            <span className="flex items-center gap-1.5"><Calendar size={14} className="text-[#FF9933]" /> {formatBlogDate(blog)}</span>
            <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-700"></span>
            <span className="flex items-center gap-1.5"><Clock size={14} className="text-[#FF9933]" /> {blog.readTime}</span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 dark:text-white leading-tight mb-8">
            {blog.title}
          </h1>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center text-lg font-bold text-gray-600 dark:text-gray-300">
              {blog.author.charAt(0)}
            </div>
            <div className="text-left">
              <div className="text-sm font-bold text-gray-900 dark:text-white">{blog.author}</div>
              <div className="text-xs text-gray-500">Travel Expert</div>
            </div>
          </div>
        </motion.div>

        {/* Featured Image */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="w-full h-[400px] md:h-[500px] lg:h-[600px] rounded-3xl overflow-hidden shadow-2xl mb-16 relative"
        >
          <img src={blog.featuredImage} alt={blog.imageAlt || blog.title} className="w-full h-full object-cover" />
        </motion.div>

        {/* Article Content */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/60 dark:bg-zinc-900/60 backdrop-blur-2xl border border-white/60 dark:border-white/10 rounded-3xl p-8 md:p-12 lg:p-16 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)] relative"
        >
          {/* Social Links sidebar - sticky on desktop (icons only, Instagram / Facebook / YouTube) */}
          <div className="hidden lg:flex flex-col gap-3 absolute -left-20 top-16 sticky-share">
            {SOCIAL_LINKS.map((link) => (
              <a
                key={link.name}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={link.ariaLabel}
                className="w-10 h-10 rounded-full bg-white dark:bg-zinc-800 shadow-md flex items-center justify-center text-gray-600 dark:text-gray-400 hover:text-[#FF9933] dark:hover:text-[#FF9933] hover:-translate-y-1 transition-all no-underline"
              >
                {link.icon(18)}
              </a>
            ))}
            <button
              onClick={copyLink}
              aria-label="Copy link"
              className="w-10 h-10 rounded-full bg-white dark:bg-zinc-800 shadow-md flex items-center justify-center text-gray-600 dark:text-gray-400 hover:text-[#FF9933] dark:hover:text-[#FF9933] hover:-translate-y-1 transition-all mt-2"
            >
              {copied ? <Check size={16} className="text-green-500" /> : <Link2 size={16} />}
            </button>
          </div>

          <div
            className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-extrabold prose-a:text-[#FF9933] prose-img:rounded-2xl"
            dangerouslySetInnerHTML={{ __html: sanitizeBlogHtml(blog.content) }}
          />

          {/* Mobile Social Links (icons only, Instagram / Facebook / YouTube) */}
          <div className="mt-12 pt-8 border-t border-gray-200 dark:border-white/10 lg:hidden flex justify-center items-center gap-3">
            {SOCIAL_LINKS.map((link) => (
              <a
                key={link.name}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={link.ariaLabel}
                className="w-10 h-10 rounded-full bg-gray-100 dark:bg-zinc-800 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:text-[#FF9933] dark:hover:text-[#FF9933] transition-colors no-underline"
              >
                {link.icon(18)}
              </a>
            ))}
            <button
              onClick={copyLink}
              aria-label="Copy link"
              className="w-10 h-10 rounded-full bg-gray-100 dark:bg-zinc-800 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:text-[#FF9933] dark:hover:text-[#FF9933] transition-colors"
            >
              {copied ? <Check size={16} className="text-green-500" /> : <Link2 size={16} />}
            </button>
          </div>
        </motion.div>

        {/* Related Blogs */}
        {related.length > 0 && (
          <div className="mt-24">
            <div className="flex items-center gap-4 mb-10">
              <BookOpen size={20} className="text-[#FF9933]" />
              <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white">
                More from {blog.category}
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {related.map((rel) => (
                <Link key={rel.id} to={`/blog/${rel.slug}`} className="group no-underline">
                  <div className="bg-white/40 dark:bg-zinc-900/40 backdrop-blur-xl border border-white/60 dark:border-white/10 rounded-2xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)] hover:shadow-[0_8px_30px_rgb(217,119,54,0.1)] transition-all duration-500 hover:-translate-y-1.5 flex flex-col h-full">
                    <div className="h-36 relative overflow-hidden shrink-0">
                      <img
                        src={rel.featuredImage}
                        alt={rel.imageAlt || rel.title}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    </div>
                    <div className="p-5 flex flex-col grow">
                      <div className="flex items-center gap-2 mb-3 text-[10px] font-bold uppercase tracking-widest text-[#FF9933]">
                        <span>{formatBlogDate(rel)}</span>
                      </div>
                      <h3 className="text-sm font-bold text-gray-900 dark:text-white line-clamp-3 leading-snug group-hover:text-[#FF9933] transition-colors">
                        {rel.title}
                      </h3>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default BlogPost;
