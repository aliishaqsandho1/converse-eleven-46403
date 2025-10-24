
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Package, 
  Users, 
  ShoppingCart,
  AlertTriangle,
  Calendar,
  BarChart3,
  PieChart,
  Activity,
  Target,
  Clock,
  CheckCircle,
  XCircle,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  Star,
  Eye,
  Bell,
  Smartphone
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { apiConfig } from "@/utils/apiConfig";

interface DashboardStats {
  financial: {
    todayRevenue: number;
    monthRevenue: number;
    profitMargin: number;
    revenueGrowth: number;
    netProfit: number;
    grossProfit: number;
    monthExpenses: number;
  };
  sales: {
    todaySales: number;
    weekSales: number;
    avgOrderValue: number;
    highValueSales: Array<{
      orderNumber: string;
      amount: number;
      customer: string;
      date: string;
    }>;
  };
  inventory: {
    totalInventoryValue: number;
    lowStockItems: number;
    deadStockValue: number;
    inventoryTurnover: number;
    fastMovingProducts: Array<{
      name: string;
      sold: number;
      remaining: number;
    }>;
  };
  customers: {
    totalCustomers: number;
    newCustomersThisMonth: number;
    avgCustomerValue: number;
    totalReceivables: number;
  };
  cashFlow: {
    netCashFlow: number;
    monthlyInflows: number;
    monthlyOutflows: number;
  };
  alerts: Array<{
    type: string;
    title: string;
    message: string;
    action: string;
  }>;
}

