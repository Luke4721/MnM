import { Filter, Calendar, Info, ChevronDown, User, TrendingUp, TrendingDown } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
} from 'recharts';
import { PageHeader } from '../components/ui/PageHeader';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

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

const miniEarningsData = [
  { v: 20 },
  { v: 30 },
  { v: 25 },
  { v: 40 },
  { v: 35 },
  { v: 45 },
  { v: 40 },
  { v: 50 },
  { v: 45 },
];

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
    <div className="max-w-[1240px] mx-auto space-y-6 relative z-10">
      {/* Header */}
      <PageHeader
        title="Dashboard"
        description="Key performance indicators, sales volume, web metrics, and operations overview."
        actions={
          <>
            <Button
              variant="secondary"
              size="sm"
              iconLeft={<Filter size={14} className="text-gray-500" />}
            >
              Filters
            </Button>
            <Button
              variant="secondary"
              size="sm"
              iconLeft={<Calendar size={14} className="text-gray-500" />}
              iconRight={<ChevronDown size={14} className="text-gray-400" />}
            >
              Last 30 days
            </Button>
          </>
        }
      />

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
        {/* Earnings */}
        <Card hoverable className="p-5">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-1.5 text-gray-500 text-[12px] font-semibold mb-1 uppercase tracking-wider">
                Earnings <Info size={12} className="text-gray-400" />
              </div>
              <div className="text-3xl font-extrabold text-gray-900 mb-2 tracking-tight">
                $22,500
              </div>
              <div className="flex items-center gap-1.5 text-[11px]">
                <span className="flex items-center gap-0.5 text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-bold border border-emerald-200">
                  <TrendingUp size={12} /> 19%
                </span>
                <span className="text-gray-400 font-medium">vs last month</span>
              </div>
            </div>
            <div className="w-24 h-12">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={miniEarningsData}>
                  <Line
                    type="monotone"
                    dataKey="v"
                    stroke="#8B5CF6"
                    strokeWidth={2}
                    dot={false}
                    isAnimationActive={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Card>

        {/* Sales */}
        <Card hoverable className="p-5">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-1.5 text-gray-500 text-[12px] font-semibold mb-1 uppercase tracking-wider">
                Sales <Info size={12} className="text-gray-400" />
              </div>
              <div className="text-3xl font-extrabold text-gray-900 mb-2 tracking-tight">
                $500
              </div>
              <div className="flex items-center gap-1.5 text-[11px]">
                <span className="flex items-center gap-0.5 text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-bold border border-emerald-200">
                  <TrendingUp size={12} /> 16%
                </span>
                <span className="text-gray-400 font-medium">vs last month</span>
              </div>
            </div>
            <div className="w-24 h-12 flex items-end gap-1.5 pb-1">
              {[30, 60, 40, 80, 50, 70].map((h, i) => (
                <div
                  key={i}
                  className="flex-1 bg-rose-500 rounded-t-sm"
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
          </div>
        </Card>

        {/* Orders */}
        <Card hoverable className="p-5 sm:col-span-2 md:col-span-1">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-1.5 text-gray-500 text-[12px] font-semibold mb-1 uppercase tracking-wider">
                Orders <Info size={12} className="text-gray-400" />
              </div>
              <div className="text-3xl font-extrabold text-gray-900 mb-2 tracking-tight">
                215
              </div>
              <div className="flex items-center gap-1.5 text-[11px]">
                <span className="flex items-center gap-0.5 text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full font-bold border border-rose-200">
                  <TrendingDown size={12} /> 17%
                </span>
                <span className="text-gray-400 font-medium">vs last month</span>
              </div>
            </div>
            <div className="w-24 h-12 flex items-end gap-1.5 pb-1">
              {[60, 40, 80, 50, 100, 70].map((h, i) => (
                <div
                  key={i}
                  className="flex-1 bg-emerald-400 rounded-t-sm"
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Middle Row: Sales Overview & Traffic */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Overview Chart */}
        <Card className="lg:col-span-2 p-6">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
            <h3 className="text-gray-900 font-bold flex items-center gap-1.5 text-sm">
              Sales Overview <Info size={13} className="text-gray-400" />
            </h3>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                iconLeft={<Filter size={12} />}
              >
                Filter
              </Button>
              <Button
                variant="secondary"
                size="sm"
                iconRight={<ChevronDown size={12} />}
              >
                This Year
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap items-start gap-8 sm:gap-12 mb-6">
            <div>
              <div className="text-[11px] text-gray-500 font-medium mb-1">
                Total Revenue
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold text-gray-900">$22,500</span>
                <span className="text-[10px] text-emerald-600 font-bold">↑ 25%</span>
              </div>
            </div>
            <div>
              <div className="text-[11px] text-gray-500 font-medium mb-1">
                Current Month
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold text-gray-900">$4,200</span>
                <span className="text-[10px] text-rose-600 font-bold">↓ 12%</span>
              </div>
            </div>
            <div>
              <div className="text-[11px] text-gray-500 font-medium mb-1">
                This Year
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold text-gray-900">$3,489</span>
                <span className="text-[10px] text-emerald-600 font-bold">↑ 16%</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 mb-4 text-[11px] font-medium">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-rose-400" />
              <span className="text-gray-600">Sales</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
              <span className="text-gray-600">Revenue</span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={salesData}
                margin={{ top: 10, right: 0, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FB7185" stopOpacity={0.18} />
                    <stop offset="95%" stopColor="#FB7185" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.18} />
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gridGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6b7280" stopOpacity={0.15} />
                    <stop offset="100%" stopColor="#6b7280" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="url(#gridGradient)"
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: '#6B7280' }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: '#6B7280' }}
                  tickFormatter={(val) => `$${val / 1000}K`}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: '16px',
                    border: '1px solid rgba(255,255,255,0.7)',
                    background: 'rgba(255,255,255,0.9)',
                    backdropFilter: 'blur(12px)',
                    boxShadow: '0 12px 32px rgba(0,0,0,0.08)',
                    fontSize: '12px',
                    fontWeight: 'bold',
                  }}
                  itemStyle={{ padding: 0 }}
                  labelStyle={{ display: 'none' }}
                  cursor={{
                    stroke: '#6366F1',
                    strokeWidth: 2,
                    strokeDasharray: '4 4',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="sales"
                  stroke="#FB7185"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorSales)"
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#6366F1"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Site Traffic */}
        <Card className="p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-900 font-bold flex items-center gap-1.5 text-sm">
              Site Traffic <Info size={13} className="text-gray-400" />
            </h3>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center relative my-4">
            <svg
              viewBox="0 0 200 120"
              className="w-full max-w-[240px] drop-shadow-sm"
            >
              <path
                d="M 20 100 A 80 80 0 0 1 180 100"
                fill="none"
                stroke="rgba(255,255,255,0.7)"
                strokeWidth="16"
                strokeLinecap="round"
              />
              <path
                d="M 45 100 A 55 55 0 0 1 155 100"
                fill="none"
                stroke="rgba(255,255,255,0.7)"
                strokeWidth="16"
                strokeLinecap="round"
              />
              <path
                d="M 20 100 A 80 80 0 0 1 180 100"
                fill="none"
                stroke="#FB7185"
                strokeWidth="16"
                strokeLinecap="round"
                strokeDasharray="251"
                strokeDashoffset="50"
              />
              <path
                d="M 45 100 A 55 55 0 0 1 125 50"
                fill="none"
                stroke="#6366F1"
                strokeWidth="16"
                strokeLinecap="round"
              />

              <circle cx="100" cy="90" r="12" fill="rgba(255,255,255,0.9)" />
              <g
                transform="translate(94, 84)"
                stroke="#6B7280"
                strokeWidth="1"
                fill="none"
              >
                <circle cx="6" cy="6" r="5" />
                <ellipse cx="6" cy="6" rx="2.5" ry="5" />
                <path d="M1 6h10" />
              </g>
            </svg>

            <div className="text-center mt-2">
              <div className="flex items-center justify-center gap-1.5">
                <span className="text-2xl font-extrabold text-gray-900">
                  115,500
                </span>
                <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  ↑ 66%
                </span>
              </div>
              <div className="text-[11px] text-gray-400 mt-0.5">Total Users</div>
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t border-white/40">
            <div className="flex items-center justify-between text-[13px]">
              <div className="flex items-center gap-2">
                <div className="w-3.5 h-1.5 rounded-full bg-rose-400" />
                <span className="text-gray-600 font-medium">Positive Sentiment</span>
              </div>
              <span className="font-bold text-gray-900">77%</span>
            </div>
            <div className="flex items-center justify-between text-[13px]">
              <div className="flex items-center gap-2">
                <div className="w-3.5 h-1.5 rounded-full bg-indigo-500" />
                <span className="text-gray-600 font-medium">Return Visitors</span>
              </div>
              <span className="font-bold text-gray-900">50%</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Bottom Row: Progress, Leadership, Analysis */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Progress Charts */}
        <Card className="p-6 flex items-center justify-around">
          <div className="flex flex-col items-center">
            <div className="relative w-24 h-24 mb-3">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="rgba(255,255,255,0.7)"
                  strokeWidth="12"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="#FB7185"
                  strokeWidth="12"
                  strokeDasharray="251"
                  strokeDashoffset="165"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center text-xl font-bold text-gray-900">
                34%
              </div>
            </div>
            <div className="text-[10px] text-emerald-600 font-bold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full mb-1">
              ↑ 24%
            </div>
            <div className="text-sm font-bold text-gray-900">Lead</div>
            <div className="text-[10px] text-gray-400">vs last week</div>
          </div>

          <div className="flex flex-col items-center">
            <div className="relative w-24 h-24 mb-3">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="rgba(255,255,255,0.7)"
                  strokeWidth="12"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="#6366F1"
                  strokeWidth="12"
                  strokeDasharray="251"
                  strokeDashoffset="45"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center text-xl font-bold text-gray-900">
                82%
              </div>
            </div>
            <div className="text-[10px] text-emerald-600 font-bold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full mb-1">
              ↑ 56%
            </div>
            <div className="text-sm font-bold text-gray-900">Sales</div>
            <div className="text-[10px] text-gray-400">vs last week</div>
          </div>
        </Card>

        {/* Leadership Team */}
        <Card className="p-6">
          <h3 className="text-gray-900 font-bold flex items-center gap-2 text-sm mb-4">
            <User size={15} className="text-indigo-600" /> Leadership Team
          </h3>
          <div className="flex justify-between mb-4 pb-3 border-b border-white/40">
            <div>
              <div className="text-[11px] text-gray-400 mb-0.5">Founded</div>
              <div className="text-base font-bold text-gray-900">2008</div>
            </div>
            <div className="text-right">
              <div className="text-[11px] text-gray-400 mb-0.5">Directors</div>
              <div className="text-base font-bold text-gray-900">3</div>
            </div>
          </div>
          <div className="space-y-3">
            {[
              {
                name: 'Dr. Sharad Kumar Jindal',
                role: 'Co-founder & Director',
                img: 'https://ui-avatars.com/api/?name=Dr+Sharad+Kumar+Jindal&background=FCA5A5&color=fff',
              },
              {
                name: 'Dr. Sanjeev K. Verma',
                role: 'Co-founder & Director',
                img: 'https://ui-avatars.com/api/?name=Dr+Sanjeev+Kumar+Verma&background=93C5FD&color=fff',
              },
              {
                name: 'Arvind Kumar',
                role: 'Director',
                img: 'https://ui-avatars.com/api/?name=Arvind+Kumar&background=FCD34D&color=fff',
              },
            ].map((user, i) => (
              <div key={i} className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={user.img}
                    alt={user.name}
                    className="w-8 h-8 rounded-full shadow-sm ring-2 ring-white/60 shrink-0"
                  />
                  <span className="text-[13px] font-bold text-gray-900 truncate">
                    {user.name}
                  </span>
                </div>
                <span className="text-[11px] text-gray-400 shrink-0">
                  {user.role}
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* Analysis */}
        <Card className="p-6 flex flex-col md:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-900 font-bold flex items-center gap-1.5 text-sm">
              Regional Analysis <Info size={13} className="text-gray-400" />
            </h3>
            <Button
              variant="secondary"
              size="sm"
              iconRight={<ChevronDown size={12} />}
            >
              This Month
            </Button>
          </div>

          <div className="flex justify-between mb-4">
            <div>
              <div className="text-[11px] text-gray-400 mb-0.5">New York</div>
              <div className="text-sm font-bold text-gray-900">2,598</div>
            </div>
            <div className="text-center">
              <div className="text-[11px] text-gray-400 mb-0.5">France</div>
              <div className="text-sm font-bold text-gray-900">8,547</div>
            </div>
            <div className="text-right">
              <div className="text-[11px] text-gray-400 mb-0.5">Canada</div>
              <div className="text-sm font-bold text-gray-900">2,707</div>
            </div>
          </div>

          <div className="flex items-center gap-4 mb-3 text-[10px] font-medium">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <span className="text-gray-600">New Users</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-rose-200" />
              <span className="text-gray-600">Unique Visitors</span>
            </div>
          </div>

          <div className="flex-1 h-32 w-full mt-auto">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={analysisData}
                margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
                barGap={0}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="rgba(107,114,128,0.15)"
                />
                <Tooltip
                  cursor={{ fill: 'rgba(255,255,255,0.4)' }}
                  contentStyle={{
                    borderRadius: '12px',
                    border: '1px solid rgba(255,255,255,0.6)',
                    background: 'rgba(255,255,255,0.9)',
                    backdropFilter: 'blur(8px)',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                    fontSize: '11px',
                  }}
                />
                <Bar
                  dataKey="ny"
                  stackId="a"
                  fill="#FB7185"
                  radius={[0, 0, 4, 4]}
                  barSize={10}
                />
                <Bar
                  dataKey="fr"
                  stackId="a"
                  fill="rgba(255,228,230,0.8)"
                  radius={[4, 4, 0, 0]}
                  barSize={10}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
};
