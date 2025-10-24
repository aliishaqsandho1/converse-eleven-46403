
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Calendar, Package, User, DollarSign, Trash2 } from "lucide-react";
import { getPendingOrders, removePendingOrder } from "@/data/storeData";
import { useToast } from "@/hooks/use-toast";
import { formatQuantity } from "@/lib/utils";

interface PendingOrdersModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PendingOrdersModal({ open, onOpenChange }: PendingOrdersModalProps) {
  const { toast } = useToast();
  const pendingOrders = getPendingOrders();

  const handleRemoveOrder = (orderId: string) => {
    removePendingOrder(orderId);
    toast({
      title: "Order Removed",
      description: "Pending order has been removed successfully",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-blue-600" />
            Pending Orders ({pendingOrders.length})
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {pendingOrders.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500 text-lg">No pending orders</p>
              <p className="text-gray-400 text-sm">All orders have been processed</p>
            </div>
          ) : (
            pendingOrders.map((order) => (
              <div key={order.id} className="border rounded-lg p-4 hover:shadow-sm transition-shadow">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-lg">Order #{order.id}</h3>
                      <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">
                        {order.status}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        <span>{order.customer}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>{order.orderDate}</span>
                      </div>
                    </div>
                    
                    {order.notes && (
                      <p className="text-sm text-gray-500 italic">"{order.notes}"</p>
                    )}
                  </div>
                  
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-xl font-bold text-green-600 mb-2">
                      <DollarSign className="h-5 w-5" />
                      PKR {order.totalAmount.toLocaleString()}
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-600 border-red-300 hover:bg-red-50"
                      onClick={() => handleRemoveOrder(order.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Remove
                    </Button>
                  </div>
                </div>
                
                <Separator className="my-3" />
                
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-700">Order Items:</h4>
                  {order.items.map((item: any, index: number) => (
                    <div key={index} className="flex justify-between items-center text-sm bg-gray-50 p-2 rounded">
                      <div className="flex-1">
                        <span className="font-medium">{item.productName}</span>
                        <span className="text-gray-500 ml-2">x {formatQuantity(item.quantity)}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-medium">PKR {item.total.toLocaleString()}</span>
                        <div className="text-xs text-gray-500">
                          @ PKR {item.unitPrice} each
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