const Index = () => {
  const isMobile = useIsMobile();
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Fetch dashboard stats
  const { data: dashboardData, isLoading, error } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const response = await fetch(`${apiConfig.getBaseUrl()}/dashboard/enhanced-stats`);
      if (!response.ok) throw new Error('Failed to fetch stats');
      return response.json();
    },
    refetchInterval: 2 * 60 * 1000, // Refetch every 2 minutes
  });

  const stats: DashboardStats = dashboardData?.data || {
    financial: { todayRevenue: 0, monthRevenue: 0, profitMargin: 0, revenueGrowth: 0, netProfit: 0, grossProfit: 0, monthExpenses: 0 },
    sales: { todaySales: 0, weekSales: 0, avgOrderValue: 0, highValueSales: [] },
    inventory: { totalInventoryValue: 0, lowStockItems: 0, deadStockValue: 0, inventoryTurnover: 0, fastMovingProducts: [] },
    customers: { totalCustomers: 0, newCustomersThisMonth: 0, avgCustomerValue: 0, totalReceivables: 0 },
    cashFlow: { netCashFlow: 0, monthlyInflows: 0, monthlyOutflows: 0 },
    alerts: []
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen bg-background">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-2 border-muted border-t-primary rounded-full animate-spin mx-auto"></div>
          <p className="text-sm text-muted-foreground">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen bg-background">
        <div className="text-center space-y-4">
          <XCircle className="w-12 h-12 text-destructive mx-auto" />
          <div>
            <h3 className="text-lg font-semibold text-foreground">Failed to Load Dashboard</h3>
            <p className="text-sm text-muted-foreground">Please check your connection and try again.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-65px)] bg-background overflow-hidden">
      {/* Mobile-Optimized Header */}
      <div className="flex-shrink-0 border-b bg-card shadow-sm">
        <div className="p-3 md:p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-1">
              <SidebarTrigger />
              <div className="min-w-0">
                <h1 className="text-lg md:text-xl font-bold text-foreground truncate">
                  {isMobile ? "Dashboard" : "Business Dashboard"}
                </h1>
                <p className="text-xs text-muted-foreground">Usman Hardware - Hafizabad</p>
              </div>
            </div>
            
            <div className="flex items-center gap-1 md:gap-2 flex-shrink-0">
              <Badge variant="secondary" className="h-6 text-xs hidden sm:flex">
                <Activity className="w-3 h-3 mr-1" />
                Live
              </Badge>
              {isMobile && (
                <Badge variant="outline" className="h-6 text-xs">
                  <Smartphone className="w-3 h-3 mr-1" />
                  Mobile
                </Badge>
              )}
            </div>
          </div>
          
          {/* Date and Time Bar - Mobile Responsive */}
          <div className="flex items-center justify-between text-xs text-muted-foreground bg-muted/50 rounded-lg px-3 py-2">
            <div className="flex items-center gap-2">
              <Calendar className="w-3 h-3" />
              <span className={isMobile ? "hidden" : ""}>{formatDate(currentTime)}</span>
              <span className={isMobile ? "" : "hidden"}>{currentTime.toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-3 h-3" />
              <span>{formatTime(currentTime)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile-Optimized Content */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-3 md:p-4 space-y-4 md:space-y-6 pb-6">
            
            {/* Alerts Section - Mobile First */}
            {stats.alerts && stats.alerts.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-orange-500" />
                  <h2 className="text-sm md:text-base font-semibold text-foreground">Alerts</h2>
                  <Badge variant="destructive" className="h-5 text-xs">
                    {stats.alerts.length}
                  </Badge>
                </div>
                <div className="grid gap-2">
                  {stats.alerts.slice(0, isMobile ? 2 : 4).map((alert, index) => (
                    <Card key={index} className="border-orange-200 bg-orange-50 dark:bg-orange-950/20">
                      <CardContent className="p-3">
                        <div className="flex items-start gap-2">
                          <AlertTriangle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-foreground">{alert.title}</p>
                            <p className="text-xs text-muted-foreground mt-1">{alert.message}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {stats.alerts.length > (isMobile ? 2 : 4) && (
                    <Button variant="outline" size="sm" className="h-8 text-xs">
                      View {stats.alerts.length - (isMobile ? 2 : 4)} more alerts
                    </Button>
                  )}
                </div>
              </div>
            )}

            {/* Key Metrics Grid - Mobile Responsive */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-blue-500" />
                <h2 className="text-sm md:text-base font-semibold text-foreground">Today's Overview</h2>
              </div>
              
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {/* Today's Revenue */}
                <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20 border-green-200">
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                        <DollarSign className="w-3 h-3 text-white" />
                      </div>
                      <h3 className="text-xs font-medium text-green-700 dark:text-green-300">Revenue</h3>
                    </div>
                    <p className="text-lg md:text-xl font-bold text-green-900 dark:text-green-100">
                      {formatCurrency(stats.financial.todayRevenue)}
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      <TrendingUp className="w-3 h-3 text-green-600" />
                      <span className="text-xs text-green-600">+{stats.financial.revenueGrowth.toFixed(1)}%</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Today's Sales */}
                <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20 border-blue-200">
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                        <ShoppingCart className="w-3 h-3 text-white" />
                      </div>
                      <h3 className="text-xs font-medium text-blue-700 dark:text-blue-300">Sales</h3>
                    </div>
                    <p className="text-lg md:text-xl font-bold text-blue-900 dark:text-blue-100">
                      {stats.sales.todaySales}
                    </p>
                    <span className="text-xs text-blue-600">orders today</span>
                  </CardContent>
                </Card>

                {/* Inventory Value */}
                <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/20 dark:to-purple-900/20 border-purple-200">
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center">
                        <Package className="w-3 h-3 text-white" />
                      </div>
                      <h3 className="text-xs font-medium text-purple-700 dark:text-purple-300">Inventory</h3>
                    </div>
                    <p className="text-lg md:text-xl font-bold text-purple-900 dark:text-purple-100">
                      {formatCurrency(stats.inventory.totalInventoryValue)}
                    </p>
                    {stats.inventory.lowStockItems > 0 && (
                      <div className="flex items-center gap-1 mt-1">
                        <AlertTriangle className="w-3 h-3 text-orange-500" />
                        <span className="text-xs text-orange-600">{stats.inventory.lowStockItems} low stock</span>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Customers */}
                <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/20 dark:to-orange-900/20 border-orange-200">
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center">
                        <Users className="w-3 h-3 text-white" />
                      </div>
                      <h3 className="text-xs font-medium text-orange-700 dark:text-orange-300">Customers</h3>
                    </div>
                    <p className="text-lg md:text-xl font-bold text-orange-900 dark:text-orange-100">
                      {stats.customers.totalCustomers}
                    </p>
                    <span className="text-xs text-orange-600">+{stats.customers.newCustomersThisMonth} this month</span>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Financial Summary - Mobile Responsive */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <PieChart className="w-4 h-4 text-green-500" />
                <h2 className="text-sm md:text-base font-semibold text-foreground">Financial Summary</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {/* Monthly Revenue */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-green-500" />
                      Monthly Revenue
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-xl md:text-2xl font-bold text-foreground">
                      {formatCurrency(stats.financial.monthRevenue)}
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      <ArrowUpRight className="w-3 h-3 text-green-500" />
                      <span className="text-xs text-green-600">
                        {stats.financial.revenueGrowth > 0 ? '+' : ''}{stats.financial.revenueGrowth.toFixed(1)}% from last month
                      </span>
                    </div>
                  </CardContent>
                </Card>

                {/* Net Profit */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Target className="w-4 h-4 text-blue-500" />
                      Net Profit
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-xl md:text-2xl font-bold text-foreground">
                      {formatCurrency(stats.financial.netProfit)}
                    </p>
                    <span className="text-xs text-muted-foreground">
                      Margin: {stats.financial.profitMargin.toFixed(1)}%
                    </span>
                  </CardContent>
                </Card>

                {/* Cash Flow */}
                <Card className="md:col-span-2 lg:col-span-1">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Activity className="w-4 h-4 text-purple-500" />
                      Cash Flow
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className={`text-xl md:text-2xl font-bold ${
                      stats.cashFlow.netCashFlow >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {formatCurrency(stats.cashFlow.netCashFlow)}
                    </p>
                    <div className="flex items-center justify-between mt-1 text-xs">
                      <span className="text-green-600">In: {formatCurrency(stats.cashFlow.monthlyInflows)}</span>
                      <span className="text-red-600">Out: {formatCurrency(stats.cashFlow.monthlyOutflows)}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Quick Actions & Recent Activity - Mobile Responsive */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Top Products */}
              {stats.inventory.fastMovingProducts && stats.inventory.fastMovingProducts.length > 0 && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Star className="w-4 h-4 text-yellow-500" />
                      Top Selling Products
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      {stats.inventory.fastMovingProducts.slice(0, isMobile ? 3 : 5).map((product, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-foreground truncate">{product.name}</p>
                            <p className="text-xs text-muted-foreground">Remaining: {product.remaining}</p>
                          </div>
                          <Badge variant="secondary" className="ml-2 text-xs">
                            {product.sold} sold
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Recent High-Value Sales */}
              {stats.sales.highValueSales && stats.sales.highValueSales.length > 0 && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Zap className="w-4 h-4 text-blue-500" />
                      Recent High-Value Sales
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      {stats.sales.highValueSales.slice(0, isMobile ? 3 : 5).map((sale, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-foreground">{sale.customer}</p>
                            <p className="text-xs text-muted-foreground">Order #{sale.orderNumber}</p>
                          </div>
                          <div className="text-right ml-2">
                            <p className="text-sm font-bold text-green-600">{formatCurrency(sale.amount)}</p>
                            <p className="text-xs text-muted-foreground">{new Date(sale.date).toLocaleDateString()}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Status Footer - Mobile Optimized */}
            <div className="pt-4 border-t">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>System Online</span>
                </div>
                <span>Last updated: {formatTime(currentTime)}</span>
              </div>
            </div>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

export default Index;
