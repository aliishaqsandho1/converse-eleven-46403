import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Package, AlertTriangle, TrendingUp } from "lucide-react";

interface FilteredProductsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  filterType: 'lowStock' | 'outOfStock' | 'inStock' | 'all';
  onFetchAllProducts?: () => Promise<any[]>;
  products?: any[]; // Add optional products prop
}

export const FilteredProductsModal: React.FC<FilteredProductsModalProps> = ({
  open,
  onOpenChange,
  title,
  filterType,
  onFetchAllProducts,
  products = [] // Default to empty array
}) => {
  const [allProducts, setAllProducts] = useState<any[]>(products);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && onFetchAllProducts) {
      fetchAllProducts();
    } else if (products.length > 0) {
      setAllProducts(products);
    }
  }, [open, onFetchAllProducts, products]);

  const fetchAllProducts = async () => {
    if (!onFetchAllProducts) return;
    
    try {
      setLoading(true);
      const fetchedProducts = await onFetchAllProducts();
      setAllProducts(Array.isArray(fetchedProducts) ? fetchedProducts : []);
    } catch (error) {
      console.error('Failed to fetch all products:', error);
      setAllProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredProducts = () => {
    switch (filterType) {
      case 'lowStock':
        return allProducts.filter(product => 
          (product.stock || product.currentStock || 0) <= (product.minStock || 0) && 
          (product.stock || product.currentStock || 0) > 0
        );
      case 'outOfStock':
        return allProducts.filter(product => (product.stock || product.currentStock || 0) === 0);
      case 'inStock':
        return allProducts.filter(product => (product.stock || product.currentStock || 0) > (product.minStock || 0));
      default:
        return allProducts;
    }
  };

  const filteredProducts = getFilteredProducts();

  const getStockStatus = (currentStock: number, minStock: number) => {
    if (currentStock === 0) return { status: 'Out of Stock', color: 'bg-red-500 text-white', icon: AlertTriangle };
    if (currentStock <= minStock) return { status: 'Low Stock', color: 'bg-orange-500 text-white', icon: AlertTriangle };
    return { status: 'In Stock', color: 'bg-green-500 text-white', icon: TrendingUp };
  };

  const formatCurrency = (value: number | undefined | null) => {
    if (value === undefined || value === null || isNaN(value)) {
      return '0';
    }
    return Math.round(value).toLocaleString();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-blue-600" />
            {title} ({loading ? 'Loading...' : `${filteredProducts.length} products`})
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-3 animate-pulse" />
              <div className="text-muted-foreground">Loading all products...</div>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <div className="text-muted-foreground">No products found for this filter</div>
            </div>
          ) : (
            <div className="grid gap-3">
              {filteredProducts.map((product, index) => {
                const currentStock = product.stock || product.currentStock || 0;
                const minStock = product.minStock || 0;
                const stockStatus = getStockStatus(currentStock, minStock);
                const StatusIcon = stockStatus.icon;

                return (
                  <Card key={product.id || index} className="border-l-4 border-l-blue-500">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h4 className="font-medium text-foreground">{product.name || product.productName}</h4>
                          <p className="text-sm text-muted-foreground">SKU: {product.sku}</p>
                          <p className="text-sm text-muted-foreground">Category: {product.category}</p>
                        </div>
                        <Badge className={`text-xs ${stockStatus.color} flex items-center gap-1`}>
                          <StatusIcon className="h-3 w-3" />
                          {stockStatus.status}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <div className="font-medium text-blue-600">{currentStock} {product.unit || 'units'}</div>
                          <div className="text-muted-foreground">Current Stock</div>
                        </div>
                        <div>
                          <div className="font-medium text-orange-600">{minStock} {product.unit || 'units'}</div>
                          <div className="text-muted-foreground">Min Stock</div>
                        </div>
                        <div>
                          <div className="font-medium text-green-600">PKR {formatCurrency(product.price || product.value)}</div>
                          <div className="text-muted-foreground">Price/Value</div>
                        </div>
                      </div>
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
