
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { User, Package, Calendar, DollarSign, TrendingUp, AlertTriangle } from "lucide-react";
import { salesApi } from "@/services/api";

interface ProductDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: any;
}

export const ProductDetailsModal: React.FC<ProductDetailsModalProps> = ({
  open,
  onOpenChange,
  product
}) => {
  const [salesData, setSalesData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [customerStats, setCustomerStats] = useState<{[key: string]: any}>({});

  useEffect(() => {
    if (open && product) {
      fetchProductSalesData();
    }
  }, [open, product]);

  const fetchProductSalesData = async () => {
    try {
      setLoading(true);
      // Fetch ALL sales data without any date restrictions to get complete history
      const response = await salesApi.getAll({ 
        limit: 5000, // Increased limit to ensure we get complete history
        // Remove any date filters to get all-time data
      });
      if (response.success) {
        const allSales = response.data?.sales || response.data || [];
        
        // Filter sales that contain this product
        const productSales = allSales.filter((sale: any) => 
          sale.items && sale.items.some((item: any) => item.productId === product.id)
        );

        // Extract only the relevant items and add sale info
        const relevantSales = productSales.map((sale: any) => {
          const productItem = sale.items.find((item: any) => item.productId === product.id);
          return {
            ...productItem,
            saleDate: sale.saleDate || sale.createdAt,
            customerName: sale.customerName || sale.customer?.name || 'Walk-in Customer',
            customerId: sale.customerId,
            saleId: sale.id,
            paymentMethod: sale.paymentMethod,
            status: sale.status,
            // Calculate proper values
            actualUnitPrice: productItem?.unitPrice || productItem?.price || product.price,
            actualTotalPrice: (productItem?.unitPrice || productItem?.price || product.price) * (productItem?.quantity || 1)
          };
        });

        setSalesData(relevantSales);

        // Calculate customer statistics with proper values
        const stats: {[key: string]: any} = {};
        relevantSales.forEach((sale: any) => {
          const customerKey = sale.customerName || 'Walk-in Customer';
          if (!stats[customerKey]) {
            stats[customerKey] = {
              name: customerKey,
              totalQuantity: 0,
              totalValue: 0,
              purchaseCount: 0,
              averagePrice: 0,
              lastPurchase: sale.saleDate
            };
          }
          
          const quantity = sale.quantity || 1;
          const unitPrice = sale.actualUnitPrice || 0;
          const totalPrice = sale.actualTotalPrice || (unitPrice * quantity);
          
          stats[customerKey].totalQuantity += quantity;
          stats[customerKey].totalValue += totalPrice;
          stats[customerKey].purchaseCount += 1;
          
          // Calculate average price per unit
          if (stats[customerKey].totalQuantity > 0) {
            stats[customerKey].averagePrice = stats[customerKey].totalValue / stats[customerKey].totalQuantity;
          }
          
          // Keep the most recent purchase date
          if (new Date(sale.saleDate) > new Date(stats[customerKey].lastPurchase)) {
            stats[customerKey].lastPurchase = sale.saleDate;
          }
        });

        setCustomerStats(stats);
      }
    } catch (error) {
      console.error('Failed to fetch product sales data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'N/A';
      return date.toLocaleDateString('en-PK', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'N/A';
    }
  };

  const formatCurrency = (value: number | undefined | null) => {
    if (value === undefined || value === null || isNaN(value)) {
      return '0';
    }
    return Math.round(value).toLocaleString();
  };

  // Calculate totals with proper values
  const totalSold = salesData.reduce((sum, sale) => sum + (sale.quantity || 0), 0);
  const totalRevenue = salesData.reduce((sum, sale) => sum + (sale.actualTotalPrice || 0), 0);
  const uniqueCustomers = Object.keys(customerStats).length;
  const averageOrderValue = salesData.length > 0 ? totalRevenue / salesData.length : 0;
  const mostRecentSale = salesData.length > 0 ? 
    salesData.sort((a, b) => new Date(b.saleDate).getTime() - new Date(a.saleDate).getTime())[0] : null;

  if (!product) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-blue-600" />
            {product.name}
            {product.incompleteQuantity && (
              <Badge variant="outline" className="text-orange-600 border-orange-300">
                <AlertTriangle className="h-3 w-3 mr-1" />
                Incomplete Info
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Product Basic Info */}
          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">SKU</div>
                  <div className="font-medium">{product.sku || 'N/A'}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Category</div>
                  <div className="font-medium">{product.category || 'N/A'}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Price</div>
                  <div className="font-medium text-green-600">PKR {formatCurrency(product.price)}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Stock</div>
                  <div className="font-medium">
                    {product.incompleteQuantity ? (
                      <span className="text-orange-600">Unknown</span>
                    ) : (
                      `${product.stock || 0} ${product.unit || 'units'}`
                    )}
                  </div>
                </div>
              </div>
              {product.quantityNote && (
                <div className="mt-3 p-2 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-700 rounded">
                  <div className="text-sm text-orange-800 dark:text-orange-200">
                    <strong>Note:</strong> {product.quantityNote}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Sales Overview */}
          <Card>
            <CardContent className="p-4">
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Sales Overview
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{totalSold} {product.unit || 'units'}</div>
                  <div className="text-sm text-muted-foreground">Total Sold</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">PKR {formatCurrency(totalRevenue)}</div>
                  <div className="text-sm text-muted-foreground">Total Revenue</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{uniqueCustomers}</div>
                  <div className="text-sm text-muted-foreground">Unique Customers</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{salesData.length}</div>
                  <div className="text-sm text-muted-foreground">Total Orders</div>
                </div>
              </div>
              {mostRecentSale && (
                <div className="mt-4 pt-3 border-t">
                  <div className="text-sm text-muted-foreground">Last Purchase: {formatDate(mostRecentSale.saleDate)} by {mostRecentSale.customerName}</div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Customer Purchase Summary */}
          {Object.keys(customerStats).length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <User className="h-5 w-5" />
                Customer Purchase Summary
              </h3>
              <div className="grid gap-3">
                {Object.values(customerStats).map((customer: any, index) => (
                  <Card key={index} className="border-l-4 border-l-blue-500">
                    <CardContent className="p-3">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="font-medium">{customer.name}</div>
                          <div className="text-sm text-muted-foreground">
                            Last purchase: {formatDate(customer.lastPurchase)}
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <div className="font-medium text-blue-600">{customer.totalQuantity} {product.unit || 'units'}</div>
                          <div className="text-muted-foreground">Total Quantity</div>
                        </div>
                        <div>
                          <div className="font-medium text-green-600">PKR {formatCurrency(customer.totalValue)}</div>
                          <div className="text-muted-foreground">Total Value</div>
                        </div>
                        <div>
                          <div className="font-medium text-purple-600">PKR {formatCurrency(customer.averagePrice)}</div>
                          <div className="text-muted-foreground">Avg. Price/{product.unit || 'unit'}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Recent Sales History */}
          {salesData.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Recent Sales History
              </h3>
              <div className="space-y-2">
                {salesData
                  .sort((a, b) => new Date(b.saleDate).getTime() - new Date(a.saleDate).getTime())
                  .slice(0, 10)
                  .map((sale, index) => (
                  <Card key={index}>
                    <CardContent className="p-3">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <div className="font-medium">{sale.customerName || 'Walk-in Customer'}</div>
                            <div className="text-sm text-muted-foreground">{formatDate(sale.saleDate)}</div>
                            <div className="flex gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                {sale.paymentMethod || 'cash'}
                              </Badge>
                              <Badge variant={sale.status === 'completed' ? 'default' : 'secondary'} className="text-xs">
                                {sale.status || 'completed'}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{sale.quantity || 0} {product.unit || 'units'}</div>
                          <div className="text-sm text-green-600">PKR {formatCurrency(sale.actualUnitPrice)}/{product.unit || 'unit'}</div>
                          <div className="text-sm font-medium">Total: PKR {formatCurrency(sale.actualTotalPrice)}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {loading && (
            <div className="text-center py-8">
              <div className="text-muted-foreground">Loading sales data...</div>
            </div>
          )}

          {!loading && salesData.length === 0 && (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <div className="text-muted-foreground">No sales history found for this product</div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
