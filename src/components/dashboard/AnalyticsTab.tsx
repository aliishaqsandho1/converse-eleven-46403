
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Package, DollarSign, Users } from "lucide-react";

interface AnalyticsTabProps {
  stats: any;
}

export function AnalyticsTab({ stats }: AnalyticsTabProps) {
  return (
    <div className="space-y-6">
      {/* Enhanced Analytics Section */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-blue-500 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profit Margin</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {stats?.financial?.profitMargin?.toFixed(1) || '0'}%
            </div>
            <p className="text-xs text-muted-foreground">
              Net Profit: Rs. {stats?.financial?.netProfit?.toLocaleString() || '0'}
            </p>
            <div className="mt-2">
              <Badge variant={stats?.financial?.profitMargin > 10 ? "default" : "destructive"}>
                {stats?.financial?.profitMargin > 10 ? "Healthy" : "Needs Attention"}
              </Badge>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-green-500 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inventory Turnover</CardTitle>
            <Package className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {stats?.inventory?.inventoryTurnover?.toFixed(2) || '0'}
            </div>
            <p className="text-xs text-muted-foreground">
              Times per period
            </p>
            <div className="mt-2">
              <Badge variant={stats?.inventory?.inventoryTurnover > 1 ? "default" : "secondary"}>
                {stats?.inventory?.inventoryTurnover > 1 ? "Active" : "Slow"}
              </Badge>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-orange-500 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/20 dark:to-orange-900/20 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receivables</CardTitle>
            <DollarSign className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              Rs. {stats?.customers?.totalReceivables?.toLocaleString() || '0'}
            </div>
            <p className="text-xs text-muted-foreground">
              Outstanding amount
            </p>
            <div className="mt-2">
              <Badge variant={stats?.customers?.totalReceivables === 0 ? "default" : "destructive"}>
                {stats?.customers?.totalReceivables === 0 ? "All Clear" : "Pending"}
              </Badge>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-purple-500 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/20 dark:to-purple-900/20 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Daily Avg Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              Rs. {stats?.performance?.dailyAvgRevenue?.toLocaleString() || '0'}
            </div>
            <p className="text-xs text-muted-foreground">
              Average per day
            </p>
            <div className="mt-2">
              <Badge variant="outline">
                Monthly: Rs. {(stats?.performance?.dailyAvgRevenue * 30)?.toLocaleString() || '0'}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Customer Analytics */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-green-500" />
              Customer Analytics
            </CardTitle>
            <CardDescription>Customer distribution and value analysis</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {stats?.customers?.totalCustomers || 0}
                  </p>
                  <p className="text-sm text-muted-foreground">Total Customers</p>
                </div>
                <div className="text-center p-4 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20 rounded-lg">
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {stats?.customers?.newCustomersThisMonth || 0}
                  </p>
                  <p className="text-sm text-muted-foreground">New This Month</p>
                </div>
              </div>
              
              {/* Customer Types */}
              <div className="space-y-2">
                <p className="font-medium">Customer Types</p>
                {stats?.customers?.customerTypes?.map((type, index) => (
                  <div key={index} className="flex justify-between items-center p-2 bg-muted rounded">
                    <span className="capitalize">{type.type}</span>
                    <Badge variant="outline">{type.count}</Badge>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Customers</CardTitle>
            <CardDescription>Highest value customers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats?.customers?.topCustomers?.map((customer, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20 rounded-lg">
                  <div>
                    <p className="font-medium">{customer.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {customer.totalPurchases} purchases
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600 dark:text-green-400">
                      Rs. {customer.balance.toLocaleString()}
                    </p>
                  </div>
                </div>
              )) || <p className="text-muted-foreground">No customer data available</p>}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
