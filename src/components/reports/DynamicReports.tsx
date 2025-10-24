
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  AreaChart,
  Area,
  Legend,
  TooltipProps,
  ScatterChart,
  Scatter,
  RadialBarChart,
  RadialBar
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  ShoppingCart, 
  Package2, 
  Users, 
  DollarSign,
  Calendar,
  FileText,
  Download,
  RefreshCw,
  AlertTriangle,
  Target,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Zap,
  Eye,
  PieChart,
  BarChart3,
  Sparkles,
  Brain
} from 'lucide-react';
import { customerApi, type DashboardStats } from '@/services/customerApi';
import { reportsApi, type ProfitabilityTrendData, type CustomerSegmentData, type RevenueForecastData, type InventoryHealthData, type KPIMetricsData, type PerformanceScorecardData, type OpportunityData, type RiskData, type ActionItemData } from '@/services/reportsApi';
import { useToast } from '@/hooks/use-toast';
import { generateReportPDF } from '@/utils/reportsPdfGenerator';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
const GEMINI_API_KEY = 'AIzaSyDscgxHRLCy4suVBigT1g_pXMnE7tH_Ejw';

// Gemini AI Integration
const generateAIInsights = async (data: any, context: string) => {
  try {
    const prompt = `Analyze this ${context} data and provide 3 key business insights: ${JSON.stringify(data)}`;
    
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }]
      })
    });

    const result = await response.json();
    return result.candidates[0]?.content?.parts[0]?.text || 'Unable to generate insights';
  } catch (error) {
    console.error('Gemini AI Error:', error);
    return 'AI insights temporarily unavailable';
  }
};

