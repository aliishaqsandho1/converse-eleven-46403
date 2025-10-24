import { apiConfig } from '@/utils/apiConfig';

// API response types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// Profit API Types
export interface DailyProgress {
  today: string;
  revenue_so_far: string;
  cogs_so_far: string;
  profit_so_far: string;
  completed_sales: string;
  revenue_progress_percent: string;
  time_progress_percent: string;
  projected_revenue: string;
  projected_profit: string;
}

export interface DailyPerformance {
  actual_revenue: string;
  actual_cogs: string;
  actual_profit: string;
  target_revenue: string;
  target_profit: string;
  revenue_variance: string;
  profit_variance: string;
  actual_margin: string;
  target_margin: string;
}

export interface WeekComparison {
  period: string;
  date: string;
  revenue: string;
  cogs: string;
  profit: string;
}

export interface KeyMetrics {
  today_revenue: string;
  today_profit: string;
  yesterday_revenue: string;
  month_revenue: string;
  month_profit: string;
}

export interface CategoryPerformance {
  category_name: string;
  sales_count: string;
  revenue: string;
  cogs: string;
  profit: string;
  margin: string;
}

export interface ProfitOverview {
  today_profit: string;
  today_revenue: string;
  week_profit: string;
  month_profit: string;
  ytd_profit: string;
  best_day_profit: string;
  best_day_date: string;
}

export interface TargetAchievement {
  period: string;
  actual_profit: string;
  target_profit: string;
  variance: string;
}

export interface MonthlyTrend {
  period: string;
  monthly_revenue: string;
  monthly_profit: string;
  margin: string;
  sales_count: string;
  profit_per_sale: string;
}

export interface WeeklyTrend {
  week_number: string;
  week_start: string;
  week_end: string;
  weekly_profit: string;
  weekly_revenue: string;
  week_margin: string;
  sales_count: string;
}

export interface TopCustomer {
  customer_name: string;
  customer_type: string;
  monthly_orders: string;
  monthly_revenue: string;
  monthly_cogs: string;
  monthly_profit: string;
  margin: string;
}

export interface YTDSummary {
  ytd_revenue: string;
  ytd_profit: string;
  ytd_margin: string;
  ytd_sales: string;
}

export interface CurrentMonth {
  current_month_revenue: string;
  current_month_cogs: string;
  current_month_profit: string;
  current_month_margin: string;
  month_sales: string;
}

export interface WeeklyPerformance {
  week_profit: string;
  week_revenue: string;
  week_sales: string;
  week_margin: string;
}

export interface TodayPerformance {
  today_profit: string;
  today_revenue: string;
  today_sales: string;
}

export interface PeriodComparison {
  period: string;
  start_date: string;
  end_date: string;
  revenue: string;
  profit: string;
}

export interface DailyTrend {
  date: string;
  revenue: string;
  profit: string;
  sales_count: string;
  profit_margin: string;
}

export interface MonthlyReport {
  year: string;
  month: string;
  period: string;
  revenue: string;
  profit: string;
  sales_count: string;
  profit_margin: string;
}

// Generic API request function
const apiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const url = `${apiConfig.getBaseUrl()}${endpoint}`;

  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Profit API request failed:', error);
    throw error;
  }
};

// Profit API
export const profitApi = {
  // Dashboard endpoints
  getDailyProgress: () =>
    apiRequest<DailyProgress>('/dashboard/daily-progress'),

  getDailyPerformance: () =>
    apiRequest<DailyPerformance>('/dashboard/daily-performance'),

  getWeekComparison: () =>
    apiRequest<WeekComparison[]>('/dashboard/week-comparison'),

  getKeyMetrics: () =>
    apiRequest<KeyMetrics>('/dashboard/key-metrics'),

  // Reports endpoints
  getCategoryPerformance: () =>
    apiRequest<CategoryPerformance[]>('/reports/category-performance'),

  getProfitOverview: () =>
    apiRequest<ProfitOverview>('/reports/profit-overview'),

  getTargetAchievement: () =>
    apiRequest<TargetAchievement[]>('/reports/target-achievement'),

  getMonthlyTrends: (limit: number = 6) =>
    apiRequest<MonthlyTrend[]>(`/reports/monthly-trends?limit=${limit}`),

  getWeeklyTrends: (limit: number = 4) =>
    apiRequest<WeeklyTrend[]>(`/reports/weekly-trends?limit=${limit}`),

  getTopCustomers: (limit: number = 10) =>
    apiRequest<TopCustomer[]>(`/reports/top-customers?limit=${limit}`),

  getYTDSummary: () =>
    apiRequest<YTDSummary>('/reports/ytd-summary'),

  getCurrentMonth: () =>
    apiRequest<CurrentMonth>('/reports/current-month'),

  getWeeklyPerformance: () =>
    apiRequest<WeeklyPerformance>('/reports/weekly-performance'),

  getTodayPerformance: () =>
    apiRequest<TodayPerformance>('/reports/today-performance'),

  getPeriodComparison: () =>
    apiRequest<PeriodComparison[]>('/reports/period-comparison'),

  // Daily data for charts
  getDailyProfitData: () =>
    apiRequest<DailyTrend[]>(`/daily-report`),

  // Monthly report data
  getMonthlyReport: () =>
    apiRequest<MonthlyReport[]>(`/monthly-report`),
};