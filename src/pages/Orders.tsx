import { useState, useEffect, useMemo, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { salesApi, customersApi } from "@/services/api";
import { PDFExportModal, ExportOptions } from "@/components/orders/PDFExportModal";
import { OrdersHeader } from "@/components/orders/OrdersHeader";
import { OrdersSummaryCards } from "@/components/orders/OrdersSummaryCards";
import { OrdersFilters } from "@/components/orders/OrdersFilters";
import { OrdersTable } from "@/components/orders/OrdersTable";
import { useOrderPDFGenerator } from "@/components/orders/OrdersPDFGenerator";
import { generateOrdersReportPDF } from "@/utils/ordersReportPdfGenerator";

interface Sale {
  id: number;
  orderNumber: string;
  customerId: number | null;
  customerName: string | null;
  date: string;
  time: string;
  items: Array<{
    productId: number;
    productName: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paymentMethod: string;
  status: string;
  createdBy: string;
  createdAt: string;
}

const Orders = () => {
  const { toast } = useToast();
  const { generateOrderPDF } = useOrderPDFGenerator();
  const [orders, setOrders] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [exportLoading, setExportLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterCustomer, setFilterCustomer] = useState("");
  const [filterPaymentMethod, setFilterPaymentMethod] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [summary, setSummary] = useState({
    totalSales: 0,
    totalOrders: 0,
    avgOrderValue: 0
  });
  
  const [isPDFExportModalOpen, setIsPDFExportModalOpen] = useState(false);

  // Items per page for server-side pagination
  const ITEMS_PER_PAGE = 20;
  // Cache full dataset for current filters during search to avoid repeated network calls
  const allSalesCacheRef = useRef<Sale[]>([]);
  const cacheKeyRef = useRef<string>("");

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      const len = searchTerm.trim().length;
      if (len === 0 || len >= 2) {
        setDebouncedSearchTerm(searchTerm);
        setCurrentPage(1); // Reset to page 1 when search changes
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    fetchOrders();
  }, [filterStatus, filterCustomer, dateFrom, dateTo, currentPage, debouncedSearchTerm, filterPaymentMethod]);

  const fetchOrders = async () => {
    const term = debouncedSearchTerm.trim();
    const isSearching = term.length >= 2;
    const currentKey = `${filterStatus}|${filterPaymentMethod}|${dateFrom}|${dateTo}|${filterCustomer || ''}|${isSearching ? term.toLowerCase() : ''}`;

    const shouldFetchFromNetwork = !isSearching || (cacheKeyRef.current !== currentKey || allSalesCacheRef.current.length === 0);

    try {
      if (shouldFetchFromNetwork) {
        setLoading(true);
      }

      // Build base filters
      const baseParams: any = {};
      if (filterStatus !== "all") baseParams.status = filterStatus;
      if (filterCustomer) baseParams.customerId = parseInt(filterCustomer);
      if (dateFrom) baseParams.dateFrom = dateFrom;
      if (dateTo) baseParams.dateTo = dateTo;
      if (filterPaymentMethod !== "all") baseParams.paymentMethod = filterPaymentMethod;

      // When not searching, use server pagination directly
      if (!isSearching) {
        const response = await salesApi.getAll({ ...baseParams, limit: ITEMS_PER_PAGE, page: currentPage });
        if (response.success) {
          const sales = response.data.sales || [];
          setOrders(sales);
          setTotalPages(response.data.pagination?.totalPages || 1);
          setSummary(response.data.summary || { totalSales: 0, totalOrders: 0, avgOrderValue: 0 });
          // Reset search cache for new filter scope
          allSalesCacheRef.current = [];
          cacheKeyRef.current = currentKey;
        }
        return;
      }

      // Searching: fetch orders by matching customers (server-side) and cache results
      if (shouldFetchFromNetwork) {
        // 1) Find matching customers by name
        let matchedCustomerIds: number[] = [];
        try {
          // Try server-side customer search
          const custRes = await customersApi.getAll({ search: term, limit: 1000, page: 1 });
          let customers = custRes?.data?.customers || custRes?.data || [];

          // If API doesn't support search, fetch all and filter locally
          if (!customers?.length) {
            const firstAll = await customersApi.getAll({ limit: 1000, page: 1 });
            customers = firstAll?.data?.customers || firstAll?.data || [];
            const totalPages = firstAll?.data?.pagination?.totalPages || 1;
            if (totalPages > 1) {
              const morePromises: Promise<any>[] = [];
              for (let p = 2; p <= totalPages; p++) {
                morePromises.push(customersApi.getAll({ limit: 1000, page: p }));
              }
              const more = await Promise.all(morePromises);
              more.forEach(res => {
                const items = res?.data?.customers || res?.data || [];
                if (items?.length) customers.push(...items);
              });
            }
            const lower = term.toLowerCase();
            customers = customers.filter((c: any) => (c?.name || '').toLowerCase().includes(lower));
          }

          matchedCustomerIds = (customers || [])
            .filter((c: any) => c?.id)
            .map((c: any) => Number(c.id));
        } catch (e) {
          matchedCustomerIds = [];
        }

        // Helper to fetch all pages for a single customer (up to a safe cap)
        const fetchAllForCustomer = async (customerId: number) => {
          const first = await salesApi.getAll({ ...baseParams, customerId, limit: 1000, page: 1 });
          const list = (first?.data?.sales || first?.data || []) as Sale[];
          const totalPages = first?.data?.pagination?.totalPages || 1;
          if (totalPages <= 1) return list;

          const morePromises: Promise<any>[] = [];
          for (let p = 2; p <= totalPages; p++) {
            morePromises.push(salesApi.getAll({ ...baseParams, customerId, limit: 1000, page: p }));
          }
          const more = await Promise.all(morePromises);
          more.forEach(res => {
            const items = res?.data?.sales || res?.data || [];
            if (items?.length) list.push(...items);
          });
          return list;
        };

        if (matchedCustomerIds.length > 0) {
          // Fetch all sales for all matched customers in parallel
          const results = await Promise.all(
            matchedCustomerIds.map((id) => fetchAllForCustomer(id))
          );
          const aggregated: Sale[] = results.flat().sort((a, b) => {
            // Sort by createdAt desc (fallback to date if needed)
            const aTime = new Date(a.createdAt || a.date).getTime();
            const bTime = new Date(b.createdAt || b.date).getTime();
            return bTime - aTime;
          });

          allSalesCacheRef.current = aggregated;
          cacheKeyRef.current = currentKey;
        } else {
          // Fallback: pull a larger page and filter client-side
          const response = await salesApi.getAll({ ...baseParams, limit: 10000, page: 1 });
          allSalesCacheRef.current = response?.data?.sales || response?.data || [];
          cacheKeyRef.current = currentKey;
        }
      }

      // Client-side filter and paginate from cache
      const searchLower = term.toLowerCase();
      const filteredSales = (allSalesCacheRef.current || []).filter((sale: Sale) =>
        (sale.orderNumber?.toLowerCase().includes(searchLower)) ||
        (sale.customerName?.toLowerCase().includes(searchLower)) ||
        (sale.createdBy?.toLowerCase().includes(searchLower)) ||
        (sale.paymentMethod?.toLowerCase().includes(searchLower))
      );

      // Relevance scoring: prioritize exact and prefix matches on customer name, then order number, then recency
      const score = (s: Sale) => {
        const name = (s.customerName || '').toLowerCase();
        const order = (s.orderNumber || '').toLowerCase();
        let sc = 0;
        if (name === searchLower) sc += 1000;
        if (name.startsWith(searchLower)) sc += 800;
        if (name.includes(searchLower)) sc += 500;
        if (order.startsWith(searchLower)) sc += 300;
        if (order.includes(searchLower)) sc += 150;
        // slight recency boost
        const recency = new Date(s.createdAt || s.date).getTime() / 1e10; // small factor
        sc += recency;
        return sc;
      };

      const sortedByRelevance = filteredSales.sort((a, b) => {
        const diff = score(b) - score(a);
        if (diff !== 0) return diff;
        // tie-breaker by newest first
        const aTime = new Date(a.createdAt || a.date).getTime();
        const bTime = new Date(b.createdAt || b.date).getTime();
        return bTime - aTime;
      });

      const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
      const endIndex = startIndex + ITEMS_PER_PAGE;
      const paginatedSales = sortedByRelevance.slice(startIndex, endIndex);

      setOrders(paginatedSales);
      setTotalPages(Math.max(1, Math.ceil(sortedByRelevance.length / ITEMS_PER_PAGE)));
      const totalSales = sortedByRelevance.reduce((sum, s) => sum + s.total, 0);
      setSummary({ totalSales, totalOrders: sortedByRelevance.length, avgOrderValue: sortedByRelevance.length ? totalSales / sortedByRelevance.length : 0 });
    } catch (error) {
      console.error('Error fetching orders:', error);
      const errorMessage = error instanceof Error ? error.message : "Failed to load orders data";
      toast({ title: "Error", description: errorMessage, variant: "destructive" });
    } finally {
      if (shouldFetchFromNetwork) setLoading(false);
    }
  };

  const handleOrderPDF = async (order: Sale) => {
    await generateOrderPDF(order);
  };


  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleAdvancedPDFExport = async (options: ExportOptions) => {
    try {
      setExportLoading(true);
      setIsPDFExportModalOpen(false);
      
      // Build query parameters based on options
      const params: any = { 
        limit: 10000,
        page: 1
      };

      // Add customer filtering
      if (options.customerScope === 'single' && options.selectedCustomers.length === 1) {
        params.customerId = options.selectedCustomers[0];
      } else if (options.customerScope === 'multiple' && options.selectedCustomers.length > 0) {
        params.customerIds = options.selectedCustomers.join(',');
      }

      // Add time filtering
      const now = new Date();
      let filterText = 'Filters Applied: ';
      
      if (options.customerScope === 'single') {
        filterText += 'Single Customer | ';
      } else if (options.customerScope === 'multiple') {
        filterText += `${options.selectedCustomers.length} Selected Customers | `;
      } else {
        filterText += 'All Customers | ';
      }
      
      switch (options.timeScope) {
        case 'today':
          params.dateFrom = now.toISOString().split('T')[0];
          params.dateTo = now.toISOString().split('T')[0];
          filterText += 'Today Only';
          break;
        case 'weekly':
          const weekStart = new Date(now);
          weekStart.setDate(now.getDate() - now.getDay());
          params.dateFrom = weekStart.toISOString().split('T')[0];
          params.dateTo = new Date().toISOString().split('T')[0];
          filterText += 'This Week';
          break;
        case 'monthly':
          const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
          params.dateFrom = monthStart.toISOString().split('T')[0];
          params.dateTo = new Date().toISOString().split('T')[0];
          filterText += 'This Month';
          break;
        case 'custom':
          if (options.startDate) params.dateFrom = options.startDate;
          if (options.endDate) params.dateTo = options.endDate;
          filterText += `${options.startDate} to ${options.endDate}`;
          break;
        default:
          filterText += 'All Time Period';
      }

      // Fetch filtered orders
      const response = await salesApi.getAll(params);
      
      if (response.success) {
        const filteredOrders = response.data.sales || response.data || [];
        
        // Calculate summary data
        const totalSales = filteredOrders.reduce((sum: number, order: Sale) => sum + (order.subtotal - order.discount), 0);
        const totalItems = filteredOrders.reduce((sum: number, order: Sale) => sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0);
        const avgOrderValue = filteredOrders.length > 0 ? totalSales / filteredOrders.length : 0;

        // Build report payload and generate PDF
        const reportData = {
          title: 'ORDERS EXPORT REPORT',
          orders: filteredOrders,
          exportDate: new Date().toLocaleString(),
          totalOrders: filteredOrders.length,
          totalSales: totalSales,
          totalItems: totalItems,
          avgOrderValue: avgOrderValue,
          filters: filterText
        };
        const filename = await generateOrdersReportPDF(reportData);

        toast({
          title: "PDF Export Successful",
          description: `Exported ${filteredOrders.length} orders to PDF.`,
        });
      }
    } catch (error) {
      console.error('Failed to export orders to PDF:', error);
      const errorMessage = error instanceof Error ? error.message : "Failed to export orders data to PDF. Please try again.";
      toast({
        title: "PDF Export Failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setExportLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 p-4 md:p-6 space-y-6 min-h-screen bg-slate-50">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-gray-500">Loading orders...</div>
        </div>
      </div>
    );
  }

  // Get unique customers for the export modal
  const uniqueCustomers = orders.reduce((acc: Array<{id: number, name: string}>, order) => {
    if (order.customerId && !acc.find(c => c.id === order.customerId)) {
      acc.push({
        id: order.customerId,
        name: order.customerName || `Customer #${order.customerId}`
      });
    }
    return acc;
  }, []);

  return (
    <div className="flex-1 p-2 md:p-6 space-y-3 min-h-[calc(100vh-65px)]">
      <OrdersHeader 
        onPDFExport={() => setIsPDFExportModalOpen(true)}
        exportLoading={exportLoading}
      />

      <OrdersSummaryCards summary={summary} />

      <Card className="border-slate-200">
        <CardContent>
          <OrdersFilters
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            filterStatus={filterStatus}
            setFilterStatus={setFilterStatus}
            filterPaymentMethod={filterPaymentMethod}
            setFilterPaymentMethod={setFilterPaymentMethod}
            dateFrom={dateFrom}
            setDateFrom={setDateFrom}
            dateTo={dateTo}
            setDateTo={setDateTo}
            filterCustomer={filterCustomer}
            setFilterCustomer={setFilterCustomer}
          />

          <OrdersTable
            orders={orders}
            currentPage={currentPage}
            totalPages={totalPages}
            onOrderPDF={handleOrderPDF}
            onPageChange={handlePageChange}
            onOrderUpdated={fetchOrders}
          />
        </CardContent>
      </Card>

      {/* PDF Export Modal */}
      <PDFExportModal
        open={isPDFExportModalOpen}
        onOpenChange={setIsPDFExportModalOpen}
        onExport={handleAdvancedPDFExport}
        customers={uniqueCustomers}
        isLoading={exportLoading}
      />
    </div>
  );
};

export default Orders;
