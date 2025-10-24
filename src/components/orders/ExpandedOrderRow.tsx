import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Separator } from "@/components/ui/separator";
import { Package, Edit2, Save, X, AlertTriangle, RotateCcw, Minus, Plus, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { salesApi, customersApi, outsourcingApi } from "@/services/api";
import { useCustomerBalance } from "@/hooks/useCustomerBalance";
import { useStockManagement } from "@/hooks/useStockManagement";
import { apiConfig } from "@/utils/apiConfig";
import { formatQuantity } from "@/lib/utils";

interface ExpandedOrderRowProps {
  order: any;
  onOrderUpdated?: () => void;
}

export const ExpandedOrderRow = ({ order, onOrderUpdated }: ExpandedOrderRowProps) => {
  const { toast } = useToast();
  const { updateBalanceForOrderStatusChange } = useCustomerBalance();
  const { handleOrderStatusChange } = useStockManagement();
  
  const [showAdjustmentForm, setShowAdjustmentForm] = useState(false);
  const [adjustmentItems, setAdjustmentItems] = useState<any[]>([]);
  const [adjustmentNotes, setAdjustmentNotes] = useState("");
  const [adjustmentLoading, setAdjustmentLoading] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [outsourcedItems, setOutsourcedItems] = useState<any[]>([]);
  
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

  useEffect(() => {
    if (order) {
      setEditValues({
        status: order.status || '',
        paymentMethod: order.paymentMethod || '',
        customerId: order.customerId || null,
        customerName: order.customerName || ''
      });
      fetchOutsourcingData();
    }
  }, [order]);

  const fetchOutsourcingData = async () => {
    if (!order?.id) return;
    try {
      const response = await outsourcingApi.getAll({ limit: 1000 });
      if (response.success && response.data.orders) {
        const orderOutsourcedItems = response.data.orders.filter(
          (outsourcedItem: any) => outsourcedItem.sale_id === order.id
        );
        setOutsourcedItems(orderOutsourcedItems);
      }
    } catch (error) {
      console.error('Failed to fetch outsourcing data:', error);
    }
  };

  const isOrderCancelled = order.status === 'cancelled';

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
      
      if (editMode === 'status') {
        if (editValues.status !== order.status) {
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
            }
          }
        }
        
        const response = await salesApi.updateStatus(order.id, { status: editValues.status });
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
        const response = await fetch(`${apiConfig.getBaseUrl()}/sales/${order.id}/details`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ paymentMethod: editValues.paymentMethod })
        });
        
        const result = await response.json();
        if (result.success) {
          toast({
            title: "Payment Method Updated",
            description: "Payment method updated successfully",
          });
        } else {
          throw new Error(result.message || 'Failed to update payment method');
        }
      } else if (editMode === 'customer') {
        const response = await fetch(`${apiConfig.getBaseUrl()}/sales/${order.id}/details`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ customerId: editValues.customerId })
        });
        
        const result = await response.json();
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

  const finalTotal = order.subtotal - order.discount;

  if (showAdjustmentForm) {
    return (
      <div className="p-4 space-y-4 bg-card border-t border-border">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-foreground flex items-center gap-2">
            <RotateCcw className="h-4 w-4" />
            Return/Adjust Order Items
          </h4>
          <Button variant="ghost" size="sm" onClick={() => setShowAdjustmentForm(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="space-y-3">
          {adjustmentItems.map((item, index) => (
            <div key={index} className="p-3 border border-border rounded-lg bg-muted/20 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm text-foreground">{item.productName}</span>
                <span className="text-xs text-muted-foreground">Original: {formatQuantity(item.originalQuantity)}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => updateReturnQuantity(index, item.returnQuantity - 1)}
                  disabled={item.returnQuantity === 0}
                >
                  <Minus className="h-3 w-3" />
                </Button>
                <Input
                  type="number"
                  value={item.returnQuantity}
                  onChange={(e) => updateReturnQuantity(index, parseInt(e.target.value) || 0)}
                  className="w-20 text-center"
                  min="0"
                  max={item.originalQuantity}
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => updateReturnQuantity(index, item.returnQuantity + 1)}
                  disabled={item.returnQuantity >= item.originalQuantity}
                >
                  <Plus className="h-3 w-3" />
                </Button>
                <Input
                  placeholder="Reason for return"
                  value={item.reason}
                  onChange={(e) => updateReturnReason(index, e.target.value)}
                  className="flex-1"
                />
              </div>
            </div>
          ))}
        </div>

        <div>
          <Label className="text-sm">Additional Notes</Label>
          <Textarea
            value={adjustmentNotes}
            onChange={(e) => setAdjustmentNotes(e.target.value)}
            placeholder="Enter any additional notes about this adjustment..."
            className="mt-1"
          />
        </div>

        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={() => setShowAdjustmentForm(false)}>
            Cancel
          </Button>
          <Button onClick={handleOrderAdjustment} disabled={adjustmentLoading}>
            {adjustmentLoading ? "Processing..." : "Process Return"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="border-t border-border bg-card/30">
      {isOrderCancelled && (
        <div className="m-4 bg-destructive/10 border border-destructive/30 rounded-lg p-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            <span className="text-sm font-medium text-destructive">Order Cancelled - Read Only</span>
          </div>
        </div>
      )}

      {/* Quick Info Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 bg-muted/20">
        {/* Customer */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <Label className="text-xs text-muted-foreground">Customer</Label>
            {editMode !== 'customer' && !isOrderCancelled && (
              <Button variant="ghost" size="sm" onClick={() => handleEditStart('customer')} className="h-5 w-5 p-0">
                <Edit2 className="h-3 w-3" />
              </Button>
            )}
          </div>
          {editMode === 'customer' ? (
            <div className="space-y-1">
              <Input
                placeholder="Search..."
                value={customerSearch}
                onChange={(e) => setCustomerSearch(e.target.value)}
                className="h-7 text-xs"
              />
              {customerSearch && (
                <div className="max-h-24 overflow-y-auto border border-border rounded bg-card text-xs">
                  <div
                    className="p-1 cursor-pointer hover:bg-muted"
                    onClick={() => handleCustomerSelect(null)}
                  >
                    Walk-in Customer
                  </div>
                  {filteredCustomers.map((customer) => (
                    <div
                      key={customer.id}
                      className="p-1 cursor-pointer hover:bg-muted"
                      onClick={() => handleCustomerSelect(customer)}
                    >
                      {customer.name}
                    </div>
                  ))}
                </div>
              )}
              <div className="flex gap-1">
                <Button size="sm" onClick={handleEditSave} disabled={editLoading} className="h-6 text-xs">
                  <Save className="h-3 w-3" />
                </Button>
                <Button size="sm" variant="outline" onClick={handleEditCancel} className="h-6 text-xs">
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-sm font-medium text-foreground">{order.customerName || "Walk-in"}</p>
          )}
        </div>

        {/* Status */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <Label className="text-xs text-muted-foreground">Status</Label>
            {editMode !== 'status' && !isOrderCancelled && (
              <Button variant="ghost" size="sm" onClick={() => handleEditStart('status')} className="h-5 w-5 p-0">
                <Edit2 className="h-3 w-3" />
              </Button>
            )}
          </div>
          {editMode === 'status' ? (
            <div className="space-y-1">
              <Select value={editValues.status} onValueChange={handleStatusChange}>
                <SelectTrigger className="h-7 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex gap-1">
                <Button size="sm" onClick={handleEditSave} disabled={editLoading} className="h-6 text-xs">
                  <Save className="h-3 w-3" />
                </Button>
                <Button size="sm" variant="outline" onClick={handleEditCancel} className="h-6 text-xs">
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ) : (
            <Badge variant={order.status === 'completed' ? 'default' : order.status === 'cancelled' ? 'destructive' : 'secondary'} className="text-xs">
              {order.status}
            </Badge>
          )}
        </div>

        {/* Payment Method */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <Label className="text-xs text-muted-foreground">Payment</Label>
            {editMode !== 'payment' && !isOrderCancelled && (
              <Button variant="ghost" size="sm" onClick={() => handleEditStart('payment')} className="h-5 w-5 p-0">
                <Edit2 className="h-3 w-3" />
              </Button>
            )}
          </div>
          {editMode === 'payment' ? (
            <div className="space-y-1">
              <Select value={editValues.paymentMethod} onValueChange={(val) => setEditValues(prev => ({ ...prev, paymentMethod: val }))}>
                <SelectTrigger className="h-7 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="credit">Credit</SelectItem>
                  <SelectItem value="card">Card</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex gap-1">
                <Button size="sm" onClick={handleEditSave} disabled={editLoading} className="h-6 text-xs">
                  <Save className="h-3 w-3" />
                </Button>
                <Button size="sm" variant="outline" onClick={handleEditCancel} className="h-6 text-xs">
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ) : (
            <Badge variant="outline" className="text-xs capitalize">{order.paymentMethod}</Badge>
          )}
        </div>

        {/* Time & Created By */}
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Time / Created By</Label>
          <p className="text-xs text-foreground">{order.time}</p>
          <p className="text-xs text-muted-foreground">{order.createdBy}</p>
        </div>
      </div>

      {/* Order Items Table */}
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-primary" />
            <h4 className="font-semibold text-sm text-foreground">Order Items ({order.items?.length || 0})</h4>
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span>Subtotal: <span className="font-semibold text-foreground">Rs. {order.subtotal.toLocaleString()}</span></span>
            {order.discount > 0 && (
              <span>Discount: <span className="font-semibold text-destructive">-Rs. {order.discount.toLocaleString()}</span></span>
            )}
            <span>Total: <span className="font-semibold text-primary">Rs. {finalTotal.toLocaleString()}</span></span>
          </div>
        </div>
        
        <div className="border border-border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead className="w-12 text-center h-8">#</TableHead>
                <TableHead className="h-8">Product Name</TableHead>
                <TableHead className="text-center w-24 h-8">Qty</TableHead>
                <TableHead className="text-right w-32 h-8">Unit Price</TableHead>
                <TableHead className="text-right w-32 h-8">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {order.items?.map((item: any, index: number) => (
                <TableRow key={index} className="hover:bg-muted/20">
                  <TableCell className="text-center text-xs text-muted-foreground">{index + 1}</TableCell>
                  <TableCell className="text-sm">
                    <div className="flex flex-col">
                      <span className="text-foreground">{item.productName}</span>
                      {item.productId && (
                        <span className="text-xs text-muted-foreground">ID: {item.productId}</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="secondary" className="text-xs font-mono">
                      {formatQuantity(item.quantity)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right text-xs font-mono text-muted-foreground">
                    Rs. {item.unitPrice?.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right text-sm font-mono font-semibold text-primary">
                    Rs. {item.total?.toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Actions */}
        {!isOrderCancelled && order.status === 'completed' && (
          <div className="flex justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={initializeAdjustmentForm}
              className="text-xs"
            >
              <RotateCcw className="h-3 w-3 mr-1" />
              Return/Adjust Items
            </Button>
          </div>
        )}

        {/* Outsourcing Info */}
        {outsourcedItems.length > 0 && (
          <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <h5 className="text-xs font-semibold text-blue-900 dark:text-blue-300 mb-2">Outsourced Items</h5>
            <div className="space-y-1 text-xs text-blue-800 dark:text-blue-400">
              {outsourcedItems.map((item, idx) => (
                <div key={idx}>• {item.product_name} (Qty: {formatQuantity(item.quantity)})</div>
              ))}
            </div>
          </div>
        )}
      </div>

      <AlertDialog open={showCancelConfirm} onOpenChange={setShowCancelConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Order?</AlertDialogTitle>
            <AlertDialogDescription>
              This will mark the order as cancelled and restore inventory. This action can be reversed later if needed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>No, Keep Order</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmCancel}>Yes, Cancel Order</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
