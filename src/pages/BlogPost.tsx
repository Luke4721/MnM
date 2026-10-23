import React, { useEffect, useMemo, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Clock,
  Calendar,
  BookOpen,
  Link2,
  Check,
  ChevronDown,
  HelpCircle,
  MapPin,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import {
  blogBySlug,
  relatedBlogs,
  formatBlogDate,
  truncateExcerpt,
  sanitizeBlogHtml,
  fetchBlogBySlug,
  optimizePostImages,
  getBlogFaqs,
  hasFaqInContent,
  SITE_URL,
  type Blog,
  type BlogFaq,
  type BlogGalleryImage,
} from '../lib/blogs';
import { useSeo } from '../lib/useSeo';
import { scrollToTop } from '../components/SmoothScroll';
import { SOCIAL_LINKS } from '../components/SocialLinks';
import { Footer } from '../components/Footer';

interface BlogFaqAccordionProps {
  faqs: BlogFaq[];
  title?: string;
}

const BlogFaqAccordion: React.FC<BlogFaqAccordionProps> = ({ faqs, title }) => {
  const [openIndices, setOpenIndices] = useState<number[]>([0]);

  const toggle = (idx: number) => {
    setOpenIndices((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );
  };

  return (
    <section aria-labelledby="faq-section-heading" className="mt-16 pt-10 border-t border-gray-200/80 dark:border-white/10">
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#FF9933] mb-3">
        <HelpCircle size={16} />
        <span>Essential Q&A</span>
      </div>
      <h2 id="faq-section-heading" className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white mb-3">
        Frequently Asked Questions
      </h2>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-8 max-w-2xl">
        Common questions and helpful travel details for {title ? title.split(/[:,-]/)[0].trim() : 'this destination'}.
      </p>

      <div className="space-y-4">
        {faqs.map((faq, index) => {
          const isOpen = openIndices.includes(index);
          return (
            <div
              key={index}
              className={`rounded-2xl transition-all duration-300 border ${
                isOpen
                  ? 'bg-orange-50/40 dark:bg-orange-950/20 border-[#FF9933]/30 shadow-sm'
                  : 'bg-gray-50/50 dark:bg-zinc-800/30 border-gray-200/70 dark:border-white/5 hover:border-gray-300 dark:hover:border-zinc-700'
              }`}
            >
              <button
                type="button"
                onClick={() => toggle(index)}
                aria-expanded={isOpen}
                className="w-full flex items-center justify-between gap-4 p-5 md:p-6 text-left cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF9933] rounded-2xl group"
              >
                <span className="text-base md:text-lg font-bold text-gray-900 dark:text-white group-hover:text-[#FF9933] transition-colors leading-snug">
                  {faq.question}
                </span>
                <span
                  className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                    isOpen
                      ? 'rotate-180 bg-[#FF9933] text-white shadow-sm'
                      : 'bg-gray-200/70 dark:bg-zinc-700/60 text-gray-600 dark:text-gray-300 group-hover:bg-[#FF9933]/10 group-hover:text-[#FF9933]'
                  }`}
                >
                  <ChevronDown size={18} />
                </span>
              </button>
              {isOpen && (
                <div className="px-5 md:px-6 pb-5 md:pb-6 text-gray-700 dark:text-gray-300 text-sm md:text-base leading-relaxed whitespace-pre-line border-t border-orange-100/60 dark:border-orange-900/20 pt-4">
                  {faq.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};

interface BlogImageSlideshowProps {
  images: BlogGalleryImage[];
  blogTitle: string;
}

export const BlogImageSlideshow: React.FC<BlogImageSlideshowProps> = ({ images, blogTitle }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!images || images.length === 0) return null;

  const currentImage = images[currentIndex] || images[0];
  const hasMultiple = images.length > 1;

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const activeAlt = currentImage.alt || currentImage.location || blogTitle;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.2, duration: 0.6 }}
      className="w-full mb-16"
    >
      <div className="w-full aspect-[16/9] rounded-[24px] overflow-hidden shadow-2xl relative bg-zinc-950 select-none group">
        <AnimatePresence mode="wait">
          <motion.img
            key={currentImage.url}
            src={currentImage.url}
            alt={activeAlt}
            width={1200}
            height={675}
            loading="eager"
            fetchPriority="high"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45, ease: 'easeInOut' }}
            className="w-full h-full aspect-[16/9] object-cover"
          />
        </AnimatePresence>

        {/* Pill-shaped badge in the top-left corner */}
        {currentImage.location && (
          <div className="absolute top-4 left-4 z-20 flex items-center gap-2 px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full bg-black/60 backdrop-blur-md text-white text-xs sm:text-sm font-semibold shadow-lg border border-white/20 tracking-wide pointer-events-none">
            <MapPin size={15} className="text-[#FF9933] shrink-0" />
            <span className="truncate max-w-[220px] sm:max-w-xs">{currentImage.location}</span>
          </div>
        )}

        {/* Navigation arrows */}
        {hasMultiple && (
          <>
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Previous photo"
              className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 z-20 w-10 sm:w-11 h-10 sm:h-11 rounded-full bg-black/50 hover:bg-black/75 backdrop-blur-md text-white flex items-center justify-center transition-all border border-white/20 hover:scale-105 active:scale-95 shadow-xl cursor-pointer"
            >
              <ChevronLeft size={22} />
            </button>
            <button
              type="button"
              onClick={handleNext}
              aria-label="Next photo"
              className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 z-20 w-10 sm:w-11 h-10 sm:h-11 rounded-full bg-black/50 hover:bg-black/75 backdrop-blur-md text-white flex items-center justify-center transition-all border border-white/20 hover:scale-105 active:scale-95 shadow-xl cursor-pointer"
            >
              <ChevronRight size={22} />
            </button>

            {/* Bottom-right counter badge */}
            <div className="absolute bottom-4 right-4 z-20 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-xs font-mono tracking-wider border border-white/15">
              {currentIndex + 1} / {images.length}
            </div>

            {/* Dot indicators */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5">
              {images.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCurrentIndex(idx)}
                  aria-label={`Go to photo ${idx + 1}`}
                  className={`h-1.5 rounded-full transition-all cursor-pointer ${
                    currentIndex === idx
                      ? 'w-6 bg-[#FF9933]'
                      : 'w-1.5 bg-white/60 hover:bg-white'
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {activeAlt && (
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 italic text-center mt-3">
          {activeAlt}
        </p>
      )}
    </motion.div>
  );
};

export const BlogPost: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  const localBlog = blogBySlug(slug);
  const [blog, setBlog] = useState<Blog | undefined>(localBlog);
  const [isFetching, setIsFetching] = useState(!localBlog || !localBlog.content);

  useEffect(() => {
    scrollToTop(true);
    let isMounted = true;

    // Fast path: use bundled blog metadata if present
    if (localBlog) {
      setBlog((prev) => (prev?.slug === slug && prev?.content ? prev : localBlog));
    }

    if (slug) {
      setIsFetching(true);
      fetchBlogBySlug(slug)
        .then((fullPost) => {
          if (!isMounted) return;
          if (fullPost && fullPost.content) {
            setBlog(fullPost);
          } else if (fullPost) {
            setBlog(fullPost);
          } else if (!localBlog) {
            navigate('/blog');
          }
        })
        .catch(() => {
          if (!isMounted) return;
          if (!localBlog) {
            navigate('/blog');
          }
        })
        .finally(() => {
          if (isMounted) setIsFetching(false);
        });
    } else if (!localBlog) {
      navigate('/blog');
    }

    return () => {
      isMounted = false;
    };
  }, [slug, navigate]);

  const related = useMemo(() => (blog ? relatedBlogs(blog, 4) : []), [blog]);
  const shareUrl = blog ? `${SITE_URL}/blog/${blog.slug}` : '';

  const blogFaqs = useMemo(() => getBlogFaqs(blog), [blog]);
  const contentHasFaqs = useMemo(() => hasFaqInContent(blog?.content), [blog?.content]);

  const jsonLd = useMemo(() => {
    if (!blog) return undefined;

    const blogPosting: Record<string, any> = {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: blog.title,
      description: blog.seo?.description || blog.excerpt,
      image: [blog.featuredImage, ...(blog.imageGallery?.map((g) => g.url) || [])].filter(Boolean),
      datePublished: blog.publishedAt,
      dateModified: blog.updatedAt || blog.publishedAt,
      articleSection: blog.category,
      keywords: blog.seo?.keywords || '',
      author: { '@type': 'Organization', name: 'Monks & Monkeys Travels' },
      publisher: {
        '@type': 'Organization',
        name: 'Monks & Monkeys Travels',
      },
      mainEntityOfPage: { '@type': 'WebPage', '@id': shareUrl },
    };

    if (blogFaqs.length === 0) {
      return blogPosting;
    }

    const faqPage: Record<string, any> = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: blogFaqs.map((faq) => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.answer,
        },
      })),
    };

    return [blogPosting, faqPage];
  }, [blog, blogFaqs, shareUrl]);

  useSeo(blog ? {
    title: `${blog.seo?.title || blog.title} | Monks & Monkeys Travels`,
    description: blog.seo?.description || truncateExcerpt(blog.excerpt, 158),
    keywords: blog.seo?.keywords,
    image: blog.seo?.ogImage || blog.featuredImage,
    canonicalPath: `/blog/${blog.slug}`,
    type: 'article',
    jsonLd,
  } : { title: 'Travel Journal | Monks & Monkeys Travels', description: '' });

  if (!blog) {
    if (isFetching) {
      return (
        <div className="min-h-screen bg-gray-50 dark:bg-black w-full flex items-center justify-center pt-32">
          <div className="flex flex-col items-center gap-3">
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-[#FF9933] border-t-transparent"></div>
            <p className="text-sm font-medium text-gray-500">Loading travel story...</p>
          </div>
        </div>
      );
    }
    return null;
  }

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
              {(blog.author || 'M').charAt(0)}
            </div>
            <div className="text-left">
              <div className="text-sm font-bold text-gray-900 dark:text-white">{blog.author || 'MNM Team'}</div>
              <div className="text-xs text-gray-500">Travel Expert</div>
            </div>
          </div>
        </motion.div>

        {/* Featured Image or Image Slideshow */}
        {blog.imageGallery && blog.imageGallery.length > 0 ? (
          <BlogImageSlideshow images={blog.imageGallery} blogTitle={blog.title} />
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="w-full mb-16"
          >
            <div className="w-full aspect-[16/9] rounded-[24px] overflow-hidden shadow-2xl relative">
              <img
                src={blog.featuredImage}
                alt={blog.imageAlt || blog.title}
                width={1200}
                height={675}
                loading="eager"
                fetchPriority="high"
                className="w-full h-full aspect-[16/9] object-cover"
              />
            </div>
            {(blog.imageAlt || blog.title) && (
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 italic text-center mt-3">
                {blog.imageAlt || blog.title}
              </p>
            )}
          </motion.div>
        )}

        {/* Article Content */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/60 dark:bg-zinc-900/60 backdrop-blur-2xl border border-white/60 dark:border-white/10 rounded-[24px] p-8 md:p-12 lg:p-16 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)] relative"
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

          {blog.content ? (
            <div
              className="blog-content prose prose-lg dark:prose-invert max-w-none prose-headings:font-extrabold prose-a:text-[#FF9933] prose-img:rounded-2xl"
              dangerouslySetInnerHTML={{ __html: optimizePostImages(sanitizeBlogHtml(blog.content)) }}
            />
          ) : (
            <div className="py-12 flex flex-col items-center justify-center gap-3">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#FF9933] border-t-transparent"></div>
              <p className="text-sm font-medium text-gray-500">Loading travel story...</p>
            </div>
          )}

          {/* Frequently Asked Questions Section */}
          {blogFaqs.length > 0 && !contentHasFaqs && (
            <BlogFaqAccordion faqs={blogFaqs} title={blog.title} />
          )}

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
                  <div className="bg-white/40 dark:bg-zinc-900/40 backdrop-blur-xl border border-white/60 dark:border-white/10 rounded-[20px] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)] hover:shadow-[0_8px_30px_rgb(217,119,54,0.1)] transition-all duration-500 hover:-translate-y-1.5 flex flex-col h-full">
                    <div className="h-36 relative overflow-hidden shrink-0 rounded-t-[20px]">
                      <img
                        src={rel.featuredImage}
                        alt={rel.imageAlt || rel.title}
                        width={400}
                        height={144}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 rounded-t-[20px]"
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
