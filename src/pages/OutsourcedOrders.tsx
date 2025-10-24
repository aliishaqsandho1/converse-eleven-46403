import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Calendar, Eye, FileText, User, Truck, Package, ExternalLink } from "lucide-react";
import { formatQuantity } from "@/lib/utils";
import { toast } from "sonner";
import { API_CONFIG } from "@/config/api";
import { OrderDetailsModal } from "@/components/orders/OrderDetailsModal";
import { salesApi } from "@/services/api";

interface OutsourcingOrder {
  id: number;
  order_number: string;
  sale_id: number;
  sale_item_id: number | null;
  product_id: number;
  supplier_id: number;
  quantity: number;
  cost_per_unit: number;
  total_cost: number;
  notes: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  product_name: string;
  supplier_name: string;
  sale_status?: string; // Actual order status
}

interface GroupedOutsourcingOrder {
  sale_id: number;
  items: OutsourcingOrder[];
  total_cost: number;
  total_quantity: number;
  suppliers: string[];
  created_at: string;
  sale_status: string;
}

const OutsourcedOrders = () => {
  const [orders, setOrders] = useState<OutsourcingOrder[]>([]);
  const [groupedOrders, setGroupedOrders] = useState<GroupedOutsourcingOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<any>(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [loadingOrderDetails, setLoadingOrderDetails] = useState(false);

  const ordersPerPage = 10;

  useEffect(() => {
    fetchOutsourcedOrders();
  }, [currentPage]);

  const fetchOutsourcedOrders = async () => {
    try {
      setLoading(true);
      
      // Fetch from the dedicated outsourcing API
      const response = await fetch(`${API_CONFIG.BASE_URL}/outsourcing?page=${currentPage}&limit=${ordersPerPage}`);
      if (!response.ok) {
        throw new Error('Failed to fetch outsourcing orders');
      }
      
      const result = await response.json();
      
      if (result.success) {
        const ordersData = result.data.orders;
        setOrders(ordersData);
        
        // Group orders by sale_id
        const grouped = groupOrdersBySaleId(ordersData);
        setGroupedOrders(grouped);
        
        // Calculate total pages based on grouped orders
        const totalGroupedOrders = grouped.length;
        setTotalPages(Math.ceil(totalGroupedOrders / ordersPerPage));
      } else {
        throw new Error(result.message || 'Failed to fetch outsourcing orders');
      }
      
    } catch (error) {
      console.error('Error fetching outsourcing orders:', error);
      toast.error('Failed to fetch outsourcing orders');
    } finally {
      setLoading(false);
    }
  };

  const groupOrdersBySaleId = (orders: OutsourcingOrder[]): GroupedOutsourcingOrder[] => {
    const grouped = orders.reduce((acc, order) => {
      const key = String(order.sale_id);
      if (!acc[key]) {
        acc[key] = {
          sale_id: order.sale_id,
          items: [],
          total_cost: 0,
          total_quantity: 0,
          suppliers: [],
          created_at: order.created_at,
          sale_status: 'completed'
        };
      }
      
      acc[key].items.push(order);
      acc[key].total_cost += order.total_cost;
      acc[key].total_quantity += order.quantity;
      
      // Add unique suppliers
      if (!acc[key].suppliers.includes(order.supplier_name)) {
        acc[key].suppliers.push(order.supplier_name);
      }

      // Keep earliest created_at for the group
      if (new Date(order.created_at).getTime() < new Date(acc[key].created_at).getTime()) {
        acc[key].created_at = order.created_at;
      }
      
      return acc;
    }, {} as Record<string, GroupedOutsourcingOrder>);

    return Object.values(grouped).sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-100 text-green-700 border-green-200">Completed</Badge>;
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">Pending</Badge>;
      case "cancelled":
        return <Badge className="bg-red-100 text-red-700 border-red-200">Cancelled</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-700 border-gray-200">{status}</Badge>;
    }
  };

  const getPaymentMethodBadge = (method: string) => {
    switch (method) {
      case "cash":
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Cash</Badge>;
      case "credit":
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Credit</Badge>;
      case "card":
        return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">Card</Badge>;
      default:
        return <Badge variant="outline">{method}</Badge>;
    }
  };

  const handleViewOrder = async (groupedOrder: GroupedOutsourcingOrder) => {
    try {
      setLoadingOrderDetails(true);
      
      // Fetch complete order details using sale_id
      const response = await salesApi.getById(groupedOrder.sale_id);
      if (response.success) {
        setSelectedOrderDetails(response.data);
        setShowOrderModal(true);
      } else {
        throw new Error(response.message || 'Failed to fetch order details');
      }
    } catch (error) {
      console.error('Error fetching order details:', error);
      toast.error('Failed to load order details');
    } finally {
      setLoadingOrderDetails(false);
    }
  };

  const updateOrderStatus = async (orderId: number, status: string, notes?: string) => {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/outsourcing/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status, notes }),
      });

      if (!response.ok) {
        throw new Error('Failed to update order status');
      }

      const result = await response.json();
      if (result.success) {
        toast.success('Order status updated successfully');
        fetchOutsourcedOrders(); // Refresh the list
        setShowOrderModal(false);
      } else {
        throw new Error(result.message || 'Failed to update status');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Failed to update order status');
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading Outsourced Sales...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Outsourced Sales</h1>
          <p className="text-muted-foreground">Orders containing products sourced from external suppliers</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Truck className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium">Total Orders</span>
            </div>
            <p className="text-2xl font-bold mt-2">{groupedOrders.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium">Outsourced Items</span>
            </div>
            <p className="text-2xl font-bold mt-2">
              {orders.length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <ExternalLink className="h-4 w-4 text-orange-600" />
              <span className="text-sm font-medium">Total Cost</span>
            </div>
            <p className="text-2xl font-bold mt-2">
              Rs. {orders.reduce((total, order) => total + order.total_cost, 0).toLocaleString()}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium">Unique Suppliers</span>
            </div>
            <p className="text-2xl font-bold mt-2 text-purple-600">
              {[...new Set(orders.map(order => order.supplier_name))].length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>Outsourced Sales</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order #</TableHead>
                  <TableHead>Outsourced Items</TableHead>
                  <TableHead>Suppliers</TableHead>
                  <TableHead>Total Quantity</TableHead>
                  <TableHead>Total Cost</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {groupedOrders.slice((currentPage - 1) * ordersPerPage, currentPage * ordersPerPage).map((groupedOrder) => {
                  return (
                    <TableRow key={groupedOrder.sale_id}>
                      <TableCell className="font-medium">Sale #{groupedOrder.sale_id}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {groupedOrder.items.slice(0, 2).map((item, index) => (
                            <div key={index} className="flex items-center gap-2 text-sm">
                              <Package className="h-3 w-3 text-slate-400" />
                              {item.product_name} ({formatQuantity(item.quantity)})
                            </div>
                          ))}
                          {groupedOrder.items.length > 2 && (
                            <div className="text-xs text-muted-foreground">
                              +{groupedOrder.items.length - 2} more items
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {groupedOrder.suppliers.slice(0, 2).map((supplier, index) => (
                            <div key={index} className="flex items-center gap-2 text-sm">
                              <Truck className="h-3 w-3 text-slate-400" />
                              {supplier}
                            </div>
                          ))}
                          {groupedOrder.suppliers.length > 2 && (
                            <div className="text-xs text-muted-foreground">
                              +{groupedOrder.suppliers.length - 2} more suppliers
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{formatQuantity(groupedOrder.total_quantity)}</TableCell>
                      <TableCell className="font-medium">Rs. {groupedOrder.total_cost.toLocaleString()}</TableCell>
                      <TableCell>{getStatusBadge(groupedOrder.sale_status)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-slate-400" />
                          {new Date(groupedOrder.created_at).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-blue-300 text-blue-700 hover:bg-blue-50"
                            onClick={() => handleViewOrder(groupedOrder)}
                            disabled={loadingOrderDetails}
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            {loadingOrderDetails ? 'Loading...' : 'View Order'}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {groupedOrders.length === 0 && (
            <div className="text-center py-8 text-slate-500">
              No outsourcing orders found.
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                  
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = i + 1;
                    return (
                      <PaginationItem key={pageNum}>
                        <PaginationLink
                          onClick={() => setCurrentPage(pageNum)}
                          isActive={currentPage === pageNum}
                          className="cursor-pointer"
                        >
                          {pageNum}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  })}
                  
                  <PaginationItem>
                    <PaginationNext 
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Order Details Modal */}
      <OrderDetailsModal
        open={showOrderModal}
        onOpenChange={setShowOrderModal}
        order={selectedOrderDetails}
        onOrderUpdated={() => {
          fetchOutsourcedOrders();
          setShowOrderModal(false);
        }}
      />
    </div>
  );
};

export default OutsourcedOrders;