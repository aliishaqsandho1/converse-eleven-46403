
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Package, CheckCircle, Clock, AlertCircle } from "lucide-react";

interface TodaysOrdersModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orders: any[];
}

export const TodaysOrdersModal: React.FC<TodaysOrdersModalProps> = ({
  open,
  onOpenChange,
  orders
}) => {
  // Helper function to format quantity properly
  const formatQuantity = (quantity: number) => {
    // If quantity is a whole number, show without decimals
    if (quantity % 1 === 0) {
      return quantity.toString();
    }
    // If quantity has decimals, show up to 2 decimal places, removing trailing zeros
    return parseFloat(quantity.toFixed(2)).toString();
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'cancelled':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900 dark:text-green-200 dark:border-green-700';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900 dark:text-yellow-200 dark:border-yellow-700';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-300 dark:bg-red-900 dark:text-red-200 dark:border-red-700';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[85vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-blue-600" />
            Today's Orders ({orders.length})
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-4">
          {orders.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium text-muted-foreground">No orders today</p>
              <p className="text-sm text-muted-foreground">Start making some sales!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {orders.map((order) => {
                // Use totalAmount if available, otherwise fall back to total (ensuring no tax included)
                const displayTotal = order.totalAmount || order.subtotal || order.total;
                
                return (
                  <Card key={order.id} className="hover:shadow-md transition-shadow bg-card border-border">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-bold text-lg text-card-foreground">#{order.orderNumber}</h3>
                            <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs border ${getStatusColor(order.status)}`}>
                              {getStatusIcon(order.status)}
                              {order.status}
                            </div>
                          </div>
                          <p className="text-sm font-medium text-card-foreground">{order.customerName || "Walk-in Customer"}</p>
                          <p className="text-xs text-muted-foreground">{order.time}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold text-green-600">PKR {displayTotal?.toLocaleString()}</p>
                          <p className="text-xs text-muted-foreground">{order.items?.length || 0} items</p>
                        </div>
                      </div>
                      
                      {order.items && order.items.length > 0 && (
                        <div className="border-t border-border pt-3 mt-3">
                          <p className="text-xs font-medium text-muted-foreground mb-2">Items:</p>
                          <div className="space-y-1">
                            {order.items.slice(0, 3).map((item: any, index: number) => (
                              <div key={index} className="flex justify-between text-xs">
                                <span className="text-card-foreground">{item.productName} x {formatQuantity(item.quantity)}</span>
                                <span className="font-medium">PKR {(item.totalPrice || item.total)?.toLocaleString()}</span>
                              </div>
                            ))}
                            {order.items.length > 3 && (
                              <p className="text-xs text-muted-foreground">+{order.items.length - 3} more items</p>
                            )}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
