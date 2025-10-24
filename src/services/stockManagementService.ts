
import { inventoryApi } from './api';
import { useToast } from '@/hooks/use-toast';
import { apiConfig } from '@/utils/apiConfig';

export interface StockMovement {
  id?: number;
  productId: number;
  productName: string;
  type: 'sale' | 'purchase' | 'adjustment' | 'return' | 'damage';
  quantity: number;
  balanceBefore: number;
  balanceAfter: number;
  reason: string;
  reference?: string;
  orderId?: number;
  orderNumber?: string;
  createdAt: string;
  createdBy?: string;
}

export interface StockAlert {
  productId: number;
  productName: string;
  currentStock: number;
  minStock: number;
  type: 'low_stock' | 'out_of_stock';
  severity: 'warning' | 'critical';
}

export interface StockValidationResult {
  isValid: boolean;
  availableStock: number;
  requestedQuantity: number;
  shortfall?: number;
  message: string;
}

export interface OrderStockAdjustment {
  orderId: number;
  orderNumber: string;
  currentStatus: string;
  lastAdjustedStatus: string;
  stockAdjusted: boolean;
  adjustmentTimestamp: string;
}

class StockManagementService {
  private movements: StockMovement[] = [];
  private alerts: StockAlert[] = [];
  private orderAdjustments: Map<number, OrderStockAdjustment> = new Map();

  // Track order stock adjustments to prevent duplicates
  private trackOrderAdjustment(orderId: number, orderNumber: string, status: string) {
    this.orderAdjustments.set(orderId, {
      orderId,
      orderNumber,
      currentStatus: status,
      lastAdjustedStatus: status,
      stockAdjusted: true,
      adjustmentTimestamp: new Date().toISOString()
    });
  }

  // Check if order stock has already been adjusted for current status
  private isStockAlreadyAdjusted(orderId: number, newStatus: string, oldStatus: string): boolean {
    const adjustment = this.orderAdjustments.get(orderId);
    if (!adjustment) return false;
    
    // If moving from completed to cancelled, check if we already adjusted for this transition
    if (oldStatus === 'completed' && newStatus === 'cancelled') {
      return adjustment.lastAdjustedStatus === 'cancelled' && adjustment.currentStatus === 'cancelled';
    }
    
    // If moving from cancelled to completed, check if we already adjusted for this transition
    if (oldStatus === 'cancelled' && newStatus === 'completed') {
      return adjustment.lastAdjustedStatus === 'completed' && adjustment.currentStatus === 'completed';
    }
    
    return false;
  }

