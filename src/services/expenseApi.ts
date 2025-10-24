import { apiConfig } from '@/utils/apiConfig';

// Expense types based on database schema
export interface Expense {
  id: number;
  category: string;
  account_id: number;
  transaction_id: number;
  description: string;
  amount: number;
  date: string;
  reference: string;
  payment_method: 'cash' | 'bank_transfer' | 'cheque';
  receipt_url?: string;
  created_by?: number;
  created_at: string;
}

export interface ExpenseCategory {
  id: number;
  name: string;
  description?: string;
  is_active: boolean;
  created_at: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalRecords: number;
    limit: number;
  };
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
    console.error('Expense API request failed:', error);
    throw error;
  }
};

// Scheduled expense types
export interface ScheduledExpense {
  id: number;
  category: string;
  description: string;
  amount: number;
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  next_execution: string;
  status: 'active' | 'paused' | 'inactive';
  account_id?: number;
  payment_method: 'cash' | 'bank_transfer' | 'cheque';
  created_at: string;
  last_executed?: string;
  execution_count: number;
}

export const expenseApi = {
  // Regular expense management - using /expenses endpoints
  getExpenses: (params?: {
    category?: string;
    account_id?: number;
    payment_method?: string;
    date_from?: string;
    date_to?: string;
    page?: number;
    limit?: number;
  }) => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) queryParams.append(key, value.toString());
      });
    }
    const query = queryParams.toString();
    return apiRequest<ApiResponse<Expense[]>>(`/expenses${query ? `?${query}` : ''}`);
  },

  getExpense: (id: number) =>
    apiRequest<ApiResponse<Expense>>(`/expenses/${id}`),

  createExpense: (expense: {
    category: string;
    amount: number;
    date: string;
    payment_method: 'cash' | 'bank_transfer' | 'cheque';
    account_id?: number;
    description?: string;
    reference?: string;
    receipt_url?: string;
    created_by?: number;
  }) =>
    apiRequest<ApiResponse<Expense>>('/expenses', {
      method: 'POST',
      body: JSON.stringify(expense),
    }),

  updateExpense: (id: number, expense: Partial<Expense>) =>
    apiRequest<ApiResponse<Expense>>(`/expenses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(expense),
    }),

  deleteExpense: (id: number) =>
    apiRequest<ApiResponse<{ deleted: boolean }>>(`/expenses/${id}`, {
      method: 'DELETE',
    }),

  // Expense summary
  getExpenseSummary: (params?: {
    date_from?: string;
    date_to?: string;
  }) => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) queryParams.append(key, value.toString());
      });
    }
    const query = queryParams.toString();
    return apiRequest<ApiResponse<{
      total: { count: number; amount: number };
      by_category: Array<{
        category: string;
        amount: number;
        count: number;
        percentage: number;
      }>;
      by_payment_method: Array<{
        payment_method: string;
        amount: number;
        count: number;
        percentage: number;
      }>;
      monthly_trend: Array<{
        month: string;
        amount: number;
        count: number;
      }>;
    }>>(`/expenses/summary${query ? `?${query}` : ''}`);
  },

  // Categories management
  getCategories: () =>
    apiRequest<ApiResponse<string[]>>('/expenses/categories'),

  createCategory: (category: string) =>
    apiRequest<ApiResponse<{ category: string }>>('/expenses/categories', {
      method: 'POST',
      body: JSON.stringify({ category }),
    }),

  // Bulk operations
  bulkDeleteExpenses: (ids: number[]) =>
    apiRequest<ApiResponse<{ message: string }>>('/expenses/bulk-delete', {
      method: 'POST',
      body: JSON.stringify({ ids }),
    }),

  // Export functionality
  exportExpenses: (params?: {
    category?: string;
    date_from?: string;
    date_to?: string;
  }) => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) queryParams.append(key, value.toString());
      });
    }
    const query = queryParams.toString();
    return apiRequest<ApiResponse<{
      data: Expense[];
      export_info: {
        format: string;
        total_records: number;
        exported_at: string;
      };
    }>>(`/expenses/export${query ? `?${query}` : ''}`);
  },

  // Scheduled expenses management - using /finance/expenses/scheduled endpoints
  getScheduledExpenses: (params?: {
    status?: 'active' | 'paused' | 'inactive';
    category?: string;
    frequency?: 'daily' | 'weekly' | 'monthly' | 'yearly';
    page?: number;
    limit?: number;
  }) => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) queryParams.append(key, value.toString());
      });
    }
    const query = queryParams.toString();
    return apiRequest<ApiResponse<ScheduledExpense[]>>(`/finance/expenses/scheduled${query ? `?${query}` : ''}`);
  },

  createScheduledExpense: (scheduledExpense: {
    category: string;
    description: string;
    amount: number;
    frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
    start_date: string;
    account_id?: number;
    payment_method: 'cash' | 'bank_transfer' | 'cheque';
  }) =>
    apiRequest<ApiResponse<ScheduledExpense>>('/finance/expenses/scheduled', {
      method: 'POST',
      body: JSON.stringify(scheduledExpense),
    }),

  updateScheduledExpense: (id: number, scheduledExpense: Partial<ScheduledExpense>) =>
    apiRequest<ApiResponse<ScheduledExpense>>(`/finance/expenses/scheduled/${id}`, {
      method: 'PUT',
      body: JSON.stringify(scheduledExpense),
    }),

  updateScheduledExpenseStatus: (id: number, status: 'active' | 'paused' | 'inactive') =>
    apiRequest<ApiResponse<{ id: number; status: string; updated_at: string }>>(`/finance/expenses/scheduled/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    }),

  deleteScheduledExpense: (id: number) =>
    apiRequest<ApiResponse<{ deleted: boolean }>>(`/finance/expenses/scheduled/${id}`, {
      method: 'DELETE',
    }),

  getNextExecutions: (days?: number) => {
    const queryParams = new URLSearchParams();
    if (days !== undefined) queryParams.append('days', days.toString());
    const query = queryParams.toString();
    return apiRequest<ApiResponse<Array<{
      id: number;
      description: string;
      amount: string;
      next_execution: string;
      days_until: number;
      frequency: string;
    }>>>(`/finance/expenses/scheduled/next-executions${query ? `?${query}` : ''}`);
  },

  executeScheduledExpense: (id: number) =>
    apiRequest<ApiResponse<{
      scheduled_expense_id: number;
      expense_id: number;
      executed_at: string;
      next_execution: string;
      execution_count: number;
    }>>(`/finance/expenses/scheduled/${id}/execute`, {
      method: 'POST',
    }),
};