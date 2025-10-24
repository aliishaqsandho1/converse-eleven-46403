import { apiConfig } from '@/utils/apiConfig';

// Generic API response type
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

// Account types
export interface Account {
  id: string;
  account_code: string;
  account_name: string;
  account_type: string;
  balance: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AccountSummary {
  total_accounts: number;
  active_accounts: number;
  total_balance: string;
  account_types: Array<{
    type: string;
    count: number;
    total_balance: string;
  }>;
}

// Transaction types
export interface Transaction {
  id: string;
  transaction_date: string;
  transaction_number: string;
  description: string;
  reference_type: string;
  reference_id: string;
  total_amount: string;
  created_at: string;
}

// Cash Flow types
export interface CashFlowEntry {
  id: string;
  type: 'inflow' | 'outflow';
  account_id: string;
  transaction_id: string;
  amount: string;
  reference: string;
  description: string;
  date: string;
  created_at: string;
  account_name?: string;
  account_code?: string;
}

// Finance types from WordPress API
export interface AccountsPayable {
  id: string;
  order_number: string;
  date: string;
  expected_delivery: string;
  total: string;
  supplier_name: string;
  contact_person: string;
  phone: string;
  email: string;
  paid_amount: string;
  due_amount: string;
  days_outstanding: string;
  status: string;
}

export interface AccountsReceivable {
  id: string;
  order_number: string;
  date: string;
  due_date: string;
  total: string;
  customer_name: string;
  phone: string;
  email: string;
  paid_amount: string;
  due_amount: string;
  days_overdue: string;
}

export interface FinancialStatement {
  income_statement?: {
    period: { from: string; to: string };
    revenue: number;
    cost_of_goods_sold: number;
    gross_profit: number;
    expenses: number;
    net_income: number;
  };
  balance_sheet?: {
    as_of_date: string;
    assets: { current_assets: number; total_assets: number };
    liabilities: { current_liabilities: number; total_liabilities: number };
    equity: { retained_earnings: number; total_equity: number };
    balance: boolean;
  };
  cash_flow_statement?: {
    period: { from: string; to: string };
    operating_activities: { cash_inflows: number; cash_outflows: number; net_cash_flow: number };
    net_increase_in_cash: number;
  };
}

export interface Budget {
  id: string;
  year: string;
  month: string;
  category: string;
  budget_amount: string;
  actual_amount?: string;
  variance?: string;
  created_at: string;
}

export interface Payment {
  id: string;
  amount: string;
  payment_method: string;
  date: string;
  payment_type: string;
  customer_id?: string;
  supplier_id?: string;
  allocations?: Array<{
    invoice_id: string;
    amount: string;
  }>;
  created_at: string;
}

// Regular Expense types
export interface Expense {
  id: string;
  category: string;
  amount: string;
  date: string;
  payment_method: string;
  description: string;
  account_id: string;
  reference: string;
  receipt_url?: string;
  created_at: string;
}

export interface ScheduledExpense {
  id: string;
  category: string;
  amount: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  start_date: string;
  account_id: string;
  payment_method: string;
  description: string;
  status: 'active' | 'paused' | 'completed';
  next_execution?: string;
  created_at: string;
}

export interface ExpenseSummary {
  total_expenses: string;
  expense_count: number;
  categories: Array<{
    category: string;
    total: string;
    count: number;
  }>;
  payment_methods: Array<{
    method: string;
    total: string;
    count: number;
  }>;
}

// Generic API request function
const apiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> => {
  const baseUrl = apiConfig.getBaseUrl();
  const url = `${baseUrl}${endpoint}`;

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
};

// Main Finance API
export const newFinanceApi = {
  // Accounts management
  getAccounts: (params?: {
    page?: number;
    limit?: number;
    type?: string;
    active?: boolean;
  }) => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) queryParams.append(key, value.toString());
      });
    }
    const query = queryParams.toString();
    return apiRequest<any>(`/accounts${query ? `?${query}` : ''}`).then((res) => {
      // API shape: { success, message, data: { accounts: [], pagination: {...} } }
      const accounts = res?.data?.accounts ?? [];
      const pagination = res?.data?.pagination;
      return { ...res, data: accounts, pagination } as ApiResponse<Account[]>;
    });
  },

  createAccount: (account: {
    account_code: string;
    account_name: string;
    account_type: string;
    balance: number;
    is_active?: boolean;
  }) =>
    apiRequest<Account>('/accounts', {
      method: 'POST',
      body: JSON.stringify(account),
    }),

  updateAccount: (id: string, account: {
    account_code?: string;
    account_name?: string;
    account_type?: string;
    balance?: number;
    is_active?: boolean;
  }) =>
    apiRequest<Account>(`/accounts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(account),
    }),

  deleteAccount: (id: string) =>
    apiRequest<{ message: string }>(`/accounts/${id}`, {
      method: 'DELETE',
    }),

  getAccountsSummary: () =>
    apiRequest<any>('/accounts/summary').then((res) => {
      const data = res?.data ?? {};
      const overall = data?.overall ?? {};
      const byType = Array.isArray(data?.summary_by_type) ? data.summary_by_type : [];
      const mapped: AccountSummary = {
        total_accounts: Number(overall.total_accounts ?? 0),
        active_accounts: Number(overall.total_active ?? 0),
        total_balance: overall.overall_balance ?? '0.00',
        account_types: byType.map((t: any) => ({
          type: t.account_type,
          count: Number(t.total_accounts ?? 0),
          total_balance: t.total_balance ?? '0.00',
        })),
      };
      return { ...res, data: mapped } as ApiResponse<AccountSummary>;
    }),

  updateAccountBalance: (id: string, balance: number, reason: string) =>
    apiRequest<Account>(`/accounts/${id}/balance`, {
      method: 'POST',
      body: JSON.stringify({ balance, reason }),
    }),

  // Transactions
  getTransactions: (params?: {
    page?: number;
    limit?: number;
    reference_type?: string;
    start_date?: string;
    end_date?: string;
  }) => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) queryParams.append(key, value.toString());
      });
    }
    const query = queryParams.toString();
    return apiRequest<any>(`/transactions${query ? `?${query}` : ''}`).then((res) => {
      const transactions = res?.data?.transactions ?? [];
      const pagination = res?.data?.pagination;
      return { ...res, data: transactions, pagination } as ApiResponse<Transaction[]>;
    });
  },

  createTransaction: (transaction: {
    transaction_date: string;
    transaction_number: string;
    description: string;
    reference_type: string;
    reference_id: string;
    total_amount: number;
  }) =>
    apiRequest<Transaction>('/transactions', {
      method: 'POST',
      body: JSON.stringify(transaction),
    }),

  // Cash Flow
  getCashFlow: (params?: {
    page?: number;
    limit?: number;
    type?: 'inflow' | 'outflow';
    account_id?: string;
    start_date?: string;
    end_date?: string;
  }) => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) queryParams.append(key, value.toString());
      });
    }
    const query = queryParams.toString();
    return apiRequest<CashFlowEntry[]>(`/cash-flow${query ? `?${query}` : ''}`);
  },

  createCashFlowEntry: (entry: {
    type: 'inflow' | 'outflow';
    account_id: string;
    transaction_id: string;
    amount: number;
    reference?: string;
    description?: string;
    date: string;
  }) =>
    apiRequest<CashFlowEntry>('/cash-flow', {
      method: 'POST',
      body: JSON.stringify(entry),
    }),

  // WordPress Finance API endpoints
  getAccountsPayable: () =>
    apiRequest<AccountsPayable[]>('/finance/accounts-payable'),

  getAccountsReceivable: () =>
    apiRequest<AccountsReceivable[]>('/finance/accounts-receivable'),

  getFinanceCashFlow: (params?: {
    type?: 'inflow' | 'outflow';
    date_from?: string;
    date_to?: string;
    page?: number;
    per_page?: number;
  }) => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) queryParams.append(key, value.toString());
      });
    }
    const query = queryParams.toString();
    return apiRequest<{
      transactions: CashFlowEntry[];
      summary: {
        total_inflow: string;
        total_outflow: string;
        total_transactions: string;
      };
    }>(`/finance/cash-flow${query ? `?${query}` : ''}`);
  },

  createFinanceCashFlow: (entry: {
    type: 'inflow' | 'outflow';
    amount: number;
    date: string;
    account_id?: number;
    reference?: string;
    description?: string;
  }) =>
    apiRequest<{ message: string; id: number }>('/finance/cash-flow', {
      method: 'POST',
      body: JSON.stringify(entry),
    }),

  getFinancialStatements: (params?: {
    date_from?: string;
    date_to?: string;
    type?: 'income' | 'balance' | 'cash_flow' | 'all';
  }) => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) queryParams.append(key, value.toString());
      });
    }
    const query = queryParams.toString();
    return apiRequest<FinancialStatement>(`/finance/financial-statements${query ? `?${query}` : ''}`);
  },

  getBudget: (params?: {
    year?: number;
    category?: string;
  }) => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) queryParams.append(key, value.toString());
      });
    }
    const query = queryParams.toString();
    return apiRequest<Budget[]>(`/finance/budget${query ? `?${query}` : ''}`);
  },

  createBudget: (budget: {
    year: number;
    month: number;
    category: string;
    budget_amount: number;
  }) =>
    apiRequest<{ message: string; action: string }>('/finance/budget', {
      method: 'POST',
      body: JSON.stringify(budget),
    }),

  // Payments
  getPayments: () =>
    apiRequest<Payment[]>('/payments'),

  createPayment: (payment: {
    amount: number;
    payment_method: string;
    date: string;
    payment_type: string;
    customer_id?: string;
    supplier_id?: string;
    allocations?: Array<{
      invoice_id: string;
      amount: number;
    }>;
  }) =>
    apiRequest<Payment>('/payments', {
      method: 'POST',
      body: JSON.stringify(payment),
    }),

  // Regular Expenses
  getExpenses: (params?: {
    page?: number;
    limit?: number;
    category?: string;
    account_id?: string;
    payment_method?: string;
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
    return apiRequest<any>(`/expenses${query ? `?${query}` : ''}`).then((res) => {
      const expenses = res?.data?.expenses ?? [];
      const pagination = res?.data?.pagination;
      return { ...res, data: expenses, pagination } as ApiResponse<Expense[]>;
    });
  },

  createExpense: (expense: {
    category: string;
    amount: number;
    date: string;
    payment_method: string;
    description: string;
    account_id?: string;
    reference?: string;
    receipt_url?: string;
  }) =>
    apiRequest<Expense>('/expenses', {
      method: 'POST',
      body: JSON.stringify(expense),
    }),

  updateExpense: (id: string, expense: Partial<{
    category: string;
    amount: number;
    date: string;
    payment_method: string;
    description: string;
    account_id: string;
    reference: string;
    receipt_url: string;
  }>) =>
    apiRequest<Expense>(`/expenses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(expense),
    }),

  deleteExpense: (id: string) =>
    apiRequest<{ message: string }>(`/expenses/${id}`, {
      method: 'DELETE',
    }),

  // Bulk operations
  bulkDeleteExpenses: (ids: string[]) =>
    apiRequest<{ message: string }>('/expenses/bulk-delete', {
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
    return apiRequest<{
      data: Expense[];
      export_info: {
        format: string;
        total_records: number;
        exported_at: string;
      };
    }>(`/expenses/export${query ? `?${query}` : ''}`);
  },

  getExpensesSummary: (params?: {
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
    return apiRequest<any>(`/expenses/summary${query ? `?${query}` : ''}`).then((res) => {
      const d = res?.data ?? {};
      const mapped: ExpenseSummary = {
        total_expenses: String(d?.total?.amount ?? '0'),
        expense_count: Number(d?.total?.count ?? 0),
        categories: Array.isArray(d?.by_category)
          ? d.by_category.map((c: any) => ({
              category: c.category,
              total: c.total,
              count: Number(c.count ?? 0),
            }))
          : [],
        payment_methods: Array.isArray(d?.by_payment_method)
          ? d.by_payment_method.map((m: any) => ({
              method: m.payment_method,
              total: m.total,
              count: Number(m.count ?? 0),
            }))
          : [],
      };
      return { ...res, data: mapped } as ApiResponse<ExpenseSummary>;
    });
  },

  getExpenseCategories: () =>
    apiRequest<string[]>('/expenses/categories'),

  createExpenseCategory: (category: string) =>
    apiRequest<{ message: string; category: string }>('/expenses/categories', {
      method: 'POST',
      body: JSON.stringify({ category }),
    }),

  // Scheduled Expenses
  getScheduledExpenses: (params?: {
    page?: number;
    limit?: number;
    status?: 'active' | 'paused' | 'completed';
    category?: string;
    frequency?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  }) => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) queryParams.append(key, value.toString());
      });
    }
    const query = queryParams.toString();
    return apiRequest<any>(`/finance/expenses/scheduled${query ? `?${query}` : ''}`).then((res) => {
      const list = res?.data?.scheduled_expenses ?? res?.data ?? [];
      const pagination = res?.data?.pagination;
      return { ...res, data: Array.isArray(list) ? list : [], pagination } as ApiResponse<ScheduledExpense[]>;
    });
  },

  createScheduledExpense: (expense: {
    category: string;
    amount: number;
    frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
    start_date: string;
    account_id?: string;
    payment_method: string;
    description: string;
  }) =>
    apiRequest<ScheduledExpense>('/finance/expenses/scheduled', {
      method: 'POST',
      body: JSON.stringify(expense),
    }),

  updateScheduledExpense: (id: string, expense: Partial<{
    category: string;
    description: string;
    amount: number;
    frequency: string;
    account_id: string;
    payment_method: string;
  }>) =>
    apiRequest<ScheduledExpense>(`/finance/expenses/scheduled/${id}`, {
      method: 'PUT',
      body: JSON.stringify(expense),
    }),

  updateScheduledExpenseStatus: (id: string, status: 'active' | 'paused' | 'completed') =>
    apiRequest<ScheduledExpense>(`/finance/expenses/scheduled/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    }),

  deleteScheduledExpense: (id: string) =>
    apiRequest<{ message: string }>(`/finance/expenses/scheduled/${id}`, {
      method: 'DELETE',
    }),

  getNextExecutions: (days: number = 30) =>
    apiRequest<Array<{
      id: string;
      category: string;
      amount: string;
      next_execution: string;
      description: string;
    }>>(`/finance/expenses/scheduled/next-executions?days=${days}`),

  executeScheduledExpense: (id: string) =>
    apiRequest<{ message: string; expense_id: string }>(`/finance/expenses/scheduled/${id}/execute`, {
      method: 'POST',
    }),
};