
// Centralized data for Usman Hardware store - Furniture Hardware Specialist

// Product Units - Comprehensive list for furniture hardware store
export type ProductUnit = "piece" | "pair" | "set" | "pack" | "box" | "dozen" | "meter" | "cm" | "mm" | "inch" | "feet" | "kg" | "gram" | "liter" | "ml" | "sq_ft" | "sq_meter" | "roll" | "sheet" | "bundle" | "coil" | "tube" | "bottle" | "can" | "gallon" | "pound";

// Customer Types
export type CustomerType = "manufacturer" | "retailer" | "special" | "regular" | "walk-in";

// Product interface
export interface Product {
  id: number;
  name: string;
  sku: string;
  price: number;
  stock: number;
  category: string;
  unit: ProductUnit;
  minStock: number;
  sales: number;
}

// Customer interface
export interface Customer {
  id: number;
  name: string;
  phone: string;
  address: string;
  dueAmount: number;
  type?: CustomerType;
}

// Supplier interface
export interface Supplier {
  id: number;
  name: string;
  contact: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  totalPurchases: number;
  pendingPayments: number;
  lastOrderDate: string;
  status: "active" | "inactive";
  products: number[]; // Product IDs they supply
}

// Purchase Order interface
export interface PurchaseOrder {
  id: string;
  supplierId: number;
  supplierName: string;
  items: Array<{
    productId: number;
    productName: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
  totalAmount: number;
  orderDate: string;
  expectedDelivery: string;
  status: "pending" | "delivered" | "cancelled";
  paymentStatus: "pending" | "paid" | "partial";
  notes: string;
}

// Sales Receipt interface
export interface SalesReceipt {
  id: string;
  customerId?: number;
  customerName: string;
  items: Array<{
    productId: number;
    productName: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
  totalAmount: number;
  paymentMethod: "cash" | "credit";
  date: string;
  time: string;
  cashier: string;
  invoiceNumber: string;
  taxAmount: number;
  discountAmount: number;
  notes?: string;
}

// Dashboard Stats interface
export interface DashboardStats {
  totalSales: number;
  cashSales: number;
  creditSales: number;
  customersDue: number;
  lowStockItems: number;
  totalCustomers: number;
  totalProducts: number;
}

// Sales Data interface for charts
export interface SalesData {
  name: string;
  cash: number;
  credit: number;
}

// Category Data interface for charts
export interface CategoryData {
  name: string;
  value: number;
  color: string;
}

// Monthly Trend interface
export interface MonthlyTrend {
  month: string;
  sales: number;
}

// Recent Sales interface
export interface RecentSale {
  id: string;
  customer: string;
  amount: number;
  type: "cash" | "credit";
  time: string;
}

// Low Stock Item interface
export interface LowStockItem {
  name: string;
  current: number;
  minimum: number;
  id: number;
}

// Customer Types for dropdown
export const customerTypes = [
  { value: "manufacturer", label: "Manufacturer" },
  { value: "retailer", label: "Retailer" },
  { value: "special", label: "Special Customer" },
  { value: "regular", label: "Regular Customer" },
  { value: "walk-in", label: "Walk-in Customer" }
];

// Product Categories - Furniture Hardware Focus
export const categories = [
  { value: "all", label: "All Categories" },
  { value: "hinges", label: "Hinges & Joints" },
  { value: "handles", label: "Handles & Knobs" },
  { value: "locks", label: "Locks & Security" },
  { value: "fasteners", label: "Screws & Fasteners" },
  { value: "slides", label: "Drawer Slides & Rails" },
  { value: "polishes", label: "Wood Polish & Finishes" },
  { value: "adhesives", label: "Glues & Adhesives" },
  { value: "brackets", label: "Brackets & Supports" },
];

// Units for products - Comprehensive for furniture hardware store
export const units = [
  // Count-based units
  { value: "piece", label: "Piece" },
  { value: "pair", label: "Pair" },
  { value: "set", label: "Set" },
  { value: "pack", label: "Pack" },
  { value: "box", label: "Box" },
  { value: "dozen", label: "Dozen (12 pieces)" },
  
  // Length units
  { value: "meter", label: "Meter" },
  { value: "cm", label: "Centimeter" },
  { value: "mm", label: "Millimeter" },
  { value: "inch", label: "Inch" },
  { value: "feet", label: "Feet" },
  
  // Weight units
  { value: "kg", label: "Kilogram" },
  { value: "gram", label: "Gram" },
  { value: "pound", label: "Pound" },
  
  // Volume/Liquid units
  { value: "liter", label: "Liter" },
  { value: "ml", label: "Milliliter" },
  { value: "gallon", label: "Gallon" },
  { value: "bottle", label: "Bottle" },
  { value: "can", label: "Can" },
  
  // Area units
  { value: "sq_ft", label: "Square Feet" },
  { value: "sq_meter", label: "Square Meter" },
  { value: "sheet", label: "Sheet" },
  
  // Material units
  { value: "roll", label: "Roll" },
  { value: "bundle", label: "Bundle" },
  { value: "coil", label: "Coil" },
  { value: "tube", label: "Tube" },
];

// Payment Methods
export const paymentMethods = [
  { value: "cash", label: "Cash Payment" },
  { value: "credit", label: "Credit Sale" },
  { value: "pending", label: "Send to Pending Orders" }
];

// Products data - Furniture Hardware Focus
export const products: Product[] = [
  // Hinges & Joints
  { id: 1, name: "Piano Hinges - 1.5m", sku: "PH001", price: 850, stock: 15, category: "hinges", unit: "piece", minStock: 5, sales: 45 },
  { id: 2, name: "Cabinet Door Hinges - Soft Close", sku: "CDH002", price: 320, stock: 28, category: "hinges", unit: "piece", minStock: 10, sales: 38 },
  { id: 3, name: "Heavy Duty Hinges - 4 inch", sku: "HDH003", price: 450, stock: 12, category: "hinges", unit: "piece", minStock: 8, sales: 22 },
  { id: 4, name: "Concealed Hinges - 35mm", sku: "CH004", price: 180, stock: 40, category: "hinges", unit: "piece", minStock: 15, sales: 28 },
  
  // Handles & Knobs
  { id: 5, name: "Cabinet Handles - Stainless Steel", sku: "CHS005", price: 250, stock: 35, category: "handles", unit: "piece", minStock: 12, sales: 15 },
  { id: 6, name: "Wooden Knobs - Teak Finish", sku: "WKT006", price: 120, stock: 60, category: "handles", unit: "piece", minStock: 20, sales: 31 },
  { id: 7, name: "Modern Pull Handles - Black", sku: "MPH007", price: 380, stock: 25, category: "handles", unit: "piece", minStock: 8, sales: 19 },
  { id: 8, name: "Antique Brass Knobs", sku: "ABK008", price: 280, stock: 18, category: "handles", unit: "piece", minStock: 6, sales: 14 },
  
  // Locks & Security
  { id: 9, name: "Cabinet Locks - Cam Lock", sku: "CLC009", price: 150, stock: 30, category: "locks", unit: "piece", minStock: 10, sales: 25 },
  { id: 10, name: "Drawer Locks - Push Button", sku: "DLP010", price: 200, stock: 22, category: "locks", unit: "piece", minStock: 8, sales: 18 },
  { id: 11, name: "Furniture Safety Locks", sku: "FSL011", price: 80, stock: 45, category: "locks", unit: "piece", minStock: 15, sales: 32 },
  
  // Screws & Fasteners
  { id: 12, name: "Wood Screws - 2 inch", sku: "WS012", price: 120, stock: 150, category: "fasteners", unit: "box", minStock: 20, sales: 67 },
  { id: 13, name: "Furniture Bolts - M6", sku: "FB013", price: 8, stock: 500, category: "fasteners", unit: "piece", minStock: 100, sales: 120 },
  { id: 14, name: "Wood Dowels - 8mm", sku: "WD014", price: 5, stock: 800, category: "fasteners", unit: "piece", minStock: 150, sales: 95 },
  { id: 15, name: "Furniture Nails - 1.5 inch", sku: "FN015", price: 3, stock: 1000, category: "fasteners", unit: "piece", minStock: 200, sales: 180 },
  
  // Drawer Slides & Rails
  { id: 16, name: "Soft Close Drawer Slides - 18 inch", sku: "SCD016", price: 950, stock: 12, category: "slides", unit: "pair", minStock: 5, sales: 22 },
  { id: 17, name: "Ball Bearing Slides - 20 inch", sku: "BBS017", price: 650, stock: 20, category: "slides", unit: "pair", minStock: 8, sales: 16 },
  { id: 18, name: "Side Mount Slides - 16 inch", sku: "SMS018", price: 450, stock: 25, category: "slides", unit: "pair", minStock: 10, sales: 12 },
  
  // Wood Polish & Finishes
  { id: 19, name: "Teak Wood Polish", sku: "TWP019", price: 380, stock: 25, category: "polishes", unit: "liter", minStock: 10, sales: 17 },
  { id: 20, name: "Furniture Varnish - Clear", sku: "FVC020", price: 420, stock: 18, category: "polishes", unit: "liter", minStock: 8, sales: 12 },
  { id: 21, name: "Wood Stain - Walnut", sku: "WSW021", price: 350, stock: 22, category: "polishes", unit: "liter", minStock: 5, sales: 8 },
  { id: 22, name: "Furniture Wax Polish", sku: "FWP022", price: 280, stock: 30, category: "polishes", unit: "kg", minStock: 10, sales: 25 },
  
  // Glues & Adhesives
  { id: 23, name: "Wood Glue - PVA", sku: "WGP023", price: 180, stock: 35, category: "adhesives", unit: "kg", minStock: 12, sales: 28 },
  { id: 24, name: "Contact Cement", sku: "CC024", price: 320, stock: 20, category: "adhesives", unit: "kg", minStock: 8, sales: 15 },
  { id: 25, name: "Epoxy Adhesive", sku: "EA025", price: 450, stock: 15, category: "adhesives", unit: "kg", minStock: 6, sales: 10 },
  
  // Brackets & Supports
  { id: 26, name: "Shelf Support Brackets", sku: "SSB026", price: 120, stock: 50, category: "brackets", unit: "piece", minStock: 20, sales: 35 },
  { id: 27, name: "Corner Braces - L Shape", sku: "CBL027", price: 80, stock: 80, category: "brackets", unit: "piece", minStock: 25, sales: 45 },
  { id: 28, name: "Table Leg Brackets", sku: "TLB028", price: 200, stock: 30, category: "brackets", unit: "piece", minStock: 12, sales: 20 },
];

// Customers data
export const customers: Customer[] = [
  { id: 1, name: "Furniture Master Hafizabad", phone: "0300-1234567", address: "Sagar Road, Hafizabad", dueAmount: 3240, type: "manufacturer" },
  { id: 2, name: "Ali Furniture Works", phone: "0321-9876543", address: "Gujranwala Road, Hafizabad", dueAmount: 2890, type: "retailer" },
  { id: 3, name: "Modern Furniture House", phone: "0333-5555555", address: "College Road, Hafizabad", dueAmount: 0, type: "special" },
  { id: 4, name: "Royal Cabinet Makers", phone: "0345-1111111", address: "Kolo Road, Hafizabad", dueAmount: 5600, type: "manufacturer" },
  { id: 5, name: "Khan Furniture Center", phone: "0311-2222222", address: "Vanike Tarar, Hafizabad", dueAmount: 1200, type: "regular" },
  { id: 6, name: "Elite Wood Works", phone: "0333-3333333", address: "Main Bazaar, Hafizabad", dueAmount: 0, type: "retailer" },
  { id: 7, name: "Classic Furniture", phone: "0302-4444444", address: "GT Road, Hafizabad", dueAmount: 4500, type: "special" },
  { id: 8, name: "Wooden Dreams", phone: "0315-5555555", address: "Railway Road, Hafizabad", dueAmount: 890, type: "regular" },
];

// Suppliers data
export const suppliers: Supplier[] = [
  {
    id: 1,
    name: "Lahore Furniture Hardware",
    contact: "Muhammad Tariq",
    phone: "042-35123456",
    email: "tariq@lfhardware.pk",
    address: "Industrial Area, Kot Lakhpat",
    city: "Lahore",
    totalPurchases: 650000,
    pendingPayments: 35000,
    lastOrderDate: "2024-01-20",
    status: "active",
    products: [1, 2, 3, 4, 5, 6, 7, 8]
  },
  {
    id: 2,
    name: "Gujranwala Hardware Depot",
    contact: "Ahmed Hassan",
    phone: "055-3234567",
    email: "ahmed@ghd.pk",
    address: "GT Road, Satellite Town",
    city: "Gujranwala",
    totalPurchases: 420000,
    pendingPayments: 0,
    lastOrderDate: "2024-01-15",
    status: "active",
    products: [9, 10, 11, 12, 13, 14, 15, 16, 17, 18]
  },
  {
    id: 3,
    name: "Karachi Polish Industries",
    contact: "Fatima Sheikh",
    phone: "021-32567890",
    email: "fatima@kpi.pk",
    address: "SITE Area, Karachi",
    city: "Karachi",
    totalPurchases: 280000,
    pendingPayments: 25000,
    lastOrderDate: "2024-01-18",
    status: "active",
    products: [19, 20, 21, 22, 23, 24, 25]
  },
  {
    id: 4,
    name: "Sialkot Metal Works",
    contact: "Malik Usman",
    phone: "052-4567890",
    email: "usman@smw.pk",
    address: "Paris Road, Sialkot",
    city: "Sialkot",
    totalPurchases: 195000,
    pendingPayments: 18000,
    lastOrderDate: "2024-01-10",
    status: "active",
    products: [26, 27, 28]
  }
];

// Purchase Orders data
export const purchaseOrders: PurchaseOrder[] = [
  {
    id: "PO-2024-001",
    supplierId: 1,
    supplierName: "Lahore Furniture Hardware",
    items: [
      { productId: 1, productName: "Piano Hinges - 1.5m", quantity: 50, unitPrice: 800, total: 40000 },
      { productId: 5, productName: "Cabinet Handles - Stainless Steel", quantity: 100, unitPrice: 230, total: 23000 }
    ],
    totalAmount: 63000,
    orderDate: "2024-01-20",
    expectedDelivery: "2024-01-25",
    status: "delivered",
    paymentStatus: "paid",
    notes: "Regular monthly order for hinges and handles"
  },
  {
    id: "PO-2024-002",
    supplierId: 2,
    supplierName: "Gujranwala Hardware Depot",
    items: [
      { productId: 12, productName: "Wood Screws - 2 inch", quantity: 200, unitPrice: 110, total: 22000 },
      { productId: 16, productName: "Soft Close Drawer Slides - 18 inch", quantity: 50, unitPrice: 900, total: 45000 }
    ],
    totalAmount: 67000,
    orderDate: "2024-01-15",
    expectedDelivery: "2024-01-22",
    status: "pending",
    paymentStatus: "pending",
    notes: "Urgent order for low stock items"
  }
];

// Pending Orders data - New addition for pending orders functionality
export let pendingOrders: any[] = [
  {
    id: "PEND-001",
    customer: "Walk-in Customer - Ahmed",
    items: [
      { productId: 1, productName: "Piano Hinges - 1.5m", quantity: 2, unitPrice: 850, total: 1700 },
      { productId: 5, productName: "Cabinet Handles - Stainless Steel", quantity: 10, unitPrice: 250, total: 2500 }
    ],
    totalAmount: 4200,
    orderDate: "2024-01-22",
    status: "pending",
    notes: "Customer will collect tomorrow"
  },
  {
    id: "PEND-002", 
    customer: "Royal Cabinet Makers",
    items: [
      { productId: 16, productName: "Soft Close Drawer Slides - 18 inch", quantity: 5, unitPrice: 950, total: 4750 }
    ],
    totalAmount: 4750,
    orderDate: "2024-01-21",
    status: "pending", 
    notes: "Waiting for payment confirmation"
  }
];

// Function to add pending order
export const addPendingOrder = (order: any) => {
  pendingOrders.push(order);
};

// Function to get pending orders
export const getPendingOrders = () => {
  return pendingOrders;
};

// Function to remove pending order
export const removePendingOrder = (orderId: string) => {
  pendingOrders = pendingOrders.filter(order => order.id !== orderId);
};

// Sales Receipts data - More detailed with authentication elements
export const salesReceipts: SalesReceipt[] = [
  {
    id: "RCP-2024-001",
    customerId: 1,
    customerName: "Furniture Master Hafizabad",
    items: [
      { productId: 1, productName: "Piano Hinges - 1.5m", quantity: 4, unitPrice: 850, total: 3400 },
      { productId: 5, productName: "Cabinet Handles - Stainless Steel", quantity: 20, unitPrice: 250, total: 5000 },
      { productId: 12, productName: "Wood Screws - 2 inch", quantity: 2, unitPrice: 120, total: 240 }
    ],
    totalAmount: 8640,
    paymentMethod: "credit",
    date: "2024-01-22",
    time: "10:30 AM",
    cashier: "Muhammad Usman",
    invoiceNumber: "INV-001-2024",
    taxAmount: 864,
    discountAmount: 0,
    notes: "Bulk order for cabinet project"
  },
  {
    id: "RCP-2024-002",
    customerName: "Walk-in Customer - Imran Ali",
    items: [
      { productId: 19, productName: "Teak Wood Polish", quantity: 2, unitPrice: 380, total: 760 },
      { productId: 6, productName: "Wooden Knobs - Teak Finish", quantity: 8, unitPrice: 120, total: 960 }
    ],
    totalAmount: 1720,
    paymentMethod: "cash",
    date: "2024-01-22",
    time: "11:45 AM",
    cashier: "Muhammad Usman",
    invoiceNumber: "INV-002-2024",
    taxAmount: 172,
    discountAmount: 50,
    notes: "Furniture restoration supplies"
  },
  {
    id: "RCP-2024-003",
    customerId: 4,
    customerName: "Royal Cabinet Makers",
    items: [
      { productId: 16, productName: "Soft Close Drawer Slides - 18 inch", quantity: 10, unitPrice: 950, total: 9500 },
      { productId: 2, productName: "Cabinet Door Hinges - Soft Close", quantity: 30, unitPrice: 320, total: 9600 },
      { productId: 9, productName: "Cabinet Locks - Cam Lock", quantity: 15, unitPrice: 150, total: 2250 }
    ],
    totalAmount: 21350,
    paymentMethod: "credit",
    date: "2024-01-21",
    time: "2:15 PM",
    cashier: "Muhammad Usman",
    invoiceNumber: "INV-003-2024",
    taxAmount: 2135,
    discountAmount: 500,
    notes: "Premium cabinet hardware order"
  },
  {
    id: "RCP-2024-004",
    customerId: 2,
    customerName: "Ali Furniture Works",
    items: [
      { productId: 23, productName: "Wood Glue - PVA", quantity: 5, unitPrice: 180, total: 900 },
      { productId: 26, productName: "Shelf Support Brackets", quantity: 20, unitPrice: 120, total: 2400 },
      { productId: 13, productName: "Furniture Bolts - M6", quantity: 100, unitPrice: 8, total: 800 }
    ],
    totalAmount: 4100,
    paymentMethod: "cash",
    date: "2024-01-21",
    time: "4:30 PM",
    cashier: "Muhammad Usman",
    invoiceNumber: "INV-004-2024",
    taxAmount: 410,
    discountAmount: 100,
    notes: "Shelving project supplies"
  },
  {
    id: "RCP-2024-005",
    customerId: 7,
    customerName: "Classic Furniture",
    items: [
      { productId: 20, productName: "Furniture Varnish - Clear", quantity: 3, unitPrice: 420, total: 1260 },
      { productId: 21, productName: "Wood Stain - Walnut", quantity: 2, unitPrice: 350, total: 700 },
      { productId: 7, productName: "Modern Pull Handles - Black", quantity: 12, unitPrice: 380, total: 4560 }
    ],
    totalAmount: 6520,
    paymentMethod: "credit",
    date: "2024-01-20",
    time: "9:45 AM",
    cashier: "Muhammad Usman",
    invoiceNumber: "INV-005-2024",
    taxAmount: 652,
    discountAmount: 200,
    notes: "Finishing materials for dining set"
  },
  {
    id: "RCP-2024-006",
    customerName: "Walk-in Customer - Asad Ahmed",
    items: [
      { productId: 11, productName: "Furniture Safety Locks", quantity: 6, unitPrice: 80, total: 480 },
      { productId: 14, productName: "Wood Dowels - 8mm", quantity: 50, unitPrice: 5, total: 250 }
    ],
    totalAmount: 730,
    paymentMethod: "cash",
    date: "2024-01-20",
    time: "3:20 PM",
    cashier: "Muhammad Usman",
    invoiceNumber: "INV-006-2024",
    taxAmount: 73,
    discountAmount: 0,
    notes: "Safety locks for children's furniture"
  }
];

// Dashboard Statistics
export const dashboardStats: DashboardStats = {
  totalSales: 25420,
  cashSales: 12950,
  creditSales: 12470,
  customersDue: 18320,
  lowStockItems: 6,
  totalCustomers: 98,
  totalProducts: 876
};

// Sales Data for charts
export const salesData: SalesData[] = [
  { name: "Mon", cash: 6400, credit: 4200 },
  { name: "Tue", cash: 5200, credit: 3800 },
  { name: "Wed", cash: 4800, credit: 6200 },
  { name: "Thu", cash: 5600, credit: 4900 },
  { name: "Fri", cash: 7200, credit: 5800 },
  { name: "Sat", cash: 8900, credit: 6400 },
  { name: "Sun", cash: 4200, credit: 3200 },
];

// Category Data for pie chart - Furniture Hardware Focus
export const categoryData: CategoryData[] = [
  { name: "Hinges", value: 32, color: "#1e3a8a" },
  { name: "Handles", value: 24, color: "#1e40af" },
  { name: "Fasteners", value: 18, color: "#3b82f6" },
  { name: "Slides", value: 12, color: "#60a5fa" },
  { name: "Polishes", value: 8, color: "#93c5fd" },
  { name: "Locks", value: 6, color: "#dbeafe" },
];

// Monthly Trend Data
export const monthlyTrend: MonthlyTrend[] = [
  { month: "Aug", sales: 65000 },
  { month: "Sep", sales: 72000 },
  { month: "Oct", sales: 68000 },
  { month: "Nov", sales: 81000 },
  { month: "Dec", sales: 78000 },
  { month: "Jan", sales: 87000 },
];

// Recent Sales Data
export const recentSales: RecentSale[] = [
  { id: "001", customer: "Furniture Master Hafizabad", amount: 3240, type: "credit", time: "10:30 AM" },
  { id: "002", customer: "Walk-in Customer", amount: 850, type: "cash", time: "11:15 AM" },
  { id: "003", customer: "Royal Cabinet Makers", amount: 2890, type: "credit", time: "12:45 PM" },
  { id: "004", customer: "Ali Furniture Works", amount: 1230, type: "cash", time: "1:20 PM" },
  { id: "005", customer: "Modern Furniture House", amount: 4560, type: "credit", time: "2:45 PM" },
];

// Low Stock Items Data
export const lowStockItems: LowStockItem[] = [
  { name: "Piano Hinges - 1.5m", current: 15, minimum: 25, id: 1 },
  { name: "Soft Close Drawer Slides - 18 inch", current: 12, minimum: 20, id: 16 },
  { name: "Cabinet Door Hinges - Soft Close", current: 28, minimum: 40, id: 2 },
  { name: "Heavy Duty Hinges - 4 inch", current: 12, minimum: 25, id: 3 },
  { name: "Modern Pull Handles - Black", current: 25, minimum: 35, id: 7 },
  { name: "Antique Brass Knobs", current: 18, minimum: 30, id: 8 },
];
