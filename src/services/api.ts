import { apiConfig } from '@/utils/apiConfig';

// API response types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: {
    [key: string]: T[] | {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
    };
  };
}

// Enhanced Dashboard Data Types
export interface EnhancedDashboardData {
  financial: {
    todayRevenue: number;
    yesterdayRevenue: number;
    monthRevenue: number;
    lastMonthRevenue: number;
    monthExpenses: number;
    grossProfit: number;
    netProfit: number;
    profitMargin: number;
    revenueGrowth: number;
    monthlyGrowth: number;
  };
  sales: {
    todaySales: number;
    weekSales: number;
    avgOrderValue: number;
    pendingOrdersValue: number;
    paymentMethods: Array<{
      method: string;
      count: number;
      amount: number;
    }>;
    highValueSales: Array<{
      orderNumber: string;
      amount: number;
      customer: string;
      date: string;
    }>;
  };
  inventory: {
    totalInventoryValue: number;
    retailInventoryValue: number;
    lowStockItems: number;
    outOfStockItems: number;
    overstockItems: number;
    fastMovingProducts: Array<{
      name: string;
      sold: number;
      remaining: number;
    }>;
    deadStockValue: number;
    inventoryTurnover: number;
  };
  customers: {
    totalCustomers: number;
    newCustomersThisMonth: number;
    avgCustomerValue: number;
    topCustomers: Array<{
      name: string;
      totalPurchases: number;
      balance: number;
    }>;
    customerTypes: Array<{
      type: string;
      count: number;
    }>;
    totalReceivables: number;
  };
  performance: {
    weeklyTrend: Array<{
      week: string;
      revenue: number;
      orders: number;
    }>;
    dailyAvgRevenue: number;
    dailyAvgOrders: number;
    categoryPerformance: Array<{
      category: string;
      revenue: number;
      unitsSold: number;
    }>;
  };
  cashFlow: {
    monthlyInflows: number;
    monthlyOutflows: number;
    netCashFlow: number;
    recentPayments: Array<{
      customer: string;
      amount: number;
      date: string;
    }>;
  };
  alerts: Array<{
    type: string;
    title: string;
    message: string;
    action: string;
  }>;
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
      // Try to extract error message from response body
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          if (errorData.message) {
            errorMessage = errorData.message;
          } else if (errorData.error) {
            errorMessage = errorData.error;
          } else if (typeof errorData === 'string') {
            errorMessage = errorData;
          }
        } else {
          // If response is not JSON (likely HTML error page), provide a user-friendly message
          const textResponse = await response.text();
          if (textResponse.includes('404') || response.status === 404) {
            errorMessage = 'The requested resource was not found';
          } else if (textResponse.includes('500') || response.status === 500) {
            errorMessage = 'Internal server error occurred';
          } else if (response.status === 403) {
            errorMessage = 'Access denied - insufficient permissions';
          } else if (response.status === 400) {
            errorMessage = 'Invalid request - please check your input';
          } else {
            errorMessage = response.statusText || `Server error (${response.status})`;
          }
        }
      } catch (parseError) {
        // If we can't parse the error response, use the status text
        errorMessage = response.statusText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    try {
      const data = await response.json();
      return data;
    } catch (jsonError) {
      // Handle mixed HTML/JSON responses (WordPress database errors followed by JSON)
      try {
        const textResponse = await response.text();
        
        // Look for JSON in the response text
        const jsonMatch = textResponse.match(/\{.*\}$/);
        if (jsonMatch) {
          const jsonData = JSON.parse(jsonMatch[0]);
          return jsonData;
        }
        
        // If no JSON found, throw original error
        throw new Error('Server returned invalid response format');
      } catch (fallbackError) {
        throw new Error('Server returned invalid response format');
      }
    }
  } catch (error) {
    console.error('API request failed:', error);
    // Ensure we always throw an Error object with a meaningful message
    if (error instanceof Error) {
      throw error;
    } else {
      throw new Error('Network request failed');
    }
  }
};

// Dashboard API
export const dashboardApi = {
  getStats: () => apiRequest<ApiResponse<any>>('/dashboard/stats'),
  getEnhancedStats: () => apiRequest<ApiResponse<EnhancedDashboardData>>('/dashboard/enhanced-stats'),
  getRevenueTrend: () => apiRequest<ApiResponse<any>>('/dashboard/revenue-trend'),
  getCategoryPerformance: () => apiRequest<ApiResponse<any>>('/dashboard/category-performance'),
  getDailySales: () => apiRequest<ApiResponse<any>>('/dashboard/daily-sales'),
  getInventoryStatus: () => apiRequest<ApiResponse<any>>('/dashboard/inventory-status'),
};

