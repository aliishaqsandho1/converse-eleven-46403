import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { User, Calendar, DollarSign, CreditCard, Edit2, RotateCcw, Save, X, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { salesApi, customersApi } from "@/services/api";
import { useCustomerBalance } from "@/hooks/useCustomerBalance";
import { useStockManagement } from "@/hooks/useStockManagement";

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
  outsourcedItems?: any[];
}

interface ExpandedOrderRowProps {
  order: Sale;
  onOrderUpdated?: () => void;
}

export const ExpandedOrderRow = ({ order, onOrderUpdated }: ExpandedOrderRowProps) => {
  const { toast } = useToast();
  const { updateBalanceForOrderStatusChange } = useCustomerBalance();
  const { handleOrderStatusChange } = useStockManagement();
  
  const [isEditingStatus, setIsEditingStatus] = useState(false);
  const [isEditingPayment, setIsEditingPayment] = useState(false);
  const [isEditingCustomer, setIsEditingCustomer] = useState(false);
  const [isReturning, setIsReturning] = useState(false);
  
  const [editedStatus, setEditedStatus] = useState(order.status);
  const [editedPaymentMethod, setEditedPaymentMethod] = useState(order.paymentMethod);
  const [editedCustomer, setEditedCustomer] = useState(order.customerName || "Walk-in");
  const [returnQuantities, setReturnQuantities] = useState<{ [key: number]: number }>({});
  const [returnNotes, setReturnNotes] = useState("");
  
  const [isLoading, setIsLoading] = useState(false);

  // Live calculations for return flow
  const computedRefund = React.useMemo(() => {
    let sum = 0;
    order.items.forEach((item) => {
      const qty = returnQuantities[item.productId] || 0;
      if (qty > 0) sum += qty * item.unitPrice;
    });
    return Number(sum.toFixed(2));
  }, [order.items, returnQuantities]);

  const newSubtotal = React.useMemo(
    () => Number((order.subtotal - computedRefund).toFixed(2)),
    [order.subtotal, computedRefund]
  );

  const newTotal = React.useMemo(
    () => Number((order.total - computedRefund).toFixed(2)),
    [order.total, computedRefund]
  );

  const formatCurrency = (val: number) =>
    `Rs. ${val.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      completed: "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20",
      pending: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20",
      cancelled: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20"
    };
    return variants[status] || "bg-muted text-muted-foreground border-border";
  };

  const getPaymentBadge = (method: string) => {
    const variants: Record<string, string> = {
      cash: "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20",
      credit: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
      card: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20"
    };
    return variants[method] || "bg-muted text-muted-foreground border-border";
  };

  const handleSaveStatus = async () => {
    if (editedStatus === order.status) {
      setIsEditingStatus(false);
      return;
    }

    setIsLoading(true);
    try {
      // Handle stock management
      const stockResult = await handleOrderStatusChange(
        order.id,
        order.orderNumber,
        order.items || [],
        editedStatus,
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
      
      // Handle customer balance
      if (order.customerId) {
        await updateBalanceForOrderStatusChange(
          order.id,
          order.customerId,
          order.orderNumber,
          order.total,
          editedStatus,
          order.status
        );
      }

      // Update status
      await salesApi.updateStatus(order.id, { status: editedStatus });
      
      toast({
        title: "Status Updated",
        description: "Order status has been updated successfully",
      });
      
      setIsEditingStatus(false);
      onOrderUpdated?.();
    } catch (error: any) {
      console.error('Status update error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update status",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSavePayment = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/sales/${order.id}/details`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentMethod: editedPaymentMethod })
      });
      
      if (!response.ok) throw new Error('Failed to update payment method');
      
      toast({
        title: "Payment Method Updated",
        description: "Payment method has been updated successfully",
      });
      
      setIsEditingPayment(false);
      onOrderUpdated?.();
    } catch (error: any) {
      console.error('Payment update error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update payment method",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReturn = async () => {
    const itemsToReturn = Object.entries(returnQuantities).filter(([_, qty]) => qty > 0);
    
    if (itemsToReturn.length === 0) {
      toast({
        title: "No Items Selected",
        description: "Please select items to return",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const returnData = {
        type: "return",
        items: itemsToReturn.map(([productId, quantity]) => ({
          productId: parseInt(productId),
          quantity,
          reason: "customer_request",
        })),
        adjustmentReason: returnNotes || "Order adjustment - items returned after completion",
        refundAmount: computedRefund,
        restockItems: true,
      };

      await salesApi.adjustOrder(order.id, returnData);
      
      toast({
        title: "Return Processed",
        description: "Items have been returned and inventory updated",
      });
      
      setIsReturning(false);
      setReturnQuantities({});
      setReturnNotes("");
      onOrderUpdated?.();
    } catch (error: any) {
      console.error('Return error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to process return",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 bg-muted/30 border-t border-border">
      {/* Compact Info Grid */}
      <div className="grid grid-cols-4 gap-4 mb-4">
        {/* Customer */}
        <div className="flex items-center gap-2 p-3 rounded-lg bg-card border border-border">
          <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="text-xs text-muted-foreground">Customer</p>
            {isEditingCustomer ? (
              <Input
                value={editedCustomer}
                onChange={(e) => setEditedCustomer(e.target.value)}
                className="h-7 mt-1 text-sm"
              />
            ) : (
              <p className="text-sm font-medium text-foreground truncate">{order.customerName || "Walk-in"}</p>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => isEditingCustomer ? setIsEditingCustomer(false) : setIsEditingCustomer(true)}
            className="h-7 w-7 p-0"
          >
            <Edit2 className="h-3 w-3" />
          </Button>
        </div>

        {/* Status */}
        <div className="flex items-center gap-2 p-3 rounded-lg bg-card border border-border">
          <div className="min-w-0 flex-1">
            <p className="text-xs text-muted-foreground mb-1">Status</p>
            {isEditingStatus ? (
              <div className="flex items-center gap-1">
                <Select value={editedStatus} onValueChange={setEditedStatus}>
                  <SelectTrigger className="h-7 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
                <Button size="sm" variant="ghost" onClick={handleSaveStatus} disabled={isLoading} className="h-7 px-2">
                  <Save className="h-3 w-3" />
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setIsEditingStatus(false)} disabled={isLoading} className="h-7 px-2">
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ) : (
              <Badge variant="outline" className={`${getStatusBadge(order.status)} text-xs capitalize`}>
                {order.status}
              </Badge>
            )}
          </div>
          {!isEditingStatus && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditingStatus(true)}
              className="h-7 w-7 p-0"
            >
              <Edit2 className="h-3 w-3" />
            </Button>
          )}
        </div>

        {/* Payment */}
        <div className="flex items-center gap-2 p-3 rounded-lg bg-card border border-border">
          <CreditCard className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="text-xs text-muted-foreground mb-1">Payment</p>
            {isEditingPayment ? (
              <div className="flex items-center gap-1">
                <Select value={editedPaymentMethod} onValueChange={setEditedPaymentMethod}>
                  <SelectTrigger className="h-7 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="credit">Credit</SelectItem>
                    <SelectItem value="card">Card</SelectItem>
                  </SelectContent>
                </Select>
                <Button size="sm" variant="ghost" onClick={handleSavePayment} disabled={isLoading} className="h-7 px-2">
                  <Save className="h-3 w-3" />
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setIsEditingPayment(false)} disabled={isLoading} className="h-7 px-2">
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ) : (
              <Badge variant="outline" className={`${getPaymentBadge(order.paymentMethod)} text-xs capitalize`}>
                {order.paymentMethod}
              </Badge>
            )}
          </div>
          {!isEditingPayment && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditingPayment(true)}
              className="h-7 w-7 p-0"
            >
              <Edit2 className="h-3 w-3" />
            </Button>
          )}
        </div>

        {/* Time / Created By */}
        <div className="flex items-center gap-2 p-3 rounded-lg bg-card border border-border">
          <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="text-xs text-muted-foreground">Time / Created By</p>
            <p className="text-sm font-medium text-foreground">{order.time}</p>
            <p className="text-xs text-muted-foreground truncate">{order.createdBy || "N/A"}</p>
          </div>
        </div>
      </div>


      {/* Return Notes */}
      {isReturning && (
        <div className="mb-4">
          <Label className="text-xs">Return Notes (Optional)</Label>
          <Textarea
            value={returnNotes}
            onChange={(e) => setReturnNotes(e.target.value)}
            placeholder="Enter notes about the return..."
            className="mt-1 text-sm min-h-[60px]"
          />
        </div>
      )}

      {/* Order Items Table */}
      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 bg-muted/30 border-b border-border">
          <h4 className="text-sm font-semibold text-foreground">
            Order Items ({order.items.length})
          </h4>
          <div className="flex items-center gap-3">
            <div className="text-sm text-muted-foreground">
              {isReturning ? (
                <>
                  Refund: <span className="font-semibold text-foreground">{formatCurrency(computedRefund)}</span>
                  <span className="mx-2">•</span>
                  New Total: <span className="font-bold text-primary">{formatCurrency(newTotal)}</span>
                </>
              ) : (
                <>
                  Subtotal: <span className="font-semibold text-foreground">{formatCurrency(order.subtotal)}</span>
                  <span className="mx-2">•</span>
                  Total: <span className="font-bold text-primary">{formatCurrency(order.total)}</span>
                </>
              )}
            </div>
            {isReturning ? (
              <div className="flex items-center gap-2">
                <Button size="sm" onClick={handleReturn} disabled={isLoading || computedRefund <= 0} className="h-7">
                  <Save className="h-3 w-3 mr-1" />
                  Process Return {computedRefund > 0 ? `(${formatCurrency(computedRefund)})` : ""}
                </Button>
                <Button size="sm" variant="outline" onClick={() => {
                  setIsReturning(false);
                  setReturnQuantities({});
                  setReturnNotes("");
                }} disabled={isLoading} className="h-7">
                  <X className="h-3 w-3 mr-1" />
                  Cancel
                </Button>
              </div>
            ) : (
              <Button size="sm" variant="outline" onClick={() => setIsReturning(true)} className="h-7">
                <RotateCcw className="h-3 w-3 mr-1" />
                Return
              </Button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr className="text-xs">
                <th className="px-3 py-2 text-left font-medium text-muted-foreground w-12">#</th>
                <th className="px-3 py-2 text-left font-medium text-muted-foreground">Product Name</th>
                <th className="px-3 py-2 text-center font-medium text-muted-foreground w-20">Qty</th>
                <th className="px-3 py-2 text-right font-medium text-muted-foreground w-28">Unit Price</th>
                <th className="px-3 py-2 text-right font-medium text-muted-foreground w-32">Total</th>
                {isReturning && (
                  <th className="px-3 py-2 text-center font-medium text-muted-foreground w-24">Return</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-card">
              {order.items.map((item, index) => (
                <tr key={index} className="hover:bg-muted/20 transition-colors text-sm">
                  <td className="px-3 py-2 text-muted-foreground">{index + 1}</td>
                  <td className="px-3 py-2">
                    <div>
                      <p className="font-medium text-foreground">{item.productName}</p>
                      <p className="text-xs text-muted-foreground">ID: {item.productId}</p>
                    </div>
                  </td>
                  <td className="px-3 py-2 text-center">
                    <Badge variant="secondary" className="text-xs">{item.quantity}</Badge>
                  </td>
                  <td className="px-3 py-2 text-right text-muted-foreground">
                    Rs. {item.unitPrice.toLocaleString()}
                  </td>
                  <td className="px-3 py-2 text-right font-semibold text-primary">
                    Rs. {item.total.toLocaleString()}
                  </td>
                  {isReturning && (
                    <td className="px-3 py-2">
                      <Input
                        type="number"
                        step="0.1"
                        min="0"
                        max={item.quantity}
                        value={returnQuantities[item.productId] || ""}
                        onChange={(e) => {
                          const value = e.target.value;
                          setReturnQuantities({
                            ...returnQuantities,
                            [item.productId]: value === "" ? 0 : parseFloat(value)
                          });
                        }}
                        placeholder="0"
                        className="w-20 h-7 text-center text-xs"
                      />
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Outsourced Items */}
      {order.outsourcedItems && order.outsourcedItems.length > 0 && (
        <div className="mt-4 bg-card rounded-lg border border-orange-200 dark:border-orange-800 overflow-hidden">
          <div className="px-4 py-3 bg-orange-50 dark:bg-orange-950/20 border-b border-orange-200 dark:border-orange-800">
            <h4 className="text-sm font-semibold text-foreground">Outsourced Items</h4>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr className="text-xs">
                  <th className="px-3 py-2 text-left font-medium text-muted-foreground w-12">#</th>
                  <th className="px-3 py-2 text-left font-medium text-muted-foreground">Product</th>
                  <th className="px-3 py-2 text-center font-medium text-muted-foreground w-20">Qty</th>
                  <th className="px-3 py-2 text-right font-medium text-muted-foreground w-28">Unit Price</th>
                  <th className="px-3 py-2 text-right font-medium text-muted-foreground w-32">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-card">
                {order.outsourcedItems.map((item: any, index: number) => (
                  <tr key={index} className="hover:bg-muted/20 transition-colors text-sm">
                    <td className="px-3 py-2 text-muted-foreground">{index + 1}</td>
                    <td className="px-3 py-2 font-medium text-foreground">{item.name}</td>
                    <td className="px-3 py-2 text-center">
                      <Badge variant="secondary" className="text-xs">{item.quantity}</Badge>
                    </td>
                    <td className="px-3 py-2 text-right text-muted-foreground">
                      Rs. {item.price.toLocaleString()}
                    </td>
                    <td className="px-3 py-2 text-right font-semibold text-primary">
                      Rs. {(item.quantity * item.price).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
