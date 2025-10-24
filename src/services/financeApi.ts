import { apiConfig } from '@/utils/apiConfig';

// API response types
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

// Customer balance update types
export interface CustomerBalanceUpdate {
  customerId: number;
  orderId: number;
  amount: number;
  type: 'credit' | 'debit';
  orderNumber: string;
  description: string;
}

export interface CustomerBalance {
  customerId: number;
  currentBalance: number;
  totalPurchases: number;
  creditLimit: number;
}

// Accounts Receivable types
export interface AccountsReceivable {
  id: number;
  customerName: string;
  customerId: number;
  orderNumber: string;
  invoiceNumber: string;
  amount: number;
  balance: number;
  paidAmount: number;
  dueDate: string;
  daysOverdue: number;
  status: 'pending' | 'overdue' | 'paid';
}

// Expense types
export interface Expense {
  id: number;
  category: string;
  description: string;
  amount: number;
  date: string;
  reference: string;
  paymentMethod: 'cash' | 'bank_transfer' | 'cheque' | 'credit_card';
  createdBy: string;
  createdAt: string;
}

// Finance Overview types
export interface FinanceOverview {
  revenue: {
    total: number;
    cash: number;
    credit: number;
    growth: number;
  };
  expenses: {
    total: number;
    purchases: number;
    operational: number;
    growth: number;
  };
  profit: {
    gross?: number;
    net: number;
    margin: number;
  };
  cashFlow: {
    inflow: number;
    outflow: number;
    net: number;
  };
  accountsReceivable: number;
  accountsPayable: number;
}

// Payments types based on database schema
export interface Payment {
  id: number;
  customer_id: number;
  transaction_id: number;
  account_id: number;
  amount: number;
  payment_method: 'cash' | 'bank_transfer' | 'cheque';
  reference?: string;
  notes?: string;
  date: string;
  created_at: string;
  payment_type: 'receipt' | 'payment';
  status: 'pending' | 'cleared' | 'bounced';
}

// Payment Allocations
export interface PaymentAllocation {
  id: number;
  payment_id: number;
  invoice_id: number;
  invoice_type: 'sale' | 'purchase';
  allocated_amount: number;
  allocation_date: string;
  created_at: string;
}

// Profit data
export interface Profit {
  id: number;
  reference_id: number;
  reference_type: 'sale' | 'external_purchase' | 'aggregate' | 'daily' | 'weekly' | 'monthly';
  period_type: 'sale' | 'daily' | 'weekly' | 'monthly' | 'yearly';
  revenue: number;
  cogs: number;
  expenses: number;
  profit: number;
  period_start?: string;
  period_end?: string;
  sale_date?: string;
  product_id?: number;
  created_at: string;
  updated_at: string;
}

// New API Types based on your specifications
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

export interface CashFlowTransaction {
  id: string;
  type: 'inflow' | 'outflow';
  amount: string;
  account_id: string;
  reference: string;
  description: string;
  date: string;
  account_name: string;
  account_code: string;
  customer_name?: string;
}

export interface ProfitAnalysis {
  period: {
    from: string;
    to: string;
  };
  gross_profit_analysis: {
    total_revenue: string;
    total_external_purchases: string;
    gross_profit: string;
    gross_profit_margin: string;
  };
  net_profit_analysis: {
    net_profit: string;
    total_revenue: string;
    total_expenses: string;
    net_profit_margin: string;
  };
  top_performing_products: Array<{
    product_id: string;
    product_revenue: string;
    product_cogs: string;
    product_profit: string;
    product_margin: string;
  }>;
  monthly_trend: Array<{
    month: string;
    monthly_revenue: string;
    monthly_cogs: string;
    monthly_expenses: string;
    monthly_profit: string;
  }>;
}

export interface FinancialStatements {
  income_statement: {
    period: {
      from: string;
      to: string;
    };
    revenue: number;
    cost_of_goods_sold: number;
    gross_profit: number;
    expenses: number;
    net_income: number;
  };
  balance_sheet: {
    as_of_date: string;
    assets: {
      current_assets: number;
      total_assets: number;
    };
    liabilities: {
      current_liabilities: number;
      total_liabilities: number;
    };
    equity: {
      retained_earnings: number;
      total_equity: number;
    };
    balance: boolean;
  };
  cash_flow_statement: {
    period: {
      from: string;
      to: string;
    };
    operating_activities: {
      cash_inflows: number;
      cash_outflows: number;
      net_cash_flow: number;
    };
    net_increase_in_cash: number;
  };
}

export interface Budget {
  id: string;
  year: string;
  month: string;
  category: string;
  budget_amount: string;
  actual_amount: string;
  variance: string;
  created_at: string;
}

export interface TaxSummary {
  period: string;
  sales_tax_summary: {
    total_transactions: string;
    total_sales: string;
    total_tax_collected: string;
    average_tax_per_sale: string;
  };
  expense_summary: {
    total_expenses: string;
    total_expense_amount: string;
  };
  tax_breakdown: Array<{
    tax_status: string;
    transaction_count: string;
    total_amount: string;
    total_tax: string;
  }>;
  monthly_trend: Array<{
    month: string;
    monthly_tax: string;
    monthly_sales: string;
    transaction_count: string;
  }>;
  net_tax_liability: string;
}