// Products API
export const productsApi = {
  getAll: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    status?: string;
    sortBy?: string;
    sortOrder?: string;
  }) => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value) queryParams.append(key, value.toString());
      });
    }
    const query = queryParams.toString();
    return apiRequest<any>(`/products${query ? `?${query}` : ''}`);
  },
  
  getById: (id: number) => apiRequest<ApiResponse<any>>(`/products/${id}`),
  
  create: (product: any) => 
    apiRequest<ApiResponse<any>>('/products', {
      method: 'POST',
      body: JSON.stringify(product),
    }),
  
  update: (id: number, product: any) =>
    apiRequest<ApiResponse<any>>(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(product),
    }),
  
  delete: (id: number) =>
    apiRequest<ApiResponse<any>>(`/products/${id}`, {
      method: 'DELETE',
    }),
  
  adjustStock: (id: number, adjustment: any) =>
    apiRequest<ApiResponse<any>>(`/products/${id}/stock-adjustment`, {
      method: 'POST',
      body: JSON.stringify(adjustment),
    }),
};

// Categories API
export const categoriesApi = {
  getAll: () => apiRequest<ApiResponse<string[]>>('/categories'),
  create: (category: { name: string }) =>
    apiRequest<ApiResponse<any>>('/categories', {
      method: 'POST',
      body: JSON.stringify(category),
    }),
};

// Units API
export const unitsApi = {
  getAll: () => apiRequest<ApiResponse<any[]>>('/units'),
  create: (unit: { name: string; label: string }) =>
    apiRequest<ApiResponse<any>>('/units', {
      method: 'POST',
      body: JSON.stringify(unit),
    }),
};

// Customers API
export const customersApi = {
  getAll: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    type?: string;
    status?: string;
  }) => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value) queryParams.append(key, value.toString());
      });
    }
    const query = queryParams.toString();
    return apiRequest<any>(`/customers${query ? `?${query}` : ''}`);
  },

  // New: Fetch only customers with credit balances from backend
  getCreditCustomers: (params?: {
    page?: number;
    per_page?: number;
    search?: string;
    status?: string;
  }) => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }
    const query = queryParams.toString();
    return apiRequest<any>(`/creditcustomers${query ? `?${query}` : ''}`);
  },
  
  getById: (id: number) => apiRequest<ApiResponse<any>>(`/customers/${id}`),
  
  create: (customer: any) =>
    apiRequest<ApiResponse<any>>('/customers', {
      method: 'POST',
      body: JSON.stringify(customer),
    }),
  
  update: (id: number, customer: any) =>
    apiRequest<ApiResponse<any>>(`/customers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(customer),
    }),
 
  delete: (id: number) =>
    apiRequest<ApiResponse<any>>(`/customers/${id}`, {
      method: 'DELETE',
    }),
};

// Sales API
export const salesApi = {
  getAll: (params?: {
    page?: number;
    limit?: number;
    dateFrom?: string;
    dateTo?: string;
    customerId?: number;
    status?: string;
  }) => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value) queryParams.append(key, value.toString());
      });
    }
    const query = queryParams.toString();
    return apiRequest<any>(`/sales${query ? `?${query}` : ''}`);
  },
  
  getById: (id: number) => apiRequest<ApiResponse<any>>(`/sales/${id}`),
  
  create: (sale: any) =>
    apiRequest<ApiResponse<any>>('/sales', {
      method: 'POST',
      body: JSON.stringify(sale),
    }),
  
  updateStatus: (id: number, status: any) =>
    apiRequest<ApiResponse<any>>(`/sales/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify(status),
    }),

  adjustOrder: (id: number, adjustment: any) =>
    apiRequest<ApiResponse<any>>(`/sales/${id}/adjust`, {
      method: 'POST',
      body: JSON.stringify(adjustment),
    }),

  generatePDF: (id: number) => 
    apiRequest<Blob>(`/sales/${id}/pdf`, {
      headers: {
        'Accept': 'application/pdf',
      },
    }),
};

// Inventory API
export const inventoryApi = {
  getAll: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    lowStock?: boolean;
    outOfStock?: boolean;
  }) => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) queryParams.append(key, value.toString());
      });
    }
    const query = queryParams.toString();
    return apiRequest<any>(`/inventory${query ? `?${query}` : ''}`);
  },
  
  getMovements: (params?: {
    page?: number;
    limit?: number;
    productId?: number;
    type?: string;
    dateFrom?: string;
    dateTo?: string;
  }) => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value) queryParams.append(key, value.toString());
      });
    }
    const query = queryParams.toString();
    return apiRequest<any>(`/inventory/movements${query ? `?${query}` : ''}`);
  },
  
  restock: (restock: any) =>
    apiRequest<ApiResponse<any>>('/inventory/restock', {
      method: 'POST',
      body: JSON.stringify(restock),
    }),
};

