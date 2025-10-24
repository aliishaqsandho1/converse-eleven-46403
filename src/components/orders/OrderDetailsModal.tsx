import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { User, Package, Calendar, DollarSign, RotateCcw, AlertTriangle, Minus, Plus, ArrowLeft, Edit2, Save, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { salesApi, customersApi, outsourcingApi } from "@/services/api";
import { useCustomerBalance } from "@/hooks/useCustomerBalance";
import { useStockManagement } from "@/hooks/useStockManagement";
import { apiConfig } from "@/utils/apiConfig";
import { formatQuantity } from "@/lib/utils";

interface OrderDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: any;
  onOrderUpdated?: () => void;
}

export const OrderDetailsModal = ({ open, onOpenChange, order, onOrderUpdated }: OrderDetailsModalProps) => {
  const { toast } = useToast();
  const { updateBalanceForOrderStatusChange } = useCustomerBalance();
  const { handleOrderStatusChange } = useStockManagement();
  const [showAdjustmentForm, setShowAdjustmentForm] = useState(false);
  const [adjustmentItems, setAdjustmentItems] = useState<any[]>([]);
  const [adjustmentNotes, setAdjustmentNotes] = useState("");
  const [adjustmentLoading, setAdjustmentLoading] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [outsourcedItems, setOutsourcedItems] = useState<any[]>([]);
  
  // Edit mode states
  const [editMode, setEditMode] = useState<'status' | 'payment' | 'customer' | null>(null);
  const [editValues, setEditValues] = useState({
    status: order?.status || '',
    paymentMethod: order?.paymentMethod || '',
    customerId: order?.customerId || null,
    customerName: order?.customerName || ''
  });
  const [customers, setCustomers] = useState<any[]>([]);
  const [customerSearch, setCustomerSearch] = useState('');
  const [editLoading, setEditLoading] = useState(false);

  // FIXED: Move useEffect before early return to follow Rules of Hooks
  useEffect(() => {
    if (order) {
      console.log('Order data in modal:', order);
      console.log('Order items:', order.items);
      
      // Log each item's quantity for debugging
      if (order.items && Array.isArray(order.items)) {
        order.items.forEach((item: any, index: number) => {
          console.log(`Item ${index}:`, {
            productName: item.productName,
            quantity: item.quantity,
            quantityType: typeof item.quantity,
            unitPrice: item.unitPrice,
            total: item.total
          });
        });
      }
      
      setEditValues({
        status: order.status || '',
        paymentMethod: order.paymentMethod || '',
        customerId: order.customerId || null,
        customerName: order.customerName || ''
      });
      
      // Fetch outsourcing data for this order
      fetchOutsourcingData();
    }
  }, [order]);

  const fetchOutsourcingData = async () => {
    if (!order?.id) return;
    
    try {
      // Get all outsourcing orders and filter by sale_id client-side
      const response = await outsourcingApi.getAll({ 
        limit: 1000
      });
      
      if (response.success && response.data.orders) {
        // Filter by sale_id on client side
        const orderOutsourcedItems = response.data.orders.filter(
          (outsourcedItem: any) => outsourcedItem.sale_id === order.id
        );
        setOutsourcedItems(orderOutsourcedItems);
      }
    } catch (error) {
      console.error('Failed to fetch outsourcing data:', error);
    }
  };

  const isItemOutsourced = (item: any, itemIndex: number) => {
    // Check if this item has any outsourcing orders
    return outsourcedItems.some(outsourcedItem => 
      outsourcedItem.product_id === item.productId
    );
  };

  if (!order) return null;

  // Check if order is cancelled - prevent editing
  const isOrderCancelled = order.status === 'cancelled';

  // Fetch customers when customer edit mode is activated
  const fetchCustomers = async () => {
    try {
      const response = await customersApi.getAll({ limit: 100 });
      if (response.success) {
        setCustomers(response.data.customers || response.data);
      }
    } catch (error) {
      console.error('Failed to fetch customers:', error);
    }
  };

  const handleEditStart = (field: 'status' | 'payment' | 'customer') => {
    // Prevent editing if order is cancelled
    if (isOrderCancelled) {
      toast({
        title: "Cannot Edit Cancelled Order",
        description: "Cancelled orders cannot be modified",
        variant: "destructive"
      });
      return;
    }

    setEditMode(field);
    setEditValues({
      status: order.status,
      paymentMethod: order.paymentMethod,
      customerId: order.customerId,
      customerName: order.customerName
    });
    
    if (field === 'customer') {
      fetchCustomers();
    }
  };

  const handleEditCancel = () => {
    setEditMode(null);
    setEditValues({
      status: order.status,
      paymentMethod: order.paymentMethod,
      customerId: order.customerId,
      customerName: order.customerName
    });
    setCustomerSearch('');
  };

  const handleStatusChange = (newStatus: string) => {
    if (newStatus === 'cancelled') {
      setEditValues(prev => ({ ...prev, status: newStatus }));
      setShowCancelConfirm(true);
    } else {
      setEditValues(prev => ({ ...prev, status: newStatus }));
    }
  };

  const handleConfirmCancel = () => {
    setShowCancelConfirm(false);
    handleEditSave();
  };

  const handleEditSave = async () => {
    try {
      setEditLoading(true);
      
      console.log('Attempting to save edit mode:', editMode);
      console.log('Edit values:', editValues);
      console.log('Order ID:', order.id);
      
      if (editMode === 'status') {
        console.log('Updating status from', order.status, 'to:', editValues.status);
        
        // Handle stock adjustments for status changes
        if (editValues.status !== order.status) {
          console.log('Processing stock adjustment for status change');
          
          // Handle stock management first
          const stockResult = await handleOrderStatusChange(
            order.id,
            order.orderNumber,
            order.items || [],
            editValues.status,
            order.status
          );
          
          if (!stockResult.success) {
            toast({
              title: "Stock Update Failed",
              description: stockResult.message,
              variant: "destructive"
            });
            return;
          }
          
          // Handle customer balance updates
          if (order.customerId) {
            try {
              await updateBalanceForOrderStatusChange(
                order.id,
                order.customerId,
                order.orderNumber,
                order.total,
                editValues.status,
                order.status
              );
            } catch (error) {
              console.error('Balance update failed:', error);
              // Continue with status update even if balance update fails
            }
          }
        }
        
        // Update the order status via API
        const response = await salesApi.updateStatus(order.id, { status: editValues.status });
        console.log('Status update response:', response);
        
        if (response.success) {
          toast({
            title: "Status Updated",
            description: editValues.status === 'cancelled' 
              ? "Order has been cancelled successfully" 
              : "Order status updated successfully",
          });
        } else {
          throw new Error(response.message || 'Failed to update status');
        }
      } else if (editMode === 'payment') {
        console.log('Updating payment method from', order.paymentMethod, 'to:', editValues.paymentMethod);
        
        // Use the existing details endpoint for payment method updates
        const response = await fetch(`${apiConfig.getBaseUrl()}/sales/${order.id}/details`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            paymentMethod: editValues.paymentMethod 
          })
        });
        
        const result = await response.json();
        console.log('Payment method update response:', result);
        
        if (result.success) {
          toast({
            title: "Payment Method Updated",
            description: "Payment method updated successfully",
          });
        } else {
          throw new Error(result.message || 'Failed to update payment method');
        }
      } else if (editMode === 'customer') {
        const updateData = { customerId: editValues.customerId };
        console.log('Updating customer to:', editValues.customerId);
        
        const response = await fetch(`${apiConfig.getBaseUrl()}/sales/${order.id}/details`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updateData)
        });
        
        const result = await response.json();
        console.log('Update response:', result);
        
        if (result.success) {
          toast({
            title: "Customer Updated",
            description: "Customer has been updated successfully",
          });
        } else {
          throw new Error(result.message || 'Update failed');
        }
      }
      
      setEditMode(null);
      onOrderUpdated?.();
      
    } catch (error) {
      console.error('Failed to update order:', error);
      const errorMessage = error instanceof Error ? error.message : `Failed to update ${editMode}. Please try again.`;
      toast({
        title: "Update Failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setEditLoading(false);
    }
  };

  // Fixed customer selection handler
  const handleCustomerSelect = (customer: any) => {
    setEditValues(prev => ({ 
      ...prev, 
      customerId: customer ? customer.id : null, 
      customerName: customer ? customer.name : 'Walk-in Customer' 
    }));
    setCustomerSearch('');
  };

  const filteredCustomers = customers.filter(customer =>
    customer.name?.toLowerCase().includes(customerSearch.toLowerCase()) ||
    customer.phone?.toLowerCase().includes(customerSearch.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-100 text-green-700 border-green-200">Completed</Badge>;
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">Pending</Badge>;
      case "cancelled":
        return <Badge className="bg-red-100 text-red-700 border-red-200">Cancelled</Badge>;
      case "credit":
        return <Badge className="bg-blue-100 text-blue-700 border-blue-200">Credit</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-700 border-gray-200">{status}</Badge>;
    }
  };

  const initializeAdjustmentForm = () => {
    setAdjustmentItems(order.items.map(item => ({
      productId: item.productId,
      productName: item.productName,
      originalQuantity: item.quantity,
      returnQuantity: 0,
      unitPrice: item.unitPrice,
      reason: ""
    })));
    setShowAdjustmentForm(true);
  };

  const updateReturnQuantity = (index: number, quantity: number) => {
    const updatedItems = [...adjustmentItems];
    updatedItems[index].returnQuantity = Math.max(0, Math.min(quantity, updatedItems[index].originalQuantity));
    setAdjustmentItems(updatedItems);
  };

  const updateReturnReason = (index: number, reason: string) => {
    const updatedItems = [...adjustmentItems];
    updatedItems[index].reason = reason;
    setAdjustmentItems(updatedItems);
  };

  const handleOrderAdjustment = async () => {
    try {
      setAdjustmentLoading(true);
      
      const itemsToReturn = adjustmentItems.filter(item => item.returnQuantity > 0);
      
      if (itemsToReturn.length === 0) {
        toast({
          title: "No Items to Return",
          description: "Please specify quantities to return",
          variant: "destructive"
        });
        return;
      }

      const refundAmount = itemsToReturn.reduce((sum, item) => sum + (item.returnQuantity * item.unitPrice), 0);

      const adjustmentData = {
        type: "return",
        items: itemsToReturn.map(item => ({
          productId: item.productId,
          quantity: item.returnQuantity,
          reason: item.reason || "customer_request"
        })),
        adjustmentReason: adjustmentNotes || "Order adjustment - items returned after completion",
        refundAmount: refundAmount,
        restockItems: true
      };

      console.log('Sending adjustment data:', adjustmentData);

      const response = await salesApi.adjustOrder(order.id, adjustmentData);
      
      if (response.success) {
        toast({
          title: "Order Adjusted Successfully",
          description: "Items have been returned and inventory updated",
        });
        setShowAdjustmentForm(false);
        setAdjustmentItems([]);
        setAdjustmentNotes("");
        onOrderUpdated?.();
        onOpenChange(false);
      } else {
        throw new Error(response.message || 'Failed to adjust order');
      }
    } catch (error) {
      console.error('Failed to adjust order:', error);
      toast({
        title: "Adjustment Failed",
        description: `Error: ${error.message || 'Unknown error occurred'}`,
        variant: "destructive"
      });
    } finally {
      setAdjustmentLoading(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-5xl max-h-[95vh] overflow-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-blue-600" />
              Order Details - {order.orderNumber}
              {isOrderCancelled && (
                <Badge className="bg-red-100 text-red-700 border-red-200 ml-2">
                  Read Only - Cancelled
                </Badge>
              )}
            </DialogTitle>
          </DialogHeader>

          {!showAdjustmentForm ? (
            <div className="space-y-6">
              {/* Show warning if order is cancelled */}
              {isOrderCancelled && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                    <h4 className="font-medium text-red-800">Order Cancelled</h4>
                  </div>
                  <p className="text-sm text-red-700 mt-1">
                    This order has been cancelled and cannot be modified.
                  </p>
                </div>
              )}

              {/* Order Header */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Customer Information
                      {editMode !== 'customer' && !isOrderCancelled && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditStart('customer')}
                          className="h-6 w-6 p-0 ml-auto"
                        >
                          <Edit2 className="h-3 w-3" />
                        </Button>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {editMode === 'customer' ? (
                      <div className="space-y-3">
                        <div>
                          <Label className="text-sm">Search Customer</Label>
                          <Input
                            placeholder="Search by name or phone..."
                            value={customerSearch}
                            onChange={(e) => setCustomerSearch(e.target.value)}
                            className="mt-1"
                          />
                        </div>
                        <div className="max-h-32 overflow-y-auto space-y-1">
                          <div
                            className="p-2 border rounded cursor-pointer hover:bg-gray-50 transition-colors"
                            onClick={() => handleCustomerSelect(null)}
                          >
                            <p className="font-medium">Walk-in Customer</p>
                            <p className="text-sm text-gray-600">No customer account</p>
                          </div>
                          {filteredCustomers.map((customer) => (
                            <div
                              key={customer.id}
                              className={`p-2 border rounded cursor-pointer hover:bg-blue-50 transition-colors ${
                                editValues.customerId === customer.id ? 'bg-blue-100 border-blue-300' : ''
                              }`}
                              onClick={() => handleCustomerSelect(customer)}
                            >
                              <p className="font-medium">{customer.name}</p>
                              <p className="text-sm text-gray-600">{customer.phone}</p>
                            </div>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" onClick={handleEditSave} disabled={editLoading}>
                            <Save className="h-3 w-3 mr-1" />
                            {editLoading ? 'Saving...' : 'Save'}
                          </Button>
                          <Button size="sm" variant="outline" onClick={handleEditCancel}>
                            <X className="h-3 w-3 mr-1" />
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <p><strong>Name:</strong> {order.customerName || 'Walk-in Customer'}</p>
                        <p><strong>Customer ID:</strong> {order.customerId || 'N/A'}</p>
                      </>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Order Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p><strong>Date:</strong> {new Date(order.date).toLocaleDateString()}</p>
                    <p><strong>Time:</strong> {order.time}</p>
                    
                    {/* Status with edit capability */}
                    <div className="flex items-center gap-2">
                      <strong>Status:</strong>
                      {editMode === 'status' ? (
                        <div className="flex items-center gap-2">
                          <Select value={editValues.status} onValueChange={handleStatusChange}>
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="completed">Completed</SelectItem>
                              <SelectItem value="cancelled">Cancelled</SelectItem>
                              <SelectItem value="credit">Credit</SelectItem>
                            </SelectContent>
                          </Select>
                          {editValues.status !== 'cancelled' && (
                            <>
                              <Button size="sm" onClick={handleEditSave} disabled={editLoading}>
                                <Save className="h-3 w-3" />
                              </Button>
                              <Button size="sm" variant="outline" onClick={handleEditCancel}>
                                <X className="h-3 w-3" />
                              </Button>
                            </>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          {getStatusBadge(order.status)}
                          {!isOrderCancelled && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditStart('status')}
                              className="h-6 w-6 p-0"
                            >
                              <Edit2 className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Payment Method with edit capability */}
                    <div className="flex items-center gap-2">
                      <strong>Payment:</strong>
                      {editMode === 'payment' ? (
                        <div className="flex items-center gap-2">
                          <Select value={editValues.paymentMethod} onValueChange={(value) => setEditValues(prev => ({ ...prev, paymentMethod: value }))}>
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="cash">Cash</SelectItem>
                              <SelectItem value="credit">Credit</SelectItem>
                              <SelectItem value="card">Card</SelectItem>
                              <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button size="sm" onClick={handleEditSave} disabled={editLoading}>
                            <Save className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={handleEditCancel}>
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="capitalize">{order.paymentMethod}</span>
                          {!isOrderCancelled && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditStart('payment')}
                              className="h-6 w-6 p-0"
                            >
                              <Edit2 className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Order Items - FIXED TABLE */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    Order Items
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Unit Price</TableHead>
                        <TableHead>Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {order.items && order.items.length > 0 ? (
                        order.items.map((item: any, index: number) => {
                          console.log(`Rendering item ${index}:`, item);
                          const formattedQuantity = formatQuantity(item.quantity);
                          const itemOutsourced = isItemOutsourced(item, index);
                          console.log(`Formatted quantity for ${item.productName}:`, formattedQuantity);
                          
                          return (
                            <TableRow 
                              key={index} 
                              className={itemOutsourced ? "bg-orange-50 border-orange-200" : ""}
                            >
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  {itemOutsourced && (
                                    <Badge className="bg-orange-100 text-orange-700 border-orange-200 text-xs">
                                      Outsourced
                                    </Badge>
                                  )}
                                  <span>{item.productName || 'Unknown Product'}</span>
                                </div>
                              </TableCell>
                              <TableCell className="font-medium text-blue-600">{formattedQuantity}</TableCell>
                              <TableCell>PKR {(item.unitPrice || 0).toFixed(2)}</TableCell>
                              <TableCell>PKR {(item.total || 0).toFixed(2)}</TableCell>
                            </TableRow>
                          );
                        })
                      ) : (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center text-gray-500">
                            No items found in this order
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {/* Order Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Order Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>PKR {(order.subtotal || 0).toFixed(2)}</span>
                  </div>
                  {order.discount > 0 && (
                    <div className="flex justify-between">
                      <span>Discount:</span>
                      <span>PKR {order.discount.toFixed(2)}</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total:</span>
                    <span>PKR {((order.subtotal || 0) - (order.discount || 0)).toFixed(2)}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex gap-2 justify-end">
                {order.status === 'completed' && !isOrderCancelled && (
                  <Button
                    onClick={initializeAdjustmentForm}
                    variant="outline"
                    className="border-orange-300 text-orange-700 hover:bg-orange-50"
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Return Items
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Header with Back Button */}
              <div className="flex items-center gap-3 pb-4 border-b">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAdjustmentForm(false)}
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Order Details
                </Button>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-orange-600" />
                  <h3 className="text-lg font-semibold text-orange-700">Return Items from Order</h3>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <h4 className="font-medium text-orange-800 mb-2">Order: {order.orderNumber}</h4>
                  <p className="text-sm text-orange-700">
                    Select the items and quantities you want to return. These items will be added back to inventory.
                  </p>
                </div>

                <div className="grid gap-4">
                  {adjustmentItems.map((item, index) => (
                    <Card key={index} className="border-2 border-gray-200 hover:border-orange-300 transition-colors">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h4 className="font-semibold text-gray-800">{item.productName}</h4>
                            <p className="text-sm text-gray-600">
                              Original Quantity: <span className="font-medium">{formatQuantity(item.originalQuantity)}</span>
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-600">Unit Price</p>
                            <p className="font-medium">PKR {item.unitPrice.toFixed(2)}</p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor={`return-qty-${index}`} className="text-sm font-medium text-gray-700">
                              Return Quantity
                            </Label>
                            <div className="flex items-center gap-2 mt-1">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={() => updateReturnQuantity(index, item.returnQuantity - 0.1)}
                                disabled={item.returnQuantity <= 0}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <Input
                                id={`return-qty-${index}`}
                                type="number"
                                min="0"
                                max={item.originalQuantity}
                                step="0.1"
                                value={item.returnQuantity}
                                onChange={(e) => updateReturnQuantity(index, parseFloat(e.target.value) || 0)}
                                className="w-20 text-center"
                              />
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={() => updateReturnQuantity(index, item.returnQuantity + 0.1)}
                                disabled={item.returnQuantity >= item.originalQuantity}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                          
                          <div>
                            <Label htmlFor={`reason-${index}`} className="text-sm font-medium text-gray-700">
                              Return Reason
                            </Label>
                            <select
                              id={`reason-${index}`}
                              value={item.reason}
                              onChange={(e) => updateReturnReason(index, e.target.value)}
                              className="mt-1 w-full p-2 border border-gray-300 rounded-md text-sm"
                            >
                              <option value="">Select reason</option>
                              <option value="damaged">Damaged</option>
                              <option value="wrong_item">Wrong Item</option>
                              <option value="customer_request">Customer Request</option>
                            </select>
                          </div>
                        </div>
                        
                        {item.returnQuantity > 0 && (
                          <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded">
                            <p className="text-sm text-green-700">
                              <strong>Refund Amount:</strong> PKR {(item.returnQuantity * item.unitPrice).toFixed(2)}
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div>
                  <Label htmlFor="adjustment-notes" className="text-sm font-medium text-gray-700">
                    Additional Notes
                  </Label>
                  <Textarea
                    id="adjustment-notes"
                    value={adjustmentNotes}
                    onChange={(e) => setAdjustmentNotes(e.target.value)}
                    placeholder="Any additional notes about this return..."
                    rows={3}
                    className="mt-1"
                  />
                </div>

                {adjustmentItems.some(item => item.returnQuantity > 0) && (
                  <Card className="bg-blue-50 border-blue-200">
                    <CardContent className="p-4">
                      <h4 className="font-medium text-blue-800 mb-2">Return Summary</h4>
                      <div className="space-y-1 text-sm">
                        {adjustmentItems
                          .filter(item => item.returnQuantity > 0)
                          .map((item, index) => (
                            <div key={index} className="flex justify-between text-blue-700">
                              <span>{item.productName} x {formatQuantity(item.returnQuantity)}</span>
                              <span>PKR {(item.returnQuantity * item.unitPrice).toFixed(2)}</span>
                            </div>
                          ))}
                        <Separator className="my-2" />
                        <div className="flex justify-between font-medium text-blue-800">
                          <span>Total Refund:</span>
                          <span>
                            PKR {adjustmentItems
                              .reduce((sum, item) => sum + (item.returnQuantity * item.unitPrice), 0)
                              .toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <div className="flex gap-3 justify-end pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => setShowAdjustmentForm(false)}
                    disabled={adjustmentLoading}
                    className="min-w-24"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleOrderAdjustment}
                    disabled={adjustmentLoading || !adjustmentItems.some(item => item.returnQuantity > 0)}
                    className="bg-orange-600 hover:bg-orange-700 text-white min-w-32"
                  >
                    {adjustmentLoading ? 'Processing...' : 'Process Return'}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Cancel Confirmation Dialog */}
      <AlertDialog open={showCancelConfirm} onOpenChange={setShowCancelConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              Cancel Order Confirmation
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>Are you sure you want to cancel this order?</p>
              <div className="bg-red-50 border border-red-200 rounded p-3 text-sm text-red-700">
                <strong>Important:</strong> Once an order is cancelled, it cannot be re-edited or changed back to any other status.
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowCancelConfirm(false)}>
              Keep Order Active
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmCancel}
              className="bg-red-600 hover:bg-red-700"
            >
              Yes, Cancel Order
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
