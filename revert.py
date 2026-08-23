import re

with open('src/pages/Home.tsx', 'r', encoding='utf-8') as f:
    data = f.read()

old_prime = """                  <img src={dest.img || dest.image_url || dest.image} alt={dest.location} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300"></div>
                  
                  {/* Glassmorphism content reveal */}
                  <div className="absolute inset-x-4 bottom-4 translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-500 ease-out flex flex-col justify-end">
                    <div className="bg-white/10 backdrop-blur-md border border-white/20 shadow-xl rounded-xl p-4 text-center">
                      <span className="text-white font-bold text-sm tracking-widest uppercase mb-1 block drop-shadow-sm">{dest.location}</span>
                      <span className="text-white/80 text-[10px] uppercase tracking-wider">Explore Tours &rarr;</span>
                    </div>
                  </div>
                  
                  {/* Default static label */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 uppercase tracking-widest text-white text-xs font-bold drop-shadow-lg group-hover:opacity-0 transition-opacity duration-300 pointer-events-none whitespace-nowrap">
                    {dest.location}
                  </div>"""

new_prime = """                  <img src={dest.img || dest.image_url || dest.image} alt={dest.location} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-sm px-6 py-2 border border-white/20 uppercase tracking-widest text-white text-xs font-bold">
                    {dest.location}
                  </div>"""

data = data.replace(old_prime, new_prime)

old_cta = """      {/* Modern Parallax CTA using Scroll-driven animations */}
      <style>{`
        @supports ((animation-timeline: view()) and (animation-range: entry)) {
          @keyframes modern-parallax {
            from { transform: translateY(-15%); }
            to { transform: translateY(15%); }
          }
          .parallax-wrapper {
            view-timeline: --cta-wrapper;
            overflow: clip;
          }
          .parallax-layer {
            animation: modern-parallax linear both;
            animation-timeline: --cta-wrapper;
            height: 130%;
            top: -15%;
            background-attachment: scroll !important; /* Override fallback */
          }
        }
      `}</style>
      <div className="relative py-40 mt-10 parallax-wrapper">
        <div className="absolute inset-0 bg-center bg-cover parallax-layer bg-fixed" style={{ backgroundImage: 'url(https://upload.wikimedia.org/wikipedia/commons/7/76/Wing.two.arp.600pix.jpg)' }}>
          <div className="absolute inset-0 bg-black/50 z-0"></div>
        </div>
        <div className="relative z-10 max-w-4xl mx-auto text-center px-6 flex flex-col items-center">
          <h4 className="text-white text-xs font-bold tracking-[0.2em] mb-4 uppercase">Finding the perfect trails</h4>
          <h2 className="text-4xl md:text-6xl font-extrabold text-white mb-12" style={{ fontFamily: 'var(--font-serif)' }}>Get ready to explore and <br/>discover your world.</h2>
        </div>
      </div>"""

new_cta = """      {/* Parallax CTA */}
      <div className="relative py-40 mt-10">
        <div className="absolute inset-0 bg-fixed bg-center bg-cover" style={{ backgroundImage: 'url(https://upload.wikimedia.org/wikipedia/commons/7/76/Wing.two.arp.600pix.jpg)' }}>
          <div className="absolute inset-0 bg-black/50 z-0"></div>
        </div>
        <div className="relative z-10 max-w-4xl mx-auto text-center px-6 flex flex-col items-center">
          <h4 className="text-white text-xs font-bold tracking-[0.2em] mb-4 uppercase">Finding the perfect trails</h4>
          <h2 className="text-4xl md:text-6xl font-extrabold text-white mb-12">Get ready to explore and <br/>discover your world.</h2>
        </div>
      </div>"""
      
data = data.replace(old_cta, new_cta)

old_happy = """          <div className="flex flex-col md:flex-row gap-12 items-center">
            
            <div className="flex-1 flex flex-col justify-center items-start">
              <h2 className="text-5xl md:text-6xl font-extrabold text-gray-900 dark:text-white leading-[1.1] mb-8 font-serif">
                Our happy <br/>traveller.
              </h2>
              <div className="flex gap-4">
                <button className="w-12 h-12 rounded-full border border-gray-300 dark:border-gray-700 flex items-center justify-center hover:bg-[#D97736] hover:text-white hover:border-[#D97736] transition-all hover:scale-110">
                  <ArrowRight size={20} className="transform rotate-180" />
                </button>
                <button className="w-12 h-12 rounded-full border border-gray-300 dark:border-gray-700 flex items-center justify-center hover:bg-[#D97736] hover:text-white hover:border-[#D97736] transition-all hover:scale-110">
                  <ArrowRight size={20} />
                </button>
              </div>
            </div>
  
            <div className="flex-1 relative flex justify-center">
               <div className="relative w-72 h-72 rounded-full border-[8px] border-white dark:border-zinc-900 shadow-2xl overflow-hidden z-10 transition-transform duration-700 hover:scale-105">
                 <img src="/images/3ac9bf62d5bb14289acd33e9f5a63ee3.jpg" alt="Happy traveller" className="w-full h-full object-cover" />
               </div>
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 mt-36 z-20 pointer-events-none">
                  <span className="text-7xl text-[#D97736] drop-shadow-lg -rotate-6 inline-block" style={{ fontFamily: 'var(--font-cursive)' }}>Amazing</span>
               </div>
               <div className="absolute top-1/2 -translate-y-1/2 -left-16 -z-0 text-gray-100 dark:text-zinc-800/80 font-serif text-9xl font-black tracking-tighter select-none rotate-90 opacity-40">
                 ALEXANDER
               </div>
            </div>"""

new_happy = """          <div className="flex flex-col md:flex-row gap-12 items-center">
            
            <div className="flex-1 flex flex-col justify-center items-start">
              <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white leading-[1.2] mb-8">
                Our happy <br/>traveller.
              </h2>
              <div className="flex gap-4">
                <button className="w-12 h-12 rounded-full border border-gray-300 dark:border-gray-700 flex items-center justify-center hover:bg-[#D97736] hover:text-white hover:border-[#D97736] transition-colors">
                  <ArrowRight size={20} className="transform rotate-180" />
                </button>
                <button className="w-12 h-12 rounded-full border border-gray-300 dark:border-gray-700 flex items-center justify-center hover:bg-[#D97736] hover:text-white hover:border-[#D97736] transition-colors">
                  <ArrowRight size={20} />
                </button>
              </div>
            </div>
  
            <div className="flex-1 relative flex justify-center">
               <div className="relative w-64 h-64 rounded-full border-[12px] border-white dark:border-zinc-900 shadow-2xl overflow-hidden z-10">
                 <img src="/images/3ac9bf62d5bb14289acd33e9f5a63ee3.jpg" alt="Happy traveller" className="w-full h-full object-cover" />
               </div>
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 mt-32 z-20">
                  <span className="text-6xl text-[#D97736] drop-shadow-md" style={{ fontFamily: 'var(--font-cursive)' }}>Amazing</span>
               </div>
               <div className="absolute top-1/2 -translate-y-1/2 -left-12 -z-0 text-gray-100 dark:text-zinc-800 font-serif text-9xl tracking-tighter select-none rotate-90 opacity-50">
                 ALEXANDER
               </div>
            </div>"""
            
data = data.replace(old_happy, new_happy)

with open('src/pages/Home.tsx', 'w', encoding='utf-8') as f:
    f.write(data)
print("Reverted!")
