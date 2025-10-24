import { apiConfig } from '@/utils/apiConfig';

// Comprehensive API Registry for AutoMate Integration
// This file contains ALL APIs from all main pages with detailed documentation

export interface ApiEndpoint {
  name: string;
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  description: string;
  category: string;
  subcategory?: string;
  parameters?: {
    path?: Record<string, string>;
    query?: Record<string, any>;
    body?: Record<string, any>;
  };
  responseType: string;
  example?: {
    request?: any;
    response?: any;
  };
}

export interface ApiCategory {
  name: string;
  description: string;
  color: string;
  icon: string;
}

// API Categories
export const apiCategories: Record<string, ApiCategory> = {
  dashboard: {
    name: "Dashboard & Analytics",
    description: "Overview statistics and performance metrics",
    color: "blue",
    icon: "BarChart3"
  },
  products: {
    name: "Product Management",
    description: "Manage products, categories, and inventory",
    color: "green", 
    icon: "Package"
  },
  customers: {
    name: "Customer Management",
    description: "Handle customer data and relationships",
    color: "purple",
    icon: "Users"
  },
  sales: {
    name: "Sales & Orders",
    description: "Process sales, orders, and quotations",
    color: "orange",
    icon: "ShoppingCart"
  },
  suppliers: {
    name: "Supplier Management", 
    description: "Manage suppliers and purchase orders",
    color: "teal",
    icon: "Truck"
  },
  finance: {
    name: "Financial Management",
    description: "Finance, payments, expenses, and accounts",
    color: "red",
    icon: "DollarSign"
  },
  reports: {
    name: "Reports & Analytics",
    description: "Generate comprehensive business reports",
    color: "indigo",
    icon: "FileText"
  },
  employees: {
    name: "Employee Management",
    description: "Manage staff and employee data",
    color: "yellow", 
    icon: "UserCheck"
  },
  accounts: {
    name: "Chart of Accounts",
    description: "Manage financial accounts and ledgers",
    color: "pink",
    icon: "Calculator"
  },
  settings: {
    name: "System Settings",
    description: "Configure system and application settings",
    color: "gray",
    icon: "Settings"
  }
};