// Notifications API
export const notificationsApi = {
  getAll: (params?: {
    page?: number;
    limit?: number;
    type?: string;
    read?: boolean;
  }) => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) queryParams.append(key, value.toString());
      });
    }
    const query = queryParams.toString();
    return apiRequest<any>(`/notifications${query ? `?${query}` : ''}`);
  },
  
  markAsRead: (id: number) =>
    apiRequest<ApiResponse<any>>(`/notifications/${id}/read`, {
      method: 'PUT',
    }),
  
  markAllAsRead: () =>
    apiRequest<ApiResponse<any>>('/notifications/mark-all-read', {
      method: 'PUT',
    }),
};

// Suppliers API
export const suppliersApi = {
  getAll: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
  }) => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value) queryParams.append(key, value.toString());
      });
    }
    const query = queryParams.toString();
    return apiRequest<any>(`/suppliers${query ? `?${query}` : ''}`);
  },
  
  getById: (id: number) => apiRequest<ApiResponse<any>>(`/suppliers/${id}`),
  
  create: (supplier: any) =>
    apiRequest<ApiResponse<any>>('/suppliers', {
      method: 'POST',
      body: JSON.stringify(supplier),
    }),
  
  update: (id: number, supplier: any) =>
    apiRequest<ApiResponse<any>>(`/suppliers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(supplier),
    }),
  
  delete: (id: number) =>
    apiRequest<ApiResponse<any>>(`/suppliers/${id}`, {
      method: 'DELETE',
    }),
};

// Employee type definition
export interface Employee {
  id?: number;
  name: string;
  email: string;
  phone: string;
  position: string;
  department: string;
  salary: number;
  joinDate?: string;
  status: 'active' | 'inactive' | 'on_leave';
  avatar?: string;
  address: string;
  experience: string;
}

// Employees API
export const employeesApi = {
  getAll: () => apiRequest<ApiResponse<Employee[]>>('/employees'),
  
  getById: (id: number) => apiRequest<ApiResponse<Employee>>(`/employees/${id}`),
  
  create: (employee: Employee) =>
    apiRequest<ApiResponse<Employee>>('/employees', {
      method: 'POST',
      body: JSON.stringify(employee),
    }),
  
  update: (id: number, employee: Employee) =>
    apiRequest<ApiResponse<Employee>>(`/employees/${id}`, {
      method: 'PUT',
      body: JSON.stringify(employee),
    }),
  
  delete: (id: number) =>
    apiRequest<ApiResponse<any>>(`/employees/${id}`, {
      method: 'DELETE',
    }),
};

// Purchase Orders API - Fixed to match new WordPress API structure
export const purchaseOrdersApi = {
  getAll: (params?: {
    page?: number;
    limit?: number;
    supplierId?: number;
    status?: string;
    dateFrom?: string;
    dateTo?: string;
    search?: string;
  }) => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }
    const query = queryParams.toString();
    return apiRequest<any>(`/purchase-orders${query ? `?${query}` : ''}`);
  },
  
  getById: (id: number) => apiRequest<ApiResponse<any>>(`/purchase-orders/${id}`),
  
  create: (order: any) =>
    apiRequest<ApiResponse<any>>('/purchase-orders', {
      method: 'POST',
      body: JSON.stringify(order),
    }),
  
  update: (id: number, order: any) =>
    apiRequest<ApiResponse<any>>(`/purchase-orders/${id}`, {
      method: 'PUT',
      body: JSON.stringify(order),
    }),
  
  // Fixed: Simple status update endpoint that matches the API
  updateStatus: (id: number, status: string, notes?: string) =>
    apiRequest<ApiResponse<any>>(`/purchase-orders/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status, notes }),
    }),
  
  receive: (id: number, data: any) =>
    apiRequest<ApiResponse<any>>(`/purchase-orders/${id}/receive`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: number) =>
    apiRequest<ApiResponse<any>>(`/purchase-orders/${id}`, {
      method: 'DELETE',
    }),
};

