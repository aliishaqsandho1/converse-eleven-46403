
import { apiConfig } from '@/utils/apiConfig';

// API response types for reports
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface SalesReportData {
  salesReport: Array<{
    period: string;
    totalSales: number;
    totalOrders: number;
    avgOrderValue: number;
    topProduct: string;
  }>;
  summary: {
    totalRevenue: number;
    totalOrders: number;
    avgOrderValue: number;
    growth: number;
  };
}

export interface InventoryReportData {
  inventoryReport: {
    totalProducts: number;
    totalValue: number;
    lowStockItems: Array<{
      productId: number;
      productName: string;
      currentStock: number;
      minStock: number;
      reorderQuantity: number;
    }>;
    fastMovingItems: Array<{
      productId: number;
      productName: string;
      soldQuantity: number;
      revenue: number;
    }>;
    slowMovingItems: any[];
    deadStock: any[];
  };
}

export interface FinancialReportData {
  financialReport: {
    revenue: {
      total: number;
      breakdown: Array<{
        month: string;
        amount: number;
      }>;
    };
    expenses: {
      total: number;
      breakdown: Array<{
        category: string;
        amount: number;
      }>;
    };
    profit: {
      gross: number;
      net: number;
      margin: number;
    };
    cashFlow: {
      opening: number;
      inflow: number;
      outflow: number;
      closing: number;
    };
  };
}

// New Advanced Report Types
export interface ProfitabilityTrendData {
  period: string;
  revenue: number;
  expenses: number;
  profit: number;
}

export interface CustomerSegmentData {
  customerId: number;
  name: string;
  segment: string;
  value: number;
  frequency: number;
  recencyDays: number;
}

export interface YearOverYearGrowthData {
  year: number;
  currentRevenue: number;
  previousRevenue: number;
  growthPercentage: number;
}

export interface RevenueForecastData {
  month: string;
  predictedRevenue: number;
  confidence?: number;
}

export interface InventoryHealthData {
  productId: number;
  productName: string;
  stockLevel: number;
  reorderLevel: number;
  status: string;
  lastUpdated: string;
}

export interface KPIMetricsData {
  revenue: number;
  salesCount: number;
  revenueGrowth: number;
  salesGrowth: number;
}

export interface PerformanceScorecardData {
  salesPerformance: number;
  customerSatisfaction: number;
  inventoryEfficiency: number;
}

export interface OpportunityData {
  id: number;
  description: string;
  potential: string;
}

export interface RiskData {
  id: number;
  description: string;
  severity: string;
}

export interface ActionItemData {
  id: number;
  description: string;
  priority: string;
  timeframe: string;
  dueDate: string;
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
    console.error('Reports API request failed:', error);
    throw error;
  }
};

// Reports API
export const reportsApi = {
  // Original reports
  getSalesReport: (params?: {
    period?: "daily" | "weekly" | "monthly" | "yearly";
    dateFrom?: string;
    dateTo?: string;
    groupBy?: "date" | "product" | "customer" | "category";
  }) => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value) queryParams.append(key, value.toString());
      });
    }
    const query = queryParams.toString();
    return apiRequest<ApiResponse<SalesReportData>>(`/reports/sales${query ? `?${query}` : ''}`);
  },

  getInventoryReport: () => 
    apiRequest<ApiResponse<InventoryReportData>>('/reports/inventory'),

  getFinancialReport: (params?: {
    period?: "monthly" | "quarterly" | "yearly";
    year?: number;
  }) => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value) queryParams.append(key, value.toString());
      });
    }
    const query = queryParams.toString();
    return apiRequest<ApiResponse<FinancialReportData>>(`/reports/financial${query ? `?${query}` : ''}`);
  },

  // Profitability Analysis APIs
  getProfitabilityTrend: (params?: {
    period?: string;
    year?: number;
    months?: number;
  }) => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value) queryParams.append(key, value.toString());
      });
    }
    const query = queryParams.toString();
    return apiRequest<ApiResponse<ProfitabilityTrendData[]>>(`/reports/profitability-trend${query ? `?${query}` : ''}`);
  },

  getCustomerSegmentation: (params?: {
    period?: string;
    segmentBy?: "value" | "frequency" | "recency";
  }) => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value) queryParams.append(key, value.toString());
      });
    }
    const query = queryParams.toString();
    return apiRequest<ApiResponse<CustomerSegmentData[]>>(`/reports/customer-segmentation${query ? `?${query}` : ''}`);
  },

  getYearOverYearGrowth: (params?: {
    year?: number;
  }) => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value) queryParams.append(key, value.toString());
      });
    }
    const query = queryParams.toString();
    return apiRequest<ApiResponse<YearOverYearGrowthData>>(`/reports/year-over-year-growth${query ? `?${query}` : ''}`);
  },

  // Predictive Insights APIs
  getRevenueForecast: (params?: {
    months?: number;
    includeConfidence?: boolean;
    model?: "linear" | "seasonal" | "ai";
  }) => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) queryParams.append(key, value.toString());
      });
    }
    const query = queryParams.toString();
    return apiRequest<ApiResponse<RevenueForecastData[]>>(`/reports/revenue-forecast${query ? `?${query}` : ''}`);
  },

  getInventoryHealthMatrix: () =>
    apiRequest<ApiResponse<InventoryHealthData[]>>('/reports/inventory-health-matrix'),

  getPredictiveAnalytics: (params?: {
    forecastPeriod?: string;
  }) => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value) queryParams.append(key, value.toString());
      });
    }
    const query = queryParams.toString();
    return apiRequest<ApiResponse<any[]>>(`/reports/predictive-analytics${query ? `?${query}` : ''}`);
  },

  // Performance Metrics APIs
  getKPIMetrics: (params?: {
    period?: string;
    compareWith?: "lastPeriod" | "lastYear";
  }) => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value) queryParams.append(key, value.toString());
      });
    }
    const query = queryParams.toString();
    return apiRequest<ApiResponse<KPIMetricsData>>(`/reports/kpi-metrics${query ? `?${query}` : ''}`);
  },

  getPerformanceScorecard: () =>
    apiRequest<ApiResponse<PerformanceScorecardData>>('/reports/performance-scorecard'),

  getOperationalMetrics: () =>
    apiRequest<ApiResponse<any>>('/reports/operational-metrics'),

  // Strategic Intelligence APIs
  getGrowthOpportunities: () =>
    apiRequest<ApiResponse<OpportunityData[]>>('/reports/growth-opportunities'),

  getRiskFactors: () =>
    apiRequest<ApiResponse<RiskData[]>>('/reports/risk-factors'),

  getActionItems: (params?: {
    priority?: "high" | "medium" | "low";
    timeframe?: "short" | "medium" | "long";
  }) => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value) queryParams.append(key, value.toString());
      });
    }
    const query = queryParams.toString();
    return apiRequest<ApiResponse<ActionItemData[]>>(`/reports/action-items${query ? `?${query}` : ''}`);
  },

  getAIRecommendations: () =>
    apiRequest<ApiResponse<any[]>>('/reports/ai-recommendations'),
};