// Comprehensive API Registry
export const comprehensiveApiRegistry: Record<string, ApiEndpoint[]> = {
  // ===== DASHBOARD & ANALYTICS =====
  dashboard: [
    {
      name: "Get Dashboard Stats",
      endpoint: "/dashboard/stats",
      method: "GET",
      description: "Retrieve basic dashboard statistics",
      category: "dashboard",
      subcategory: "overview",
      parameters: {
        query: {
          period: "Optional period filter (day, week, month, year)"
        }
      },
      responseType: "DashboardStats",
      example: {
        response: {
          success: true,
          data: {
            totalRevenue: 150000,
            totalOrders: 450,
            totalCustomers: 120,
            totalProducts: 800
          }
        }
      }
    },
    {
      name: "Get Enhanced Dashboard Stats",
      endpoint: "/dashboard/enhanced-stats", 
      method: "GET",
      description: "Get comprehensive dashboard metrics with financial, sales, inventory data",
      category: "dashboard",
      subcategory: "enhanced",
      responseType: "EnhancedDashboardData",
      example: {
        response: {
          success: true,
          data: {
            financial: {
              todayRevenue: 5000,
              monthRevenue: 150000,
              grossProfit: 90000,
              profitMargin: 60
            }
          }
        }
      }
    },
    {
      name: "Get Revenue Trend",
      endpoint: "/dashboard/revenue-trend",
      method: "GET", 
      description: "Fetch revenue trend data for charts",
      category: "dashboard",
      subcategory: "trends",
      parameters: {
        query: {
          period: "Time period (7d, 30d, 90d, 1y)",
          granularity: "Data granularity (day, week, month)"
        }
      },
      responseType: "RevenueTrendData[]"
    },
    {
      name: "Get Category Performance",
      endpoint: "/dashboard/category-performance",
      method: "GET",
      description: "Get sales performance by product categories",
      category: "dashboard",
      subcategory: "performance",
      responseType: "CategoryPerformanceData[]"
    },
    {
      name: "Get Daily Sales",
      endpoint: "/dashboard/daily-sales", 
      method: "GET",
      description: "Retrieve daily sales data for trends",
      category: "dashboard",
      subcategory: "sales",
      parameters: {
        query: {
          days: "Number of days to retrieve (default: 30)"
        }
      },
      responseType: "DailySalesData[]"
    },
    {
      name: "Get Inventory Status",
      endpoint: "/dashboard/inventory-status",
      method: "GET",
      description: "Get current inventory status and alerts",
      category: "dashboard", 
      subcategory: "inventory",
      responseType: "InventoryStatusData"
    }
  ],

  // ===== PRODUCT MANAGEMENT =====
  products: [
    {
      name: "List All Products",
      endpoint: "/products",
      method: "GET",
      description: "Retrieve all products with pagination and filtering",
      category: "products",
      subcategory: "management",
      parameters: {
        query: {
          page: "Page number (default: 1)",
          limit: "Items per page (default: 20)",
          search: "Search term for product name/SKU",
          category: "Filter by category",
          status: "Filter by status (active, inactive)",
          sortBy: "Sort field (name, price, stock)",
          sortOrder: "Sort direction (asc, desc)"
        }
      },
      responseType: "PaginatedProductResponse",
      example: {
        request: {
          page: 1,
          limit: 10,
          search: "KMI",
          category: "Hardware"
        },
        response: {
          success: true,
          data: {
            products: [
              {
                id: 1,
                name: "KMI 5014",
                sku: "KMI5014",
                price: 6300,
                stock: 25,
                category: "Hardware"
              }
            ],
            pagination: {
              currentPage: 1,
              totalPages: 5,
              totalItems: 50
            }
          }
        }
      }
    },
    {
      name: "Get Product by ID",
      endpoint: "/products/{id}",
      method: "GET", 
      description: "Retrieve specific product details by ID",
      category: "products",
      subcategory: "details",
      parameters: {
        path: {
          id: "Product ID"
        }
      },
      responseType: "ProductDetails",
      example: {
        request: { id: 123 },
        response: {
          success: true,
          data: {
            id: 123,
            name: "KMI 5014",
            description: "Premium hardware component",
            price: 6300,
            stock: 25,
            minStock: 5,
            category: "Hardware"
          }
        }
      }
    },
    {
      name: "Create New Product",
      endpoint: "/products",
      method: "POST",
      description: "Add a new product to inventory",
      category: "products",
      subcategory: "management",
      parameters: {
        body: {
          name: "Product name",
          sku: "Product SKU/Code", 
          description: "Product description",
          price: "Product price",
          category: "Product category",
          unit: "Unit of measurement",
          minStock: "Minimum stock threshold",
          supplier: "Supplier information"
        }
      },
      responseType: "ProductCreationResponse",
      example: {
        request: {
          name: "New Hardware Item",
          sku: "NH001",
          price: 1500,
          category: "Hardware",
          minStock: 10
        }
      }
    },
    {
      name: "Update Product",
      endpoint: "/products/{id}",
      method: "PUT",
      description: "Update existing product details",
      category: "products",
      subcategory: "management", 
      parameters: {
        path: {
          id: "Product ID to update"
        },
        body: {
          name: "Updated product name",
          price: "Updated price",
          description: "Updated description",
          category: "Updated category",
          minStock: "Updated minimum stock"
        }
      },
      responseType: "ProductUpdateResponse"
    },
    {
      name: "Delete Product",
      endpoint: "/products/{id}",
      method: "DELETE",
      description: "Remove a product from the system",
      category: "products",
      subcategory: "management",
      parameters: {
        path: {
          id: "Product ID to delete"
        }
      },
      responseType: "DeletionResponse"
    },
    {
      name: "Adjust Product Stock",
      endpoint: "/products/{id}/stock-adjustment",
      method: "POST",
      description: "Adjust product stock levels with reason tracking",
      category: "products",
      subcategory: "inventory",
      parameters: {
        path: {
          id: "Product ID"
        },
        body: {
          adjustment: "Stock adjustment amount (+/-)",
          reason: "Reason for adjustment",
          notes: "Additional notes"
        }
      },
      responseType: "StockAdjustmentResponse",
      example: {
        request: {
          adjustment: -5,
          reason: "Damaged items",
          notes: "Water damage during transport"
        }
      }
    },
    {
      name: "Get Categories",
      endpoint: "/categories",
      method: "GET",
      description: "Retrieve all product categories",
      category: "products",
      subcategory: "categories",
      responseType: "CategoryList"
    },
    {
      name: "Create Category",
      endpoint: "/categories",
      method: "POST",
      description: "Create a new product category",
      category: "products",
      subcategory: "categories",
      parameters: {
        body: {
          name: "Category name"
        }
      },
      responseType: "CategoryCreationResponse"
    },
    {
      name: "Get Units",
      endpoint: "/units",
      method: "GET",
      description: "Retrieve all measurement units",
      category: "products",
      subcategory: "units",
      responseType: "UnitList"
    },
    {
      name: "Create Unit",
      endpoint: "/units", 
      method: "POST",
      description: "Create a new measurement unit",
      category: "products",
      subcategory: "units",
      parameters: {
        body: {
          name: "Unit name",
          label: "Unit display label"
        }
      },
      responseType: "UnitCreationResponse"
    }
  ],

  // ===== CUSTOMER MANAGEMENT =====
  customers: [
    {
      name: "List All Customers",
      endpoint: "/customers",
      method: "GET",
      description: "Retrieve all customers with pagination and search",
      category: "customers",
      subcategory: "management",
      parameters: {
        query: {
          page: "Page number (default: 1)",
          limit: "Items per page (default: 20)",
          search: "Search customer name/email/phone",
          type: "Customer type filter",
          status: "Customer status filter"
        }
      },
      responseType: "PaginatedCustomerResponse",
      example: {
        request: {
          search: "ABC Electronics",
          page: 1,
          limit: 10
        }
      }
    },
    {
      name: "Get Customer by ID", 
      endpoint: "/customers/{id}",
      method: "GET",
      description: "Retrieve specific customer details",
      category: "customers",
      subcategory: "details",
      parameters: {
        path: {
          id: "Customer ID"
        }
      },
      responseType: "CustomerDetails"
    },
    {
      name: "Create New Customer",
      endpoint: "/customers",
      method: "POST", 
      description: "Add a new customer to the system",
      category: "customers",
      subcategory: "management",
      parameters: {
        body: {
          name: "Customer name",
          email: "Customer email",
          phone: "Phone number",
          address: "Customer address",
          type: "Customer type (individual, business)",
          creditLimit: "Credit limit amount"
        }
      },
      responseType: "CustomerCreationResponse",
      example: {
        request: {
          name: "ABC Electronics",
          email: "contact@abc.com",
          phone: "123-456-7890",
          type: "business",
          creditLimit: 50000
        }
      }
    },
    {
      name: "Update Customer",
      endpoint: "/customers/{id}",
      method: "PUT",
      description: "Update existing customer information",
      category: "customers",
      subcategory: "management",
      parameters: {
        path: {
          id: "Customer ID"
        },
        body: {
          name: "Updated customer name",
          email: "Updated email",
          phone: "Updated phone",
          address: "Updated address"
        }
      },
      responseType: "CustomerUpdateResponse"
    },
    {
      name: "Delete Customer",
      endpoint: "/customers/{id}",
      method: "DELETE",
      description: "Remove customer from the system",
      category: "customers",
      subcategory: "management", 
      parameters: {
        path: {
          id: "Customer ID to delete"
        }
      },
      responseType: "DeletionResponse"
    },
    {
      name: "Get Customer Balance",
      endpoint: "/customers/{id}/balance",
      method: "GET",
      description: "Retrieve customer balance and credit information",
      category: "customers",
      subcategory: "finance",
      parameters: {
        path: {
          id: "Customer ID"
        }
      },
      responseType: "CustomerBalance",
      example: {
        response: {
          success: true,
          data: {
            currentBalance: 15000,
            creditLimit: 50000,
            availableCredit: 35000,
            totalPurchases: 125000
          }
        }
      }
    },
    {
      name: "Update Customer Balance",
      endpoint: "/customers/update-balance",
      method: "POST",
      description: "Update customer balance with transaction details",
      category: "customers",
      subcategory: "finance",
      parameters: {
        body: {
          customerId: "Customer ID",
          orderId: "Related order ID",
          amount: "Transaction amount",
          type: "Transaction type (credit, debit)",
          description: "Transaction description"
        }
      },
      responseType: "BalanceUpdateResponse"
    },
    {
      name: "Get Customer Orders",
      endpoint: "/customers/{id}/orders",
      method: "GET",
      description: "Retrieve all orders for a specific customer",
      category: "customers",
      subcategory: "orders",
      parameters: {
        path: {
          id: "Customer ID"
        },
        query: {
          page: "Page number",
          limit: "Orders per page",
          status: "Filter by order status"
        }
      },
      responseType: "CustomerOrdersResponse"
    }
  ],

  // ===== SALES & ORDERS =====
  sales: [
    {
      name: "List All Sales",
      endpoint: "/sales",
      method: "GET",
      description: "Retrieve all sales with filtering and pagination",
      category: "sales",
      subcategory: "management",
      parameters: {
        query: {
          page: "Page number (default: 1)",
          limit: "Items per page (default: 20)",
          dateFrom: "Start date filter (YYYY-MM-DD)",
          dateTo: "End date filter (YYYY-MM-DD)",
          customerId: "Filter by customer",
          status: "Filter by sale status"
        }
      },
      responseType: "PaginatedSalesResponse"
    },
    {
      name: "Get Sale by ID",
      endpoint: "/sales/{id}",
      method: "GET",
      description: "Retrieve specific sale details",
      category: "sales",
      subcategory: "details",
      parameters: {
        path: {
          id: "Sale ID"
        }
      },
      responseType: "SaleDetails"
    },
    {
      name: "Create New Sale",
      endpoint: "/sales",
      method: "POST",
      description: "Process a new sale transaction",
      category: "sales",
      subcategory: "processing",
      parameters: {
        body: {
          customerId: "Customer ID",
          items: "Array of sale items",
          paymentMethod: "Payment method",
          discount: "Discount amount",
          tax: "Tax amount",
          notes: "Sale notes"
        }
      },
      responseType: "SaleCreationResponse",
      example: {
        request: {
          customerId: 123,
          items: [
            {
              productId: 456,
              quantity: 2,
              unitPrice: 6300
            }
          ],
          paymentMethod: "cash",
          discount: 500
        }
      }
    },
    {
      name: "Update Sale Status",
      endpoint: "/sales/{id}/status",
      method: "PUT",
      description: "Update sale status (pending, completed, cancelled)",
      category: "sales",
      subcategory: "management",
      parameters: {
        path: {
          id: "Sale ID"
        },
        body: {
          status: "New status",
          reason: "Reason for status change"
        }
      },
      responseType: "StatusUpdateResponse"
    },
    {
      name: "Adjust Sale",
      endpoint: "/sales/{id}/adjust",
      method: "POST", 
      description: "Make adjustments to existing sale",
      category: "sales",
      subcategory: "adjustments",
      parameters: {
        path: {
          id: "Sale ID"
        },
        body: {
          adjustmentType: "Type of adjustment",
          amount: "Adjustment amount",
          reason: "Reason for adjustment"
        }
      },
      responseType: "SaleAdjustmentResponse"
    },
    {
      name: "Generate Sale PDF",
      endpoint: "/sales/{id}/pdf",
      method: "GET",
      description: "Generate PDF receipt for sale",
      category: "sales", 
      subcategory: "documents",
      parameters: {
        path: {
          id: "Sale ID"
        }
      },
      responseType: "PDF Document"
    },
    {
      name: "List All Orders",
      endpoint: "/orders",
      method: "GET", 
      description: "Retrieve all customer orders",
      category: "sales",
      subcategory: "orders",
      parameters: {
        query: {
          page: "Page number",
          limit: "Orders per page",
          status: "Filter by order status",
          customerId: "Filter by customer",
          dateFrom: "Start date",
          dateTo: "End date"
        }
      },
      responseType: "PaginatedOrdersResponse"
    },
    {
      name: "Create New Order", 
      endpoint: "/orders",
      method: "POST",
      description: "Create a new customer order",
      category: "sales",
      subcategory: "orders",
      parameters: {
        body: {
          customerId: "Customer ID",
          items: "Order items array",
          deliveryDate: "Expected delivery date",
          notes: "Order notes"
        }
      },
      responseType: "OrderCreationResponse"
    },
    {
      name: "Update Order Status",
      endpoint: "/orders/{id}/status",
      method: "PUT",
      description: "Update order status and tracking",
      category: "sales",
      subcategory: "orders",
      parameters: {
        path: {
          id: "Order ID"
        },
        body: {
          status: "New order status",
          notes: "Status update notes"
        }
      },
      responseType: "OrderStatusResponse"
    }
  ],

  // ===== SUPPLIER MANAGEMENT =====
  suppliers: [
    {
      name: "List All Suppliers",
      endpoint: "/suppliers",
      method: "GET",
      description: "Retrieve all suppliers with search and pagination",
      category: "suppliers",
      subcategory: "management",
      parameters: {
        query: {
          page: "Page number (default: 1)",
          limit: "Items per page (default: 20)",
          search: "Search supplier name/contact",
          status: "Filter by supplier status"
        }
      },
      responseType: "PaginatedSuppliersResponse"
    },
    {
      name: "Get Supplier by ID",
      endpoint: "/suppliers/{id}",
      method: "GET",
      description: "Retrieve specific supplier details",
      category: "suppliers",
      subcategory: "details",
      parameters: {
        path: {
          id: "Supplier ID"
        }
      },
      responseType: "SupplierDetails"
    },
    {
      name: "Create New Supplier",
      endpoint: "/suppliers",
      method: "POST",
      description: "Add a new supplier to the system",
      category: "suppliers",
      subcategory: "management",
      parameters: {
        body: {
          name: "Supplier company name",
          contactPerson: "Contact person name",
          email: "Supplier email",
          phone: "Phone number", 
          address: "Supplier address",
          paymentTerms: "Payment terms"
        }
      },
      responseType: "SupplierCreationResponse",
      example: {
        request: {
          name: "ZTC Suppliers",
          contactPerson: "John Smith",
          email: "john@ztc.com",
          phone: "123-456-7890",
          paymentTerms: "Net 30"
        }
      }
    },
    {
      name: "Update Supplier",
      endpoint: "/suppliers/{id}",
      method: "PUT",
      description: "Update existing supplier information",
      category: "suppliers",
      subcategory: "management",
      parameters: {
        path: {
          id: "Supplier ID"
        },
        body: {
          name: "Updated supplier name",
          contactPerson: "Updated contact person",
          email: "Updated email",
          phone: "Updated phone"
        }
      },
      responseType: "SupplierUpdateResponse"
    },
    {
      name: "Delete Supplier",
      endpoint: "/suppliers/{id}",
      method: "DELETE",
      description: "Remove supplier from the system",
      category: "suppliers",
      subcategory: "management",
      parameters: {
        path: {
          id: "Supplier ID to delete"
        }
      },
      responseType: "DeletionResponse"
    },
    {
      name: "List Purchase Orders",
      endpoint: "/purchase-orders",
      method: "GET",
      description: "Retrieve all purchase orders with filtering",
      category: "suppliers",
      subcategory: "purchase-orders",
      parameters: {
        query: {
          page: "Page number (default: 1)",
          limit: "Items per page (default: 20)",
          supplierId: "Filter by supplier",
          status: "Filter by PO status",
          dateFrom: "Start date filter",
          dateTo: "End date filter",
          search: "Search PO number"
        }
      },
      responseType: "PaginatedPurchaseOrdersResponse"
    },
    {
      name: "Get Purchase Order by ID",
      endpoint: "/purchase-orders/{id}",
      method: "GET",
      description: "Retrieve specific purchase order details",
      category: "suppliers",
      subcategory: "purchase-orders",
      parameters: {
        path: {
          id: "Purchase Order ID"
        }
      },
      responseType: "PurchaseOrderDetails"
    },
    {
      name: "Create Purchase Order",
      endpoint: "/purchase-orders",
      method: "POST",
      description: "Create a new purchase order",
      category: "suppliers",
      subcategory: "purchase-orders",
      parameters: {
        body: {
          supplierId: "Supplier ID",
          expectedDelivery: "Expected delivery date",
          items: "Array of items to order",
          notes: "Purchase order notes"
        }
      },
      responseType: "PurchaseOrderCreationResponse",
      example: {
        request: {
          supplierId: 8,
          expectedDelivery: "2025-09-25",
          items: [
            {
              productId: 123,
              quantity: 20,
              unitPrice: 6300
            }
          ],
          notes: "Urgent order for stock replenishment"
        }
      }
    },
    {
      name: "Update Purchase Order",
      endpoint: "/purchase-orders/{id}",
      method: "PUT",
      description: "Update purchase order details",
      category: "suppliers",
      subcategory: "purchase-orders",
      parameters: {
        path: {
          id: "Purchase Order ID"
        },
        body: {
          status: "Updated status",
          notes: "Updated notes",
          expectedDelivery: "Updated delivery date"
        }
      },
      responseType: "PurchaseOrderUpdateResponse"
    },
    {
      name: "Receive Purchase Order",
      endpoint: "/purchase-orders/{id}/receive",
      method: "PUT",
      description: "Mark purchase order items as received",
      category: "suppliers",
      subcategory: "purchase-orders",
      parameters: {
        path: {
          id: "Purchase Order ID"
        },
        body: {
          items: "Array of received items with quantities",
          notes: "Receiving notes"
        }
      },
      responseType: "ReceivingResponse"
    },
    {
      name: "List Quotations",
      endpoint: "/quotations", 
      method: "GET",
      description: "Retrieve all quotations with filtering",
      category: "suppliers",
      subcategory: "quotations",
      parameters: {
        query: {
          page: "Page number",
          limit: "Items per page",
          customerId: "Filter by customer",
          status: "Filter by quotation status",
          dateFrom: "Start date filter",
          dateTo: "End date filter"
        }
      },
      responseType: "PaginatedQuotationsResponse"
    },
    {
      name: "Create Quotation",
      endpoint: "/quotations",
      method: "POST",
      description: "Create a new customer quotation",
      category: "suppliers", 
      subcategory: "quotations",
      parameters: {
        body: {
          customerId: "Customer ID",
          items: "Quotation items array",
          validUntil: "Quotation validity date",
          terms: "Terms and conditions"
        }
      },
      responseType: "QuotationCreationResponse"
    },
    {
      name: "Convert Quotation to Sale",
      endpoint: "/quotations/{id}/convert-to-sale",
      method: "PUT",
      description: "Convert approved quotation to actual sale",
      category: "suppliers",
      subcategory: "quotations",
      parameters: {
        path: {
          id: "Quotation ID"
        }
      },
      responseType: "ConversionResponse"
    }
  ],

  // ===== FINANCIAL MANAGEMENT =====
  finance: [
    {
      name: "Get Finance Overview",
      endpoint: "/finance/overview",
      method: "GET",
      description: "Get comprehensive financial overview and metrics",
      category: "finance",
      subcategory: "overview",
      parameters: {
        query: {
          period: "Time period (month, quarter, year)"
        }
      },
      responseType: "FinanceOverview",
      example: {
        response: {
          success: true,
          data: {
            revenue: {
              total: 150000,
              cash: 90000,
              credit: 60000,
              growth: 12.5
            },
            expenses: {
              total: 45000,
              operational: 15000,
              growth: 8.2
            },
            profit: {
              net: 105000,
              margin: 70
            }
          }
        }
      }
    },
    {
      name: "Get Accounts Receivable",
      endpoint: "/finance/accounts-receivable",
      method: "GET", 
      description: "Retrieve accounts receivable with aging analysis",
      category: "finance",
      subcategory: "receivables",
      parameters: {
        query: {
          status: "Filter by status (pending, overdue, paid)",
          customerId: "Filter by specific customer",
          overdue: "Show only overdue accounts (true/false)",
          limit: "Number of records to return"
        }
      },
      responseType: "AccountsReceivableResponse",
      example: {
        response: {
          success: true,
          data: {
            receivables: [
              {
                customerName: "ABC Electronics",
                amount: 15000,
                balance: 12000,
                daysOverdue: 5,
                status: "overdue"
              }
            ],
            summary: {
              totalReceivables: 50000,
              overdueAmount: 15000,
              overdueCount: 3
            }
          }
        }
      }
    },
    {
      name: "Record Payment",
      endpoint: "/customers/record-payment",
      method: "POST",
      description: "Record customer payment and update balance",
      category: "finance",
      subcategory: "payments",
      parameters: {
        body: {
          customerId: "Customer ID (optional for non-customer payments)",
          amount: "Payment amount",
          paymentMethod: "Payment method",
          accountId: "Account to credit payment to",
          reference: "Payment reference/receipt number",
          notes: "Payment notes",
          source: "Payment source (customer, other)"
        }
      },
      responseType: "PaymentRecordResponse",
      example: {
        request: {
          customerId: 123,
          amount: 5000,
          paymentMethod: "bank_transfer", 
          accountId: 1,
          reference: "TXN123456",
          notes: "Partial payment for invoice INV-001"
        }
      }
    },
    {
      name: "Get Expenses",
      endpoint: "/finance/expenses",
      method: "GET",
      description: "Retrieve expense records with filtering",
      category: "finance",
      subcategory: "expenses",
      parameters: {
        query: {
          category: "Filter by expense category",
          dateFrom: "Start date (YYYY-MM-DD)",
          dateTo: "End date (YYYY-MM-DD)",
          limit: "Number of records",
          accountId: "Filter by account"
        }
      },
      responseType: "ExpensesResponse"
    },
    {
      name: "Create Expense",
      endpoint: "/finance/expenses",
      method: "POST",
      description: "Record a new business expense",
      category: "finance", 
      subcategory: "expenses",
      parameters: {
        body: {
          category: "Expense category",
          subcategory: "Expense subcategory",
          description: "Expense description",
          amount: "Expense amount",
          date: "Expense date",
          accountId: "Account to debit",
          paymentMethod: "Payment method used",
          reference: "Receipt/reference number",
          isRecurring: "Whether expense is recurring",
          frequency: "Recurrence frequency (if recurring)",
          notes: "Additional notes"
        }
      },
      responseType: "ExpenseCreationResponse",
      example: {
        request: {
          category: "Office Supplies",
          description: "Monthly stationery purchase",
          amount: 2500,
          date: "2025-09-22",
          accountId: 2,
          paymentMethod: "cash",
          reference: "REC-001"
        }
      }
    },
    {
      name: "Update Expense",
      endpoint: "/finance/expenses/{id}",
      method: "PUT",
      description: "Update existing expense record",
      category: "finance",
      subcategory: "expenses",
      parameters: {
        path: {
          id: "Expense ID"
        },
        body: {
          category: "Updated category",
          description: "Updated description", 
          amount: "Updated amount",
          accountId: "Updated account"
        }
      },
      responseType: "ExpenseUpdateResponse"
    },
    {
      name: "Delete Expense",
      endpoint: "/finance/expenses/{id}",
      method: "DELETE",
      description: "Remove expense record",
      category: "finance",
      subcategory: "expenses",
      parameters: {
        path: {
          id: "Expense ID to delete"
        }
      },
      responseType: "DeletionResponse"
    }
  ],

  // ===== CHART OF ACCOUNTS =====
  accounts: [
    {
      name: "List All Accounts",
      endpoint: "/accounts",
      method: "GET",
      description: "Retrieve all financial accounts in the chart of accounts",
      category: "accounts", 
      subcategory: "management",
      parameters: {
        query: {
          accountType: "Filter by account type (asset, liability, equity, revenue, expense, bank, cash)",
          isActive: "Filter by active status (true/false)",
          search: "Search account name or code"
        }
      },
      responseType: "AccountsListResponse",
      example: {
        response: {
          success: true,
          data: [
            {
              id: 1,
              accountCode: "1001",
              accountName: "Cash in Hand",
              accountType: "cash",
              balance: 50000,
              isActive: true
            },
            {
              id: 2,
              accountCode: "1100", 
              accountName: "Bank Account - Main",
              accountType: "bank",
              balance: 250000,
              isActive: true
            }
          ]
        }
      }
    },
    {
      name: "Get Account by ID",
      endpoint: "/accounts/{id}",
      method: "GET",
      description: "Retrieve specific account details and transaction history",
      category: "accounts",
      subcategory: "details",
      parameters: {
        path: {
          id: "Account ID"
        },
        query: {
          includeTransactions: "Include recent transactions (true/false)",
          transactionLimit: "Number of recent transactions to include"
        }
      },
      responseType: "AccountDetailsResponse"
    },
    {
      name: "Create New Account",
      endpoint: "/accounts",
      method: "POST",
      description: "Create a new account in the chart of accounts",
      category: "accounts",
      subcategory: "management", 
      parameters: {
        body: {
          accountCode: "Unique account code",
          accountName: "Account name",
          accountType: "Account type (asset, liability, equity, revenue, expense, bank, cash)",
          openingBalance: "Opening balance amount",
          description: "Account description"
        }
      },
      responseType: "AccountCreationResponse",
      example: {
        request: {
          accountCode: "1150",
          accountName: "Petty Cash",
          accountType: "cash",
          openingBalance: 5000,
          description: "Small cash transactions"
        }
      }
    },
    {
      name: "Update Account",
      endpoint: "/accounts/{id}",
      method: "PUT", 
      description: "Update account details (name, type, status)",
      category: "accounts",
      subcategory: "management",
      parameters: {
        path: {
          id: "Account ID"
        },
        body: {
          accountName: "Updated account name",
          accountType: "Updated account type",
          isActive: "Account active status",
          description: "Updated description"
        }
      },
      responseType: "AccountUpdateResponse"
    },
    {
      name: "Deactivate Account",
      endpoint: "/accounts/{id}/deactivate",
      method: "PUT",
      description: "Deactivate an account (soft delete)",
      category: "accounts",
      subcategory: "management",
      parameters: {
        path: {
          id: "Account ID"
        }
      },
      responseType: "AccountDeactivationResponse"
    },
    {
      name: "Get Account Balance",
      endpoint: "/accounts/{id}/balance",
      method: "GET",
      description: "Get current account balance and recent activity",
      category: "accounts",
      subcategory: "balances",
      parameters: {
        path: {
          id: "Account ID"
        },
        query: {
          asOf: "Balance as of specific date (YYYY-MM-DD)"
        }
      },
      responseType: "AccountBalanceResponse"
    },
    {
      name: "Transfer Between Accounts",
      endpoint: "/accounts/transfer",
      method: "POST",
      description: "Transfer funds between accounts",
      category: "accounts",
      subcategory: "transactions",
      parameters: {
        body: {
          fromAccountId: "Source account ID",
          toAccountId: "Destination account ID", 
          amount: "Transfer amount",
          reference: "Transfer reference",
          description: "Transfer description"
        }
      },
      responseType: "TransferResponse",
      example: {
        request: {
          fromAccountId: 1,
          toAccountId: 2,
          amount: 10000,
          reference: "TRF-001",
          description: "Transfer to main bank account"
        }
      }
    }
  ],

  // ===== EMPLOYEE MANAGEMENT =====
  employees: [
    {
      name: "List All Employees",
      endpoint: "/employees",
      method: "GET",
      description: "Retrieve all employees with filtering and pagination",
      category: "employees",
      subcategory: "management",
      parameters: {
        query: {
          page: "Page number (default: 1)",
          limit: "Items per page (default: 20)",
          search: "Search employee name/email/ID",
          department: "Filter by department", 
          status: "Filter by employment status",
          role: "Filter by job role"
        }
      },
      responseType: "PaginatedEmployeesResponse",
      example: {
        request: {
          department: "Sales",
          status: "active",
          page: 1,
          limit: 10
        }
      }
    },
    {
      name: "Get Employee by ID",
      endpoint: "/employees/{id}",
      method: "GET",
      description: "Retrieve specific employee details and employment history",
      category: "employees",
      subcategory: "details",
      parameters: {
        path: {
          id: "Employee ID"
        }
      },
      responseType: "EmployeeDetails"
    },
    {
      name: "Create New Employee", 
      endpoint: "/employees",
      method: "POST",
      description: "Add a new employee to the system",
      category: "employees",
      subcategory: "management",
      parameters: {
        body: {
          firstName: "Employee first name",
          lastName: "Employee last name", 
          email: "Employee email",
          phone: "Phone number",
          address: "Employee address",
          employeeId: "Unique employee ID",
          department: "Department name",
          role: "Job role/title",
          salary: "Employee salary",
          hireDate: "Date of hiring",
          manager: "Manager/supervisor"
        }
      },
      responseType: "EmployeeCreationResponse",
      example: {
        request: {
          firstName: "John",
          lastName: "Smith",
          email: "john.smith@company.com",
          phone: "123-456-7890",
          employeeId: "EMP001",
          department: "Sales",
          role: "Sales Executive",
          salary: 45000,
          hireDate: "2025-09-22"
        }
      }
    },
    {
      name: "Update Employee",
      endpoint: "/employees/{id}",
      method: "PUT",
      description: "Update employee information",
      category: "employees",
      subcategory: "management", 
      parameters: {
        path: {
          id: "Employee ID"
        },
        body: {
          firstName: "Updated first name",
          lastName: "Updated last name",
          email: "Updated email",
          phone: "Updated phone",
          department: "Updated department",
          role: "Updated role",
          salary: "Updated salary"
        }
      },
      responseType: "EmployeeUpdateResponse"
    },
    {
      name: "Deactivate Employee",
      endpoint: "/employees/{id}/deactivate",
      method: "PUT",
      description: "Deactivate employee (termination)",
      category: "employees",
      subcategory: "management",
      parameters: {
        path: {
          id: "Employee ID"
        },
        body: {
          terminationDate: "Date of termination",
          reason: "Termination reason",
          notes: "Additional notes"
        }
      },
      responseType: "EmployeeDeactivationResponse"
    },
    {
      name: "Get Employee Attendance",
      endpoint: "/employees/{id}/attendance", 
      method: "GET",
      description: "Retrieve employee attendance records",
      category: "employees",
      subcategory: "attendance",
      parameters: {
        path: {
          id: "Employee ID"
        },
        query: {
          dateFrom: "Start date (YYYY-MM-DD)",
          dateTo: "End date (YYYY-MM-DD)",
          month: "Specific month (YYYY-MM)"
        }
      },
      responseType: "AttendanceResponse"
    },
    {
      name: "Record Attendance",
      endpoint: "/employees/{id}/attendance",
      method: "POST",
      description: "Record employee check-in/check-out",
      category: "employees",
      subcategory: "attendance",
      parameters: {
        path: {
          id: "Employee ID"
        },
        body: {
          date: "Attendance date",
          checkIn: "Check-in time",
          checkOut: "Check-out time (optional)",
          status: "Attendance status (present, absent, late)",
          notes: "Attendance notes"
        }
      },
      responseType: "AttendanceRecordResponse"
    },
    {
      name: "Get Payroll",
      endpoint: "/employees/payroll",
      method: "GET",
      description: "Retrieve payroll information for all employees",
      category: "employees",
      subcategory: "payroll",
      parameters: {
        query: {
          month: "Payroll month (YYYY-MM)",
          department: "Filter by department",
          employeeId: "Specific employee ID"
        }
      },
      responseType: "PayrollResponse"
    },
    {
      name: "Process Payroll",
      endpoint: "/employees/payroll/process",
      method: "POST",
      description: "Process monthly payroll for employees",
      category: "employees", 
      subcategory: "payroll",
      parameters: {
        body: {
          month: "Payroll month (YYYY-MM)",
          employeeIds: "Array of employee IDs (optional - all if not specified)",
          bonuses: "Array of bonus payments",
          deductions: "Array of deductions"
        }
      },
      responseType: "PayrollProcessResponse"
    }
  ],

  // ===== REPORTS & ANALYTICS =====
  reports: [
    {
      name: "Sales Report",
      endpoint: "/reports/sales",
      method: "GET",
      description: "Generate comprehensive sales analytics and reports",
      category: "reports",
      subcategory: "sales",
      parameters: {
        query: {
          period: "Report period (daily, weekly, monthly, yearly)",
          dateFrom: "Start date (YYYY-MM-DD)",
          dateTo: "End date (YYYY-MM-DD)", 
          groupBy: "Group by (date, product, customer, category)",
          customerId: "Filter by specific customer",
          productId: "Filter by specific product"
        }
      },
      responseType: "SalesReportData",
      example: {
        request: {
          period: "monthly",
          dateFrom: "2025-01-01",
          dateTo: "2025-09-30",
          groupBy: "date"
        }
      }
    },
    {
      name: "Inventory Report",
      endpoint: "/reports/inventory",
      method: "GET",
      description: "Generate inventory status and movement reports",
      category: "reports",
      subcategory: "inventory",
      parameters: {
        query: {
          includeMovements: "Include stock movements (true/false)",
          lowStockOnly: "Show only low stock items (true/false)",
          category: "Filter by product category"
        }
      },
      responseType: "InventoryReportData"
    },
    {
      name: "Financial Report",
      endpoint: "/reports/financial",
      method: "GET", 
      description: "Generate financial statements and cash flow reports",
      category: "reports",
      subcategory: "financial",
      parameters: {
        query: {
          period: "Report period (monthly, quarterly, yearly)",
          year: "Specific year",
          includeComparison: "Include year-over-year comparison (true/false)"
        }
      },
      responseType: "FinancialReportData"
    },
    {
      name: "Customer Report",
      endpoint: "/reports/customers",
      method: "GET",
      description: "Generate customer analytics and segmentation reports",
      category: "reports",
      subcategory: "customers",
      parameters: {
        query: {
          segmentBy: "Segment by (value, frequency, recency)",
          includeBalances: "Include customer balances (true/false)",
          topCustomersCount: "Number of top customers to include"
        }
      },
      responseType: "CustomerReportData"
    },
    {
      name: "Profitability Trend",
      endpoint: "/reports/profitability-trend", 
      method: "GET",
      description: "Analyze profitability trends over time",
      category: "reports",
      subcategory: "profitability",
      parameters: {
        query: {
          period: "Analysis period",
          year: "Specific year",
          months: "Number of months to analyze"
        }
      },
      responseType: "ProfitabilityTrendData[]"
    },
    {
      name: "Revenue Forecast",
      endpoint: "/reports/revenue-forecast",
      method: "GET",
      description: "Generate AI-powered revenue forecasting",
      category: "reports",
      subcategory: "forecasting",
      parameters: {
        query: {
          months: "Forecast period in months",
          includeConfidence: "Include confidence intervals",
          model: "Forecasting model (linear, seasonal, ai)"
        }
      },
      responseType: "RevenueForecastData[]"
    },
    {
      name: "KPI Metrics",
      endpoint: "/reports/kpi-metrics",
      method: "GET",
      description: "Get key performance indicators and metrics",
      category: "reports",
      subcategory: "kpi",
      parameters: {
        query: {
          period: "Metrics period",
          compareWith: "Comparison baseline (lastPeriod, lastYear)"
        }
      },
      responseType: "KPIMetricsData"
    },
    {
      name: "Growth Opportunities",
      endpoint: "/reports/growth-opportunities",
      method: "GET", 
      description: "AI-powered growth opportunity analysis",
      category: "reports",
      subcategory: "insights",
      responseType: "OpportunityData[]"
    },
    {
      name: "Risk Factors",
      endpoint: "/reports/risk-factors",
      method: "GET",
      description: "Identify business risks and mitigation strategies",
      category: "reports",
      subcategory: "insights",
      responseType: "RiskData[]"
    }
  ],

  // ===== SYSTEM SETTINGS =====
  settings: [
    {
      name: "Get System Settings",
      endpoint: "/settings",
      method: "GET",
      description: "Retrieve all system configuration settings",
      category: "settings",
      subcategory: "configuration",
      responseType: "SettingsData",
      example: {
        response: {
          success: true,
          data: {
            store: {
              name: "Usman Hardware",
              currency: "PKR",
              taxRate: 18,
              lowStockThreshold: 5
            },
            notifications: {
              lowStock: true,
              newOrder: true,
              paymentDue: false
            }
          }
        }
      }
    },
    {
      name: "Update Settings",
      endpoint: "/settings",
      method: "PUT", 
      description: "Update system configuration settings",
      category: "settings",
      subcategory: "configuration",
      parameters: {
        body: {
          store: "Store configuration object",
          notifications: "Notification preferences",
          system: "System-wide settings",
          profile: "User profile settings"
        }
      },
      responseType: "SettingsUpdateResponse"
    },
    {
      name: "Create Backup",
      endpoint: "/settings/backup",
      method: "POST",
      description: "Create system data backup",
      category: "settings",
      subcategory: "backup",
      parameters: {
        body: {
          includeFiles: "Include uploaded files (true/false)",
          compression: "Backup compression level"
        }
      },
      responseType: "BackupResponse"
    },
    {
      name: "Restore from Backup",
      endpoint: "/settings/restore",
      method: "POST", 
      description: "Restore system from backup file",
      category: "settings",
      subcategory: "backup",
      parameters: {
        body: {
          backupFile: "Backup file data",
          overwriteExisting: "Overwrite existing data (true/false)"
        }
      },
      responseType: "RestoreResponse"
    },
    {
      name: "Get Audit Log",
      endpoint: "/settings/audit-log",
      method: "GET",
      description: "Retrieve system audit and activity logs",
      category: "settings",
      subcategory: "audit",
      parameters: {
        query: {
          page: "Page number",
          limit: "Records per page",
          action: "Filter by action type",
          userId: "Filter by user",
          dateFrom: "Start date",
          dateTo: "End date"
        }
      },
      responseType: "AuditLogResponse"
    }
  ]
};

