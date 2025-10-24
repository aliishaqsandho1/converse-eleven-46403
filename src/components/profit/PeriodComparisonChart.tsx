import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Calendar, BarChart3 } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Area,
  AreaChart
} from "recharts";
import { PeriodComparison } from "@/services/profitApi";

interface PeriodComparisonChartProps {
  data: PeriodComparison[];
  isLoading: boolean;
}

const formatCurrency = (value: string | number) => {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'PKR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num).replace('PKR', 'Rs ');
};

const formatNumber = (value: string | number) => {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (num >= 10000000) {
    return (num / 10000000).toFixed(1) + 'Cr';
  } else if (num >= 100000) {
    return (num / 100000).toFixed(1) + 'L';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toFixed(0);
};

const getPeriodLabel = (period: string) => {
  const labels: Record<string, string> = {
    'today': 'Today',
    'last_week': 'Last Week',
    'last_2_weeks': '2 Weeks Ago',
    'last_3_weeks': '3 Weeks Ago',
    'last_4_weeks': '4 Weeks Ago',
    'last_30_days': 'Last 30 Days'
  };
  return labels[period] || period;
};

export function PeriodComparisonChart({ data, isLoading }: PeriodComparisonChartProps) {
  if (isLoading || !data) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Period Comparison Loading...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-96 bg-muted/50 animate-pulse rounded-lg" />
        </CardContent>
      </Card>
    );
  }

  const chartData = data.map(item => ({
    ...item,
    periodLabel: getPeriodLabel(item.period),
    revenueNum: parseFloat(item.revenue),
    profitNum: parseFloat(item.profit),
    margin: parseFloat(item.profit) / parseFloat(item.revenue) * 100
  }));

  // Summary cards data
  const todayData = data.find(d => d.period === 'today');
  const lastWeekData = data.find(d => d.period === 'last_week');
  const last30DaysData = data.find(d => d.period === 'last_30_days');

  const todayProfit = parseFloat(todayData?.profit || '0');
  const lastWeekProfit = parseFloat(lastWeekData?.profit || '0');
  const todayRevenue = parseFloat(todayData?.revenue || '0');
  const lastWeekRevenue = parseFloat(lastWeekData?.revenue || '0');

  const profitTrend = todayProfit > lastWeekProfit / 7 ? 'up' : 'down';
  const revenueTrend = todayRevenue > lastWeekRevenue / 7 ? 'up' : 'down';

  // Get top 3 periods by profit for highlights
  const topPeriods = [...chartData].sort((a, b) => b.profitNum - a.profitNum).slice(0, 3);
  const highestProfit = topPeriods[0];

  return (
    <div className="space-y-6">
      {/* Beautiful Unified Chart */}
      <Card className="col-span-1 shadow-xl border-0 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-2xl">
        <CardHeader className="pb-6">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-slate-800 via-slate-600 to-slate-800 dark:from-slate-200 dark:via-slate-400 dark:to-slate-200 bg-clip-text text-transparent">
                Performance Overview
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Revenue and profit trends across different time periods
              </p>
            </div>
            <Badge variant="secondary" className="bg-gradient-to-r from-emerald-100 to-blue-100 dark:from-emerald-900 dark:to-blue-900 text-emerald-700 dark:text-emerald-300 border-0">
              {chartData.length} Periods
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent>
          {/* Legend */}
          <div className="flex items-center justify-center gap-8 mb-8">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 shadow-lg"></div>
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Revenue</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 shadow-lg"></div>
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Profit</span>
            </div>
          </div>

          {/* Enhanced Area Chart */}
          <ResponsiveContainer  width="100%" height={400}>
            <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.3} />
                  <stop offset="50%" stopColor="#3B82F6" stopOpacity={0.1} />
                  <stop offset="100%" stopColor="#3B82F6" stopOpacity={0.05} />
                </linearGradient>
                <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10B981" stopOpacity={0.4} />
                  <stop offset="50%" stopColor="#10B981" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="#10B981" stopOpacity={0.05} />
                </linearGradient>
                
                {/* Glow effects */}
                <filter id="revenueGlow">
                  <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#3B82F6" floodOpacity="0.3"/>
                </filter>
                <filter id="profitGlow">
                  <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#10B981" floodOpacity="0.3"/>
                </filter>
              </defs>
              
              <CartesianGrid 
                strokeDasharray="2 4" 
                stroke="hsl(var(--muted-foreground))" 
                opacity={0.15}
                horizontal={true}
                vertical={false}
              />
              
              <XAxis 
                dataKey="periodLabel" 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                fontWeight={500}
                angle={-30}
                textAnchor="end"
                height={80}
                interval={0}
                className="text-slate-600 dark:text-slate-400"
              />
              
              <YAxis 
                yAxisId="left"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                fontWeight={500}
                tickFormatter={(value) => formatNumber(value)}
                className="text-slate-600 dark:text-slate-400"
              />
              <YAxis 
                yAxisId="right"
                orientation="right"
                stroke="#10B981"
                fontSize={12}
                fontWeight={500}
                tickFormatter={(value) => formatNumber(value)}
                className="text-emerald-600 dark:text-emerald-400"
              />
              
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(148, 163, 184, 0.2)',
                  borderRadius: '16px',
                  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                  padding: '16px',
                  fontSize: '14px'
                }}
                labelStyle={{
                  color: 'hsl(var(--foreground))',
                  fontWeight: 600,
                  marginBottom: '8px'
                }}
                formatter={(value, name) => [
                  formatCurrency(value as number),
                  name === 'revenueNum' ? 'Revenue' : 'Profit'
                ]}
                labelFormatter={(label) => `Period: ${label}`}
              />
              
              {/* Revenue Area */}
              <Area
                type="monotone"
                dataKey="revenueNum"
                yAxisId="left"
                stroke="#3B82F6"
                strokeWidth={3}
                fill="url(#revenueGradient)"
                filter="url(#revenueGlow)"
                dot={{ 
                  fill: '#3B82F6', 
                  strokeWidth: 3, 
                  r: 5,
                  stroke: '#ffffff',
                  filter: 'drop-shadow(0 2px 4px rgba(59, 130, 246, 0.3))'
                }}
                activeDot={{ 
                  r: 8, 
                  stroke: '#3B82F6', 
                  strokeWidth: 3,
                  fill: '#ffffff',
                  filter: 'drop-shadow(0 4px 8px rgba(59, 130, 246, 0.4))'
                }}
              />
              
              {/* Profit Area */}
              <Area
                type="monotone"
                dataKey="profitNum"
                yAxisId="right"
                stroke="#10B981"
                strokeWidth={3}
                fill="url(#profitGradient)"
                filter="url(#profitGlow)"
                dot={{ 
                  fill: '#10B981', 
                  strokeWidth: 3, 
                  r: 5,
                  stroke: '#ffffff',
                  filter: 'drop-shadow(0 2px 4px rgba(16, 185, 129, 0.3))'
                }}
                activeDot={{ 
                  r: 8, 
                  stroke: '#10B981', 
                  strokeWidth: 3,
                  fill: '#ffffff',
                  filter: 'drop-shadow(0 4px 8px rgba(16, 185, 129, 0.4))'
                }}
              />
            </AreaChart>
          </ResponsiveContainer>

          {/* Performance Highlights */}
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {topPeriods.map((period, index) => {
              const medalColors = [
                'from-yellow-400 to-yellow-600',
                'from-slate-400 to-slate-600', 
                'from-amber-600 to-amber-800'
              ];
              
              const bgColors = [
                'from-yellow-50 to-amber-50 dark:from-yellow-950 dark:to-amber-950 border-yellow-200 dark:border-yellow-800',
                'from-slate-50 to-gray-50 dark:from-slate-950 dark:to-gray-950 border-slate-200 dark:border-slate-800',
                'from-amber-50 to-orange-50 dark:from-amber-950 dark:to-orange-950 border-amber-200 dark:border-amber-800'
              ];

              return (
                <div key={period.period} className={`bg-gradient-to-br ${bgColors[index]} rounded-xl p-4 border shadow-lg`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${medalColors[index]} flex items-center justify-center text-white font-bold text-sm shadow-lg`}>
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-slate-900 dark:text-slate-100 text-sm">
                        {period.periodLabel}
                      </p>
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        {formatCurrency(period.profitNum)} profit
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className="text-xs">
                        {period.margin.toFixed(1)}%
                      </Badge>
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
}