  // Handle order status change with proper stock management
  async handleOrderStatusChange(
    orderId: number,
    orderNumber: string,
    orderItems: any[],
    newStatus: string,
    oldStatus: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      console.log(`Handling order status change for order ${orderNumber}: ${oldStatus} -> ${newStatus}`);
      
      // Check if stock adjustment is already done for this status change
      if (this.isStockAlreadyAdjusted(orderId, newStatus, oldStatus)) {
        console.log(`Stock already adjusted for order ${orderNumber} status change: ${oldStatus} -> ${newStatus}`);
        return {
          success: true,
          message: 'Stock already adjusted for this status change'
        };
      }

      // For completed to cancelled: stock will be restored by the API
      // For cancelled to completed: stock will be deducted by the API
      // The API handles stock management automatically based on status changes
      
      this.trackOrderAdjustment(orderId, orderNumber, newStatus);

      return {
        success: true,
        message: 'Order status and stock updated successfully'
      };
      
    } catch (error) {
      console.error('Error handling order status change:', error);
      return {
        success: false,
        message: 'Error updating stock for status change'
      };
    }
  }

  // Validate stock availability before operations
  async validateStockAvailability(productId: number, requestedQuantity: number): Promise<StockValidationResult> {
    try {
      // Get product details from API
      const response = await fetch(`${apiConfig.getBaseUrl()}/products/${productId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!response.ok) {
        return {
          isValid: false,
          availableStock: 0,
          requestedQuantity,
          message: 'Product not found'
        };
      }

      const result = await response.json();
      const product = result.data || result;
      const availableStock = product.stock || 0;

      if (requestedQuantity <= availableStock) {
        return {
          isValid: true,
          availableStock,
          requestedQuantity,
          message: 'Stock available'
        };
      } else {
        return {
          isValid: false,
          availableStock,
          requestedQuantity,
          shortfall: requestedQuantity - availableStock,
          message: `Insufficient stock. Available: ${availableStock}, Requested: ${requestedQuantity}`
        };
      }
    } catch (error) {
      console.error('Stock validation error:', error);
      return {
        isValid: false,
        availableStock: 0,
        requestedQuantity,
        message: 'Error validating stock'
      };
    }
  }

  // Deduct stock for sales - Use inventory restock API with negative quantity
  async deductStock(
    productId: number, 
    quantity: number, 
    orderId?: number, 
    orderNumber?: string
  ): Promise<{ success: boolean; message: string; newStock?: number }> {
    try {
      // First validate stock availability
      const validation = await this.validateStockAvailability(productId, quantity);
      
      if (!validation.isValid) {
        return {
          success: false,
          message: validation.message
        };
      }

      // Use inventory restock API with negative quantity to deduct stock
      const response = await fetch(`${apiConfig.getBaseUrl()}/inventory/restock`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: productId,
          quantity: -quantity, // Negative quantity to deduct
          notes: `Stock deducted for sale${orderNumber ? ` - Order ${orderNumber}` : ''}`,
          purchaseOrderId: orderId
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        return {
          success: false,
          message: errorData.message || 'Failed to deduct stock'
        };
      }

      const result = await response.json();
      
      if (result.success) {
        // Record movement
        await this.recordMovement({
          productId,
          productName: result.data?.productName || 'Unknown Product',
          type: 'sale',
          quantity: -quantity,
          balanceBefore: validation.availableStock,
          balanceAfter: validation.availableStock - quantity,
          reason: `Stock deducted for sale${orderNumber ? ` - Order ${orderNumber}` : ''}`,
          reference: orderNumber,
          orderId,
          orderNumber,
          createdAt: new Date().toISOString()
        });

        return {
          success: true,
          message: 'Stock deducted successfully',
          newStock: validation.availableStock - quantity
        };
      } else {
        return {
          success: false,
          message: result.message || 'Failed to deduct stock'
        };
      }
    } catch (error) {
      console.error('Stock deduction error:', error);
      return {
        success: false,
        message: 'Error deducting stock'
      };
    }
  }

  // Add stock for purchases/returns
  async addStock(
    productId: number, 
    quantity: number, 
    reason: string = 'Stock addition',
    reference?: string
  ): Promise<{ success: boolean; message: string; newStock?: number }> {
    try {
      // Use inventory restock API
      const response = await fetch(`${apiConfig.getBaseUrl()}/inventory/restock`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: productId,
          quantity: quantity,
          notes: reason
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        return {
          success: false,
          message: errorData.message || 'Failed to add stock'
        };
      }

      const result = await response.json();
      
      if (result.success) {
        const newStock = result.data?.newStock || 0;
        
        // Record movement
        await this.recordMovement({
          productId,
          productName: result.data?.productName || 'Unknown Product',
          type: 'purchase',
          quantity: quantity,
          balanceBefore: newStock - quantity,
          balanceAfter: newStock,
          reason,
          reference,
          createdAt: new Date().toISOString()
        });

        return {
          success: true,
          message: 'Stock added successfully',
          newStock
        };
      } else {
        return {
          success: false,
          message: result.message || 'Failed to add stock'
        };
      }
    } catch (error) {
      console.error('Stock addition error:', error);
      return {
        success: false,
        message: 'Error adding stock'
      };
    }
  }

  // Record stock movement
  private async recordMovement(movement: Omit<StockMovement, 'id'>): Promise<void> {
    try {
      // In a real application, this would save to database
      console.log('Recording stock movement:', movement);
      this.movements.push({ ...movement, id: Date.now() });
    } catch (error) {
      console.error('Error recording stock movement:', error);
    }
  }

  // Check and generate stock alerts
  async checkStockAlerts(productId?: number): Promise<StockAlert[]> {
    try {
      const params = productId ? { productId } : { lowStock: true };
      const response = await inventoryApi.getAll(params);
      
      if (response.success) {
        const inventory = Array.isArray(response.data) ? response.data : response.data?.inventory || [];
        const alerts: StockAlert[] = [];

        inventory.forEach((item: any) => {
          const currentStock = item.currentStock || item.stock || 0;
          const minStock = item.minStock || 0;

          if (currentStock === 0) {
            alerts.push({
              productId: item.productId || item.id,
              productName: item.productName || item.name,
              currentStock,
              minStock,
              type: 'out_of_stock',
              severity: 'critical'
            });
          } else if (currentStock <= minStock) {
            alerts.push({
              productId: item.productId || item.id,
              productName: item.productName || item.name,
              currentStock,
              minStock,
              type: 'low_stock',
              severity: 'warning'
            });
          }
        });

        this.alerts = alerts;
        return alerts;
      }
      
      return [];
    } catch (error) {
      console.error('Error checking stock alerts:', error);
      return [];
    }
  }

  // Get current stock level
  async getCurrentStock(productId: number): Promise<number> {
    try {
      const response = await fetch(`${apiConfig.getBaseUrl()}/products/${productId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        const result = await response.json();
        const product = result.data || result;
        return product.stock || 0;
      }
      return 0;
    } catch (error) {
      console.error('Error getting current stock:', error);
      return 0;
    }
  }

  // Calculate total inventory value
  async calculateInventoryValue(): Promise<{ totalValue: number; totalProducts: number }> {
    try {
      const response = await inventoryApi.getAll({ limit: 10000 });
      
      if (response.success) {
        const inventory = Array.isArray(response.data) ? response.data : response.data?.inventory || [];
        
        let totalValue = 0;
        let totalProducts = 0;

        inventory.forEach((item: any) => {
          const stock = item.currentStock || item.stock || 0;
          const costPrice = item.costPrice || item.price || 0;
          totalValue += stock * costPrice;
          totalProducts++;
        });

        return { totalValue, totalProducts };
      }
      
      return { totalValue: 0, totalProducts: 0 };
    } catch (error) {
      console.error('Error calculating inventory value:', error);
      return { totalValue: 0, totalProducts: 0 };
    }
  }

  // Bulk stock operations for multiple products
  async bulkStockOperation(
    operations: Array<{
      productId: number;
      quantity: number;
      type: 'add' | 'deduct';
      reason?: string;
      reference?: string;
    }>
  ): Promise<{ success: boolean; results: Array<{ productId: number; success: boolean; message: string }> }> {
    const results = [];
    let allSuccessful = true;

    for (const operation of operations) {
      try {
        let result;
        
        if (operation.type === 'deduct') {
          result = await this.deductStock(
            operation.productId, 
            operation.quantity, 
            undefined, 
            operation.reference
          );
        } else {
          result = await this.addStock(
            operation.productId, 
            operation.quantity, 
            operation.reason || 'Bulk operation',
            operation.reference
          );
        }

        results.push({
          productId: operation.productId,
          success: result.success,
          message: result.message
        });

        if (!result.success) {
          allSuccessful = false;
        }
      } catch (error) {
        console.error(`Bulk operation error for product ${operation.productId}:`, error);
        results.push({
          productId: operation.productId,
          success: false,
          message: 'Operation failed'
        });
        allSuccessful = false;
      }
    }

    return { success: allSuccessful, results };
  }

  // Get stock movements history
  getMovements(): StockMovement[] {
    return this.movements;
  }

  // Get current alerts
  getAlerts(): StockAlert[] {
    return this.alerts;
  }
}

export const stockManagementService = new StockManagementService();
