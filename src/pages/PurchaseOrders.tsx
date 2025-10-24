import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { FileText, Search, Plus, Calendar, Truck, DollarSign, User, Package, CheckCircle, Clock, XCircle, Loader2, Eye, Edit, Trash2, Send, PackageCheck, Info, ChevronDown, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { purchaseOrdersApi, suppliersApi, productsApi } from "@/services/api";
import { newFinanceApi } from "@/services/newFinanceApi";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from "@/components/ui/pagination";
import { SinglePurchaseOrderForm } from "@/components/purchase-orders/SinglePurchaseOrderForm";
import { ExpandedPurchaseOrderRow } from "@/components/purchase-orders/ExpandedPurchaseOrderRow";
import { apiConfig } from "@/utils/apiConfig";

const PurchaseOrders = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [statusUpdateOrder, setStatusUpdateOrder] = useState<any>(null);
  const [newStatus, setNewStatus] = useState("");
  const [statusNotes, setStatusNotes] = useState("");
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const itemsPerPage = 20;

  // Fetch purchase orders with updated parameters
  const { data: ordersData, isLoading: ordersLoading } = useQuery({
    queryKey: ['purchase-orders', currentPage, filterStatus, searchTerm],
    queryFn: () => purchaseOrdersApi.getAll({
      page: currentPage,
      limit: itemsPerPage,
      status: filterStatus === 'all' ? undefined : filterStatus,
      search: searchTerm || undefined,
    }),
  });

  // Create purchase order mutation
  const createOrderMutation = useMutation({
    mutationFn: purchaseOrdersApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
      setIsCreateDialogOpen(false);
      toast({
        title: "Purchase Order Created",
        description: "The purchase order has been created successfully",
      });
    },
    onError: (error: any) => {
      console.error('Create error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create purchase order",
        variant: "destructive",
      });
    },
  });

  // Update status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status, notes }: { id: number, status: string, notes?: string }) => {
      // If status is "received", use the receive endpoint
      if (status === "received") {
        const order = orders.find((o: any) => o.id === id);
        if (!order || !order.items) {
          throw new Error("Order or order items not found");
        }
        
        // Use the receive API with proper format
        const receiveData = {
          items: order.items.map((item: any) => ({
            productId: item.productId,
            quantityReceived: item.quantity,
            condition: "good"
          })),
          notes: notes || "All items received in good condition"
        };
        
        return await purchaseOrdersApi.receive(id, receiveData);
      } else {
        // For other status updates, use the regular updateStatus method
        return await purchaseOrdersApi.updateStatus(id, status, notes);
      }
    },
    onSuccess: async (response, variables) => {
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
      queryClient.invalidateQueries({ queryKey: ['inventory'] }); // Refresh inventory data
      
      // Add cash flow entry for received purchase order (debit/outflow)
      if (variables.status === "received") {
        try {
          const order = orders.find((o: any) => o.id === variables.id);
          if (order && order.total) {
            // Find Bank account for debit
            let accountId: number | undefined;
            const accountsResponse = await newFinanceApi.getAccounts({ type: 'bank', active: true });
            const bankAccount = accountsResponse.data?.find((acc: any) => 
              acc.account_type?.toLowerCase() === 'bank' || acc.account_name?.toLowerCase().includes('bank')
            );
            accountId = bankAccount ? parseInt(bankAccount.id) : undefined;

            await newFinanceApi.createFinanceCashFlow({
              type: 'outflow',
              amount: parseFloat(order.total),
              date: new Date().toISOString().split('T')[0],
              account_id: accountId,
              reference: order.orderNumber || `PO-${order.id}`,
              description: `Purchase order received - ${order.supplierName} - Stock purchase`
            });
          }
        } catch (cashFlowError) {
          console.error('Failed to create cash flow entry for purchase order:', cashFlowError);
          // Don't break the purchase flow if cash flow fails
        }
      }
      
      setStatusUpdateOrder(null);
      setNewStatus("");
      setStatusNotes("");
      setIsStatusDialogOpen(false);
      toast({
        title: "Status Updated",
        description: newStatus === "received" 
          ? "Purchase order marked as received, inventory updated, and cash flow recorded successfully"
          : "Purchase order status has been updated successfully",
      });
    },
    onError: (error: any) => {
      console.error('Status update error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update purchase order status",
        variant: "destructive",
      });
    },
  });

  // Delete order mutation
  const deleteOrderMutation = useMutation({
    mutationFn: purchaseOrdersApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
      toast({
        title: "Purchase Order Deleted",
        description: "The purchase order has been deleted successfully",
      });
    },
    onError: (error: any) => {
      console.error('Delete error:', error);
      // Handle specific error for non-draft orders
      if (error.message && (error.message.includes('400') || error.message.includes('draft'))) {
        toast({
          title: "Cannot Delete Order",
          description: "Only draft purchase orders can be deleted",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: error.message || "Failed to delete purchase order",
          variant: "destructive",
        });
      }
    },
  });

  // Fixed data extraction to match API response structure
  const orders = ordersData?.data?.purchaseOrders || ordersData?.purchaseOrders || [];
  const pagination = ordersData?.data?.pagination || ordersData?.pagination;

  // Filter orders by search term (additional client-side filtering)
  const filteredOrders = orders.filter((order: any) =>
    order.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.supplierName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft": return "bg-muted text-muted-foreground border-border";
      case "sent": return "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800";
      case "confirmed": return "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-800";
      case "received": return "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800";
      case "cancelled": return "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800";
      default: return "bg-muted text-muted-foreground border-border";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "draft": return <Clock className="h-4 w-4" />;
      case "sent": return <Send className="h-4 w-4" />;
      case "confirmed": return <CheckCircle className="h-4 w-4" />;
      case "received": return <PackageCheck className="h-4 w-4" />;
      case "cancelled": return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getAvailableStatusTransitions = (currentStatus: string) => {
    switch (currentStatus) {
      case "draft":
        return [
          { value: "sent", label: "Send to Supplier" },
          { value: "confirmed", label: "Mark as Confirmed" },
          { value: "received", label: "Mark as Received" },
          { value: "cancelled", label: "Cancel Order" }
        ];
      case "sent":
        return [
          { value: "sent", label: "Send to Supplier" },
          { value: "confirmed", label: "Mark as Confirmed" },
          { value: "received", label: "Mark as Received" },
          { value: "cancelled", label: "Cancel Order" }
        ];
      case "confirmed":
        return [
          { value: "sent", label: "Send to Supplier" },
          { value: "confirmed", label: "Mark as Confirmed" },
          { value: "received", label: "Mark as Received" },
          { value: "cancelled", label: "Cancel Order" }
        ];
      default:
        return [];
    }
  };

  const handleCreateOrder = (formData: any) => {
    console.log('Creating order with data:', formData);
    createOrderMutation.mutate(formData);
  };

  const handleStatusUpdate = () => {
    if (!statusUpdateOrder || !newStatus) return;
    
    console.log('Updating status:', { id: statusUpdateOrder.id, status: newStatus, notes: statusNotes });
    updateStatusMutation.mutate({
      id: statusUpdateOrder.id,
      status: newStatus,
      notes: statusNotes
    });
  };

  const handleViewOrder = (order: any) => {
    console.log('Viewing order:', order);
    setSelectedOrder(order);
    setIsViewDialogOpen(true);
  };

  const handleEditStatus = (order: any) => {
    setStatusUpdateOrder(order);
    setNewStatus("");
    setStatusNotes("");
    setIsStatusDialogOpen(true);
  };

  // Calculate stats from current data
  const statsData = {
    total: orders.length,
    draft: orders.filter((o: any) => o.status === "draft").length,
    confirmed: orders.filter((o: any) => o.status === "confirmed").length,
    received: orders.filter((o: any) => o.status === "received").length,
    totalValue: orders.reduce((sum: number, order: any) => sum + (order.total || 0), 0)
  };

  if (ordersLoading) {
    return (
      <div className="flex-1 p-6 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1 p-3 space-y-3 h-[calc(100vh-90px)] ">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">

          <div>
            <h1 className="text-3xl font-bold text-foreground">Stock Purchase</h1>
            <p className="text-muted-foreground">Manage stock purchases and supplier transactions</p>
          </div>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <Plus className="h-4 w-4 mr-2" />
              New Purchase Order
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-7xl max-h-[95vh] overflow-hidden p-0">
            <SinglePurchaseOrderForm 
              onSubmit={handleCreateOrder} 
              onClose={() => setIsCreateDialogOpen(false)}
              isLoading={createOrderMutation.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Total Orders</p>
                <p className="text-xl font-bold text-foreground">{statsData.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-200 dark:border-blue-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <div>
                <p className="text-sm text-muted-foreground">Draft</p>
                <p className="text-xl font-bold text-blue-600 dark:text-blue-400">{statsData.draft}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-yellow-200 dark:border-yellow-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              <div>
                <p className="text-sm text-muted-foreground">Confirmed</p>
                <p className="text-xl font-bold text-yellow-600 dark:text-yellow-400">{statsData.confirmed}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200 dark:border-green-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-green-600 dark:text-green-400" />
              <div>
                <p className="text-sm text-muted-foreground">Received</p>
                <p className="text-xl font-bold text-green-600 dark:text-green-400">{statsData.received}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Total Value</p>
                <p className="text-xl font-bold text-foreground">Rs. {statsData.totalValue.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search by order ID or supplier..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterStatus} onValueChange={(value) => {
          setFilterStatus(value);
          setCurrentPage(1);
        }}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="sent">Sent</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="received">Received</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Orders Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order Number</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Expected Delivery</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Total Amount</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order: any) => (
                <React.Fragment key={order.id}>
                  <TableRow 
                    className="cursor-pointer hover:bg-muted/50 transition-colors duration-200 group"
                    onClick={() => setExpandedRow(expandedRow === order.id ? null : order.id)}
                  >
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {expandedRow === order.id ? (
                          <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform duration-200" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform duration-200" />
                        )}
                        {order.orderNumber}
                      </div>
                    </TableCell>
                    <TableCell>{order.supplierName}</TableCell>
                    <TableCell>{new Date(order.date).toLocaleDateString()}</TableCell>
                    <TableCell>
                      {order.expectedDelivery ? new Date(order.expectedDelivery).toLocaleDateString() : 'Not set'}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Package className="h-4 w-4 text-muted-foreground" />
                        {order.items?.length || 0} items
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(order.status)}>
                        {getStatusIcon(order.status)}
                        <span className="ml-1 capitalize">{order.status}</span>
                      </Badge>
                    </TableCell>
                    <TableCell>Rs. {order.total?.toLocaleString()}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {order.status === "draft" && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="text-red-600"
                                disabled={deleteOrderMutation.isPending}
                                onClick={(e) => e.stopPropagation()}
                              >
                                {deleteOrderMutation.isPending ? (
                                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                ) : (
                                  <Trash2 className="h-3 w-3 mr-1" />
                                )}
                                Delete
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Purchase Order</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete this purchase order? This action cannot be undone.
                                  Only draft orders can be deleted.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => deleteOrderMutation.mutate(order.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                  disabled={deleteOrderMutation.isPending}
                                >
                                  {deleteOrderMutation.isPending ? (
                                    <>
                                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                      Deleting...
                                    </>
                                  ) : (
                                    "Delete"
                                  )}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                  
                  {/* Expandable Row Content */}
                  {expandedRow === order.id && (
                    <TableRow className="bg-muted/20 hover:bg-muted/20">
                      <TableCell colSpan={8} className="p-0">
                        <div className="animate-accordion-down overflow-hidden">
                          <ExpandedPurchaseOrderRow 
                            order={order} 
                            onOrderUpdated={() => {
                              queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
                            }}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious 
                href="#"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
              <PaginationItem key={page}>
                <PaginationLink
                  href="#"
                  onClick={() => setCurrentPage(page)}
                  isActive={currentPage === page}
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext 
                href="#"
                onClick={() => setCurrentPage(Math.min(pagination.totalPages, currentPage + 1))}
                className={currentPage === pagination.totalPages ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

      {filteredOrders.length === 0 && !ordersLoading && (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-100 mb-2">No purchase orders found</h3>
          <p className="text-gray-500">Try adjusting your search criteria or create a new purchase order.</p>
        </div>
      )}

      {/* Status Update Dialog */}
      <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Order Status</DialogTitle>
          </DialogHeader>
          {statusUpdateOrder && (
            <div className="space-y-4">
              <div>
                <Label>Order: {statusUpdateOrder.orderNumber}</Label>
                <p className="text-sm text-gray-200">Current Status: {statusUpdateOrder.status}</p>
              </div>
              <div>
                <Label htmlFor="newStatus">New Status</Label>
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select new status" />
                  </SelectTrigger>
                  <SelectContent>
                    {getAvailableStatusTransitions(statusUpdateOrder.status).map((transition) => (
                      <SelectItem key={transition.value} value={transition.value}>
                        {transition.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="statusNotes">Notes (Optional)</Label>
                <Textarea
                  id="statusNotes"
                  value={statusNotes}
                  onChange={(e) => setStatusNotes(e.target.value)}
                  placeholder="Add any notes about this status change..."
                />
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={handleStatusUpdate}
                  disabled={!newStatus || updateStatusMutation.isPending}
                >
                  {updateStatusMutation.isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : null}
                  Update Status
                </Button>
                <Button variant="outline" onClick={() => setIsStatusDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Order Details Modal */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Purchase Order Details</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Order Number</Label>
                  <p className="font-medium">{selectedOrder.orderNumber}</p>
                </div>
                <div>
                  <Label>Supplier</Label>
                  <p className="font-medium">{selectedOrder.supplierName}</p>
                </div>
                <div>
                  <Label>Date</Label>
                  <p>{new Date(selectedOrder.date).toLocaleDateString()}</p>
                </div>
                <div>
                  <Label>Expected Delivery</Label>
                  <p>
                    {selectedOrder.expectedDelivery 
                      ? new Date(selectedOrder.expectedDelivery).toLocaleDateString() 
                      : 'Not set'
                    }
                  </p>
                </div>
                <div>
                  <Label>Status</Label>
                  <Badge className={getStatusColor(selectedOrder.status)}>
                    {getStatusIcon(selectedOrder.status)}
                    <span className="ml-1 capitalize">{selectedOrder.status}</span>
                  </Badge>
                </div>
                <div>
                  <Label>Total Amount</Label>
                  <p className="font-bold text-lg">Rs. {selectedOrder.total?.toLocaleString()}</p>
                </div>
              </div>

              {selectedOrder.items && selectedOrder.items.length > 0 && (
                <div>
                  <Label>Items</Label>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Unit Price</TableHead>
                        <TableHead>Total</TableHead>
                        {selectedOrder.status === 'received' && (
                          <>
                            <TableHead>Received</TableHead>
                            <TableHead>Condition</TableHead>
                          </>
                        )}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedOrder.items.map((item: any, index: number) => (
                        <TableRow key={index}>
                          <TableCell>{item.productName}</TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell>Rs. {item.unitPrice?.toLocaleString()}</TableCell>
                          <TableCell>Rs. {item.total?.toLocaleString()}</TableCell>
                          {selectedOrder.status === 'received' && (
                            <>
                              <TableCell>{item.quantityReceived || 0}</TableCell>
                              <TableCell>
                                <Badge variant={item.itemCondition === 'good' ? 'default' : 'destructive'}>
                                  {item.itemCondition || 'good'}
                                </Badge>
                              </TableCell>
                            </>
                          )}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}

              {selectedOrder.notes && (
                <div>
                  <Label>Notes</Label>
                  <p className="text-sm text-gray-200 whitespace-pre-wrap">{selectedOrder.notes}</p>
                </div>
              )}

              {selectedOrder.createdBy && (
                <div>
                  <Label>Created By</Label>
                  <p className="text-sm text-gray-200">{selectedOrder.createdBy}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PurchaseOrders;