// Generic API request function - no fallback to mock data
const apiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const url = `${apiConfig.getBaseUrl()}${endpoint}`;

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

// Finance API endpoints
export const financeApi = {
  // Customer balance methods - updated to use new service approach
  updateCustomerBalance: (update: CustomerBalanceUpdate) => {
    console.log('Sending customer balance update (legacy method):', update);
    // Convert to new format for consistency
    const newFormatUpdate = {
      customerId: update.customerId,
      orderId: update.orderId,
      amount: update.amount,
      type: update.type,
      orderNumber: update.orderNumber,
      description: update.description,
      includesTax: false // Ensure tax-free calculations
    };
    
    return apiRequest<ApiResponse<CustomerBalance>>('/customers/update-balance', {
      method: 'POST',
      body: JSON.stringify(newFormatUpdate),
    });
  },

  getCustomerBalance: (customerId: number) =>
    apiRequest<ApiResponse<CustomerBalance>>(`/customers/${customerId}/balance`),

  syncCustomerBalances: () =>
    apiRequest<ApiResponse<{ updated: number; errors?: number }>>('/customers/sync-balances', {
      method: 'POST',
      body: JSON.stringify({
        includesTax: false,
        recalculateAll: true
      }),
    }),

  // Finance overview methods
  getOverview: (period?: string) =>
    apiRequest<ApiResponse<FinanceOverview>>(`/finance/overview${period ? `?period=${period}` : ''}`),

  // Accounts receivable methods
  getAccountsReceivable: (params?: {
    status?: 'pending' | 'overdue' | 'paid';
    customerId?: number;
    limit?: number;
    overdue?: boolean;
  }) => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) queryParams.append(key, value.toString());
      });
    }
    const query = queryParams.toString();
    return apiRequest<ApiResponse<{ 
      receivables: AccountsReceivable[];
      summary: {
        totalReceivables: number;
        overdueAmount: number;
        overdueCount: number;
      };
    }>>(`/finance/accounts-receivable${query ? `?${query}` : ''}`);
  },

  recordPayment: (payment: {
    customerId: number;
    amount: number;
    paymentMethod: string;
    reference?: string;
    notes?: string;
  }) => {
    console.log('Recording payment:', payment);
    // Enhanced payment recording with proper balance tracking
    return apiRequest<ApiResponse<any>>('/customers/record-payment', {
      method: 'POST',
      body: JSON.stringify({
        ...payment,
        includesTax: false // Ensure tax-free calculations
      }),
    });
  },

  // Expense methods
  getExpenses: (params?: {
    category?: string;
    dateFrom?: string;
    dateTo?: string;
    limit?: number;
  }) => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) queryParams.append(key, value.toString());
      });
    }
    const query = queryParams.toString();
    return apiRequest<ApiResponse<{ 
      expenses: Expense[];
      summary: {
        totalExpenses: number;
        categories: Array<{ category: string; amount: number }>;
      };
    }>>(`/finance/expenses${query ? `?${query}` : ''}`);
  },

  createExpense: (expense: {
    category: string;
    description: string;
    amount: number;
    date: string;
    paymentMethod: string;
    reference?: string;
  }) =>
    apiRequest<ApiResponse<Expense>>('/finance/expenses', {
      method: 'POST',
      body: JSON.stringify(expense),
    }),

  // New API methods based on your specifications
  
  // Accounts Payable
  getAccountsPayable: () =>
    apiRequest<ApiResponse<AccountsPayable[]>>('/finance/accounts-payable'),

  // Cash Flow
  getCashFlowTransactions: (params?: {
    type?: 'inflow' | 'outflow';
    date_from?: string;
    date_to?: string;
    account_id?: number;
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
    return apiRequest<ApiResponse<{
      transactions: CashFlowTransaction[];
      summary: {
        total_inflow: string;
        total_outflow: string;
        total_transactions: string;
      };
      pagination: {
        page: number;
        per_page: number;
        total: string;
        total_pages: number;
      };
    }>>(`/finance/cash-flow${query ? `?${query}` : ''}`);
  },

  createCashFlowEntry: (entry: {
    type: 'inflow' | 'outflow';
    amount: number;
    date: string;
    account_id?: number;
    reference?: string;
    description?: string;
  }) =>
    apiRequest<ApiResponse<{ message: string; cash_flow_id: number }>>('/finance/cash-flow', {
      method: 'POST',
      body: JSON.stringify(entry),
    }),

  // Profit Analysis
  getProfitAnalysis: (params?: {
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
    return apiRequest<ApiResponse<ProfitAnalysis>>(`/finance/profit-analysis${query ? `?${query}` : ''}`);
  },

  // Financial Statements
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
    return apiRequest<ApiResponse<FinancialStatements>>(`/finance/financial-statements${query ? `?${query}` : ''}`);
  },

  // Budget Management
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
    return apiRequest<ApiResponse<{
      budgets: Budget[];
      actuals: Array<{
        category: string;
        month: string;
        actual_amount: string;
      }>;
      year: string;
    }>>(`/finance/budget${query ? `?${query}` : ''}`);
  },

  createBudget: (budget: {
    year: number;
    month: number;
    category: string;
    budget_amount: number;
  }) =>
    apiRequest<ApiResponse<{ message: string; action: string }>>('/finance/budget', {
      method: 'POST',
      body: JSON.stringify(budget),
    }),

  // Tax Summary
  getTaxSummary: (params?: {
    year?: number;
    quarter?: number;
  }) => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) queryParams.append(key, value.toString());
      });
    }
    const query = queryParams.toString();
    return apiRequest<ApiResponse<TaxSummary>>(`/finance/tax-summary${query ? `?${query}` : ''}`);
  },

  // Enhanced finance methods based on database schema
  
  // Payments management
  getPayments: (params?: {
    customer_id?: number;
    payment_type?: 'receipt' | 'payment';
    status?: 'pending' | 'cleared' | 'bounced';
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
    return apiRequest<ApiResponse<Payment[]>>(`/payments${query ? `?${query}` : ''}`);
  },

  createPayment: (payment: {
    customer_id: number;
    account_id: number;
    amount: number;
    payment_method: 'cash' | 'bank_transfer' | 'cheque';
    reference?: string;
    notes?: string;
    date: string;
    payment_type: 'receipt' | 'payment';
  }) =>
    apiRequest<ApiResponse<Payment>>('/payments', {
      method: 'POST',
      body: JSON.stringify(payment),
    }),

  updatePaymentStatus: (id: number, status: 'pending' | 'cleared' | 'bounced') =>
    apiRequest<ApiResponse<Payment>>(`/payments/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    }),

  // Payment Allocations
  getPaymentAllocations: (payment_id: number) =>
    apiRequest<ApiResponse<PaymentAllocation[]>>(`/payments/${payment_id}/allocations`),

  allocatePayment: (allocation: {
    payment_id: number;
    invoice_id: number;
    invoice_type: 'sale' | 'purchase';
    allocated_amount: number;
    allocation_date: string;
  }) =>
    apiRequest<ApiResponse<PaymentAllocation>>('/payment-allocations', {
      method: 'POST',
      body: JSON.stringify(allocation),
    }),

  // Profit analysis
  getProfitData: (params?: {
    reference_type?: 'sale' | 'external_purchase' | 'aggregate' | 'daily' | 'weekly' | 'monthly';
    period_type?: 'sale' | 'daily' | 'weekly' | 'monthly' | 'yearly';
    date_from?: string;
    date_to?: string;
    product_id?: number;
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
    return apiRequest<ApiResponse<Profit[]>>(`/profit${query ? `?${query}` : ''}`);
  },

  getProfitSummary: (period?: 'daily' | 'weekly' | 'monthly' | 'yearly') =>
    apiRequest<ApiResponse<{
      totalRevenue: number;
      totalCogs: number;
      totalExpenses: number;
      totalProfit: number;
      profitMargin: number;
      periodComparison: {
        previousPeriod: {
          revenue: number;
          profit: number;
          margin: number;
        };
        growth: {
          revenue: number;
          profit: number;
        };
      };
      topProducts: Array<{
        product_id: number;
        product_name: string;
        revenue: number;
        profit: number;
        margin: number;
      }>;
    }>>(`/profit/summary${period ? `?period=${period}` : ''}`),

  // Advanced financial analytics
  getCashFlowAnalysis: (period?: string) =>
    apiRequest<ApiResponse<{
      operatingCashFlow: number;
      investingCashFlow: number;
      financingCashFlow: number;
      netCashFlow: number;
      cashFlowByMonth: Array<{
        month: string;
        inflow: number;
        outflow: number;
        net: number;
      }>;
      cashFlowByCategory: Array<{
        category: string;
        inflow: number;
        outflow: number;
      }>;
    }>>(`/finance/cash-flow-analysis${period ? `?period=${period}` : ''}`),

  getFinancialRatios: () =>
    apiRequest<ApiResponse<{
      liquidityRatios: {
        currentRatio: number;
        quickRatio: number;
        cashRatio: number;
      };
      profitabilityRatios: {
        grossProfitMargin: number;
        netProfitMargin: number;
        returnOnAssets: number;
        returnOnEquity: number;
      };
      activityRatios: {
        inventoryTurnover: number;
        receivablesTurnover: number;
        payablesTurnover: number;
      };
    }>>('/finance/ratios'),

  getFinancialForecast: (months: number = 12) =>
    apiRequest<ApiResponse<{
      forecastPeriod: number;
      projectedRevenue: Array<{
        month: string;
        amount: number;
        confidence: number;
      }>;
      projectedExpenses: Array<{
        month: string;
        amount: number;
        confidence: number;
      }>;
      projectedCashFlow: Array<{
        month: string;
        amount: number;
        confidence: number;
      }>;
      assumptions: string[];
    }>>(`/finance/forecast?months=${months}`),
};