// Quotations API - Updated with all endpoints
export const quotationsApi = {
  getAll: (params?: {
    page?: number;
    limit?: number;
    customerId?: number;
    status?: string;
    quoteNumber?: string;
    dateFrom?: string;
    dateTo?: string;
  }) => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value.toString());
        }
      });
    }
    const query = queryParams.toString();
    return apiRequest<any>(`/quotations${query ? `?${query}` : ''}`);
  },
  
  getById: (id: number) => apiRequest<ApiResponse<any>>(`/quotations/${id}`),
  
  create: (quotation: any) => 
    apiRequest<ApiResponse<any>>('/quotations', {
      method: 'POST',
      body: JSON.stringify(quotation),
    }),
  
  update: (id: number, quotation: any) =>
    apiRequest<ApiResponse<any>>(`/quotations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(quotation),
    }),
  
  delete: (id: number) =>
    apiRequest<ApiResponse<any>>(`/quotations/${id}`, {
      method: 'DELETE',
    }),
  
  send: (id: number) =>
    apiRequest<ApiResponse<any>>(`/quotations/${id}/send`, {
      method: 'PUT',
    }),
  
  updateStatus: (id: number, status: string) =>
    apiRequest<ApiResponse<any>>(`/quotations/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    }),
  
  convertToSale: (id: number) =>
    apiRequest<ApiResponse<any>>(`/quotations/${id}/convert-to-sale`, {
      method: 'PUT',
    }),
};

// Outsourcing API Types
export interface OutsourcingOrder {
  id: number;
  sale_id: number;
  sale_item_id: number;
  product_id: number;
  supplier_id: number;
  quantity: number;
  cost_per_unit: number;
  total_cost: number;
  notes?: string;
  status: 'pending' | 'ordered' | 'delivered';
  created_at: string;
  updated_at: string;
  // Populated fields
  product_name?: string;
  supplier_name?: string;
}

// Outsourcing API
export const outsourcingApi = {
  /**
   * GET /outsourcing - List all outsourcing orders
   * 
   * @param params Query parameters
   * @param params.page Page number (default: 1)
   * @param params.limit Items per page (default: 10)
   * @param params.status Filter by status: 'pending', 'ordered', 'delivered'
   * @param params.supplier_id Filter by supplier ID
   * @param params.date_from Filter from date (YYYY-MM-DD)
   * @param params.date_to Filter to date (YYYY-MM-DD)
   * @param params.search Search in product name or supplier name
   * 
   * @returns Promise<ApiResponse<{ orders: OutsourcingOrder[], pagination: PaginationMeta }>>
   */
  getAll: (params?: {
    page?: number;
    limit?: number;
    status?: 'pending' | 'ordered' | 'delivered';
    supplier_id?: number;
    date_from?: string;
    date_to?: string;
    search?: string;
  }) => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value.toString());
        }
      });
    }
    const query = queryParams.toString();
    return apiRequest<ApiResponse<{
      orders: OutsourcingOrder[];
      pagination: {
        current_page: number;
        total_pages: number;
        total_items: number;
        items_per_page: number;
        has_next_page: boolean;
        has_previous_page: boolean;
      };
    }>>(`/outsourcing${query ? `?${query}` : ''}`);
  },

  /**
   * PUT /outsourcing/{id}/status - Update outsourcing order status
   * 
   * @param id Outsourcing order ID
   * @param status New status: 'pending', 'ordered', 'delivered'
   * @param notes Optional notes for the status update
   * 
   * @returns Promise<ApiResponse<OutsourcingOrder>>
   */
  updateStatus: (id: number, status: 'pending' | 'ordered' | 'delivered', notes?: string) =>
    apiRequest<ApiResponse<OutsourcingOrder>>(`/outsourcing/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, notes }),
    }),

  /**
   * GET /outsourcing/supplier/{supplierId} - Get outsourcing orders by supplier
   * 
   * @param supplierId Supplier ID
   * @param params Query parameters
   * @param params.page Page number (default: 1)
   * @param params.limit Items per page (default: 10)
   * @param params.status Filter by status: 'pending', 'ordered', 'delivered'
   * @param params.date_from Filter from date (YYYY-MM-DD)
   * @param params.date_to Filter to date (YYYY-MM-DD)
   * 
   * @returns Promise<ApiResponse<{ orders: OutsourcingOrder[], pagination: PaginationMeta, supplier: Supplier }>>
   */
  getBySupplier: (supplierId: number, params?: {
    page?: number;
    limit?: number;
    status?: 'pending' | 'ordered' | 'delivered';
    date_from?: string;
    date_to?: string;
  }) => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value.toString());
        }
      });
    }
    const query = queryParams.toString();
    return apiRequest<ApiResponse<{
      orders: OutsourcingOrder[];
      pagination: {
        current_page: number;
        total_pages: number;
        total_items: number;
        items_per_page: number;
        has_next_page: boolean;
        has_previous_page: boolean;
      };
      supplier: {
        id: number;
        name: string;
        contact_person?: string;
        phone?: string;
        email?: string;
      };
    }>>(`/outsourcing/supplier/${supplierId}${query ? `?${query}` : ''}`);
  },
};
