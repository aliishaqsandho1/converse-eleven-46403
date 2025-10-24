import { apiConfig } from '@/utils/apiConfig';

// Account types based on database schema
export interface Account {
  id: number;
  account_code: string;
  account_name: string;
  account_type: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense' | 'bank' | 'cash';
  balance: number;
  is_active: boolean;
  created_at: string;
}

export interface Transaction {
  id: number;
  transaction_date: string;
  transaction_number: string;
  description: string;
  reference_type: 'sale' | 'purchase' | 'payment' | 'expense' | 'adjustment';
  reference_id: number;
  total_amount: number;
  created_at: string;
}

export interface CashFlow {
  id: number;
  type: 'inflow' | 'outflow';
  account_id: number;
  transaction_id: number;
  amount: number;
  reference: string;
  description: string;
  date: string;
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
    console.error('Accounts API request failed:', error);
    throw error;
  }
};

export const accountsApi = {
  // Account management
  getAccounts: (params?: {
    type?: string;
    active?: boolean;
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
    return apiRequest<ApiResponse<Account[]>>(`/accounts${query ? `?${query}` : ''}`);
  },

  getAccount: (id: number) =>
    apiRequest<ApiResponse<Account>>(`/accounts/${id}`),

  createAccount: (account: {
    account_code: string;
    account_name: string;
    account_type: Account['account_type'];
    balance?: number;
    is_active?: boolean;
  }) =>
    apiRequest<ApiResponse<Account>>('/accounts', {
      method: 'POST',
      body: JSON.stringify(account),
    }),

  updateAccount: (id: number, account: Partial<Account>) =>
    apiRequest<ApiResponse<Account>>(`/accounts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(account),
    }),

  deleteAccount: (id: number) =>
    apiRequest<ApiResponse<{ deleted: boolean }>>(`/accounts/${id}`, {
      method: 'DELETE',
    }),

  // Account balance operations
  updateAccountBalance: (id: number, amount: number, type: 'credit' | 'debit', description?: string) =>
    apiRequest<ApiResponse<Account>>(`/accounts/${id}/balance`, {
      method: 'POST',
      body: JSON.stringify({
        amount,
        type,
        description
      }),
    }),

  // Transaction management
  getTransactions: (params?: {
    account_id?: number;
    reference_type?: string;
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
    return apiRequest<ApiResponse<Transaction[]>>(`/transactions${query ? `?${query}` : ''}`);
  },

  createTransaction: (transaction: {
    transaction_date: string;
    transaction_number: string;
    description: string;
    reference_type: Transaction['reference_type'];
    reference_id: number;
    total_amount: number;
  }) =>
    apiRequest<ApiResponse<Transaction>>('/transactions', {
      method: 'POST',
      body: JSON.stringify(transaction),
    }),

  // Cash flow management
  getCashFlow: (params?: {
    account_id?: number;
    type?: 'inflow' | 'outflow';
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
    return apiRequest<ApiResponse<CashFlow[]>>(`/cash-flow${query ? `?${query}` : ''}`);
  },

  createCashFlow: (cashFlow: {
    type: 'inflow' | 'outflow';
    account_id: number;
    transaction_id: number;
    amount: number;
    reference: string;
    description: string;
    date: string;
  }) =>
    apiRequest<ApiResponse<CashFlow>>('/cash-flow', {
      method: 'POST',
      body: JSON.stringify(cashFlow),
    }),

  // Summary and analytics
  getAccountsSummary: () =>
    apiRequest<ApiResponse<{
      totalAssets: number;
      totalLiabilities: number;
      totalEquity: number;
      totalRevenue: number;
      totalExpenses: number;
      totalCash: number;
      accountsByType: Array<{
        type: string;
        count: number;
        totalBalance: number;
      }>;
    }>>('/accounts/summary'),

  getCashFlowSummary: (period?: string) =>
    apiRequest<ApiResponse<{
      totalInflow: number;
      totalOutflow: number;
      netCashFlow: number;
      inflowByAccount: Array<{
        account_id: number;
        account_name: string;
        amount: number;
      }>;
      outflowByAccount: Array<{
        account_id: number;
        account_name: string;
        amount: number;
      }>;
    }>>(`/cash-flow/summary${period ? `?period=${period}` : ''}`),
};