const DynamicReports = () => {
  const { toast } = useToast();
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportReportType, setExportReportType] = useState('');
  const [forecastPeriod, setForecastPeriod] = useState('6');
  const [alertThreshold, setAlertThreshold] = useState('10');
  const [aiInsights, setAiInsights] = useState<Record<string, string>>({});
  const [loadingAI, setLoadingAI] = useState(false);

  // Real data states
  const [profitabilityData, setProfitabilityData] = useState<ProfitabilityTrendData[]>([]);
  const [customerSegments, setCustomerSegments] = useState<CustomerSegmentData[]>([]);
  const [revenueForecast, setRevenueForecast] = useState<RevenueForecastData[]>([]);
  const [inventoryHealth, setInventoryHealth] = useState<InventoryHealthData[]>([]);
  const [kpiMetrics, setKpiMetrics] = useState<KPIMetricsData | null>(null);
  const [performanceScorecard, setPerformanceScorecard] = useState<PerformanceScorecardData | null>(null);
  const [growthOpportunities, setGrowthOpportunities] = useState<OpportunityData[]>([]);
  const [riskFactors, setRiskFactors] = useState<RiskData[]>([]);
  const [actionItems, setActionItems] = useState<ActionItemData[]>([]);

  useEffect(() => {
    fetchAllReportsData();
  }, [selectedPeriod, selectedYear]);

  const fetchAllReportsData = async () => {
    try {
      setLoading(true);
      
      console.log('Fetching dashboard stats...');
      const dashboardResponse = await customerApi.getDashboardStats();
      if (dashboardResponse.success) {
        setDashboardStats(dashboardResponse.data);
        console.log('Dashboard stats loaded:', dashboardResponse.data);
      }

      console.log('Fetching all advanced reports data...');
      await Promise.all([
        fetchProfitabilityData(),
        fetchCustomerSegmentation(),
        fetchRevenueForecast(),
        fetchInventoryHealth(),
        fetchKPIMetrics(),
        fetchPerformanceScorecard(),
        fetchStrategicData()
      ]);

      toast({
        title: "Success",
        description: "All reports data loaded successfully",
      });
    } catch (error) {
      console.error('Failed to fetch reports data:', error);
      toast({
        title: "Error",
        description: "Failed to load some reports data. Check console for details.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchProfitabilityData = async () => {
    try {
      console.log('Fetching profitability trend...');
      const response = await reportsApi.getProfitabilityTrend({
        period: selectedPeriod,
        year: selectedYear,
        months: 12
      });
      if (response.success && response.data) {
        setProfitabilityData(response.data);
        console.log('Profitability data loaded:', response.data);
      } else {
        console.log('No profitability data returned');
      }
    } catch (error) {
      console.error('Failed to fetch profitability data:', error);
    }
  };

  const fetchCustomerSegmentation = async () => {
    try {
      console.log('Fetching customer segmentation...');
      const response = await reportsApi.getCustomerSegmentation({
        period: selectedPeriod,
        segmentBy: 'value'
      });
      if (response.success && response.data) {
        setCustomerSegments(response.data);
        console.log('Customer segments loaded:', response.data);
      } else {
        console.log('No customer segmentation data returned');
      }
    } catch (error) {
      console.error('Failed to fetch customer segmentation:', error);
    }
  };

  const fetchRevenueForecast = async () => {
    try {
      console.log('Fetching revenue forecast...');
      const response = await reportsApi.getRevenueForecast({
        months: parseInt(forecastPeriod),
        includeConfidence: true,
        model: 'ai'
      });
      if (response.success && response.data) {
        setRevenueForecast(response.data);
        console.log('Revenue forecast loaded:', response.data);
      } else {
        console.log('No revenue forecast data returned');
      }
    } catch (error) {
      console.error('Failed to fetch revenue forecast:', error);
    }
  };

  const fetchInventoryHealth = async () => {
    try {
      console.log('Fetching inventory health...');
      const response = await reportsApi.getInventoryHealthMatrix();
      if (response.success && response.data) {
        setInventoryHealth(response.data);
        console.log('Inventory health loaded:', response.data);
      } else {
        console.log('No inventory health data returned');
      }
    } catch (error) {
      console.error('Failed to fetch inventory health:', error);
    }
  };

  const fetchKPIMetrics = async () => {
    try {
      console.log('Fetching KPI metrics...');
      const response = await reportsApi.getKPIMetrics({
        period: selectedPeriod,
        compareWith: 'lastPeriod'
      });
      if (response.success && response.data) {
        setKpiMetrics(response.data);
        console.log('KPI metrics loaded:', response.data);
      } else {
        console.log('No KPI metrics data returned');
      }
    } catch (error) {
      console.error('Failed to fetch KPI metrics:', error);
    }
  };

  const fetchPerformanceScorecard = async () => {
    try {
      console.log('Fetching performance scorecard...');
      const response = await reportsApi.getPerformanceScorecard();
      if (response.success && response.data) {
        setPerformanceScorecard(response.data);
        console.log('Performance scorecard loaded:', response.data);
      } else {
        console.log('No performance scorecard data returned');
      }
    } catch (error) {
      console.error('Failed to fetch performance scorecard:', error);
    }
  };

  const fetchStrategicData = async () => {
    try {
      console.log('Fetching strategic data...');
      const [opportunitiesRes, risksRes, actionsRes] = await Promise.all([
        reportsApi.getGrowthOpportunities(),
        reportsApi.getRiskFactors(),
        reportsApi.getActionItems({ priority: 'high', timeframe: 'short' })
      ]);

      if (opportunitiesRes.success && opportunitiesRes.data) {
        setGrowthOpportunities(opportunitiesRes.data);
        console.log('Growth opportunities loaded:', opportunitiesRes.data);
      }
      if (risksRes.success && risksRes.data) {
        setRiskFactors(risksRes.data);
        console.log('Risk factors loaded:', risksRes.data);
      }
      if (actionsRes.success && actionsRes.data) {
        setActionItems(actionsRes.data);
        console.log('Action items loaded:', actionsRes.data);
      }
    } catch (error) {
      console.error('Failed to fetch strategic data:', error);
    }
  };

  const generateInsights = async (dataType: string, data: any) => {
    if (!data || (Array.isArray(data) && data.length === 0)) return;
    
    setLoadingAI(true);
    try {
      const insights = await generateAIInsights(data, dataType);
      setAiInsights(prev => ({ ...prev, [dataType]: insights }));
    } catch (error) {
      console.error('Failed to generate AI insights:', error);
    } finally {
      setLoadingAI(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Process customer segments for chart
  const processCustomerSegments = () => {
    if (!customerSegments || customerSegments.length === 0) return [];
    
    const segmentCounts = customerSegments.reduce((acc, customer) => {
      acc[customer.segment] = (acc[customer.segment] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(segmentCounts).map(([segment, count]) => ({
      segment: segment.charAt(0).toUpperCase() + segment.slice(1),
      customers: count,
      revenue: customerSegments
        .filter(c => c.segment === segment)
        .reduce((sum, c) => sum + c.value, 0)
    }));
  };

  // Process inventory health for visualization
  const processInventoryHealth = () => {
    if (!inventoryHealth || inventoryHealth.length === 0) return [];
    
    const statusCounts = inventoryHealth.reduce((acc, item) => {
      acc[item.status] = (acc[item.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(statusCounts).map(([status, count]) => ({
      category: status.charAt(0).toUpperCase() + status.slice(1),
      count,
      percentage: Math.round((count / inventoryHealth.length) * 100)
    }));
  };

  const handleExportPDF = (reportType: string, period: string) => {
    if (!dashboardStats) {
      toast({
        title: "Error",
        description: "No data available for export",
        variant: "destructive"
      });
      return;
    }

    const reportData = {
      title: `${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report`,
      period: period.charAt(0).toUpperCase() + period.slice(1),
      generatedAt: new Date().toLocaleDateString(),
      financial: {
        revenue: dashboardStats.financial.monthRevenue,
        expenses: dashboardStats.financial.monthExpenses,
        profit: dashboardStats.financial.netProfit,
        profitMargin: dashboardStats.financial.profitMargin
      },
      sales: {
        totalSales: dashboardStats.sales.todaySales,
        avgOrderValue: dashboardStats.sales.avgOrderValue
      },
      customers: {
        totalCustomers: dashboardStats.customers.totalCustomers,
        newCustomers: dashboardStats.customers.newCustomersThisMonth,
        avgCustomerValue: dashboardStats.customers.avgCustomerValue
      },
      cashFlow: [],
      categoryData: []
    };

    generateReportPDF(reportData);
    setShowExportModal(false);
    
    toast({
      title: "Export Successful",
      description: `${reportType} report has been exported as PDF`,
    });
  };

  const CustomTooltip = ({ active, payload, label }: TooltipProps<any, any>) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900 mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}: {typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-2">
          <RefreshCw className="h-5 w-5 animate-spin" />
          <span>Loading advanced reports...</span>
        </div>
      </div>
    );
  }

  const processedCustomerSegments = processCustomerSegments();
  const processedInventoryHealth = processInventoryHealth();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            Advanced Business Intelligence
            <Brain className="h-6 w-6 text-purple-600" />
          </h2>
          <p className="text-gray-600">Deep insights and predictive analytics powered by Gemini AI</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="quarterly">Quarterly</SelectItem>
              <SelectItem value="yearly">Yearly</SelectItem>
            </SelectContent>
          </Select>
          
          <Button onClick={fetchAllReportsData} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Advanced Tabs */}
      <Tabs defaultValue="profitability" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profitability">Profitability Analysis</TabsTrigger>
          <TabsTrigger value="forecasting">Predictive Insights</TabsTrigger>
          <TabsTrigger value="performance">Performance Metrics</TabsTrigger>
          <TabsTrigger value="strategic">Strategic Intelligence</TabsTrigger>
        </TabsList>

        <TabsContent value="profitability" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Profitability Trend */}
            <Card className="shadow-lg border-0">
              <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-100">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-green-600" />
                      Profitability Trend Analysis
                    </CardTitle>
                    <p className="text-sm text-gray-600 mt-1">Revenue, costs, and profit margins over time</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => generateInsights('profitability', profitabilityData)}
                      disabled={loadingAI}
                    >
                      <Sparkles className="h-3 w-3 mr-1" />
                      AI Insights
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => {
                        setExportReportType('profitability');
                        setShowExportModal(true);
                      }}
                    >
                      <Download className="h-3 w-3 mr-1" />
                      Export
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {profitabilityData && profitabilityData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={profitabilityData}>
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="period" stroke="#666" />
                      <YAxis stroke="#666" tickFormatter={(value) => `${(value/1000).toFixed(0)}k`} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Area type="monotone" dataKey="revenue" stroke="#10b981" fillOpacity={1} fill="url(#colorRevenue)" name="Revenue" />
                      <Area type="monotone" dataKey="profit" stroke="#3b82f6" fillOpacity={1} fill="url(#colorProfit)" name="Profit" />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-[300px] text-gray-500">
                    <div className="text-center">
                      <Package2 className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>No profitability data available</p>
                      <p className="text-sm">Check your API connection</p>
                    </div>
                  </div>
                )}
                
                {aiInsights.profitability && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="font-semibold text-blue-900 flex items-center gap-2 mb-2">
                      <Brain className="h-4 w-4" />
                      AI Insights
                    </h4>
                    <p className="text-sm text-blue-800">{aiInsights.profitability}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Customer Segmentation */}
            <Card className="shadow-lg border-0">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-violet-100">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                      <Users className="h-5 w-5 text-purple-600" />
                      Customer Value Segmentation
                    </CardTitle>
                    <p className="text-sm text-gray-600 mt-1">Customer segments by value and behavior</p>
                  </div>
                  <Badge variant="outline" className="text-purple-600 border-purple-200 bg-white">
                    {processedCustomerSegments.length} Segments
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {processedCustomerSegments && processedCustomerSegments.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={processedCustomerSegments} layout="horizontal">
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis type="number" stroke="#666" tickFormatter={(value) => `${(value/1000).toFixed(0)}k`} />
                      <YAxis dataKey="segment" type="category" stroke="#666" width={80} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="revenue" fill="#8b5cf6" name="Revenue" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-[300px] text-gray-500">
                    <div className="text-center">
                      <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>No customer segmentation data available</p>
                      <p className="text-sm">Check your API connection</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="forecasting" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Forecast */}
            <Card className="shadow-lg border-0">
              <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-100">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                      <Activity className="h-5 w-5 text-orange-600" />
                      Revenue Forecast (AI Powered)
                    </CardTitle>
                    <p className="text-sm text-gray-600 mt-1">Machine learning predictions for next {forecastPeriod} months</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      value={forecastPeriod}
                      onChange={(e) => setForecastPeriod(e.target.value)}
                      className="w-16 h-8"
                      min="1"
                      max="12"
                    />
                    <span className="text-sm text-gray-600">months</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {revenueForecast && revenueForecast.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={revenueForecast}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="month" stroke="#666" />
                      <YAxis stroke="#666" tickFormatter={(value) => `${(value/1000000).toFixed(1)}M`} />
                      <Tooltip content={<CustomTooltip />} />
                      <Line 
                        type="monotone" 
                        dataKey="predictedRevenue" 
                        stroke="#f59e0b" 
                        strokeWidth={3}
                        strokeDasharray="5 5"
                        name="Predicted Revenue"
                      />
                      {revenueForecast.length > 0 && revenueForecast[0].confidence && (
                        <Line 
                          type="monotone" 
                          dataKey="confidence" 
                          stroke="#10b981" 
                          strokeWidth={2}
                          name="Confidence %"
                        />
                      )}
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-[300px] text-gray-500">
                    <div className="text-center">
                      <Activity className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>No revenue forecast data available</p>
                      <p className="text-sm">Check your API connection</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Inventory Health Matrix */}
            <Card className="shadow-lg border-0">
              <CardHeader className="bg-gradient-to-r from-red-50 to-pink-100">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                      <Package2 className="h-5 w-5 text-red-600" />
                      Inventory Health Matrix
                    </CardTitle>
                    <p className="text-sm text-gray-600 mt-1">Stock optimization and health indicators</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm text-gray-600">{inventoryHealth.filter(i => i.status === 'low').length} items need attention</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {processedInventoryHealth && processedInventoryHealth.length > 0 ? (
                  <div className="space-y-4">
                    {processedInventoryHealth.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${
                            item.category === 'Healthy' ? 'bg-green-500' :
                            item.category === 'Low' ? 'bg-yellow-500' : 'bg-red-500'
                          }`}></div>
                          <span className="font-medium">{item.category} Stock</span>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">{item.count} items</p>
                          <p className="text-sm text-gray-600">{item.percentage}%</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-[200px] text-gray-500">
                    <div className="text-center">
                      <Package2 className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>No inventory health data available</p>
                      <p className="text-sm">Check your API connection</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* KPI Cards */}
            {kpiMetrics ? (
              <>
                <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm opacity-90">Total Revenue</p>
                        <p className="text-2xl font-bold">{formatCurrency(kpiMetrics.revenue)}</p>
                        <p className="text-xs opacity-75">+{kpiMetrics.revenueGrowth}% vs last period</p>
                      </div>
                      <DollarSign className="h-8 w-8 opacity-80" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm opacity-90">Sales Count</p>
                        <p className="text-2xl font-bold">{kpiMetrics.salesCount}</p>
                        <p className="text-xs opacity-75">+{kpiMetrics.salesGrowth}% growth</p>
                      </div>
                      <Activity className="h-8 w-8 opacity-80" />
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <div className="col-span-2 text-center text-gray-500">
                <p>No KPI data available</p>
              </div>
            )}

            {performanceScorecard ? (
              <>
                <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm opacity-90">Sales Performance</p>
                        <p className="text-2xl font-bold">{performanceScorecard.salesPerformance}%</p>
                        <p className="text-xs opacity-75">Performance score</p>
                      </div>
                      <Users className="h-8 w-8 opacity-80" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm opacity-90">Customer Satisfaction</p>
                        <p className="text-2xl font-bold">{performanceScorecard.customerSatisfaction}%</p>
                        <p className="text-xs opacity-75">Satisfaction rate</p>
                      </div>
                      <Clock className="h-8 w-8 opacity-80" />
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <div className="col-span-2 text-center text-gray-500">
                <p>No performance scorecard data available</p>
              </div>
            )}
          </div>

          {/* Performance Scorecard */}
          {performanceScorecard && (
            <Card className="shadow-lg border-0">
              <CardHeader className="bg-gradient-to-r from-indigo-50 to-blue-100">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <Target className="h-5 w-5 text-indigo-600" />
                  Business Performance Scorecard
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900">Sales Performance</h4>
                    <div className="flex justify-between items-center">
                      <span>Performance Score</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-500 h-2 rounded-full" 
                            style={{width: `${performanceScorecard.salesPerformance}%`}}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">{performanceScorecard.salesPerformance}%</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900">Customer Satisfaction</h4>
                    <div className="flex justify-between items-center">
                      <span>Satisfaction Rate</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full" 
                            style={{width: `${performanceScorecard.customerSatisfaction}%`}}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">{performanceScorecard.customerSatisfaction}%</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900">Inventory Efficiency</h4>
                    <div className="flex justify-between items-center">
                      <span>Efficiency Score</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-purple-500 h-2 rounded-full" 
                            style={{width: `${performanceScorecard.inventoryEfficiency}%`}}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">{performanceScorecard.inventoryEfficiency}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="strategic" className="space-y-6">
          {/* Strategic Dashboard */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 shadow-lg border-0">
              <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-100">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <Eye className="h-5 w-5 text-slate-600" />
                    Strategic Business Intelligence
                  </CardTitle>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => generateInsights('strategic', { opportunities: growthOpportunities, risks: riskFactors })}
                    disabled={loadingAI}
                  >
                    <Brain className="h-3 w-3 mr-1" />
                    AI Analysis
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                      <ArrowUpRight className="h-4 w-4 text-green-500" />
                      Growth Opportunities
                    </h4>
                    <div className="space-y-3">
                      {growthOpportunities && growthOpportunities.length > 0 ? growthOpportunities.map((opportunity) => (
                        <div key={opportunity.id} className={`p-3 rounded-lg border-l-4 ${
                          opportunity.potential === 'high' ? 'bg-green-50 border-green-500' :
                          opportunity.potential === 'medium' ? 'bg-blue-50 border-blue-500' :
                          'bg-yellow-50 border-yellow-500'
                        }`}>
                          <p className={`font-medium ${
                            opportunity.potential === 'high' ? 'text-green-800' :
                            opportunity.potential === 'medium' ? 'text-blue-800' :
                            'text-yellow-800'
                          }`}>{opportunity.description}</p>
                          <p className={`text-sm ${
                            opportunity.potential === 'high' ? 'text-green-600' :
                            opportunity.potential === 'medium' ? 'text-blue-600' :
                            'text-yellow-600'
                          }`}>Potential: {opportunity.potential}</p>
                        </div>
                      )) : (
                        <p className="text-gray-500 text-sm">No growth opportunities data available</p>
                      )}
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                      <ArrowDownRight className="h-4 w-4 text-red-500" />
                      Risk Factors
                    </h4>
                    <div className="space-y-3">
                      {riskFactors && riskFactors.length > 0 ? riskFactors.map((risk) => (
                        <div key={risk.id} className={`p-3 rounded-lg border-l-4 ${
                          risk.severity === 'high' ? 'bg-red-50 border-red-500' :
                          risk.severity === 'medium' ? 'bg-yellow-50 border-yellow-500' :
                          'bg-gray-50 border-gray-500'
                        }`}>
                          <p className={`font-medium ${
                            risk.severity === 'high' ? 'text-red-800' :
                            risk.severity === 'medium' ? 'text-yellow-800' :
                            'text-gray-800'
                          }`}>{risk.description}</p>
                          <p className={`text-sm ${
                            risk.severity === 'high' ? 'text-red-600' :
                            risk.severity === 'medium' ? 'text-yellow-600' :
                            'text-gray-600'
                          }`}>Severity: {risk.severity}</p>
                        </div>
                      )) : (
                        <p className="text-gray-500 text-sm">No risk factors data available</p>
                      )}
                    </div>
                  </div>
                </div>
                
                {aiInsights.strategic && (
                  <div className="mt-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <h4 className="font-semibold text-purple-900 flex items-center gap-2 mb-2">
                      <Brain className="h-4 w-4" />
                      AI Strategic Analysis
                    </h4>
                    <p className="text-sm text-purple-800">{aiInsights.strategic}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="shadow-lg border-0">
              <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-100">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <Zap className="h-5 w-5 text-emerald-600" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-3">
                  <Button className="w-full justify-start" variant="outline">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Review Low Stock Items
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Users className="h-4 w-4 mr-2" />
                    Contact High-Value Customers
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Package2 className="h-4 w-4 mr-2" />
                    Optimize Inventory Levels
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Plan Growth Strategy
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <FileText className="h-4 w-4 mr-2" />
                    Generate Full Report
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Action Items */}
          <Card className="shadow-lg border-0">
            <CardHeader className="bg-gradient-to-r from-rose-50 to-pink-100">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Target className="h-5 w-5 text-rose-600" />
                Strategic Action Items & Goals
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {actionItems && actionItems.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900">High Priority Items</h4>
                    <div className="space-y-3">
                      {actionItems.filter(item => item.priority === 'high').map((item) => (
                        <div key={item.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <input type="checkbox" className="rounded" />
                          <div className="flex-1">
                            <span className="text-sm font-medium">{item.description}</span>
                            <p className="text-xs text-gray-600">Due: {new Date(item.dueDate).toLocaleDateString()}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900">Medium Priority Items</h4>
                    <div className="space-y-3">
                      {actionItems.filter(item => item.priority === 'medium').map((item) => (
                        <div key={item.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <input type="checkbox" className="rounded" />
                          <div className="flex-1">
                            <span className="text-sm font-medium">{item.description}</span>
                            <p className="text-xs text-gray-600">Due: {new Date(item.dueDate).toLocaleDateString()}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900">Long Term Goals</h4>
                    <div className="space-y-3">
                      {actionItems.filter(item => item.timeframe === 'long').map((item) => (
                        <div key={item.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <input type="checkbox" className="rounded" />
                          <div className="flex-1">
                            <span className="text-sm font-medium">{item.description}</span>
                            <p className="text-xs text-gray-600">Due: {new Date(item.dueDate).toLocaleDateString()}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  <Target className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No action items available</p>
                  <p className="text-sm">Check your API connection</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Export Modal */}
      <Dialog open={showExportModal} onOpenChange={setShowExportModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Export Advanced Report</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>Select the time period for your {exportReportType} report:</p>
            <div className="grid grid-cols-3 gap-3">
              <Button 
                variant="outline" 
                onClick={() => handleExportPDF(exportReportType, 'daily')}
              >
                Daily
              </Button>
              <Button 
                variant="outline" 
                onClick={() => handleExportPDF(exportReportType, 'weekly')}
              >
                Weekly
              </Button>
              <Button 
                variant="outline" 
                onClick={() => handleExportPDF(exportReportType, 'monthly')}
              >
                Monthly
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowExportModal(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DynamicReports;
