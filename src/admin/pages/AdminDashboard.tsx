import { Filter, Calendar, Info, ChevronDown, User } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar } from 'recharts';

const salesData = [
  { name: 'JAN', sales: 1000, revenue: 3000 },
  { name: 'FEB', sales: 2000, revenue: 3800 },
  { name: 'MAR', sales: 1500, revenue: 4200 },
  { name: 'APR', sales: 2200, revenue: 3500 },
  { name: 'MAY', sales: 1800, revenue: 3800 },
  { name: 'JUN', sales: 2100, revenue: 4000 },
  { name: 'JUL', sales: 1900, revenue: 4200 },
  { name: 'AUG', sales: 2300, revenue: 5200 },
  { name: 'SEP', sales: 1800, revenue: 4000 },
  { name: 'OCT', sales: 2400, revenue: 4300 },
  { name: 'NOV', sales: 1900, revenue: 3800 },
  { name: 'DEC', sales: 2000, revenue: 4500 },
];

const miniEarningsData = [{ v: 20 }, { v: 30 }, { v: 25 }, { v: 40 }, { v: 35 }, { v: 45 }, { v: 40 }, { v: 50 }, { v: 45 }];

const analysisData = [
  { name: 'A', ny: 40, fr: 20, ca: 30 },
  { name: 'B', ny: 60, fr: 30, ca: 40 },
  { name: 'C', ny: 30, fr: 80, ca: 20 },
  { name: 'D', ny: 50, fr: 40, ca: 30 },
  { name: 'E', ny: 80, fr: 30, ca: 50 },
  { name: 'F', ny: 40, fr: 90, ca: 20 },
  { name: 'G', ny: 60, fr: 40, ca: 40 },
  { name: 'H', ny: 30, fr: 50, ca: 30 },
  { name: 'I', ny: 70, fr: 30, ca: 60 },
  { name: 'J', ny: 50, fr: 60, ca: 30 },
  { name: 'K', ny: 90, fr: 40, ca: 50 },
];

