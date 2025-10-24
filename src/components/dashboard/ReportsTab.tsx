
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, TrendingUp, Package, DollarSign, Download, AlertTriangle } from "lucide-react";

interface ReportsTabProps {
  salesReport: any;
  inventoryReport: any;
  financialReport: any;
}

export function ReportsTab({ salesReport, inventoryReport, financialReport }: ReportsTabProps) {
  return (
    <div className="space-y-6">
      {/* Report Generation Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-6 w-6 text-blue-500" />
            Business Reports
          </CardTitle>
          <CardDescription>
            Comprehensive business analytics and detailed reports
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <Button className="h-20 flex flex-col gap-2" variant="outline">
              <TrendingUp className="h-6 w-6" />
              <div className="text-center">
                <p className="font-medium">Sales Reports</p>
                <p className="text-xs text-muted-foreground">Revenue & order analysis</p>
              </div>
            </Button>
            <Button className="h-20 flex flex-col gap-2" variant="outline">
              <Package className="h-6 w-6" />
              <div className="text-center">
                <p className="font-medium">Inventory Reports</p>
                <p className="text-xs text-muted-foreground">Stock & movement analysis</p>
              </div>
            </Button>
            <Button className="h-20 flex flex-col gap-2" variant="outline">
              <DollarSign className="h-6 w-6" />
              <div className="text-center">
                <p className="font-medium">Financial Reports</p>
                <p className="text-xs text-muted-foreground">P&L and cash flow</p>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Sales Report Summary */}
      {salesReport && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-500" />
                Sales Report Summary
              </div>
              <Button size="sm" variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="text-center p-4 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20 rounded-lg">
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  Rs. {salesReport.data?.summary?.totalRevenue?.toLocaleString() || '0'}
                </p>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
              </div>
              <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20 rounded-lg">
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {salesReport.data?.summary?.totalOrders?.toLocaleString() || '0'}
                </p>
                <p className="text-sm text-muted-foreground">Total Orders</p>
              </div>
              <div className="text-center p-4 bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-950/20 dark:to-orange-900/20 rounded-lg">
                <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  Rs. {salesReport.data?.summary?.avgOrderValue?.toLocaleString() || '0'}
                </p>
                <p className="text-sm text-muted-foreground">Avg Order Value</p>
              </div>
              <div className="text-center p-4 bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-950/20 dark:to-purple-900/20 rounded-lg">
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {salesReport.data?.summary?.growth?.toFixed(1) || '0'}%
                </p>
                <p className="text-sm text-muted-foreground">Growth Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Inventory Report Summary */}
      {inventoryReport && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-blue-500" />
                Inventory Report Summary
              </div>
              <Button size="sm" variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20 rounded-lg">
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {inventoryReport.data?.inventoryReport?.totalProducts || '0'}
                </p>
                <p className="text-sm text-muted-foreground">Total Products</p>
              </div>
              <div className="text-center p-4 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20 rounded-lg">
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  Rs. {inventoryReport.data?.inventoryReport?.totalValue?.toLocaleString() || '0'}
                </p>
                <p className="text-sm text-muted-foreground">Total Value</p>
              </div>
              <div className="text-center p-4 bg-gradient-to-r from-red-50 to-red-100 dark:from-red-950/20 dark:to-red-900/20 rounded-lg">
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {inventoryReport.data?.inventoryReport?.lowStockItems?.length || '0'}
                </p>
                <p className="text-sm text-muted-foreground">Low Stock Items</p>
              </div>
            </div>

            {/* Low Stock Items Alert */}
            {inventoryReport.data?.inventoryReport?.lowStockItems?.length > 0 && (
              <div className="mt-6">
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  Critical Stock Alerts
                </h4>
                <div className="space-y-2">
                  {inventoryReport.data?.inventoryReport?.lowStockItems?.map((item, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
                      <div>
                        <p className="font-medium">{item.productName}</p>
                        <p className="text-sm text-muted-foreground">
                          Current: {item.currentStock} | Min: {item.minStock}
                        </p>
                      </div>
                      <Badge variant="destructive">
                        Reorder {item.reorderQuantity}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
