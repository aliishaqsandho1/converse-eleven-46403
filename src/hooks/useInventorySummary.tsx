
import { useState, useEffect } from 'react';
import { inventoryApi } from '@/services/api';
import { stockManagementService } from '@/services/stockManagementService';

interface InventorySummary {
  totalProducts: number;
  totalValue: number;
  lowStockItems: number;
  outOfStockItems: number;
}

export function useInventorySummary() {
  const [summary, setSummary] = useState<InventorySummary>({
    totalProducts: 0,
    totalValue: 0,
    lowStockItems: 0,
    outOfStockItems: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSummary = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get inventory data
      const response = await inventoryApi.getAll({
        limit: 10000 // Get all products for accurate summary
      });
      
      if (response.success) {
        const inventoryData = response.data?.inventory || response.data || [];
        const inventoryArray = Array.isArray(inventoryData) ? inventoryData : [];
        
        if (response.data?.summary) {
          // Use API summary if available
          setSummary(response.data.summary);
        } else {
          // Calculate summary from inventory data using consistent logic
          const totalProducts = inventoryArray.length;
          
          // Use the stock management service for consistent calculations
          const { totalValue } = await stockManagementService.calculateInventoryValue();
          
          const lowStockItems = inventoryArray.filter(item => {
            const currentStock = item.currentStock || item.stock || 0;
            const minStock = item.minStock || 0;
            return currentStock <= minStock && currentStock > 0;
          }).length;
          
          const outOfStockItems = inventoryArray.filter(item => {
            const currentStock = item.currentStock || item.stock || 0;
            return currentStock === 0;
          }).length;
          
          setSummary({
            totalProducts,
            totalValue,
            lowStockItems,
            outOfStockItems
          });
        }
        
        // Also refresh stock alerts
        await stockManagementService.checkStockAlerts();
      } else {
        throw new Error('Failed to fetch inventory summary');
      }
    } catch (err) {
      console.error('Failed to fetch inventory summary:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  return {
    summary,
    loading,
    error,
    refetch: fetchSummary
  };
}
