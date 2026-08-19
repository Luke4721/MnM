import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import blogsData from '../data/blogs_database.json';

export const Blog: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black w-full relative z-10 transition-colors duration-500 pt-32 pb-24">
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden">
        <div className="absolute top-[-10%] right-[-5%] w-[40vw] h-[40vw] rounded-full bg-gradient-to-br from-[#D97736]/20 to-transparent blur-[100px] opacity-50 dark:opacity-30"></div>
        <div className="absolute bottom-[-10%] left-[-5%] w-[50vw] h-[50vw] rounded-full bg-gradient-to-tr from-[#D97736]/10 to-transparent blur-[120px] opacity-50 dark:opacity-30"></div>
      </div>

      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16 flex flex-col items-center">
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
            className="w-12 h-1 bg-[#D97736]"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogsData.map((blog, idx) => (
            <motion.div
              key={blog.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Link to={`/blog/${blog.slug}`} className="block h-full group no-underline">
                <div className="h-full bg-white/40 dark:bg-zinc-900/40 backdrop-blur-xl border border-white/60 dark:border-white/10 rounded-3xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:hover:shadow-[0_8px_30px_rgb(217,119,54,0.1)] transition-all duration-500 hover:-translate-y-2 flex flex-col relative">
                  
                  <div className="h-56 relative overflow-hidden shrink-0">
                    <img 
                      src={blog.image} 
                      alt={blog.title} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  </div>
                  
                  <div className="p-8 flex flex-col grow">
                    <div className="flex items-center gap-2 mb-4 text-xs font-bold uppercase tracking-widest text-[#D97736]">
                      <span>{blog.date}</span>
                      <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-700"></span>
                      <span>{blog.readTime}</span>
                    </div>
                    
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 line-clamp-2 leading-snug group-hover:text-[#D97736] transition-colors">
                      {blog.title}
                    </h2>
                    
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 mb-6 grow">
                      {blog.excerpt}
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
      </div>
    </div>
  );
};
