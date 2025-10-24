import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Truck, Calendar, DollarSign, Edit2, Save, X, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { purchaseOrdersApi } from "@/services/api";
import { newFinanceApi } from "@/services/newFinanceApi";
import { useQueryClient } from "@tanstack/react-query";

interface PurchaseOrder {
  id: number;
  orderNumber: string;
  supplierId: number;
  supplierName: string;
  date: string;
  expectedDelivery: string | null;
  status: string;
  items: Array<{
    productId: number;
    productName: string;
    quantity: number;
    unitPrice: number;
    sku?: string;
  }>;
  total: number;
  notes?: string;
}

interface ExpandedPurchaseOrderRowProps {
  order: PurchaseOrder;
  onOrderUpdated?: () => void;
}

export const ExpandedPurchaseOrderRow = ({ order, onOrderUpdated }: ExpandedPurchaseOrderRowProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [statusNotes, setStatusNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      draft: "bg-muted text-muted-foreground border-border",
      sent: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
      confirmed: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20",
      received: "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20",
      cancelled: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20"
    };
    return variants[status] || "bg-muted text-muted-foreground border-border";
  };

  const getAvailableStatusTransitions = (currentStatus: string) => {
    switch (currentStatus) {
      case "draft":
      case "sent":
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

  const handleStatusUpdate = async () => {
    if (!newStatus) {
      toast({
        title: "Error",
        description: "Please select a new status",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      if (newStatus === "received") {
        const receiveData = {
          items: order.items.map((item) => ({
            productId: item.productId,
            quantityReceived: item.quantity,
            condition: "good"
          })),
          notes: statusNotes || "All items received in good condition"
        };
        
        await purchaseOrdersApi.receive(order.id, receiveData);

        // Add cash flow entry
        try {
          const accountsResponse = await newFinanceApi.getAccounts({ type: 'bank', active: true });
          const bankAccount = accountsResponse.data?.find((acc: any) => 
            acc.account_type?.toLowerCase() === 'bank' || acc.account_name?.toLowerCase().includes('bank')
          );
          const accountId = bankAccount ? parseInt(bankAccount.id) : undefined;

          await newFinanceApi.createFinanceCashFlow({
            type: 'outflow',
            amount: parseFloat(order.total.toString()),
            date: new Date().toISOString().split('T')[0],
            account_id: accountId,
            reference: order.orderNumber || `PO-${order.id}`,
            description: `Purchase order received - ${order.supplierName} - Stock purchase`
          });
        } catch (cashFlowError) {
          console.error('Failed to create cash flow entry:', cashFlowError);
        }
      } else {
        await purchaseOrdersApi.updateStatus(order.id, newStatus, statusNotes);
      }

      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
      queryClient.invalidateQueries({ queryKey: ['inventory'] });

      toast({
        title: "Success",
        description: newStatus === "received" 
          ? "Purchase order marked as received and inventory updated"
          : "Purchase order status updated successfully",
      });

      setIsUpdatingStatus(false);
      setNewStatus("");
      setStatusNotes("");
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

  const availableTransitions = getAvailableStatusTransitions(order.status);

  return (
    <div className="p-4 bg-muted/10 border-t border-border">
      {/* Compact Info Grid */}
      <div className="grid grid-cols-4 gap-4 mb-4">
        {/* Supplier */}
        <div className="flex items-center gap-2 p-3 rounded-lg bg-card border border-border">
          <Truck className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="text-xs text-muted-foreground">Supplier</p>
            <p className="text-sm font-medium text-foreground truncate">{order.supplierName}</p>
          </div>
        </div>

        {/* Status */}
        <div className="flex items-center gap-2 p-3 rounded-lg bg-card border border-border">
          <div className="min-w-0 flex-1">
            <p className="text-xs text-muted-foreground mb-1">Status</p>
            {isUpdatingStatus ? (
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger className="h-7 text-sm">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {availableTransitions.map((transition) => (
                    <SelectItem key={transition.value} value={transition.value}>
                      {transition.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Badge variant="outline" className={`${getStatusBadge(order.status)} text-xs capitalize`}>
                {order.status}
              </Badge>
            )}
          </div>
        </div>

        {/* Expected Delivery */}
        <div className="flex items-center gap-2 p-3 rounded-lg bg-card border border-border">
          <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="text-xs text-muted-foreground">Expected Delivery</p>
            <p className="text-sm font-medium text-foreground">
              {order.expectedDelivery ? new Date(order.expectedDelivery).toLocaleDateString() : 'Not set'}
            </p>
          </div>
        </div>

        {/* Total Amount */}
        <div className="flex items-center gap-2 p-3 rounded-lg bg-card border border-border">
          <DollarSign className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="text-xs text-muted-foreground">Total Amount</p>
            <p className="text-sm font-bold text-primary">Rs. {order.total?.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Status Update Section */}
      {isUpdatingStatus && (
        <div className="mb-4 p-3 bg-card rounded-lg border border-border space-y-3">
          <Textarea
            placeholder="Add notes about this status change (optional)..."
            value={statusNotes}
            onChange={(e) => setStatusNotes(e.target.value)}
            className="min-h-[60px] text-sm"
          />
          <div className="flex items-center gap-2">
            <Button 
              size="sm" 
              onClick={handleStatusUpdate} 
              disabled={!newStatus || isLoading}
              className="h-8"
            >
              {isLoading ? (
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
              ) : (
                <Save className="h-3 w-3 mr-1" />
              )}
              Update Status
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => {
                setIsUpdatingStatus(false);
                setNewStatus("");
                setStatusNotes("");
              }}
              disabled={isLoading}
              className="h-8"
            >
              <X className="h-3 w-3 mr-1" />
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Action Button */}
      {!isUpdatingStatus && availableTransitions.length > 0 && (
        <div className="mb-4">
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => setIsUpdatingStatus(true)}
            className="h-8"
          >
            <Edit2 className="h-3 w-3 mr-1" />
            Update Status
          </Button>
        </div>
      )}

      {/* Order Items Table */}
      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 bg-muted/30 border-b border-border">
          <h4 className="text-sm font-semibold text-foreground">
            Order Items ({order.items?.length || 0})
          </h4>
          <div className="text-sm text-muted-foreground">
            Total: <span className="font-bold text-primary">Rs. {order.total?.toLocaleString()}</span>
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
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-card">
              {order.items && order.items.length > 0 ? (
                order.items.map((item, index) => (
                  <tr key={index} className="hover:bg-muted/20 transition-colors text-sm">
                    <td className="px-3 py-2 text-muted-foreground">{index + 1}</td>
                    <td className="px-3 py-2">
                      <div>
                        <p className="font-medium text-foreground">{item.productName}</p>
                        {item.sku && (
                          <p className="text-xs text-muted-foreground">SKU: {item.sku}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-2 text-center">
                      <Badge variant="secondary" className="text-xs">{item.quantity}</Badge>
                    </td>
                    <td className="px-3 py-2 text-right text-muted-foreground">
                      Rs. {item.unitPrice?.toLocaleString()}
                    </td>
                    <td className="px-3 py-2 text-right font-semibold text-primary">
                      Rs. {(item.quantity * item.unitPrice)?.toLocaleString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-3 py-8 text-center text-sm text-muted-foreground">
                    No items found in this order
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Notes */}
      {order.notes && (
        <div className="mt-4 p-3 bg-muted/30 rounded-lg border border-border">
          <p className="text-xs font-medium text-muted-foreground mb-1">Notes:</p>
          <p className="text-sm text-foreground">{order.notes}</p>
        </div>
      )}
    </div>
  );
};
