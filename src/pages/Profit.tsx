import { useQuery } from "@tanstack/react-query";
import { profitApi } from "@/services/profitApi";
import { PincodeProtection } from "@/components/PincodeProtection";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Target,
  Calendar,
  Users,
  BarChart3,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  Star,
  Clock
} from "lucide-react";
import ProfitMainChart from "@/components/profit/ProfitMainChart";
import { PeriodComparisonChart } from "@/components/profit/PeriodComparisonChart";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Cell
} from "recharts";

const formatCurrency = (value: string | number) => {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'PKR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num).replace('PKR', 'Rs ');
};

const formatPercentage = (value: string | number) => {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return `${num.toFixed(1)}%`;
};

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'];

// Overview Cards Component
const OverviewCards = () => {
  const { data: periodComparison, isLoading: periodLoading } = useQuery({
    queryKey: ['profit-period-comparison'],
    queryFn: profitApi.getPeriodComparison,
  });

  const { data: keyMetrics, isLoading: metricsLoading } = useQuery({
    queryKey: ['profit-key-metrics'],
    queryFn: profitApi.getKeyMetrics,
  });

  const { data: ytdSummary, isLoading: ytdLoading } = useQuery({
    queryKey: ['profit-ytd-summary'],
    queryFn: profitApi.getYTDSummary,
  });

  const isLoading = periodLoading || metricsLoading || ytdLoading;

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-[100px]" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-[80px] mb-2" />
              <Skeleton className="h-3 w-[120px]" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const todayData = periodComparison?.find(p => p.period === 'today');
  const lastWeekData = periodComparison?.find(p => p.period === 'last_week');
  const last30DaysData = periodComparison?.find(p => p.period === 'last_30_days');
  
  const todayProfit = parseFloat(todayData?.profit || '0');
  const lastWeekProfit = parseFloat(lastWeekData?.profit || '0');
  const lastMonthProfit = parseFloat(last30DaysData?.profit || '0');
  const ytdProfit = parseFloat(ytdSummary?.ytd_profit || '0');
  
  const todayRevenue = parseFloat(todayData?.revenue || '0');
  const lastWeekRevenue = parseFloat(lastWeekData?.revenue || '0');
  const lastMonthRevenue = parseFloat(last30DaysData?.revenue || '0');
  const ytdRevenue = parseFloat(ytdSummary?.ytd_revenue || '0');

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
     
      <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950 dark:to-emerald-900 border-emerald-200 dark:border-emerald-800 col-span-1 shadow-xl border-0 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-2xl">

        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-emerald-700 dark:text-emerald-300">Today's Profit</CardTitle>
          <div className="p-2 bg-emerald-100 dark:bg-emerald-800 rounded-full">
            <DollarSign className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">
            {formatCurrency(todayProfit)}
          </div>
          <div className="flex items-center justify-between mt-2">
            <p className="text-xs text-emerald-600 dark:text-emerald-400">
              <Clock className="h-3 w-3 inline mr-1" />
              Live tracking
            </p>
            <p className="text-xs text-emerald-500 dark:text-emerald-400 font-medium">
              Rev: {formatCurrency(todayRevenue)}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950 dark:to-amber-900 border-amber-200 dark:border-amber-800 col-span-1 shadow-xl border-0 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-2xl">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-amber-700 dark:text-amber-300">Last Week Profit</CardTitle>
          <div className="p-2 bg-amber-100 dark:bg-amber-800 rounded-full">
            <Calendar className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-amber-900 dark:text-amber-100">
            {formatCurrency(lastWeekProfit)}
          </div>
          <div className="flex items-center justify-between mt-2">
            <p className="text-xs text-amber-600 dark:text-amber-400">
              <TrendingUp className="h-3 w-3 inline mr-1" />
              Previous week performance
            </p>
            <p className="text-xs text-amber-500 dark:text-amber-400 font-medium">
              Rev: {formatCurrency(lastWeekRevenue)}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800 col-span-1 shadow-xl border-0 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-2xl">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300">Last Month Profit</CardTitle>
          <div className="p-2 bg-blue-100 dark:bg-blue-800 rounded-full">
            <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
            {formatCurrency(lastMonthProfit)}
          </div>
          <div className="flex items-center justify-between mt-2">
            <p className="text-xs text-blue-600 dark:text-blue-400">
              <TrendingUp className="h-3 w-3 inline mr-1" />
              Last 30 days performance
            </p>
            <p className="text-xs text-blue-500 dark:text-blue-400 font-medium">
              Rev: {formatCurrency(lastMonthRevenue)}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200 dark:border-purple-800 col-span-1 shadow-xl border-0 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-2xl">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-purple-700 dark:text-purple-300">YTD Profit</CardTitle>
          <div className="p-2 bg-purple-100 dark:bg-purple-800 rounded-full">
            <Star className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">
            {formatCurrency(ytdProfit)}
          </div>
          <div className="flex items-center justify-between mt-2">
            <p className="text-xs text-purple-600 dark:text-purple-400">
              <TrendingUp className="h-3 w-3 inline mr-1" />
              Year to date total
            </p>
            <p className="text-xs text-purple-500 dark:text-purple-400 font-medium">
              Rev: {formatCurrency(ytdRevenue)}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Performance Tab Component
const PerformanceTab = () => {
  const { data: dailyPerformance, isLoading: performanceLoading } = useQuery({
    queryKey: ['profit-daily-performance'],
    queryFn: profitApi.getDailyPerformance,
  });

  const { data: weekComparison, isLoading: comparisonLoading } = useQuery({
    queryKey: ['profit-week-comparison'],
    queryFn: profitApi.getWeekComparison,
  });

  const { data: targetAchievement, isLoading: targetLoading } = useQuery({
    queryKey: ['profit-target-achievement'],
    queryFn: profitApi.getTargetAchievement,
  });

  if (performanceLoading || comparisonLoading || targetLoading) {
    return <div className="space-y-3">Loading performance data...</div>;
  }

  const actualProfit = parseFloat(dailyPerformance?.actual_profit || '0');
  const targetProfit = parseFloat(dailyPerformance?.target_profit || '0');
  const achievementPercent = targetProfit > 0 ? (actualProfit / targetProfit) * 100 : 0;

  return (
    <div className="space-y-3">
      {/* Enhanced Daily Performance vs Target */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Beautiful Target Achievement Card */}
        <Card className="bg-gradient-to-br from-emerald-50 via-blue-50 to-purple-50 dark:from-emerald-950 dark:via-blue-950 dark:to-purple-950 border-0 shadow-xl ">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl bg-gradient-to-r from-emerald-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
              <Target className="h-6 w-6 text-emerald-600" />
              Today's Target Achievement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {/* Circular Progress Indicator */}
              <div className="relative flex items-center justify-center">
                <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
                  <circle
                    cx="60"
                    cy="60"
                    r="50"
                    fill="none"
                    stroke="hsl(var(--muted))"
                    strokeWidth="8"
                    className="opacity-20"
                  />
                  <circle
                    cx="60"
                    cy="60"
                    r="50"
                    fill="none"
                    stroke="url(#targetGradient)"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={`${Math.min(achievementPercent * 3.14, 314)} 314`}
                    className="transition-all duration-1000 ease-out"
                  />
                  <defs>
                    <linearGradient id="targetGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#10B981" />
                      <stop offset="50%" stopColor="#3B82F6" />
                      <stop offset="100%" stopColor="#8B5CF6" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
                    {achievementPercent.toFixed(1)}%
                  </span>
                  <span className="text-sm text-muted-foreground">Achievement</span>
                </div>
              </div>
              
              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/60 dark:bg-black/20 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">Actual</p>
                  <p className="text-xl font-bold text-emerald-900 dark:text-emerald-100">
                    {formatCurrency(actualProfit)}
                  </p>
                </div>
                <div className="bg-white/60 dark:bg-black/20 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Target</p>
                  <p className="text-xl font-bold text-blue-900 dark:text-blue-100">
                    {formatCurrency(targetProfit)}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Week Comparison */}
        <Card className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-blue-950 dark:via-purple-950 dark:to-pink-950 border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              <BarChart3 className="h-6 w-6 text-blue-600" />
              Week Comparison
            </CardTitle>
          </CardHeader>
          <CardContent>
            {weekComparison && weekComparison.length >= 2 && (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={weekComparison} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3B82F6" />
                      <stop offset="100%" stopColor="#8B5CF6" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted-foreground))" opacity={0.2} />
                  <XAxis 
                    dataKey="period" 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '12px',
                      boxShadow: '0 8px 32px rgba(0,0,0,0.12)'
                    }}
                    formatter={(value) => [formatCurrency(value as number), 'Profit']} 
                  />
                  <Bar 
                    dataKey="profit" 
                    fill="url(#barGradient)"
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Target Achievement Overview */}
      <Card className="bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-50 dark:from-slate-900 dark:via-gray-900 dark:to-zinc-900 border-0 shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl bg-gradient-to-r from-slate-600 to-zinc-600 bg-clip-text text-transparent">
            Target Achievement Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-3">
            {targetAchievement?.map((target, index) => {
              const actual = parseFloat(target.actual_profit);
              const targetValue = parseFloat(target.target_profit);
              const variance = parseFloat(target.variance);
              const percent = targetValue > 0 ? (actual / targetValue) * 100 : 0;
              
              const gradientColors = [
                'from-emerald-400 to-cyan-400',
                'from-blue-400 to-purple-400', 
                'from-purple-400 to-pink-400'
              ];
              
              const bgColors = [
                'from-emerald-50 to-cyan-50 dark:from-emerald-950 dark:to-cyan-950',
                'from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950',
                'from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950'
              ];

              return (
                <div key={index} className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${bgColors[index]} border border-white/20 shadow-lg`}>
                  {/* Background Pattern */}
                  <div className="absolute inset-0 opacity-5">
                    <svg width="100%" height="100%" viewBox="0 0 40 40">
                      <defs>
                        <pattern id={`pattern-${index}`} x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                          <circle cx="20" cy="20" r="2" fill="currentColor" />
                        </pattern>
                      </defs>
                      <rect width="100%" height="100%" fill={`url(#pattern-${index})`} />
                    </svg>
                  </div>
                  
                  <div className="relative p-6 space-y-4">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-semibold text-slate-900 dark:text-slate-100">{target.period}</span>
                      <div className={`px-3 py-1 rounded-full bg-gradient-to-r ${gradientColors[index]} text-white text-sm font-medium shadow-lg`}>
                        {variance >= 0 ? (
                          <ArrowUpRight className="h-4 w-4 inline mr-1" />
                        ) : (
                          <ArrowDownRight className="h-4 w-4 inline mr-1" />
                        )}
                        {formatPercentage(percent)}
                      </div>
                    </div>

                    {/* Animated Progress Ring */}
                    <div className="relative flex items-center justify-center">
                      <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          fill="none"
                          stroke="hsl(var(--muted))"
                          strokeWidth="6"
                          className="opacity-20"
                        />
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          fill="none"
                          stroke={`url(#gradient-${index})`}
                          strokeWidth="6"
                          strokeLinecap="round"
                          strokeDasharray={`${Math.min(percent * 2.51, 251)} 251`}
                          className="transition-all duration-1000 ease-out"
                        />
                        <defs>
                          <linearGradient id={`gradient-${index}`} x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor={index === 0 ? "#10B981" : index === 1 ? "#3B82F6" : "#8B5CF6"} />
                            <stop offset="100%" stopColor={index === 0 ? "#06B6D4" : index === 1 ? "#8B5CF6" : "#EC4899"} />
                          </linearGradient>
                        </defs>
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-xl font-bold text-slate-900 dark:text-slate-100">
                          {Math.round(percent)}%
                        </span>
                      </div>
                    </div>

                    {/* Amount Display */}
                    <div className="text-center space-y-2">
                      <div className="text-sm text-muted-foreground">
                        <span className="font-medium text-slate-900 dark:text-slate-100">{formatCurrency(actual)}</span>
                        <span className="mx-2">of</span>
                        <span className="font-medium text-slate-900 dark:text-slate-100">{formatCurrency(targetValue)}</span>
                      </div>
                      <div className={`text-xs font-medium ${variance >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                        {variance >= 0 ? '+' : ''}{formatCurrency(variance)} variance
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Trends Tab Component
const TrendsTab = () => {
  const { data: monthlyTrends, isLoading: monthlyLoading } = useQuery({
    queryKey: ['profit-monthly-trends'],
    queryFn: () => profitApi.getMonthlyTrends(6),
  });

  const { data: weeklyTrends, isLoading: weeklyLoading } = useQuery({
    queryKey: ['profit-weekly-trends'],
    queryFn: () => profitApi.getWeeklyTrends(8),
  });

  if (monthlyLoading || weeklyLoading) {
    return <div className="space-y-3">Loading trends data...</div>;
  }

  const monthlyChartData = monthlyTrends?.map(trend => ({
    period: trend.period,
    profit: parseFloat(trend.monthly_profit),
    revenue: parseFloat(trend.monthly_revenue),
    margin: parseFloat(trend.margin)
  }));

  const weeklyChartData = weeklyTrends?.map(trend => ({
    week: trend.week_number,
    profit: parseFloat(trend.weekly_profit),
    revenue: parseFloat(trend.weekly_revenue),
    margin: parseFloat(trend.week_margin)
  }));

  return (
    <div className="space-y-3">
      {/* Monthly Trends */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Monthly Profit Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={monthlyChartData}>
              <defs>
                <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="period" />
              <YAxis />
              <Tooltip 
                formatter={(value, name) => [
                  name === 'margin' ? formatPercentage(value as number) : formatCurrency(value as number),
                  name === 'profit' ? 'Profit' : name === 'revenue' ? 'Revenue' : 'Margin'
                ]}
              />
              <Area 
                type="monotone" 
                dataKey="profit" 
                stroke="#10B981" 
                fillOpacity={1}
                fill="url(#profitGradient)"
              />
              <Line type="monotone" dataKey="margin" stroke="#F59E0B" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Weekly Trends */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Weekly Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={weeklyChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" />
              <YAxis />
              <Tooltip formatter={(value, name) => [
                name === 'margin' ? formatPercentage(value as number) : formatCurrency(value as number),
                name === 'profit' ? 'Profit' : name === 'revenue' ? 'Revenue' : 'Margin'
              ]} />
              <Line type="monotone" dataKey="profit" stroke="#3B82F6" strokeWidth={3} />
              <Line type="monotone" dataKey="margin" stroke="#EF4444" strokeWidth={2} strokeDasharray="5 5" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

// Analytics Tab Component
const AnalyticsTab = () => {
  const { data: categoryPerformance, isLoading: categoryLoading } = useQuery({
    queryKey: ['profit-category-performance'],
    queryFn: profitApi.getCategoryPerformance,
  });

  const { data: topCustomers, isLoading: customersLoading } = useQuery({
    queryKey: ['profit-top-customers'],
    queryFn: () => profitApi.getTopCustomers(10),
  });

  const { data: profitOverview, isLoading: overviewLoading } = useQuery({
    queryKey: ['profit-overview'],
    queryFn: profitApi.getProfitOverview,
  });

  if (categoryLoading || customersLoading || overviewLoading) {
    return (
      <div className="space-y-3">
        <div className="grid gap-6 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-[200px]" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-[300px] w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const categoryChartData = categoryPerformance?.map((category, index) => ({
    name: category.category_name,
    profit: parseFloat(category.profit),
    revenue: parseFloat(category.revenue),
    margin: parseFloat(category.margin),
    color: COLORS[index % COLORS.length]
  }));

  const pieChartData = categoryChartData?.map((item, index) => ({
    ...item,
    value: item.profit
  }));

  return (
    <div className="space-y-3">
      {/* Profit Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-emerald-50 to-cyan-50 dark:from-emerald-950 dark:to-cyan-950 border-emerald-200 dark:border-emerald-800">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100 dark:bg-emerald-800 rounded-lg">
                <DollarSign className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">Today's Revenue</p>
                <p className="text-xl font-bold text-emerald-900 dark:text-emerald-100">
                  {formatCurrency(profitOverview?.today_revenue || '0')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 border-blue-200 dark:border-blue-800">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-800 rounded-lg">
                <TrendingUp className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">Week Profit</p>
                <p className="text-xl font-bold text-blue-900 dark:text-blue-100">
                  {formatCurrency(profitOverview?.week_profit || '0')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 border-purple-200 dark:border-purple-800">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-800 rounded-lg">
                <Calendar className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">Month Profit</p>
                <p className="text-xl font-bold text-purple-900 dark:text-purple-100">
                  {formatCurrency(profitOverview?.month_profit || '0')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950 dark:to-orange-950 border-amber-200 dark:border-amber-800">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 dark:bg-amber-800 rounded-lg">
                <Star className="h-6 w-6 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-sm text-amber-600 dark:text-amber-400 font-medium">Best Day</p>
                <p className="text-lg font-bold text-amber-900 dark:text-amber-100">
                  {formatCurrency(profitOverview?.best_day_profit || '0')}
                </p>
                <p className="text-xs text-amber-600 dark:text-amber-400">
                  {profitOverview?.best_day_date}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Performance */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="bg-gradient-to-br from-slate-50 to-gray-50 dark:from-slate-900 dark:to-gray-900 border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl bg-gradient-to-r from-slate-600 to-gray-600 bg-clip-text text-transparent">
              <PieChart className="h-6 w-6 text-slate-600" />
              Profit by Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPieChart>
                <defs>
                  {COLORS.map((color, index) => (
                    <linearGradient key={index} id={`categoryGradient${index}`} x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor={color} />
                      <stop offset="100%" stopColor={color} stopOpacity={0.8} />
                    </linearGradient>
                  ))}
                </defs>
                <Tooltip 
                  formatter={(value) => [formatCurrency(value as number), 'Profit']}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '12px',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.12)'
                  }}
                />
                <RechartsPieChart 
                  data={pieChartData} 
                  cx="50%" 
                  cy="50%" 
                  outerRadius={100} 
                  innerRadius={40}
                  dataKey="value"
                >
                  {pieChartData?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={`url(#categoryGradient${index % COLORS.length})`} />
                  ))}
                </RechartsPieChart>
              </RechartsPieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Category Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {categoryPerformance?.slice(0, 5).map((category, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-white/60 dark:bg-black/20 backdrop-blur-sm rounded-xl border border-white/20 hover:bg-white/80 dark:hover:bg-black/30 transition-all duration-200">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-4 h-4 rounded-full shadow-lg"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-slate-100">{category.category_name}</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {category.sales_count} sales • {formatPercentage(category.margin)} margin
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-slate-900 dark:text-slate-100">{formatCurrency(category.profit)}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">profit</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Top Customers */}
      <Card className="bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-emerald-950 dark:via-teal-950 dark:to-cyan-950 border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
            <Users className="h-6 w-6 text-emerald-600" />
            Top Profitable Customers
          </CardTitle>
          <p className="text-slate-600 dark:text-slate-400">Most valuable customers by monthly profit</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {topCustomers?.slice(0, 8).map((customer, index) => {
              const isTopThree = index < 3;
              const badgeColors = ['bg-gradient-to-r from-yellow-400 to-orange-400', 'bg-gradient-to-r from-slate-400 to-gray-400', 'bg-gradient-to-r from-amber-600 to-yellow-600'];
              
              return (
                <div key={index} className="flex items-center justify-between p-4 bg-white/60 dark:bg-black/20 backdrop-blur-sm rounded-xl border border-white/20 hover:bg-white/80 dark:hover:bg-black/30 transition-all duration-200 hover:scale-[1.02]">
                  <div className="flex items-center gap-4">
                    <Badge 
                      variant="outline" 
                      className={`w-10 h-10 rounded-full p-0 flex items-center justify-center font-bold text-white border-0 ${
                        isTopThree ? badgeColors[index] : 'bg-gradient-to-r from-slate-500 to-gray-500'
                      }`}
                    >
                      {index + 1}
                    </Badge>
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-slate-100">{customer.customer_name}</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {customer.monthly_orders} orders • {formatPercentage(customer.margin)} margin
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(customer.monthly_profit)}</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{formatCurrency(customer.monthly_revenue)} revenue</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Insights Tab Component
const InsightsTab = () => {
  const { data: profitOverview, isLoading: overviewLoading } = useQuery({
    queryKey: ['profit-overview'],
    queryFn: profitApi.getProfitOverview,
  });

  const { data: currentMonth, isLoading: currentMonthLoading } = useQuery({
    queryKey: ['profit-current-month'],
    queryFn: profitApi.getCurrentMonth,
  });

  const { data: weeklyPerformance, isLoading: weeklyLoading } = useQuery({
    queryKey: ['profit-weekly-performance'],
    queryFn: profitApi.getWeeklyPerformance,
  });

  const { data: todayPerformance, isLoading: todayLoading } = useQuery({
    queryKey: ['profit-today-performance'],
    queryFn: profitApi.getTodayPerformance,
  });

  if (overviewLoading || currentMonthLoading || weeklyLoading || todayLoading) {
    return (
      <div className="space-y-3">
        <div className="grid gap-6 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-[200px]" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-[200px] w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const todayProfit = parseFloat(todayPerformance?.today_profit || '0');
  const todayRevenue = parseFloat(todayPerformance?.today_revenue || '0');
  const todaySales = parseFloat(todayPerformance?.today_sales || '0');
  
  const weekProfit = parseFloat(weeklyPerformance?.week_profit || '0');
  const weekRevenue = parseFloat(weeklyPerformance?.week_revenue || '0');
  const weekSales = parseFloat(weeklyPerformance?.week_sales || '0');
  
  const monthProfit = parseFloat(currentMonth?.current_month_profit || '0');
  const monthRevenue = parseFloat(currentMonth?.current_month_revenue || '0');
  const monthMargin = parseFloat(currentMonth?.current_month_margin || '0');

  const bestDayProfit = parseFloat(profitOverview?.best_day_profit || '0');
  const ytdProfit = parseFloat(profitOverview?.ytd_profit || '0');

  // Calculate insights
  const avgDailyProfit = monthProfit / 30;
  const profitGrowth = todayProfit > avgDailyProfit ? ((todayProfit - avgDailyProfit) / avgDailyProfit) * 100 : 0;
  const avgSaleValue = todaySales > 0 ? todayRevenue / todaySales : 0;

  const insights = [
    {
      title: "Today's Performance",
      description: todayProfit > avgDailyProfit ? "Above average daily performance" : "Below average daily performance",
      value: formatCurrency(todayProfit),
      comparison: `${profitGrowth.toFixed(1)}% vs daily average`,
      trend: todayProfit > avgDailyProfit ? "up" : "down",
      color: todayProfit > avgDailyProfit ? "emerald" : "orange"
    },
    {
      title: "Weekly Momentum",
      description: "Current week profit performance",
      value: formatCurrency(weekProfit),
      comparison: `${weekSales} sales this week`,
      trend: "up",
      color: "blue"
    },
    {
      title: "Monthly Progress",
      description: "Month-to-date profit achievement",
      value: formatCurrency(monthProfit),
      comparison: `${monthMargin.toFixed(1)}% profit margin`,
      trend: "up", 
      color: "purple"
    },
    {
      title: "Best Performance",
      description: "Highest single-day profit recorded",
      value: formatCurrency(bestDayProfit),
      comparison: profitOverview?.best_day_date || "Recent achievement",
      trend: "up",
      color: "amber"
    }
  ];

  const recommendations = [
    {
      icon: TrendingUp,
      title: "Optimize High-Margin Products",
      description: "Focus on promoting products with margins above 25% to maximize daily profit",
      priority: "High",
      action: "Review product mix"
    },
    {
      icon: Users,
      title: "Strengthen Customer Relationships", 
      description: "Top customers contribute significantly to profit. Consider loyalty programs",
      priority: "Medium",
      action: "Implement rewards"
    },
    {
      icon: Calendar,
      title: "Maintain Consistency",
      description: `Current average of ${formatCurrency(avgDailyProfit)} daily profit is sustainable`,
      priority: "Medium", 
      action: "Monitor trends"
    },
    {
      icon: Target,
      title: "Set Performance Targets",
      description: "Establish weekly targets based on best day performance",
      priority: "Low",
      action: "Define goals"
    }
  ];

  return (
    <div className="space-y-3">
      {/* Key Insights Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {insights.map((insight, index) => {
          const colorVariants = {
            emerald: "from-emerald-50 to-teal-50 dark:from-emerald-950 dark:to-teal-950 border-emerald-200 dark:border-emerald-800",
            blue: "from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950 border-blue-200 dark:border-blue-800", 
            purple: "from-purple-50 to-violet-50 dark:from-purple-950 dark:to-violet-950 border-purple-200 dark:border-purple-800",
            amber: "from-amber-50 to-yellow-50 dark:from-amber-950 dark:to-yellow-950 border-amber-200 dark:border-amber-800",
            orange: "from-orange-50 to-red-50 dark:from-orange-950 dark:to-red-950 border-orange-200 dark:border-orange-800"
          };

          const iconColors = {
            emerald: "text-emerald-600 dark:text-emerald-400",
            blue: "text-blue-600 dark:text-blue-400",
            purple: "text-purple-600 dark:text-purple-400", 
            amber: "text-amber-600 dark:text-amber-400",
            orange: "text-orange-600 dark:text-orange-400"
          };

          const textColors = {
            emerald: "text-emerald-900 dark:text-emerald-100",
            blue: "text-blue-900 dark:text-blue-100",
            purple: "text-purple-900 dark:text-purple-100",
            amber: "text-amber-900 dark:text-amber-100", 
            orange: "text-orange-900 dark:text-orange-100"
          };

          return (
            <Card key={index} className={`bg-gradient-to-br ${colorVariants[insight.color as keyof typeof colorVariants]} border-0 shadow-lg`}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-2 bg-white/60 dark:bg-black/20 rounded-lg`}>
                    {insight.trend === "up" ? (
                      <TrendingUp className={`h-5 w-5 ${iconColors[insight.color as keyof typeof iconColors]}`} />
                    ) : (
                      <TrendingDown className={`h-5 w-5 ${iconColors[insight.color as keyof typeof iconColors]}`} />
                    )}
                  </div>
                </div>
                <div>
                  <h3 className={`font-semibold ${textColors[insight.color as keyof typeof textColors]} mb-1`}>
                    {insight.title}
                  </h3>
                  <p className="text-2xl font-bold mb-2 text-slate-900 dark:text-slate-100">
                    {insight.value}
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                    {insight.description}
                  </p>
                  <p className={`text-xs ${iconColors[insight.color as keyof typeof iconColors]} font-medium`}>
                    {insight.comparison}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Actionable Recommendations */}
      <Card className="bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-50 dark:from-slate-900 dark:via-gray-900 dark:to-zinc-900 border-0 shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl bg-gradient-to-r from-slate-600 to-zinc-600 bg-clip-text text-transparent">
            Smart Recommendations
          </CardTitle>
          <p className="text-slate-600 dark:text-slate-400">
            AI-powered insights to improve your profit performance
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {recommendations.map((rec, index) => {
              const priorityColors = {
                High: "from-red-500 to-orange-500",
                Medium: "from-blue-500 to-purple-500", 
                Low: "from-green-500 to-teal-500"
              };

              const priorityBg = {
                High: "from-red-50 to-orange-50 dark:from-red-950 dark:to-orange-950",
                Medium: "from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950",
                Low: "from-green-50 to-teal-50 dark:from-green-950 dark:to-teal-950"
              };

              return (
                <div key={index} className={`p-6 bg-gradient-to-br ${priorityBg[rec.priority as keyof typeof priorityBg]} rounded-xl border border-white/20 shadow-lg`}>
                  <div className="flex items-start gap-4">
                    <div className={`p-3 bg-gradient-to-r ${priorityColors[rec.priority as keyof typeof priorityColors]} rounded-lg shadow-lg`}>
                      <rec.icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                          {rec.title}
                        </h3>
                        <Badge 
                          variant="outline" 
                          className={`text-xs px-2 py-1 bg-gradient-to-r ${priorityColors[rec.priority as keyof typeof priorityColors]} text-white border-0`}
                        >
                          {rec.priority}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                        {rec.description}
                      </p>
                      <div className="flex items-center gap-2">
                        <ArrowUpRight className="h-4 w-4 text-slate-500" />
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          {rec.action}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Performance Summary */}
      <Card className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-indigo-950 dark:via-purple-950 dark:to-pink-950 border-0 shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Performance Summary
          </CardTitle>
          <p className="text-slate-600 dark:text-slate-400">
            Key metrics and profit achievement overview
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="text-center p-6 bg-white/60 dark:bg-black/20 backdrop-blur-sm rounded-xl border border-white/20">
              <div className="w-16 h-16 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <DollarSign className="h-8 w-8 text-white" />
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">Average Sale Value</h3>
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {formatCurrency(avgSaleValue)}
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400">Per transaction</p>
            </div>

            <div className="text-center p-6 bg-white/60 dark:bg-black/20 backdrop-blur-sm rounded-xl border border-white/20">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Calendar className="h-8 w-8 text-white" />
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">Daily Average</h3>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {formatCurrency(avgDailyProfit)}
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400">Monthly basis</p>
            </div>

            <div className="text-center p-6 bg-white/60 dark:bg-black/20 backdrop-blur-sm rounded-xl border border-white/20">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Target className="h-8 w-8 text-white" />
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">YTD Achievement</h3>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {formatCurrency(ytdProfit)}
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400">Year to date</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default function Profit() {
  const { data: periodComparison, isLoading: periodLoading } = useQuery({
    queryKey: ['profit-period-comparison'],
    queryFn: profitApi.getPeriodComparison,
  });

  return (
    <PincodeProtection 
      title="Profit Analytics" 
      description="Access detailed profit analysis and performance insights"
    >
      <div className="container mx-auto p-3 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
            Profit Analytics
          </h1>
        </div>
      </div>

      {/* Overview Cards */}
      <OverviewCards />

      {/* Period Comparison Section */}
      <PeriodComparisonChart data={periodComparison || []} isLoading={periodLoading} />

      {/* Main Profit Chart */}
      <ProfitMainChart />

      {/* Main Content Tabs */}
      <Tabs defaultValue="performance" className="space-y-3">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto">
          <TabsTrigger value="performance" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Performance
          </TabsTrigger>
          <TabsTrigger value="trends" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Trends
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="insights" className="flex items-center gap-2">
            <Star className="h-4 w-4" />
            Insights
          </TabsTrigger>
        </TabsList>

        <TabsContent value="performance">
          <PerformanceTab />
        </TabsContent>

        <TabsContent value="trends">
          <TrendsTab />
        </TabsContent>

        <TabsContent value="analytics">
          <AnalyticsTab />
        </TabsContent>

        <TabsContent value="insights">
          <InsightsTab />
        </TabsContent>
      </Tabs>
      </div>
    </PincodeProtection>
  );
}