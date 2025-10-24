import { apiConfig } from '@/utils/apiConfig';

export const getAllApiEndpoints = () => {
  const baseUrl = apiConfig.getBaseUrl();
  
  return {
    // Products endpoints
    products: {
      list: { endpoint: `${baseUrl}/products`, method: 'GET', description: 'Get all products' },
      create: { endpoint: `${baseUrl}/products`, method: 'POST', description: 'Create new product' },
      update: { endpoint: `${baseUrl}/products/{id}`, method: 'PUT', description: 'Update product' },
      delete: { endpoint: `${baseUrl}/products/{id}`, method: 'DELETE', description: 'Delete product' },
      search: { endpoint: `${baseUrl}/products/search`, method: 'GET', description: 'Search products' },
      updateStock: { endpoint: `${baseUrl}/products/{id}/stock`, method: 'PUT', description: 'Update product stock' },
      bulkImport: { endpoint: `${baseUrl}/products/bulk-import`, method: 'POST', description: 'Bulk import products' },
    },
    
    // Customers endpoints  
    customers: {
      list: { endpoint: `${baseUrl}/customers`, method: 'GET', description: 'Get all customers' },
      create: { endpoint: `${baseUrl}/customers`, method: 'POST', description: 'Create new customer' },
      update: { endpoint: `${baseUrl}/customers/{id}`, method: 'PUT', description: 'Update customer' },
      delete: { endpoint: `${baseUrl}/customers/{id}`, method: 'DELETE', description: 'Delete customer' },
      orders: { endpoint: `${baseUrl}/customers/{id}/orders`, method: 'GET', description: 'Get customer orders' },
      balance: { endpoint: `${baseUrl}/customers/{id}/balance`, method: 'GET', description: 'Get customer balance' },
      updateBalance: { endpoint: `${baseUrl}/customers/{id}/balance`, method: 'PUT', description: 'Update customer balance' },
    },

    // Orders endpoints
    orders: {
      list: { endpoint: `${baseUrl}/orders`, method: 'GET', description: 'Get all orders' },
      create: { endpoint: `${baseUrl}/orders`, method: 'POST', description: 'Create new order' },
      update: { endpoint: `${baseUrl}/orders/{id}`, method: 'PUT', description: 'Update order' },
      delete: { endpoint: `${baseUrl}/orders/{id}`, method: 'DELETE', description: 'Delete order' },
      updateStatus: { endpoint: `${baseUrl}/orders/{id}/status`, method: 'PUT', description: 'Update order status' },
      addPayment: { endpoint: `${baseUrl}/orders/{id}/payments`, method: 'POST', description: 'Add payment to order' },
      items: { endpoint: `${baseUrl}/orders/{id}/items`, method: 'GET', description: 'Get order items' },
      addItem: { endpoint: `${baseUrl}/orders/{id}/items`, method: 'POST', description: 'Add item to order' },
      removeItem: { endpoint: `${baseUrl}/orders/{id}/items/{itemId}`, method: 'DELETE', description: 'Remove item from order' },
    },

    // Suppliers endpoints
    suppliers: {
      list: { endpoint: `${baseUrl}/suppliers`, method: 'GET', description: 'Get all suppliers' },
      create: { endpoint: `${baseUrl}/suppliers`, method: 'POST', description: 'Create new supplier' },
      update: { endpoint: `${baseUrl}/suppliers/{id}`, method: 'PUT', description: 'Update supplier' },
      delete: { endpoint: `${baseUrl}/suppliers/{id}`, method: 'DELETE', description: 'Delete supplier' },
      products: { endpoint: `${baseUrl}/suppliers/{id}/products`, method: 'GET', description: 'Get supplier products' },
    },

    // Purchase Orders endpoints
    purchaseOrders: {
      list: { endpoint: `${baseUrl}/purchase-orders`, method: 'GET', description: 'Get all purchase orders' },
      create: { endpoint: `${baseUrl}/purchase-orders`, method: 'POST', description: 'Create new purchase order' },
      update: { endpoint: `${baseUrl}/purchase-orders/{id}`, method: 'PUT', description: 'Update purchase order' },
      delete: { endpoint: `${baseUrl}/purchase-orders/{id}`, method: 'DELETE', description: 'Delete purchase order' },
      approve: { endpoint: `${baseUrl}/purchase-orders/{id}/approve`, method: 'PUT', description: 'Approve purchase order' },
      receive: { endpoint: `${baseUrl}/purchase-orders/{id}/receive`, method: 'PUT', description: 'Mark purchase order as received' },
    },

    // Finance endpoints
    finance: {
      addExpense: { endpoint: `${baseUrl}/finance/expenses`, method: 'POST', description: 'Add new expense' },
      getExpenses: { endpoint: `${baseUrl}/finance/expenses`, method: 'GET', description: 'Get all expenses' },
      updateExpense: { endpoint: `${baseUrl}/finance/expenses/{id}`, method: 'PUT', description: 'Update expense' },
      deleteExpense: { endpoint: `${baseUrl}/finance/expenses/{id}`, method: 'DELETE', description: 'Delete expense' },
      getRevenue: { endpoint: `${baseUrl}/finance/revenue`, method: 'GET', description: 'Get revenue data' },
      getCashFlow: { endpoint: `${baseUrl}/finance/cash-flow`, method: 'GET', description: 'Get cash flow data' },
    },

    // Analytics endpoints
    analytics: {
      salesReport: { endpoint: `${baseUrl}/reports/sales`, method: 'GET', description: 'Get sales analytics' },
      inventoryReport: { endpoint: `${baseUrl}/reports/inventory`, method: 'GET', description: 'Get inventory analytics' },
      financialReport: { endpoint: `${baseUrl}/reports/financial`, method: 'GET', description: 'Get financial analytics' },
      customerReport: { endpoint: `${baseUrl}/reports/customers`, method: 'GET', description: 'Get customer analytics' },
      profitReport: { endpoint: `${baseUrl}/reports/profit`, method: 'GET', description: 'Get profit analytics' },
    },

    // Dashboard endpoints
    dashboard: {
      stats: { endpoint: `${baseUrl}/dashboard/enhanced-stats`, method: 'GET', description: 'Get dashboard statistics' },
      dailySales: { endpoint: `${baseUrl}/dashboard/daily-sales`, method: 'GET', description: 'Get daily sales data' },
      categoryPerformance: { endpoint: `${baseUrl}/dashboard/category-performance`, method: 'GET', description: 'Get category performance' },
      inventoryStatus: { endpoint: `${baseUrl}/dashboard/inventory-status`, method: 'GET', description: 'Get inventory status' },
    },

    // Notifications endpoints
    notifications: {
      list: { endpoint: `${baseUrl}/notifications`, method: 'GET', description: 'Get notifications' },
      markAsRead: { endpoint: `${baseUrl}/notifications/{id}/read`, method: 'PUT', description: 'Mark notification as read' },
      markAllAsRead: { endpoint: `${baseUrl}/notifications/mark-all-read`, method: 'PUT', description: 'Mark all notifications as read' },
    },

    // Calendar endpoints
    calendar: {
      events: { endpoint: `${baseUrl}/calendar/events`, method: 'GET', description: 'Get calendar events' },
      createEvent: { endpoint: `${baseUrl}/calendar/events`, method: 'POST', description: 'Create calendar event' },
      updateEvent: { endpoint: `${baseUrl}/calendar/events/{id}`, method: 'PUT', description: 'Update calendar event' },
      deleteEvent: { endpoint: `${baseUrl}/calendar/events/{id}`, method: 'DELETE', description: 'Delete calendar event' },
    },

    // Settings endpoints
    settings: {
      get: { endpoint: `${baseUrl}/settings`, method: 'GET', description: 'Get system settings' },
      update: { endpoint: `${baseUrl}/settings`, method: 'PUT', description: 'Update system settings' },
      backup: { endpoint: `${baseUrl}/settings/backup`, method: 'POST', description: 'Create system backup' },
      restore: { endpoint: `${baseUrl}/settings/restore`, method: 'POST', description: 'Restore from backup' },
    }
  };
};

export const getEndpointsByAction = (action: string) => {
  const allEndpoints = getAllApiEndpoints();
  
  switch (action) {
    case 'products':
      return allEndpoints.products;
    case 'customers':
      return allEndpoints.customers;
    case 'sales':
    case 'orders':
      return allEndpoints.orders;
    case 'suppliers':
      return allEndpoints.suppliers;
    case 'purchase-orders':
      return allEndpoints.purchaseOrders;
    case 'finance':
      return allEndpoints.finance;
    case 'analytics':
      return allEndpoints.analytics;
    default:
      return allEndpoints;
  }
};