export const AdminDashboard = () => {
  return (
    <div className="max-w-[1200px] mx-auto space-y-6 relative z-10">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-3 py-1.5 bg-white/60 backdrop-blur-md border border-white/60 rounded-xl text-[13px] font-medium text-gray-700 shadow-sm hover:bg-white/80 transition-all">
            <Filter size={14} /> Filters
          </button>
          <button className="flex items-center gap-2 px-3 py-1.5 bg-white/60 backdrop-blur-md border border-white/60 rounded-xl text-[13px] font-medium text-gray-700 shadow-sm hover:bg-white/80 transition-all">
            <Calendar size={14} /> Last 30 days <ChevronDown size={14} />
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Earnings */}
        <div className="bg-white/50 backdrop-blur-xl border border-white/60 shadow-[0_8px_32px_rgba(0,0,0,0.04)] rounded-2xl p-5">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-1.5 text-gray-600 text-[13px] font-medium mb-1">
                Earnings <Info size={12} className="text-gray-400" />
              </div>
              <div className="text-3xl font-extrabold text-gray-900 mb-2 tracking-tight">$22,500</div>
              <div className="flex items-center gap-1.5 text-[11px]">
                <span className="flex items-center text-emerald-600 bg-emerald-100/50 backdrop-blur-sm px-1.5 py-0.5 rounded font-bold border border-emerald-200/50">↑ 19%</span>
                <span className="text-gray-500">vs last month</span>
              </div>
            </div>
            <div className="w-24 h-12">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={miniEarningsData}>
                  <Line type="monotone" dataKey="v" stroke="#8B5CF6" strokeWidth={2} dot={false} isAnimationActive={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Sales */}
        <div className="bg-white/50 backdrop-blur-xl border border-white/60 shadow-[0_8px_32px_rgba(0,0,0,0.04)] rounded-2xl p-5">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-1.5 text-gray-600 text-[13px] font-medium mb-1">
                Sales <Info size={12} className="text-gray-400" />
              </div>
              <div className="text-3xl font-extrabold text-gray-900 mb-2 tracking-tight">$500</div>
              <div className="flex items-center gap-1.5 text-[11px]">
                <span className="flex items-center text-emerald-600 bg-emerald-100/50 backdrop-blur-sm px-1.5 py-0.5 rounded font-bold border border-emerald-200/50">↑ 16%</span>
                <span className="text-gray-500">vs last month</span>
              </div>
            </div>
            <div className="w-24 h-12 flex items-end gap-1 pb-1">
              {[30, 60, 40, 80, 50, 70].map((h, i) => (
                <div key={i} className="flex-1 bg-rose-500 rounded-t-sm" style={{ height: `${h}%` }}></div>
              ))}
            </div>
          </div>
        </div>

        {/* Orders */}
        <div className="bg-white/50 backdrop-blur-xl border border-white/60 shadow-[0_8px_32px_rgba(0,0,0,0.04)] rounded-2xl p-5">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-1.5 text-gray-600 text-[13px] font-medium mb-1">
                Orders <Info size={12} className="text-gray-400" />
              </div>
              <div className="text-3xl font-extrabold text-gray-900 mb-2 tracking-tight">215</div>
              <div className="flex items-center gap-1.5 text-[11px]">
                <span className="flex items-center text-rose-600 bg-rose-100/50 backdrop-blur-sm px-1.5 py-0.5 rounded font-bold border border-rose-200/50">↓ 17%</span>
                <span className="text-gray-500">vs last month</span>
              </div>
            </div>
            <div className="w-24 h-12 flex items-end gap-1 pb-1">
              {[60, 40, 80, 50, 100, 70].map((h, i) => (
                <div key={i} className="flex-1 bg-emerald-400 rounded-t-sm" style={{ height: `${h}%` }}></div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Middle Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Overview Chart */}
        <div className="lg:col-span-2 bg-white/50 backdrop-blur-xl border border-white/60 shadow-[0_8px_32px_rgba(0,0,0,0.04)] rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-900 font-bold flex items-center gap-1.5 text-sm">
              Sales Overview <Info size={12} className="text-gray-400" />
            </h3>
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-1 text-[11px] text-gray-500 hover:text-gray-700 font-medium">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.5 2v6h-6M2.13 15.57a10 10 0 1 0 4.43-13.43L2 6" /></svg>
              </button>
              <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white/60 backdrop-blur-md border border-white/60 rounded-lg text-[11px] font-medium text-gray-600 shadow-sm">
                <Filter size={12} /> Filter
              </button>
              <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white/60 backdrop-blur-md border border-white/60 rounded-lg text-[11px] font-medium text-gray-600 shadow-sm">
                This Year <ChevronDown size={12} />
              </button>
            </div>
          </div>

          <div className="flex items-start gap-12 mb-6">
            <div>
              <div className="text-[11px] text-gray-500 font-medium mb-1">Total Revenue</div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold text-gray-900">$22,500</span>
                <span className="text-[10px] text-emerald-600 font-bold">↑ 25%</span>
              </div>
            </div>
            <div>
              <div className="text-[11px] text-gray-500 font-medium mb-1">Current Month</div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold text-gray-900">$42,00</span>
                <span className="text-[10px] text-rose-600 font-bold">↓ 12%</span>
              </div>
            </div>
            <div>
              <div className="text-[11px] text-gray-500 font-medium mb-1">This Year</div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold text-gray-900">$3,489</span>
                <span className="text-[10px] text-emerald-600 font-bold">↑ 16%</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 mb-4 text-[11px] font-medium">
            <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-rose-400"></div> <span className="text-gray-600">Sales</span></div>
            <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-indigo-500"></div> <span className="text-gray-600">Revenue</span></div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FB7185" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#FB7185" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="gridGradient" x1="0" y1="0" x2="0" y2="1">
                     <stop offset="0%" stopColor="#6b7280" stopOpacity={0.2}/>
                     <stop offset="100%" stopColor="#6b7280" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="url(#gridGradient)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#6B7280' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#6B7280' }} tickFormatter={(val) => `$${val/1000}K`} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: '1px solid rgba(255,255,255,0.6)', background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(8px)', boxShadow: '0 8px 32px rgba(0,0,0,0.08)', fontSize: '12px', fontWeight: 'bold' }}
                  itemStyle={{ padding: 0 }}
                  labelStyle={{ display: 'none' }}
                  cursor={{ stroke: '#6366F1', strokeWidth: 2, strokeDasharray: '4 4' }}
                />
                <Area type="monotone" dataKey="sales" stroke="#FB7185" strokeWidth={2} fillOpacity={1} fill="url(#colorSales)" />
                <Area type="monotone" dataKey="revenue" stroke="#6366F1" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Site Traffic */}
        <div className="bg-white/50 backdrop-blur-xl border border-white/60 shadow-[0_8px_32px_rgba(0,0,0,0.04)] rounded-2xl p-6 flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-gray-900 font-bold flex items-center gap-1.5 text-sm">
              Site Traffic <Info size={12} className="text-gray-400" />
            </h3>
          </div>
          
          <div className="flex-1 flex flex-col items-center justify-center relative">
            {/* SVG Donut */}
            <svg viewBox="0 0 200 120" className="w-full max-w-[240px] drop-shadow-sm">
              {/* Background arcs */}
              <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="16" strokeLinecap="round" />
              <path d="M 45 100 A 55 55 0 0 1 155 100" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="16" strokeLinecap="round" />
              {/* Foreground arcs */}
              <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="#FB7185" strokeWidth="16" strokeLinecap="round" strokeDasharray="251" strokeDashoffset="50" />
              <path d="M 45 100 A 55 55 0 0 1 125 50" fill="none" stroke="#6366F1" strokeWidth="16" strokeLinecap="round" />
              
              {/* Center globe icon */}
              <circle cx="100" cy="90" r="12" fill="rgba(255,255,255,0.8)" />
              <g transform="translate(94, 84)" stroke="#6B7280" strokeWidth="1" fill="none">
                <circle cx="6" cy="6" r="5" />
                <ellipse cx="6" cy="6" rx="2.5" ry="5" />
                <path d="M1 6h10" />
              </g>
            </svg>

            <div className="text-center mt-2">
              <div className="flex items-center justify-center gap-1.5">
                <span className="text-2xl font-extrabold text-gray-900">11,5500</span>
                <span className="text-[10px] text-emerald-600 font-bold">↑ 66%</span>
              </div>
              <div className="text-[11px] text-gray-500 mt-0.5">Total User</div>
            </div>
          </div>

          <div className="mt-8 space-y-4">
            <div className="flex items-center justify-between text-[13px]">
              <div className="flex items-center gap-2"><div className="w-3.5 h-1.5 rounded-full bg-rose-400"></div> <span className="text-gray-600 font-medium">Positive Sentiment</span></div>
              <span className="font-bold text-gray-900">77%</span>
            </div>
            <div className="flex items-center justify-between text-[13px]">
              <div className="flex items-center gap-2"><div className="w-3.5 h-1.5 rounded-full bg-indigo-500"></div> <span className="text-gray-600 font-medium">Return Visitors</span></div>
              <span className="font-bold text-gray-900">50%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Progress Charts */}
        <div className="bg-white/50 backdrop-blur-xl border border-white/60 shadow-[0_8px_32px_rgba(0,0,0,0.04)] rounded-2xl p-6 flex items-center justify-around">
          <div className="flex flex-col items-center">
            <div className="relative w-24 h-24 mb-4">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="12" />
                <circle cx="50" cy="50" r="40" fill="none" stroke="#FB7185" strokeWidth="12" strokeDasharray="251" strokeDashoffset="165" strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center text-xl font-bold text-gray-900">34%</div>
            </div>
            <div className="text-[11px] text-emerald-600 font-bold bg-emerald-100/50 backdrop-blur-sm border border-emerald-200/50 px-2 py-0.5 rounded mb-1">↑ 24%</div>
            <div className="text-sm font-bold text-gray-900">Lead</div>
            <div className="text-[10px] text-gray-500">vs last week</div>
          </div>
          
          <div className="flex flex-col items-center">
            <div className="relative w-24 h-24 mb-4">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="12" />
                <circle cx="50" cy="50" r="40" fill="none" stroke="#6366F1" strokeWidth="12" strokeDasharray="251" strokeDashoffset="45" strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center text-xl font-bold text-gray-900">82%</div>
            </div>
            <div className="text-[11px] text-emerald-600 font-bold bg-emerald-100/50 backdrop-blur-sm border border-emerald-200/50 px-2 py-0.5 rounded mb-1">↑ 56%</div>
            <div className="text-sm font-bold text-gray-900">Sales</div>
            <div className="text-[10px] text-gray-500">vs last week</div>
          </div>
        </div>

        {/* Connection */}
        <div className="bg-white/50 backdrop-blur-xl border border-white/60 shadow-[0_8px_32px_rgba(0,0,0,0.04)] rounded-2xl p-6">
          <h3 className="text-gray-900 font-bold flex items-center gap-2 text-sm mb-5">
            <User size={14} className="text-gray-500" /> Connection
          </h3>
          <div className="flex justify-between mb-6 pb-4 border-b border-white/40">
            <div>
              <div className="text-[11px] text-gray-500 mb-0.5">Following</div>
              <div className="text-lg font-bold text-gray-900">2598</div>
            </div>
            <div className="text-right">
              <div className="text-[11px] text-gray-500 mb-0.5">Followers</div>
              <div className="text-lg font-bold text-gray-900">8547</div>
            </div>
          </div>
          <div className="space-y-4">
            {[
              { name: 'Mahmuda Ruma', role: 'DevOps', img: 'https://ui-avatars.com/api/?name=Mahmuda+Ruma&background=FCA5A5&color=fff' },
              { name: 'Juwel Jaman', role: 'Founder & CEO', img: 'https://ui-avatars.com/api/?name=Juwel+Jaman&background=93C5FD&color=fff' },
              { name: 'Elham', role: 'Designer', img: 'https://ui-avatars.com/api/?name=Elham&background=FCD34D&color=fff' },
            ].map((user, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img src={user.img} alt={user.name} className="w-8 h-8 rounded-full shadow-sm ring-2 ring-white/50" />
                  <span className="text-[13px] font-bold text-gray-900">{user.name}</span>
                </div>
                <span className="text-[11px] text-gray-500">{user.role}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Analysis */}
        <div className="bg-white/50 backdrop-blur-xl border border-white/60 shadow-[0_8px_32px_rgba(0,0,0,0.04)] rounded-2xl p-6 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-900 font-bold flex items-center gap-1.5 text-sm">
              Analysis <Info size={12} className="text-gray-400" />
            </h3>
            <button className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/60 backdrop-blur-sm border border-white/60 text-[11px] font-medium text-gray-600 shadow-sm">
              This Month <ChevronDown size={12} />
            </button>
          </div>
          
          <div className="flex justify-between mb-6">
            <div>
              <div className="text-[11px] text-gray-500 mb-0.5">New York</div>
              <div className="text-sm font-bold text-gray-900">2598</div>
            </div>
            <div className="text-center">
              <div className="text-[11px] text-gray-500 mb-0.5">France</div>
              <div className="text-sm font-bold text-gray-900">8547</div>
            </div>
            <div className="text-right">
              <div className="text-[11px] text-gray-500 mb-0.5">Canada</div>
              <div className="text-sm font-bold text-gray-900">2707</div>
            </div>
          </div>

          <div className="flex items-center gap-4 mb-4 text-[10px] font-medium">
            <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-rose-500"></div> <span className="text-gray-600">New User</span></div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-rose-100" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(254,205,211,0.8) 2px, rgba(254,205,211,0.8) 4px)' }}></div>
              <span className="text-gray-600">Unique Visitors</span>
            </div>
          </div>

          <div className="flex-1 h-32 w-full mt-auto">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analysisData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }} barGap={0}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(107,114,128,0.2)" />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.4)' }} 
                  contentStyle={{ borderRadius: '12px', border: '1px solid rgba(255,255,255,0.6)', background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(8px)', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '11px' }} 
                />
                <Bar dataKey="ny" stackId="a" fill="#FB7185" radius={[0, 0, 4, 4]} barSize={12} />
                <Bar dataKey="fr" stackId="a" fill="rgba(255,228,230,0.8)" radius={[4, 4, 0, 0]} barSize={12} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
