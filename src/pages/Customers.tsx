import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Users, Search, Plus, Edit, CreditCard, Phone, MapPin, Calendar, Mail, Building, IdCard, Receipt, History, AlertCircle, Banknote, Download, Trash2, Archive } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { customersApi } from "@/services/api";
import { CustomerEditModal } from "@/components/customers/CustomerEditModal";
import { apiConfig } from "@/utils/apiConfig";

import { CustomersList } from "@/components/customers/CustomersList";
import { CustomersPagination } from "@/components/customers/CustomersPagination";
import { generateAllCustomersPDF } from "@/utils/allCustomersPdfGenerator";

const Customers = () => {
  const { toast } = useToast();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [customerTypeFilter, setCustomerTypeFilter] = useState("all");
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [customersLoading, setCustomersLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("active");
  const [inactiveCustomers, setInactiveCustomers] = useState<any[]>([]);
  const [inactiveLoading, setInactiveLoading] = useState(false);
  
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 50
  });

  // States for customer edit modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [customerToEdit, setCustomerToEdit] = useState<any>(null);

  const customerTypes = [
    { value: "all", label: "All Customers" },
    { value: "Temporary", label: "Temporary" },
    { value: "Semi-Permanent", label: "Semi-Permanent" },
    { value: "Permanent", label: "Permanent" },
  ];

  // Debounced search
  const [searchDebounce, setSearchDebounce] = useState<NodeJS.Timeout | null>(null);

  const fetchCustomers = useCallback(async (page = 1, search = searchTerm, type = customerTypeFilter) => {
    try {
      setCustomersLoading(true);
      const params: any = {
        page,
        limit: 50,
        status: 'active',
        includeHistoricalData: true,
        allTime: true
      };
      
      if (search) params.search = search;
      if (type !== 'all') params.type = type;

      console.log('Fetching customers with params:', params);
      const response = await customersApi.getAll(params);
      console.log('API Response:', response);
      
      if (response.success) {
        // Use the data structure directly from the API
        const apiData = response.data;
        const customersArray = apiData?.customers || [];
        
        console.log('Customers from API:', customersArray);
        setCustomers(customersArray);
        
        // Use pagination info from API
        if (apiData?.pagination) {
          setPagination(apiData.pagination);
        } else {
          setPagination({
            currentPage: 1,
            totalPages: 1,
            totalItems: customersArray.length,
            itemsPerPage: 50
          });
        }
      } else {
        console.error('API returned error:', response);
        setCustomers([]);
        toast({
          title: "Error",
          description: response.message || "Failed to load customers",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Failed to fetch customers:', error);
      setCustomers([]);
      toast({
        title: "Error",
        description: "Failed to load customers",
        variant: "destructive"
      });
    } finally {
      setCustomersLoading(false);
      setLoading(false);
    }
  }, [searchTerm, customerTypeFilter, toast]);

  // Initial load
  useEffect(() => {
    fetchCustomers();
  }, []);

  // Handle search with debouncing
  useEffect(() => {
    if (searchDebounce) {
      clearTimeout(searchDebounce);
    }

    const timeout = setTimeout(() => {
      fetchCustomers(1, searchTerm, customerTypeFilter);
    }, 500);

    setSearchDebounce(timeout);

    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [searchTerm, customerTypeFilter]);

  // Handle page change
  const handlePageChange = (page: number) => {
    fetchCustomers(page, searchTerm, customerTypeFilter);
  };

  // Fetch inactive customers
  const fetchInactiveCustomers = useCallback(async () => {
    try {
      setInactiveLoading(true);
      const params: any = {
        page: 1,
        limit: 10000,
        status: 'inactive'
      };
      
      console.log('Fetching inactive customers with params:', params);
      const response = await customersApi.getAll(params);
      console.log('Inactive API Response:', response);
      
      if (response.success) {
        const apiData = response.data;
        const customersArray = apiData?.customers || [];
        setInactiveCustomers(customersArray);
      } else {
        console.error('API returned error:', response);
        setInactiveCustomers([]);
      }
    } catch (error) {
      console.error('Failed to fetch inactive customers:', error);
      setInactiveCustomers([]);
    } finally {
      setInactiveLoading(false);
    }
  }, []);

  // Handle delete single customer
  const handleDeleteCustomer = async (customerId: number) => {
    if (!confirm('Are you sure you want to delete this customer? This action cannot be undone.')) {
      return;
    }
    
    try {
      // API call to delete customer (you'll implement on backend)
      const response = await fetch(`${apiConfig.getBaseUrl()}/customers/${customerId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        toast({
          title: "Customer Deleted",
          description: "Customer has been deleted successfully."
        });
        fetchInactiveCustomers();
      } else {
        throw new Error('Failed to delete customer');
      }
    } catch (error) {
      console.error('Failed to delete customer:', error);
      toast({
        title: "Error",
        description: "Failed to delete customer",
        variant: "destructive"
      });
    }
  };

  // Handle delete all inactive customers
  const handleDeleteAllInactive = async () => {
    if (!confirm('Are you sure you want to delete ALL inactive customers? This action cannot be undone.')) {
      return;
    }
    
    try {
      // API call to delete all inactive customers (you'll implement on backend)
      const response = await fetch(`${apiConfig.getBaseUrl()}/customers/inactive/bulk-delete`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        toast({
          title: "All Inactive Customers Deleted",
          description: "All inactive customers have been deleted successfully."
        });
        setInactiveCustomers([]);
      } else {
        throw new Error('Failed to delete customers');
      }
    } catch (error) {
      console.error('Failed to delete all inactive customers:', error);
      toast({
        title: "Error",
        description: "Failed to delete all inactive customers",
        variant: "destructive"
      });
    }
  };

  // Load inactive customers when tab changes
  useEffect(() => {
    if (activeTab === 'inactive') {
      fetchInactiveCustomers();
    }
  }, [activeTab, fetchInactiveCustomers]);


  const handleAddCustomer = async (formData: any) => {
    try {
      console.log('Creating customer with data:', formData);
      const response = await customersApi.create(formData);
      console.log('Create customer response:', response);
      
      if (response.success) {
        setIsDialogOpen(false);
        fetchCustomers(1); // Reset to first page after adding
        toast({
          title: "Customer Added",
          description: "New customer has been added successfully.",
        });
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to add customer",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Failed to add customer:', error);
      toast({
        title: "Error",
        description: "Failed to add customer",
        variant: "destructive"
      });
    }
  };

  const handleUpdateCustomer = async (customerId: number, formData: any) => {
    try {
      const response = await customersApi.update(customerId, formData);
      if (response.success) {
        fetchCustomers(pagination.currentPage);
        toast({
          title: "Customer Updated",
          description: "Customer has been updated successfully.",
        });
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to update customer",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Failed to update customer:', error);
      toast({
        title: "Error",
        description: "Failed to update customer",
        variant: "destructive"
      });
    }
  };

  // Handle edit customer
  const handleEditCustomer = (customer: any) => {
    setCustomerToEdit(customer);
    setIsEditModalOpen(true);
  };

  // Handle customer updated
  const handleCustomerUpdated = () => {
    fetchCustomers(pagination.currentPage);
    setIsEditModalOpen(false);
    setCustomerToEdit(null);
  };

  // Handle customer deleted
  const handleCustomerDeleted = () => {
    fetchCustomers(pagination.currentPage);
    setIsEditModalOpen(false);
    setCustomerToEdit(null);
  };

  // Use the currentBalance from API data
  const totalDues = customers.reduce((sum, customer) => sum + (customer.currentBalance || 0), 0);
  const activeCustomers = customers.filter(c => c.status === "active" || !c.status).length;
  const customersWithDues = customers.filter(c => (c.currentBalance || 0) > 0).length;

  if (loading) {
    return (
      <div className="flex-1 p-6 space-y-6 min-h-screen bg-background no-horizontal-scroll">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-muted-foreground">Loading customers...</div>
        </div>
      </div>
    );
  }

  // Add export all customers function
  const handleExportAllCustomers = async () => {
    try {
      if (customers.length === 0) {
        toast({
          title: "No Data",
          description: "No customers available to export.",
          variant: "destructive"
        });
        return;
      }

      console.log('Preparing to export ALL customers from API...');

      // Fetch ALL customers across all pages (ignore current pagination)
      const pageSize = 200; // higher page size to reduce requests
      let page = 1;
      let totalPages = 1;
      const allCustomers: any[] = [];

      do {
        const resp = await customersApi.getAll({ page, limit: pageSize });
        if (!resp.success) throw new Error(resp.message || 'Failed to fetch customers');

        const batch = resp.data?.customers || resp.data || [];
        const pag = resp.data?.pagination;
        if (Array.isArray(batch)) allCustomers.push(...batch);
        if (pag) {
          totalPages = pag.totalPages || 1;
        } else {
          // If no pagination info, assume everything returned in one go
          totalPages = 1;
        }

        console.log(`Fetched page ${page}/${totalPages}: +${batch.length} customers`);
        page += 1;
      } while (page <= totalPages);

      if (allCustomers.length === 0) {
        toast({ title: 'No Data', description: 'No customers available to export.', variant: 'destructive' });
        return;
      }

      console.log('Exporting all customers:', allCustomers.length);
      generateAllCustomersPDF(allCustomers);
      
      toast({
        title: 'Export Successful',
        description: `All customers report has been downloaded with ${allCustomers.length} customers.`,
      });
      
    } catch (error) {
      console.error('Failed to export all customers:', error);
      toast({
        title: 'Export Failed',
        description: 'Failed to generate the customers report.',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="flex-1 p-6 space-y-3 min-h-[calc(100vh-65px)] bg-background no-horizontal-scroll">
      {/* HEADER + ACTIONS */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Customer Management</h1>
            <p className="text-muted-foreground">Manage customer profiles, dues, and transactions</p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
          <Button 
            variant="outline" 
            onClick={handleExportAllCustomers}
            className="bg-purple-50 hover:bg-purple-100 text-purple-600 border-purple-200 w-full sm:w-auto"
          >
            <Download className="h-4 w-4 mr-2" />
            Export All Customers
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto">
                <Plus className="h-4 w-4 mr-2" />
                Add Customer
              </Button>
            </DialogTrigger>
            <CustomerDialog onSubmit={handleAddCustomer} onClose={() => setIsDialogOpen(false)} />
          </Dialog>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total Customers</p>
                <p className="text-2xl font-bold text-blue-600">{pagination.totalItems}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CreditCard className="h-8 w-8 text-red-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total Dues</p>
                <p className="text-2xl font-bold text-red-600">PKR {totalDues.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Active Customers</p>
                <p className="text-2xl font-bold text-green-600">{activeCustomers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-8 w-8 text-orange-500" />
              <div>
                <p className="text-sm text-muted-foreground">Customers with Dues</p>
                <p className="text-2xl font-bold text-orange-600">{customersWithDues}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for Active and Inactive Customers */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="active">
            <Users className="h-4 w-4 mr-2" />
            Active Customers
          </TabsTrigger>
          <TabsTrigger value="inactive">
            <Archive className="h-4 w-4 mr-2" />
            Old Customers
          </TabsTrigger>
        </TabsList>

        {/* Active Customers Tab */}
        <TabsContent value="active" className="space-y-3 mt-3">
          {/* Search and Filter */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search customers by name, phone, or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={customerTypeFilter} onValueChange={setCustomerTypeFilter}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {customerTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Customers List */}
          <CustomersList
            customers={customers}
            loading={customersLoading}
            onSelectCustomer={setSelectedCustomer}
            onEditCustomer={handleEditCustomer}
          />

          {/* Pagination */}
          <Card>
            <CardContent className="p-4">
              <CustomersPagination
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
                totalItems={pagination.totalItems}
                itemsPerPage={pagination.itemsPerPage}
                onPageChange={handlePageChange}
                loading={customersLoading}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Inactive Customers Tab */}
        <TabsContent value="inactive" className="space-y-3 mt-3">
          {/* Delete All Button */}
          {inactiveCustomers.length > 0 && (
            <Card>
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold text-foreground">Old Customers ({inactiveCustomers.length})</h3>
                    <p className="text-sm text-muted-foreground">These customers are marked as inactive</p>
                  </div>
                  <Button 
                    variant="destructive"
                    onClick={handleDeleteAllInactive}
                    disabled={inactiveLoading}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete All Old Customers
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Inactive Customers List with Delete Buttons */}
          <Card>
            <CardContent className="p-6">
              {inactiveLoading ? (
                <div className="text-center py-8">
                  <div className="text-lg text-muted-foreground">Loading old customers...</div>
                </div>
              ) : inactiveCustomers.length === 0 ? (
                <div className="text-center py-8">
                  <Archive className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-lg text-muted-foreground">No inactive customers found</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {inactiveCustomers.map((customer) => (
                    <Card key={customer.id} className="hover:shadow-lg transition-shadow border-orange-200">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <CardTitle className="text-lg text-foreground">{customer.name}</CardTitle>
                              <Badge className="text-xs bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100">
                                {customer.type || 'business'}
                              </Badge>
                              <Badge className="text-xs bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100">
                                Inactive
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                              <Phone className="h-4 w-4" />
                              {customer.phone || 'No phone'}
                            </div>
                          </div>
                          <div className="flex flex-col gap-2">
                            {(customer.currentBalance || 0) > 0 && (
                              <Badge variant="destructive" className="ml-2">
                                Due: PKR {customer.currentBalance?.toLocaleString()}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          <span className="truncate">{customer.address || 'Address not provided'}</span>
                        </div>

                        {customer.email && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Mail className="h-4 w-4" />
                            <span className="truncate">{customer.email}</span>
                          </div>
                        )}

                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Total Purchases</p>
                            <p className="font-bold text-green-600">PKR {customer.totalPurchases?.toLocaleString() || '0'}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Credit Limit</p>
                            <p className="font-medium text-foreground">PKR {customer.creditLimit?.toLocaleString() || '0'}</p>
                          </div>
                        </div>

                        {customer.lastPurchase && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            <span>Last purchase: {customer.lastPurchase}</span>
                          </div>
                        )}

                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => setSelectedCustomer(customer)}
                          >
                            View Details
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteCustomer(customer.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Customer Details Dialog */}
      {selectedCustomer && (
        <CustomerDetailsDialog
          customer={selectedCustomer}
          onClose={() => setSelectedCustomer(null)}
          onUpdate={handleUpdateCustomer}
        />
      )}

      {/* Customer Edit Modal */}
      {customerToEdit && (
        <CustomerEditModal
          open={isEditModalOpen}
          onOpenChange={setIsEditModalOpen}
          customer={customerToEdit}
          onCustomerUpdated={handleCustomerUpdated}
          onCustomerDeleted={handleCustomerDeleted}
        />
      )}
    </div>
  );
};

// Customer Dialog Component
const CustomerDialog = ({ onSubmit, onClose }: { onSubmit: (data: any) => void; onClose: () => void }) => {
  const [formData, setFormData] = useState({
    name: "", 
    phone: "+92", 
    email: "", 
    address: "", 
    city: "",
    type: "Permanent",
    creditLimit: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      return;
    }
    
    if (!formData.phone.trim() || formData.phone.trim() === "+92") {
      return;
    }
    
    onSubmit({
      ...formData,
      creditLimit: parseFloat(formData.creditLimit) || 0
    });
    setFormData({ 
      name: "", phone: "+92", email: "", address: "", city: "", type: "Permanent", creditLimit: "" 
    });
  };

  return (
    <DialogContent className="max-w-2xl">
      <DialogHeader>
        <DialogTitle>Add New Customer</DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">Customer Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required
            />
          </div>
          <div>
            <Label htmlFor="phone">Phone Number *</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => {
                const value = e.target.value;
                if (!value.startsWith("+92")) {
                  setFormData({...formData, phone: "+92"});
                } else {
                  setFormData({...formData, phone: value});
                }
              }}
              placeholder="+92XXXXXXXXXX"
              required
            />
          </div>
        </div>

        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
          />
        </div>

        <div>
          <Label htmlFor="address">Address</Label>
          <Textarea
            id="address"
            value={formData.address}
            onChange={(e) => setFormData({...formData, address: e.target.value})}
            rows={2}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              value={formData.city}
              onChange={(e) => setFormData({...formData, city: e.target.value})}
            />
          </div>
          <div>
            <Label htmlFor="type">Customer Type</Label>
            <Select value={formData.type} onValueChange={(value) => setFormData({...formData, type: value})}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Temporary">Temporary</SelectItem>
                <SelectItem value="Semi-Permanent">Semi-Permanent</SelectItem>
                <SelectItem value="Permanent">Permanent</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor="creditLimit">Credit Limit (PKR)</Label>
          <Input
            id="creditLimit"
            type="number"
            value={formData.creditLimit}
            onChange={(e) => setFormData({...formData, creditLimit: e.target.value})}
          />
        </div>

        <div className="flex gap-2 pt-4">
          <Button 
            type="submit" 
            className="flex-1"
            disabled={!formData.name.trim() || !formData.phone.trim() || formData.phone.trim() === "+92"}
          >
            Add Customer
          </Button>
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
        </div>
      </form>
    </DialogContent>
  );
};

// Customer Details Dialog Component
const CustomerDetailsDialog = ({ 
  customer, 
  onClose, 
  onUpdate 
}: { 
  customer: any; 
  onClose: () => void; 
  onUpdate: (id: number, data: any) => void;
}) => {
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{customer.name} - Customer Details</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="info" className="space-y-4">
          <TabsList>
            <TabsTrigger value="info">Information</TabsTrigger>
          </TabsList>
          
          <TabsContent value="info" className="space-y-4">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label>Contact Information</Label>
                  <div className="mt-2 space-y-2 text-sm">
                    <p><strong>Phone:</strong> {customer.phone || 'N/A'}</p>
                    <p><strong>Email:</strong> {customer.email || 'N/A'}</p>
                    <p><strong>Address:</strong> {customer.address || 'N/A'}</p>
                    <p><strong>City:</strong> {customer.city || 'N/A'}</p>
                    <p><strong>Type:</strong> {customer.type || 'business'}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <Label>Account Summary</Label>
                  <div className="mt-2 space-y-2 text-sm">
                    <p><strong>Total Purchases:</strong> PKR {customer.totalPurchases?.toLocaleString() || '0'}</p>
                    <p><strong>Credit Limit:</strong> PKR {customer.creditLimit?.toLocaleString() || '0'}</p>
                    <p><strong>Outstanding Amount:</strong> <span className="text-red-600 font-bold">PKR {(customer.currentBalance || 0)?.toLocaleString()}</span></p>
                    <p><strong>Available Credit:</strong> PKR {((customer.creditLimit || 0) - (customer.currentBalance || 0)).toLocaleString()}</p>
                    <p><strong>Last Purchase:</strong> {customer.lastPurchase || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default Customers;
