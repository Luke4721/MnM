export interface MonthlyStat {
  month: string;
  enquiries: number;
  bookings: number;
  revenue: number;
}

export interface TopDestination {
  name: string;
  count: number;
  percentage: number;
}

export interface RecentEnquiry {
  id: string;
  name: string;
  contact: string;
  destination: string;
  date: string;
  status: 'new' | 'contacted' | 'converted';
  email?: string;
  phone?: string;
  message?: string;
  travelers?: string | number;
  budget?: string;
}

export interface EnquirySource {
  source: 'website' | 'whatsapp' | 'phone' | 'email';
  count: number;
  percentage: number;
}

export interface DashboardStatsData {
  totalEnquiries: number;
  totalPackages: number;
  totalBlogs: number;
  monthlyStats: MonthlyStat[];
  topDestinations: TopDestination[];
  recentEnquiries: RecentEnquiry[];
  enquirySources: EnquirySource[];
}

export interface DashboardApiResponse {
  success: boolean;
  data?: DashboardStatsData;
  error?: string;
}
