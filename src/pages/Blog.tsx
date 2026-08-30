import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import blogsData from '../data/blogs_database.json';

export const Blog: React.FC = () => {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black w-full relative z-10 transition-colors duration-500 pt-32 pb-24">
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden">
        <div className="absolute top-[-10%] right-[-5%] w-[40vw] h-[40vw] rounded-full bg-gradient-to-br from-[#FF9933]/20 to-transparent blur-[100px] opacity-50 dark:opacity-30"></div>
        <div className="absolute bottom-[-10%] left-[-5%] w-[50vw] h-[50vw] rounded-full bg-gradient-to-tr from-[#FF9933]/10 to-transparent blur-[120px] opacity-50 dark:opacity-30"></div>
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
            className="w-12 h-1 bg-[#FF9933]"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogsData.map((blog, idx) => (
            <motion.div
              layoutId={`blog-${blog.id}`}
              key={blog.id}
              onClick={() => setSelectedId(blog.id)}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="cursor-pointer block h-full group no-underline"
            >
              <div className="h-full bg-white/40 dark:bg-zinc-900/40 backdrop-blur-xl border border-white/60 dark:border-white/10 rounded-3xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:hover:shadow-[0_8px_30px_rgb(217,119,54,0.1)] transition-all duration-500 hover:-translate-y-2 flex flex-col relative">
                
                <div className="h-56 relative overflow-hidden shrink-0">
                  <motion.img 
                    layoutId={`blog-img-${blog.id}`}
                    src={blog.image} 
                    alt={blog.title} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>
                
                <div className="p-8 flex flex-col grow">
                  <div className="flex items-center gap-2 mb-4 text-xs font-bold uppercase tracking-widest text-[#FF9933]">
                    <motion.span layoutId={`blog-date-${blog.id}`}>{blog.date}</motion.span>
                    <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-700"></span>
                    <motion.span layoutId={`blog-read-${blog.id}`}>{blog.readTime}</motion.span>
                  </div>
                  
                  <motion.h2 
                    layoutId={`blog-title-${blog.id}`}
                    className="text-xl font-bold text-gray-900 dark:text-white mb-4 line-clamp-2 leading-snug group-hover:text-[#FF9933] transition-colors"
                  >
                    {blog.title}
                  </motion.h2>
                  
                  <motion.p 
                    layoutId={`blog-excerpt-${blog.id}`}
                    className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 mb-6 grow"
                  >
                    {blog.excerpt}
                  </motion.p>
                  
                  <div className="mt-auto flex items-center gap-3 pt-4 border-t border-gray-200/50 dark:border-white/10">
                    <motion.div 
                      layoutId={`blog-author-avatar-${blog.id}`}
                      className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center text-xs font-bold text-gray-600 dark:text-gray-300"
                    >
                      {blog.author.charAt(0)}
                    </motion.div>
                    <motion.span 
                      layoutId={`blog-author-name-${blog.id}`}
                      className="text-sm font-semibold text-gray-900 dark:text-white"
                    >
                      {blog.author}
                    </motion.span>
                  </div>
                </div>
                
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {selectedId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedId(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-pointer"
            />
            <motion.div 
              layoutId={`blog-${selectedId}`}
              className="relative w-full max-w-4xl max-h-[90vh] bg-white dark:bg-zinc-900 rounded-3xl overflow-hidden flex flex-col shadow-2xl z-10"
            >
              {(() => {
                const blog = blogsData.find(b => b.id === selectedId);
                if (!blog) return null;
                return (
                  <>
                    <button 
                      onClick={() => setSelectedId(null)}
                      className="absolute top-4 right-4 z-20 w-10 h-10 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-colors backdrop-blur-md"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                    
                    <div className="h-64 md:h-80 relative shrink-0">
                      <motion.img 
                        layoutId={`blog-img-${blog.id}`}
                        src={blog.image} 
                        alt={blog.title} 
                        className="w-full h-full object-cover" 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      <div className="absolute bottom-6 left-6 right-6 md:bottom-8 md:left-8 md:right-8">
                        <div className="flex items-center gap-2 mb-3 text-xs md:text-sm font-bold uppercase tracking-widest text-[#FF9933]">
                          <motion.span layoutId={`blog-date-${blog.id}`}>{blog.date}</motion.span>
                          <span className="w-1.5 h-1.5 rounded-full bg-white/50"></span>
                          <motion.span layoutId={`blog-read-${blog.id}`}>{blog.readTime}</motion.span>
                        </div>
                        <motion.h2 
                          layoutId={`blog-title-${blog.id}`}
                          className="text-2xl md:text-4xl font-bold text-white mb-2 leading-tight"
                        >
                          {blog.title}
                        </motion.h2>
                        <div className="flex items-center gap-3">
                          <motion.div 
                            layoutId={`blog-author-avatar-${blog.id}`}
                            className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold text-white backdrop-blur-sm border border-white/30"
                          >
                            {blog.author.charAt(0)}
                          </motion.div>
                          <motion.span 
                            layoutId={`blog-author-name-${blog.id}`}
                            className="text-sm font-semibold text-white/90"
                          >
                            {blog.author}
                          </motion.span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-6 md:p-8 overflow-y-auto relative bg-white dark:bg-zinc-900 flex-1 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-zinc-700">
                      <motion.p 
                        layoutId={`blog-excerpt-${blog.id}`}
                        className="text-base md:text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-6"
                      >
                        {blog.excerpt}
                      </motion.p>
                      
                      {/* Fake blurred content */}
                      <div className="relative mt-8">
                        <div className="text-base md:text-lg text-gray-700 dark:text-gray-300 leading-relaxed blur-md opacity-50 select-none">
                          <p className="mb-4">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
                          <p className="mb-4">Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
                          <p>Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.</p>
                        </div>
                        
                        {/* Newsletter Overlay */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-10 bg-white/40 dark:bg-zinc-900/40 backdrop-blur-[2px]">
                          <div className="bg-white dark:bg-zinc-800 p-8 rounded-2xl shadow-xl border border-gray-100 dark:border-zinc-700 max-w-md w-full">
                            <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-2">Read the Full Article</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Subscribe to our newsletter to unlock this article and get the latest travel stories delivered to your inbox.</p>
                            
                            <form className="flex flex-col gap-3" onSubmit={(e) => e.preventDefault()}>
                              <input 
                                type="email" 
                                placeholder="Enter your email address" 
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF9933] transition-all"
                                required
                              />
                              <button 
                                type="submit"
                                className="w-full px-4 py-3 rounded-xl bg-[#FF9933] hover:bg-[#e68a2e] text-white font-semibold transition-colors"
                              >
                                Subscribe to Unlock
                              </button>
                            </form>
                            <p className="text-xs text-gray-400 mt-4">No spam. Unsubscribe anytime.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                );
              })()}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
