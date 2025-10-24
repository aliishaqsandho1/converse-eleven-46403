import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PincodeProtection } from "@/components/PincodeProtection"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, AreaChart, Area } from "recharts"
import { DollarSign, TrendingUp, Package, Users, AlertTriangle, CheckCircle, ShoppingCart, Target, ArrowUpDown, Download, FileText, Calendar, CreditCard, Package2, Activity, Banknote } from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import { dashboardApi } from "@/services/api"
import { reportsApi } from "@/services/reportsApi"
import { Legend, ReferenceLine } from "recharts";
function formatNumber(value) {
  const num = Number(value);
  if (isNaN(num)) return '0';

  if (num >= 10000000) {
    return (num / 10000000).toFixed(2) + ' Cr';
  } else if (num >= 100000) {
    return (num / 100000).toFixed(2) + ' Lac';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(2) + ' K';
  } else {
    return num.toFixed(0);
  }
}

// Enhanced Chart configurations with beautiful colors
const cashFlowChartConfig = {
  inflow: {
    label: "Cash Inflow",
    color: "#10b981",
  },
  outflow: {
    label: "Cash Outflow",
    color: "#ef4444",
  },
  net: {
    label: "Net Cash Flow",
    color: "#3b82f6",
  },
}
const defaultColors = [
  "#10b981", // Emerald
  "#3b82f6", // Blue
  "#f59e0b", // Amber
  "#ef4444", // Red
  "#8b5cf6", // Purple
  "#ec4899", // Pink
  "#06b6d4", // Cyan
];
const categoryChartConfig = {
  sheets: { label: "Sheets", color: "#3b82f6" },
  uncategorized: { label: "Uncategorized", color: "#ef4444" },
  new: { label: "New", color: "#10b981" },
  electronics: { label: "Electronics", color: "#f59e0b" },
  plus: { label: "Plus", color: "#8b5cf6" },
}

const salesChartConfig = {
  sales: {
    label: "Actual Sales",
    color: "#10b981",
  },
  target: {
    label: "Target",
    color: "#f59e0b",
  },
}

const inventoryChartConfig = {
  stock: {
    label: "Current Stock",
    color: "#3b82f6",
  },
  sold: {
    label: "Units Sold",
    color: "#10b981",
  },
  reorderLevel: {
    label: "Reorder Level",
    color: "#ef4444",
  },
}

