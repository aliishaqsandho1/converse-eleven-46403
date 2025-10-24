import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { stockManagementService, StockAlert, StockMovement, StockValidationResult } from '@/services/stockManagementService';

export const useStockManagement = () => {
  const { toast } = useToast();
  const [alerts, setAlerts] = useState<StockAlert[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(false);

  // Handle order status changes - Let the API handle stock management
  const handleOrderStatusChange = async (
    orderId: number,
    orderNumber: string,
    orderItems: any[],
    newStatus: string,
    oldStatus: string
  ) => {
    try {
      setLoading(true);
      console.log(`Processing order status change: ${oldStatus} -> ${newStatus} for order ${orderNumber}`);
      
      // The API will handle stock adjustments automatically
      // We just need to track that the adjustment was made
      const result = await stockManagementService.handleOrderStatusChange(
        orderId,
        orderNumber,
        orderItems,
        newStatus,
        oldStatus
      );

      if (result.success) {
        toast({
          title: "Order Updated",
          description: "Order status updated successfully",
        });
        
        // Refresh alerts after potential stock change
        await refreshAlerts();
      } else {
        toast({
          title: "Update Warning",
          description: result.message,
          variant: "destructive"
        });
      }
      
      return result;
    } catch (error) {
      console.error('Error handling order status change:', error);
      toast({
        title: "Error",
        description: "Failed to process order status change",
        variant: "destructive"
      });
      return { success: false, message: 'Error updating order status' };
    } finally {
      setLoading(false);
    }
  };

  // Validate stock before operations
  const validateStock = async (productId: number, quantity: number): Promise<StockValidationResult> => {
    try {
      return await stockManagementService.validateStockAvailability(productId, quantity);
    } catch (error) {
      console.error('Stock validation error:', error);
      return {
        isValid: false,
        availableStock: 0,
        requestedQuantity: quantity,
        message: 'Error validating stock'
      };
    }
  };

  // Deduct stock for sales
  const deductStock = async (
    productId: number,
    quantity: number,
    orderId?: number,
    orderNumber?: string
  ) => {
    try {
      setLoading(true);
      const result = await stockManagementService.deductStock(productId, quantity, orderId, orderNumber);
      
      if (result.success) {
        toast({
          title: "Stock Updated",
          description: `Stock deducted successfully. New stock: ${result.newStock}`,
        });
        
        await refreshAlerts();
      } else {
        toast({
          title: "Stock Deduction Failed",
          description: result.message,
          variant: "destructive"
        });
      }
      
      return result;
    } catch (error) {
      console.error('Stock deduction error:', error);
      toast({
        title: "Error",
        description: "Failed to deduct stock",
        variant: "destructive"
      });
      return { success: false, message: 'Error deducting stock' };
    } finally {
      setLoading(false);
    }
  };

  // Add stock for purchases/returns
  const addStock = async (
    productId: number,
    quantity: number,
    reason: string = 'Stock addition',
    reference?: string
  ) => {
    try {
      setLoading(true);
      const result = await stockManagementService.addStock(productId, quantity, reason, reference);
      
      if (result.success) {
        toast({
          title: "Stock Updated",
          description: `Stock added successfully. New stock: ${result.newStock}`,
        });
        
        await refreshAlerts();
      } else {
        toast({
          title: "Stock Addition Failed",
          description: result.message,
          variant: "destructive"
        });
      }
      
      return result;
    } catch (error) {
      console.error('Stock addition error:', error);
      toast({
        title: "Error",
        description: "Failed to add stock",
        variant: "destructive"
      });
      return { success: false, message: 'Error adding stock' };
    } finally {
      setLoading(false);
    }
  };

  // Refresh stock alerts
  const refreshAlerts = async () => {
    try {
      const newAlerts = await stockManagementService.checkStockAlerts();
      setAlerts(newAlerts);
      
      newAlerts.forEach(alert => {
        if (alert.severity === 'critical') {
          toast({
            title: "Critical Stock Alert",
            description: `${alert.productName} is out of stock!`,
            variant: "destructive"
          });
        }
      });
      
      return newAlerts;
    } catch (error) {
      console.error('Error refreshing alerts:', error);
      return [];
    }
  };

  // Get current stock level
  const getCurrentStock = async (productId: number): Promise<number> => {
    try {
      return await stockManagementService.getCurrentStock(productId);
    } catch (error) {
      console.error('Error getting current stock:', error);
      return 0;
    }
  };

  // Calculate inventory value
  const calculateInventoryValue = async () => {
    try {
      return await stockManagementService.calculateInventoryValue();
    } catch (error) {
      console.error('Error calculating inventory value:', error);
      return { totalValue: 0, totalProducts: 0 };
    }
  };

  // Bulk operations
  const bulkStockOperation = async (operations: Array<{
    productId: number;
    quantity: number;
    type: 'add' | 'deduct';
    reason?: string;
    reference?: string;
  }>) => {
    try {
      setLoading(true);
      const result = await stockManagementService.bulkStockOperation(operations);
      
      if (result.success) {
        toast({
          title: "Bulk Operation Completed",
          description: "All stock operations completed successfully",
        });
      } else {
        const failedCount = result.results.filter(r => !r.success).length;
        toast({
          title: "Bulk Operation Partial Success",
          description: `${failedCount} operations failed. Check the details.`,
          variant: "destructive"
        });
      }
      
      await refreshAlerts();
      
      return result;
    } catch (error) {
      console.error('Bulk operation error:', error);
      toast({
        title: "Bulk Operation Failed",
        description: "Failed to complete bulk operations",
        variant: "destructive"
      });
      return { success: false, results: [] };
    } finally {
      setLoading(false);
    }
  };

  // Initialize alerts on mount
  useEffect(() => {
    refreshAlerts();
  }, []);

  // Update movements from service
  useEffect(() => {
    const interval = setInterval(() => {
      setMovements(stockManagementService.getMovements());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return {
    // State
    alerts,
    movements,
    loading,
    
    // Actions
    handleOrderStatusChange,
    validateStock,
    deductStock,
    addStock,
    refreshAlerts,
    getCurrentStock,
    calculateInventoryValue,
    bulkStockOperation
  };
};
