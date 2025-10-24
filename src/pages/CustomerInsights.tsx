
import { useState, useEffect } from "react";
import { Users, Star, TrendingUp, Calendar, Eye, Mail, Phone, Search, Filter, Plus, BarChart3, PieChart, UserPlus, UserCheck, DollarSign, CreditCard, MapPin, Building2, User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart as RechartsPieChart, Pie, Cell } from 'recharts';
import { useToast } from "@/hooks/use-toast";
import { customerApi, type Customer, type CustomerInsights as CustomerInsightsType } from "@/services/customerApi";

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

export default function CustomerInsights() {
  const { toast } = useToast();
  const [insights, setInsights] = useState<CustomerInsightsType | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [apiConnected, setApiConnected] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  useEffect(() => {
    fetchCustomerInsights();
    fetchCustomers();
  }, [currentPage, filterType, filterStatus]);

  const fetchCustomerInsights = async () => {
    try {
      setApiConnected(false);
      const response = await customerApi.getCustomerInsights();
      
      if (response.success) {
        setApiConnected(true);
        setInsights(response.data);
      }
    } catch (error) {
      console.error('Error fetching customer insights:', error);
      toast({
        title: "API Connection Issue",
        description: "Using demo data. Check your API connection for live data.",
        variant: "destructive",
      });
    }
  };

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const params: any = { 
        page: currentPage, 
        limit: 10,
        search: searchTerm || undefined
      };
      
      if (filterType !== "all") {
        params.type = filterType;
      }
      
      if (filterStatus !== "all") {
        params.status = filterStatus;
      }

      const response = await customerApi.getCustomers(params);
      
      if (response.success) {
        setCustomers(response.data.customers);
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchCustomers();
  };

  const handleViewCustomer = async (customerId: number) => {
    try {
      const response = await customerApi.getCustomerById(customerId);
      if (response.success) {
        setSelectedCustomer(response.data);
        toast({
          title: "Customer Details",
          description: `Viewing details for ${response.data.name}`,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load customer details",
        variant: "destructive",
      });
    }
  };

  const handleContactCustomer = (customer: Customer, method: 'email' | 'phone') => {
    if (method === 'email' && customer.email) {
      window.location.href = `mailto:${customer.email}`;
      toast({
        title: "Email Client Opened",
        description: `Opening email to ${customer.name}`,
      });
    } else if (method === 'phone' && customer.phone) {
      window.location.href = `tel:${customer.phone}`;
      toast({
        title: "Calling Customer",
        description: `Initiating call to ${customer.name}`,
      });
    }
  };

  const getStatusBadge = (status: string) => {
    return (
      <Badge className={status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
        {status === 'active' ? <UserCheck className="h-3 w-3 mr-1" /> : <User className="h-3 w-3 mr-1" />}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getTypeBadge = (type: string) => {
    return (
      <Badge className={type === 'business' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}>
        {type === 'business' ? <Building2 className="h-3 w-3 mr-1" /> : <User className="h-3 w-3 mr-1" />}
        {type === 'business' ? 'Business' : 'Individual'}
      </Badge>
    );
  };

  if (loading && !insights) {
    return (
      <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-gray-500">Loading customer insights...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 space-y-3 min-h-[calc(100vh-65px)]">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Customer Insights</h1>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-gray-600">Comprehensive customer analytics and management</p>
            {!apiConnected && (
              <Badge variant="outline" className="text-orange-600 border-orange-200 bg-orange-50">
                Demo Data
              </Badge>
            )}
          </div>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Add Customer
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Customers</p>
                <p className="text-2xl font-bold text-gray-900">{insights?.totalCustomers || 0}</p>
                <p className="text-sm text-blue-600">+{insights?.newCustomersThisMonth || 0} this month</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <UserCheck className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Customers</p>
                <p className="text-2xl font-bold text-gray-900">{insights?.activeCustomers || 0}</p>
                <p className="text-sm text-green-600">{insights?.customerRetention || 0}% retention rate</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg. Customer Value</p>
                <p className="text-2xl font-bold text-gray-900">Rs. {insights?.averageCustomerValue?.toLocaleString() || 0}</p>
                <p className="text-sm text-purple-600">Lifetime value</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <CreditCard className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Receivables</p>
                <p className="text-2xl font-bold text-gray-900">Rs. {insights?.totalReceivables?.toLocaleString() || 0}</p>
                <p className="text-sm text-orange-600">Outstanding amounts</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="customers">Customer List</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Customer Growth Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                  Customer Growth Trend
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={insights?.customerGrowth || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Line dataKey="newCustomers" stroke="#3b82f6" name="New Customers" strokeWidth={2} />
                      <Line dataKey="totalCustomers" stroke="#10b981" name="Total Customers" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Customer Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5 text-green-600" />
                  Customer Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={insights?.customersByType || []}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                        label={({ type, percentage }) => `${type}: ${percentage.toFixed(1)}%`}
                      >
                        {(insights?.customersByType || []).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Top Customers */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-600" />
                Top Customers by Value
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {(insights?.topCustomers || []).slice(0, 5).map((customer, index) => (
                  <div key={customer.id} className="flex items-center justify-between p-4 border-2 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
                        <span className="text-sm font-bold text-slate-500">#{index + 1}</span>
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-500">{customer.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          {getTypeBadge(customer.type)}
                          <span className="text-sm text-gray-500 flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {customer.city}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">Rs. {customer.totalPurchases.toLocaleString()}</p>
                      <p className="text-sm text-gray-500">Balance: Rs. {customer.currentBalance.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Customer Value Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Customer Value Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={insights?.lifetimeValue.distribution || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="range" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Customer Status Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Customer Status Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(insights?.customersByStatus || []).map((status, index) => (
                    <div key={status.status} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-4 h-4 rounded-full" 
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="font-medium">{status.status}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold">{status.count}</p>
                        <p className="text-sm text-gray-500">{status.percentage.toFixed(1)}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="customers" className="space-y-6">
          {/* Filters and Search */}
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  Customer Management
                </CardTitle>
                <div className="flex gap-3 w-full md:w-auto">
                  <div className="relative flex-1 md:w-64">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search customers..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                      className="pl-10"
                    />
                  </div>
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="business">Business</SelectItem>
                      <SelectItem value="individual">Individual</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button onClick={handleSearch} variant="outline">
                    <Filter className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Total Purchases</TableHead>
                    <TableHead>Balance</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customers.map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{customer.name}</div>
                          <div className="text-sm text-gray-500 flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {customer.city}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getTypeBadge(customer.type)}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{customer.email}</div>
                          <div className="text-gray-500">{customer.phone}</div>
                        </div>
                      </TableCell>
                      <TableCell>Rs. {customer.totalPurchases.toLocaleString()}</TableCell>
                      <TableCell>Rs. {customer.currentBalance.toLocaleString()}</TableCell>
                      <TableCell>{getStatusBadge(customer.status)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleViewCustomer(customer.id)}
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleContactCustomer(customer, 'email')}
                            disabled={!customer.email}
                          >
                            <Mail className="h-3 w-3" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleContactCustomer(customer, 'phone')}
                            disabled={!customer.phone}
                          >
                            <Phone className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Key Performance Indicators</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded">
                    <span className="font-medium">Customer Retention Rate</span>
                    <span className="text-xl font-bold text-blue-600">{insights?.customerRetention || 0}%</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded">
                    <span className="font-medium">Average Lifetime Value</span>
                    <span className="text-xl font-bold text-green-600">Rs. {insights?.lifetimeValue.average?.toLocaleString() || 0}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-purple-50 rounded">
                    <span className="font-medium">New Customers This Month</span>
                    <span className="text-xl font-bold text-purple-600">{insights?.newCustomersThisMonth || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Performing Customer</CardTitle>
              </CardHeader>
              <CardContent>
                {insights?.lifetimeValue.highest && (
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                        <Star className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">{insights.lifetimeValue.highest.name}</h3>
                        <p className="text-gray-600">{insights.lifetimeValue.highest.city}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Total Purchases:</span>
                        <p className="font-bold">Rs. {insights.lifetimeValue.highest.totalPurchases.toLocaleString()}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Current Balance:</span>
                        <p className="font-bold">Rs. {insights.lifetimeValue.highest.currentBalance.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