// Helper functions for API registry
export const getAllEndpoints = (): ApiEndpoint[] => {
  return Object.values(comprehensiveApiRegistry).flat();
};

export const getEndpointsByCategory = (category: string): ApiEndpoint[] => {
  return comprehensiveApiRegistry[category] || [];
};

export const searchEndpoints = (query: string): ApiEndpoint[] => {
  const allEndpoints = getAllEndpoints();
  const searchTerm = query.toLowerCase();
  
  return allEndpoints.filter(endpoint => 
    endpoint.name.toLowerCase().includes(searchTerm) ||
    endpoint.description.toLowerCase().includes(searchTerm) ||
    endpoint.endpoint.toLowerCase().includes(searchTerm) ||
    endpoint.category.toLowerCase().includes(searchTerm)
  );
};

export const getEndpointsBySubcategory = (category: string, subcategory: string): ApiEndpoint[] => {
  return getEndpointsByCategory(category).filter(endpoint => 
    endpoint.subcategory === subcategory
  );
};

// API execution helper
export const executeApiCall = async (endpoint: ApiEndpoint, parameters: any = {}): Promise<any> => {
  const baseUrl = apiConfig.getBaseUrl();
  let url = `${baseUrl}${endpoint.endpoint}`;
  
  // Replace path parameters
  if (parameters.path) {
    Object.entries(parameters.path).forEach(([key, value]) => {
      url = url.replace(`{${key}}`, String(value));
    });
  }
  
  // Add query parameters
  if (parameters.query && endpoint.method === 'GET') {
    const queryParams = new URLSearchParams();
    Object.entries(parameters.query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, String(value));
      }
    });
    if (queryParams.toString()) {
      url += `?${queryParams.toString()}`;
    }
  }
  
  // Prepare request options
  const options: RequestInit = {
    method: endpoint.method,
    headers: {
      'Content-Type': 'application/json',
    },
  };
  
  // Add body for POST/PUT requests
  if (parameters.body && ['POST', 'PUT'].includes(endpoint.method)) {
    options.body = JSON.stringify(parameters.body);
  }
  
  try {
    const response = await fetch(url, options);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API execution failed:', error);
    throw error;
  }
};