export default function Dashboard() {
  // Fetch dashboard data
  const { data: enhancedStats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard-enhanced-stats'],
    queryFn: dashboardApi.getEnhancedStats,
  })

  const { data: categoryPerformance, isLoading: categoryLoading } = useQuery({
    queryKey: ['dashboard-category-performance'],
    queryFn: dashboardApi.getCategoryPerformance,
  })

  const { data: dailySales, isLoading: salesLoading } = useQuery({
    queryKey: ['dashboard-daily-sales'],
    queryFn: dashboardApi.getDailySales,
  })

  const { data: inventoryStatus, isLoading: inventoryLoading } = useQuery({
    queryKey: ['dashboard-inventory-status'],
    queryFn: dashboardApi.getInventoryStatus,
  })

  // Fetch reports data for Analytics and Reports tabs
  const { data: salesReport, isLoading: salesReportLoading } = useQuery({
    queryKey: ['sales-report-monthly'],
    queryFn: () => reportsApi.getSalesReport({ period: 'daily' }),
  })

  const { data: inventoryReport, isLoading: inventoryReportLoading } = useQuery({
    queryKey: ['inventory-report'],
    queryFn: reportsApi.getInventoryReport,
  })

  const { data: financialReport, isLoading: financialReportLoading } = useQuery({
    queryKey: ['financial-report'],
    queryFn: () => reportsApi.getFinancialReport({ period: 'monthly', year: 2025 }),
  })

  // Loading state
  if (statsLoading || categoryLoading || salesLoading || inventoryLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  const stats = enhancedStats?.data
  const categoryData = categoryPerformance?.data || []
  const salesData = dailySales?.data || []
  const inventoryData = inventoryStatus?.data || []

  // Format category data for pie chart with better colors
  const formattedCategoryData = categoryData.map((item, index) => {
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16'];
    return {
      name: item.category,
      value: item.amount,
      percentage: item.value,
      unitsSold: item.unitsSold,
      color: colors[index % colors.length]
    }
  })

  // Create cash flow data from stats
  const cashFlowData = [
    {
      period: "Opening",
      inflow: 0,
      outflow: 0,
      net: stats?.cashFlow?.monthlyInflows - stats?.cashFlow?.monthlyOutflows || 0
    },
    {
      period: "Current",
      inflow: stats?.cashFlow?.monthlyInflows || 0,
      outflow: stats?.cashFlow?.monthlyOutflows || 0,
      net: stats?.cashFlow?.netCashFlow || 0
    }
  ]

  // Create payment method data for pie chart
  const paymentMethodData = stats?.sales?.paymentMethods?.map((method, index) => ({
    name: method.method.charAt(0).toUpperCase() + method.method.slice(1),
    value: method.amount,
    count: method.count,
    color: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'][index % 4]
  })) || []

  return (
    <PincodeProtection 
      title="Dashboard Analytics" 
      description="Access comprehensive business insights and real-time analytics"
    >
      <div className="flex-1 space-y-4 p-4 md:p-6">
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 mb-6 h-full lg:grid-cols-4">
          <TabsTrigger value="overview" className="text-xs sm:text-sm">Overview</TabsTrigger>
          <TabsTrigger value="analytics" className="text-xs sm:text-sm">Analytics</TabsTrigger>
          <TabsTrigger value="reports" className="text-xs sm:text-sm">Reports</TabsTrigger>
          <TabsTrigger value="notifications" className="text-xs sm:text-sm">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Enhanced Overview Cards with gradient backgrounds */}
          <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          <Card className="col-span-1 shadow-xl border-0 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-2xl">
              <CardContent className="p-0">
                <div className="bg-gradient-to-br from-blue-600 to-blue-900 p-4 text-white">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-xs font-medium text-white/90 mb-1">Today's Revenue</p>
                      <p className="text-lg sm:text-2xl font-bold text-white mb-1">
                        Rs. {formatNumber(stats?.financial?.todayRevenue)}

                      </p>
                      <p className="text-xs text-white/80">
                        {stats?.financial?.revenueGrowth > 0 ? '+' : ''}
                        {stats?.financial?.revenueGrowth?.toFixed(1) || '0'}% from yesterday
                      </p>
                    </div>
                    <div className="bg-white/20 p-2 rounded-full">
                      <DollarSign className="h-4 w-4 text-white" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="col-span-1 shadow-xl border-0 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-2xl">
              <CardContent className="p-0">
                <div className="bg-gradient-to-br from-green-600 to-green-900 p-4 text-white">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-xs font-medium text-white/90 mb-1">Today's Orders</p>
                      <p className="text-lg sm:text-2xl font-bold text-white mb-1">
                        Rs. {formatNumber(stats?.sales?.todaySales)}

                      </p>
                      <p className="text-xs text-white/80">
                        Avg: Rs. {stats?.sales?.avgOrderValue?.toLocaleString() || '0'}
                      </p>
                    </div>
                    <div className="bg-white/20 p-2 rounded-full">
                      <ShoppingCart className="h-4 w-4 text-white" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="col-span-1 shadow-xl border-0 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-2xl">
              <CardContent className="p-0">
                <div className="bg-gradient-to-br from-red-600 to-red-900 p-4 text-white">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-xs font-medium text-white/90 mb-1">Low Stock Items</p>
                      <p className="text-lg sm:text-2xl font-bold text-white mb-1">
                        {stats?.inventory?.lowStockItems || '0'}
                      </p>
                      <p className="text-xs text-white/80">
                        Value: Rs. {(stats?.inventory?.totalInventoryValue / 1000)?.toFixed(0) || '0'}k
                      </p>
                    </div>
                    <div className="bg-white/20 p-2 rounded-full">
                      <Package className="h-4 w-4 text-white" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="col-span-1 shadow-xl border-0 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-2xl">
              <CardContent className="p-0">
                <div className="bg-gradient-to-br from-purple-500 to-purple-900 p-4 text-white">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-xs font-medium text-white/90 mb-1">Total Customers</p>
                      <p className="text-lg sm:text-2xl font-bold text-white mb-1">
                        {stats?.customers?.totalCustomers?.toLocaleString() || '0'}
                      </p>
                      <p className="text-xs text-white/80">
                        Avg: Rs. {stats?.customers?.avgCustomerValue?.toLocaleString() || '0'}
                      </p>
                    </div>
                    <div className="bg-white/20 p-2 rounded-full">
                      <Users className="h-4 w-4 text-white" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Additional Financial Metrics Row */}
          <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          <Card className="col-span-1 shadow-xl border-0 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-2xl">
              <CardContent className="p-0">
                <div className="bg-gradient-to-br from-emerald-600 to-emerald-900 p-4 text-white">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-xs font-medium text-white/90 mb-1">Month Revenue</p>
                      <p className="text-lg sm:text-2xl font-bold text-white mb-1">
                        Rs. {formatNumber(stats?.financial?.monthRevenue)}

                      </p>
                      <p className="text-xs text-white/80">
                        {stats?.financial?.monthlyGrowth?.toFixed(1) || '0'}% growth
                      </p>
                    </div>
                    <div className="bg-white/20 p-2 rounded-full">
                      <TrendingUp className="h-4 w-4 text-white" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="col-span-1 shadow-xl border-0 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-2xl">
              <CardContent className="p-0">
                <div className="bg-gradient-to-br from-amber-600 to-amber-900 p-4 text-white">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-xs font-medium text-white/90 mb-1">Monthly Profit</p>
                      <p className="text-lg sm:text-2xl font-bold text-white mb-1">
                        Rs. {formatNumber(stats?.financial?.netProfit)}


                      </p>
                      <p className="text-xs text-white/80">
                        Rs. {stats?.financial?.profitMargin?.toFixed(1) || '0'}% profit Margin
                      </p>
                    </div>
                    <div className="bg-white/20 p-2 rounded-full">
                      <Target className="h-4 w-4 text-white" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="col-span-1 shadow-xl border-0 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-2xl">
              <CardContent className="p-0">
                <div className="bg-gradient-to-br from-indigo-600 to-indigo-900 p-4 text-white">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-xs font-medium text-white/90 mb-1">Receivables</p>
                      <p className="text-lg sm:text-2xl font-bold text-white mb-1">
                        Rs. {formatNumber(stats?.customers?.totalReceivables)}
                      </p>
                      <p className="text-xs text-white/80">
                        Outstanding payments
                      </p>
                    </div>
                    <div className="bg-white/20 p-2 rounded-full">
                      <CreditCard className="h-4 w-4 text-white" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="col-span-1 shadow-xl border-0 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-2xl">
              <CardContent className="p-0">
                <div className="bg-gradient-to-br from-cyan-600 to-cyan-900 p-4 text-white">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-xs font-medium text-white/90 mb-1">Inventory Value</p>
                      <p className="text-lg sm:text-2xl font-bold text-white mb-1">
                        Rs. {formatNumber(stats?.inventory?.totalInventoryValue)}
                      </p>
                      <p className="text-xs text-white/80">
                        Turnover: {stats?.inventory?.inventoryTurnover?.toFixed(2) || '0'}
                      </p>
                    </div>
                    <div className="bg-white/20 p-2 rounded-full">
                      <Package2 className="h-4 w-4 text-white" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Enhanced Charts Section */}
          <div className="grid gap-4 grid-cols-1 lg:grid-cols-2 mb-8">
            {/* Sales vs Target */}
            <Card className="col-span-1 shadow-xl border-0 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-2xl">
              <CardHeader className="pb-3 bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-950/20 dark:to-orange-900/20">
                <CardTitle className="flex items-center gap-2 text-base font-semibold">
                  <Target className="h-5 w-5 text-orange-600" />
                  Sales vs Target
                </CardTitle>
                <CardDescription className="text-sm">Daily performance comparison (Rs.)</CardDescription>
              </CardHeader>
              <CardContent className="p-4">
                <ChartContainer config={salesChartConfig} className="h-[300px] w-full">
                  <BarChart data={salesData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" className="dark:stroke-slate-700" />
                    <XAxis
                      dataKey="day"
                      tick={{ fontSize: 12, fill: 'currentColor' }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 12, fill: 'currentColor' }}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `Rs. ${(value / 1000).toFixed(0)}k`}
                    />
                    <ChartTooltip
                      content={<ChartTooltipContent
                        formatter={(value, name) => [
                          `Rs. ${value.toLocaleString()}`,
                          name === 'sales' ? 'Actual Sales' : 'Sales Target'
                        ]}
                      />}
                    />
                    <Bar dataKey="sales" fill="#10b981" radius={[4, 4, 0, 0]} name="Actual Sales" />
                    <Bar dataKey="target" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Sales Target" />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>
            <Card className="col-span-1 shadow-xl border-0 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-2xl">
              <CardHeader className="pb-3 bg-gradient-to-r from-green-50 to-emerald-100 dark:from-green-950/30 dark:to-emerald-900/30">
                <CardTitle className="flex items-center gap-3 text-lg font-bold tracking-tight">
                  <Package className="h-6 w-6 text-green-600 dark:text-green-400" />
                  Sales by Category
                </CardTitle>
                <CardDescription className="text-sm text-gray-600 dark:text-gray-300">
                  Revenue distribution across product categories (in Rs.)
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <ChartContainer config={categoryChartConfig} className="h-[350px] w-full">
                  <BarChart
                    data={formattedCategoryData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                    barCategoryGap={50}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" className="dark:stroke-slate-700" />
                    <XAxis
                      dataKey="name"
                      interval={0}
                      tickLine={false}
                      axisLine={false}
                      tick={(props) => {
                        const { x, y, payload } = props;
                        return (
                          <text
                            x={x}
                            y={y}
                            dy={20}
                            textAnchor="end"
                            fontSize={12}
                            fill="currentColor"
                            transform={`rotate(-30, ${x}, ${y})`}
                          >
                            {payload.value}
                          </text>
                        );
                      }}
                    />
                    <YAxis
                      tick={{ fontSize: 12, fill: 'currentColor' }}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `Rs. ${(value / 1000).toFixed(0)}k`}
                    />
                    <ChartTooltip
                      content={<ChartTooltipContent
                        formatter={(value, name, props) => [
                          `Rs. ${value.toLocaleString('en-IN')}`,
                          `${props.payload.name}`,
                        ]}
                      />}
                    />
                    <Bar
                      dataKey="value"
                      name="Revenue"
                      radius={[4, 4, 0, 0]}
                      maxBarSize={40}
                    >
                      {formattedCategoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color || defaultColors[index % defaultColors.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>



          </div>

          {/* New Analytics Section - Weekly Performance Trend */}
          <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
            <Card className="col-span-1 shadow-xl border-0 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-2xl">
              <CardHeader className="pb-3 bg-gradient-to-r from-indigo-50 to-indigo-100 dark:from-indigo-950/20 dark:to-indigo-900/20">
                <CardTitle className="flex items-center gap-2 text-base font-semibold">
                  <Activity className="h-5 w-5 text-indigo-600" />
                  Weekly Performance Trend
                </CardTitle>
                <CardDescription className="text-sm">Revenue and orders over time</CardDescription>
              </CardHeader>
              <CardContent className="p-4">
                <ChartContainer config={salesChartConfig} className="h-[300px] w-full">
                  <LineChart data={stats?.performance?.weeklyTrend || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" className="dark:stroke-slate-700" />
                    <XAxis dataKey="week" tick={{ fontSize: 12, fill: 'currentColor' }} />
                    <YAxis tick={{ fontSize: 12, fill: 'currentColor' }} tickFormatter={(value) => `Rs. ${(value / 1000).toFixed(0)}k`} />
                    <ChartTooltip content={<ChartTooltipContent formatter={(value, name) => [`Rs. ${value.toLocaleString()}`, name === 'revenue' ? 'Revenue' : 'Orders']} />} />
                    <Line dataKey="revenue" stroke="#10b981" strokeWidth={3} dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }} />
                    <Line dataKey="orders" stroke="#3b82f6" strokeWidth={3} dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }} />
                  </LineChart>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Fast Moving Products */}
            <Card className="col-span-1 shadow-xl border-0 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-2xl">
              <CardHeader className="pb-3 bg-gradient-to-r from-emerald-50 to-emerald-100 dark:from-emerald-950/20 dark:to-emerald-900/20">
                <CardTitle className="flex items-center gap-2 text-base font-semibold">
                  <Package2 className="h-5 w-5 text-emerald-600" />
                  Fast Moving Products
                </CardTitle>
                <CardDescription className="text-sm">Top selling products this period</CardDescription>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-3">
                  {stats?.inventory?.fastMovingProducts?.slice(0, 5).map((product, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gradient-to-r from-emerald-50 to-emerald-100 dark:from-emerald-950/20 dark:to-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-gray-100">{product.name}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Sold: {product.sold} | Remaining: {product.remaining}
                        </p>
                      </div>
                      <Badge variant="outline" className="bg-emerald-100 text-emerald-700 border-emerald-300">
                        #{index + 1}
                      </Badge>
                    </div>
                  )) || <p className="text-center text-gray-500 py-8">No product data available</p>}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Enhanced Information Sections */}
          <div className="grid gap-4 grid-cols-1 lg:grid-cols-3 mt-8">
            {/* Recent High-Value Sales */}
            <Card className="col-span-1 shadow-xl border-0 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-2xl">
              <CardHeader className="pb-3 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20">
                <CardTitle className="text-base font-semibold flex items-center gap-2 text-card-foreground">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  Recent High-Value Sales
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 p-4">
                {stats?.sales?.highValueSales?.slice(0, 3).map((sale, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                    <div>
                      <p className="text-sm font-medium text-card-foreground">{sale.customer}</p>
                      <p className="text-xs text-muted-foreground">#{sale.orderNumber}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-green-600 dark:text-green-400">Rs. {sale.amount.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">{sale.date}</p>
                    </div>
                  </div>
                )) || (
                    <p className="text-sm text-muted-foreground">No recent sales</p>
                  )}
              </CardContent>
            </Card>

            {/* Recent Payments */}
            <Card className="col-span-1 shadow-xl border-0 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-2xl">
              <CardHeader className="pb-3 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20">
                <CardTitle className="text-base font-semibold flex items-center gap-2 text-card-foreground">
                  <Banknote className="h-5 w-5 text-blue-500" />
                  Recent Payments
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 p-4">
                {stats?.cashFlow?.recentPayments?.slice(0, 3).map((payment, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div>
                      <p className="text-sm font-medium text-card-foreground">{payment.customer}</p>
                      <p className="text-xs text-muted-foreground">{payment.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-blue-600 dark:text-blue-400">Rs. {payment.amount.toLocaleString()}</p>
                    </div>
                  </div>
                )) || (
                    <p className="text-sm text-muted-foreground">No recent payments</p>
                  )}
              </CardContent>
            </Card>

            {/* System Alerts */}
            <Card className="col-span-1 shadow-xl border-0 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-2xl">
              <CardHeader className="pb-3 bg-gradient-to-r from-yellow-50 to-yellow-100 dark:from-yellow-950/20 dark:to-yellow-900/20">
                <CardTitle className="text-base font-semibold flex items-center gap-2 text-card-foreground">
                  <AlertTriangle className="h-5 w-5 text-yellow-500" />
                  System Alerts
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 p-4">
                {stats?.inventory?.lowStockItems > 0 && (
                  <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-yellow-50 to-yellow-100 dark:from-yellow-950/20 dark:to-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                    <div>
                      <p className="text-sm font-medium text-card-foreground">Low Stock Alert</p>
                      <p className="text-xs text-muted-foreground">
                        {stats.inventory.lowStockItems} items running low
                      </p>
                    </div>
                  </div>
                )}
                {stats?.inventory?.outOfStockItems > 0 && (
                  <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-red-50 to-red-100 dark:from-red-950/20 dark:to-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                    <div>
                      <p className="text-sm font-medium text-card-foreground">Out of Stock</p>
                      <p className="text-xs text-muted-foreground">
                        {stats.inventory.outOfStockItems} items unavailable
                      </p>
                    </div>
                  </div>
                )}
                <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <div>
                    <p className="text-sm font-medium text-card-foreground">System Operational</p>
                    <p className="text-xs text-muted-foreground">All systems running</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
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
                  Rs. {formatNumber(stats?.performance?.dailyAvgRevenue)}
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

          {/* Detailed Analytics Charts */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Performance Trends */}
            <Card className="col-span-1 shadow-xl border-0 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-blue-500" />
                  Performance Analysis
                </CardTitle>
                <CardDescription>Weekly revenue and order trends</CardDescription>
              </CardHeader>
              <CardContent>
                {stats?.performance?.weeklyTrend && (
                  <ChartContainer config={salesChartConfig} className="h-[300px] w-full">
                    <AreaChart data={stats.performance.weeklyTrend}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" className="dark:stroke-slate-700" />
                      <XAxis dataKey="week" tick={{ fontSize: 12, fill: 'currentColor' }} />
                      <YAxis tick={{ fontSize: 12, fill: 'currentColor' }} tickFormatter={(value) => `Rs. ${(value / 1000).toFixed(0)}k`} />
                      <ChartTooltip content={<ChartTooltipContent formatter={(value, name) => [`Rs. ${value.toLocaleString()}`, name === 'revenue' ? 'Revenue' : 'Orders']} />} />
                      <Area dataKey="revenue" fill="#10b981" stroke="#10b981" fillOpacity={0.3} />
                      <Area dataKey="orders" fill="#3b82f6" stroke="#3b82f6" fillOpacity={0.2} />
                    </AreaChart>
                  </ChartContainer>
                )}
              </CardContent>
            </Card>

            {/* Customer Analytics */}
            <Card className="col-span-1 shadow-xl border-0 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-2xl">
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
          </div>

          {/* Top Customers & Fast Moving Products */}
          <div className="grid gap-6 md:grid-cols-2">
          <Card className="col-span-1 shadow-xl border-0 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-2xl">
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

            <Card className="col-span-1 shadow-xl border-0 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-2xl">
              <CardHeader>
                <CardTitle>Fast Moving Products</CardTitle>
                <CardDescription>Best selling items</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stats?.inventory?.fastMovingProducts?.slice(0, 5).map((product, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20 rounded-lg">
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Sold: {product.sold} | Remaining: {product.remaining}
                        </p>
                      </div>
                      <Badge variant="outline">
                        #{index + 1}
                      </Badge>
                    </div>
                  )) || <p className="text-muted-foreground">No product data available</p>}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          {/* Enhanced Reports Section */}
          <div className="grid gap-6">
            {/* Report Generation Header */}
            <Card className="col-span-1 shadow-xl border-0 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-2xl">
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
              <Card className="col-span-1 shadow-xl border-0 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-2xl">
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
              <Card className="col-span-1 shadow-xl border-0 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-2xl">
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
                        Rs. {formatNumber(inventoryReport.data?.inventoryReport?.totalValue)}
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

            {/* Financial Report Summary */}
            {financialReport && (
             <Card className="col-span-1 shadow-xl border-0 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-2xl">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-green-500" />
                      Financial Report Summary
                    </div>
                    <Button size="sm" variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6 md:grid-cols-2">
                    {/* Revenue vs Expenses */}
                    <div className="space-y-4">
                      <h4 className="font-medium">Revenue vs Expenses</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                          <span>Total Revenue</span>
                          <span className="font-bold text-green-600 dark:text-green-400">
                            Rs. {financialReport.data?.financialReport?.revenue?.total?.toLocaleString() || '0'}
                          </span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-red-50 dark:bg-red-950/20 rounded-lg">
                          <span>Total Expenses</span>
                          <span className="font-bold text-red-600 dark:text-red-400">
                            Rs. {financialReport.data?.financialReport?.expenses?.total?.toLocaleString() || '0'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Profit Analysis */}
                    <div className="space-y-4">
                      <h4 className="font-medium">Profit Analysis</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                          <span>Gross Profit</span>
                          <span className="font-bold text-blue-600 dark:text-blue-400">
                            Rs. {financialReport.data?.financialReport?.profit?.gross?.toLocaleString() || '0'}
                          </span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                          <span>Net Profit</span>
                          <span className="font-bold text-purple-600 dark:text-purple-400">
                            Rs. {financialReport.data?.financialReport?.profit?.net?.toLocaleString() || '0'}
                          </span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
                          <span>Profit Margin</span>
                          <span className="font-bold text-orange-600 dark:text-orange-400">
                            {financialReport.data?.financialReport?.profit?.margin?.toFixed(1) || '0'}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
        <Card className="col-span-1 shadow-xl border-0 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-2xl">
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>System alerts and notifications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats?.alerts?.map((alert, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-orange-50 rounded-lg">
                    <AlertTriangle className="h-4 w-4 text-orange-500" />
                    <div>
                      <p className="text-sm font-medium">{alert.title}</p>
                      <p className="text-xs text-muted-foreground">{alert.message}</p>
                    </div>
                  </div>
                )) || (
                    <p className="text-sm text-muted-foreground">No notifications at this time</p>
                  )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      </div>
    </PincodeProtection>
  )
}
