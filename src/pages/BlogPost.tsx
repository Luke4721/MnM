import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock, Calendar, Share2 } from 'lucide-react';
import blogsData from '../data/blogs_database.json';

export const BlogPost: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [blog, setBlog] = useState<typeof blogsData[0] | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    const foundBlog = blogsData.find(b => b.slug === slug);
    if (foundBlog) {
      setBlog(foundBlog);
    } else {
      navigate('/blog');
    }
  }, [slug, navigate]);

  if (!blog) return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black w-full relative z-10 transition-colors duration-500 pt-32 pb-24">
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden">
        <div className="absolute top-[20%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-gradient-to-br from-[#FF9933]/10 to-transparent blur-[120px] opacity-40 dark:opacity-20"></div>
      </div>

      <div className="max-w-4xl mx-auto px-6">
        
        {/* Back Button */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-8"
        >
          <Link to="/blog" className="inline-flex items-center gap-2 text-sm font-bold tracking-widest uppercase text-gray-500 hover:text-[#FF9933] transition-colors">
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
          <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-6 flex-wrap justify-center">
            <span className="flex items-center gap-1.5"><Calendar size={14} className="text-[#FF9933]"/> {blog.date}</span>
            <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-700"></span>
            <span className="flex items-center gap-1.5"><Clock size={14} className="text-[#FF9933]"/> {blog.readTime}</span>
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
          <img src={blog.image} alt={blog.title} className="w-full h-full object-cover" />
        </motion.div>

        {/* Article Content */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/60 dark:bg-zinc-900/60 backdrop-blur-2xl border border-white/60 dark:border-white/10 rounded-3xl p-8 md:p-12 lg:p-16 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)] relative"
        >
          {/* Social Share sidebar - sticky on desktop */}
          <div className="hidden lg:flex flex-col gap-4 absolute -left-20 top-16 sticky-share">
            <div className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2 transform -rotate-90 origin-left translate-y-8 -translate-x-4">Share</div>
            <button className="w-10 h-10 rounded-full bg-white dark:bg-zinc-800 shadow-md flex items-center justify-center text-gray-600 dark:text-gray-400 hover:text-[#FF9933] hover:-translate-y-1 transition-all font-bold">
              f
            </button>
            <button className="w-10 h-10 rounded-full bg-white dark:bg-zinc-800 shadow-md flex items-center justify-center text-gray-600 dark:text-gray-400 hover:text-[#FF9933] hover:-translate-y-1 transition-all font-bold">
              t
            </button>
            <button className="w-10 h-10 rounded-full bg-white dark:bg-zinc-800 shadow-md flex items-center justify-center text-gray-600 dark:text-gray-400 hover:text-[#FF9933] hover:-translate-y-1 transition-all font-bold">
              in
            </button>
            <button className="w-10 h-10 rounded-full bg-white dark:bg-zinc-800 shadow-md flex items-center justify-center text-gray-600 dark:text-gray-400 hover:text-[#FF9933] hover:-translate-y-1 transition-all mt-4">
              <Share2 size={18} />
            </button>
          </div>

          <div className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-extrabold prose-a:text-[#FF9933] prose-img:rounded-2xl" dangerouslySetInnerHTML={{ __html: blog.content }} />
          
          {/* Mobile Share */}
          <div className="mt-12 pt-8 border-t border-gray-200 dark:border-white/10 lg:hidden flex flex-col items-center gap-4">
            <span className="text-sm font-bold uppercase tracking-widest text-gray-500">Share this article</span>
            <div className="flex gap-4">
              <button className="w-10 h-10 rounded-full bg-gray-100 dark:bg-zinc-800 flex items-center justify-center text-gray-600 dark:text-gray-400 font-bold">
                f
              </button>
              <button className="w-10 h-10 rounded-full bg-gray-100 dark:bg-zinc-800 flex items-center justify-center text-gray-600 dark:text-gray-400 font-bold">
                t
              </button>
              <button className="w-10 h-10 rounded-full bg-gray-100 dark:bg-zinc-800 flex items-center justify-center text-gray-600 dark:text-gray-400 font-bold">
                in
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
