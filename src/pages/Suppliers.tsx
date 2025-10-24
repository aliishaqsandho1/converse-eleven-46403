import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Search, Plus, Edit, Trash2, Phone, Mail, MapPin, Package, DollarSign, TrendingUp, Building2, User, Calendar, FileText, Loader2, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { suppliersApi } from "@/services/api";

const Suppliers = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<any>(null);
  const [selectedSupplier, setSelectedSupplier] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch suppliers
  
  const { data: suppliersData, isLoading } = useQuery({
    queryKey: ['suppliers', currentPage, searchTerm, statusFilter],
    queryFn: () => suppliersApi.getAll({
      page: currentPage,
      limit: 20,
      search: searchTerm || undefined,
      status: statusFilter === 'all' ? undefined : statusFilter,
    }),
  });

  // Create supplier mutation
  const createSupplierMutation = useMutation({
    mutationFn: suppliersApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      setIsAddDialogOpen(false);
      toast({
        title: "Supplier Added",
        description: "New supplier has been added successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add supplier",
        variant: "destructive",
      });
    },
  });

  // Update supplier mutation
  const updateSupplierMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => suppliersApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      setEditingSupplier(null);
      toast({
        title: "Supplier Updated",
        description: "Supplier information has been updated",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update supplier",
        variant: "destructive",
      });
    },
  });

  // Delete supplier mutation with improved error handling
  const deleteSupplierMutation = useMutation({
    mutationFn: suppliersApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      toast({
        title: "Supplier Deleted",
        description: "Supplier has been removed from the system",
      });
    },
    onError: (error: any) => {
      console.error('Delete error:', error);
      
      // Handle 409 conflict error specifically
      if (error.message && error.message.includes('409')) {
        toast({
          title: "Cannot Delete Supplier",
          description: "This supplier cannot be deleted because it has associated products or purchase orders. Please remove or reassign them first.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: error.message || "Failed to delete supplier",
          variant: "destructive",
        });
      }
    },
  });

  const suppliers = suppliersData?.data?.suppliers || [];
  const pagination = suppliersData?.data?.pagination;

  const handleAddSupplier = (formData: any) => {
    createSupplierMutation.mutate(formData);
  };

  const handleEditSupplier = (formData: any) => {
    if (!editingSupplier?.id) return;
    updateSupplierMutation.mutate({ id: editingSupplier.id, data: formData });
  };

  const handleDeleteSupplier = async (id: number) => {
    console.log('Attempting to delete supplier:', id);
    try {
      await deleteSupplierMutation.mutateAsync(id);
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  const handleViewSupplier = async (supplier: any) => {
    try {
      const response = await suppliersApi.getById(supplier.id);
      if (response.success) {
        setSelectedSupplier(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch supplier details:', error);
      setSelectedSupplier(supplier);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (isLoading) {
    return (
      <div className="flex-1 p-6 space-y-6">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-3 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
        
          <div>
            <h1 className="text-3xl font-bold text-gray-500">Supplier Management</h1>
            <p className="text-gray-600">Manage your suppliers and vendor relationships</p>
          </div>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Add Supplier
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Supplier</DialogTitle>
            </DialogHeader>
            <SupplierForm 
              onSubmit={handleAddSupplier} 
              onClose={() => setIsAddDialogOpen(false)}
              isLoading={createSupplierMutation.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Building2 className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm text-gray-500">Total Suppliers</p>
                <p className="text-2xl font-bold text-blue-600">{pagination?.totalItems || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-sm text-gray-500">Active Suppliers</p>
                <p className="text-2xl font-bold text-green-600">
                  {suppliers.filter((s: any) => s.status === "active").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <DollarSign className="h-8 w-8 text-orange-500" />
              <div>
                <p className="text-sm text-gray-500">Total Purchases</p>
                <p className="text-2xl font-bold text-orange-600">
                  Rs. {suppliers.reduce((sum: number, s: any) => sum + (s.totalPurchases || 0), 0).toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Package className="h-8 w-8 text-red-500" />
              <div>
                <p className="text-sm text-gray-500">Pending Payments</p>
                <p className="text-2xl font-bold text-red-600">
                  Rs. {suppliers.reduce((sum: number, s: any) => sum + (s.pendingPayments || 0), 0).toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search suppliers by name, contact, or city..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Suppliers Table */}
      <Card>
        <CardHeader>
          <CardTitle>Suppliers List</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Supplier Info</TableHead>
                <TableHead>Contact Details</TableHead>
                <TableHead>Financial Status</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {suppliers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    <div className="text-muted-foreground">No suppliers found</div>
                  </TableCell>
                </TableRow>
              ) : (
                suppliers.map((supplier: any) => (
                  <TableRow key={supplier.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{supplier.name}</p>
                        <p className="text-sm text-gray-500">Contact: {supplier.contactPerson}</p>
                        <p className="text-xs text-gray-400">{supplier.city}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-sm">
                          <Phone className="h-3 w-3" />
                          {supplier.phone}
                        </div>
                        <div className="flex items-center gap-1 text-sm">
                          <Mail className="h-3 w-3" />
                          {supplier.email}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm font-medium">Total: Rs. {(supplier.totalPurchases || 0).toLocaleString()}</p>
                        {supplier.pendingPayments > 0 && (
                          <p className="text-sm text-red-600">Due: Rs. {supplier.pendingPayments.toLocaleString()}</p>
                        )}
                        <p className="text-xs text-gray-500">
                          Last Order: {supplier.lastOrderDate ? new Date(supplier.lastOrderDate).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={supplier.status === "active" ? "default" : "secondary"}>
                        {supplier.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewSupplier(supplier)}
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          View
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingSupplier(supplier)}
                        >
                          <Edit className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600"
                              disabled={deleteSupplierMutation.isPending}
                            >
                              {deleteSupplierMutation.isPending ? (
                                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                              ) : (
                                <Trash2 className="h-3 w-3 mr-1" />
                              )}
                              Delete
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Supplier</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this supplier? This action cannot be undone.
                                {supplier.productsCount > 0 && (
                                  <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
                                    <strong>Warning:</strong> This supplier has {supplier.productsCount} associated products. 
                                    Deletion may fail if there are active relationships.
                                  </div>
                                )}
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => handleDeleteSupplier(supplier.id)}
                                className="bg-red-600 hover:bg-red-700"
                                disabled={deleteSupplierMutation.isPending}
                              >
                                {deleteSupplierMutation.isPending ? (
                                  <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Deleting...
                                  </>
                                ) : (
                                  "Delete"
                                )}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="mt-4">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                      className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                  
                  {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                    <PaginationItem key={page}>
                      <PaginationLink
                        onClick={() => handlePageChange(page)}
                        isActive={page === currentPage}
                        className="cursor-pointer"
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  
                  <PaginationItem>
                    <PaginationNext 
                      onClick={() => handlePageChange(Math.min(pagination.totalPages, currentPage + 1))}
                      className={currentPage === pagination.totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Supplier Dialog */}
      <Dialog open={!!editingSupplier} onOpenChange={() => setEditingSupplier(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Supplier</DialogTitle>
          </DialogHeader>
          <SupplierForm 
            supplier={editingSupplier}
            onSubmit={handleEditSupplier}
            onClose={() => setEditingSupplier(null)}
            isLoading={updateSupplierMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* View Supplier Dialog */}
      <Dialog open={!!selectedSupplier} onOpenChange={() => setSelectedSupplier(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Supplier Details
            </DialogTitle>
          </DialogHeader>
          {selectedSupplier && <SupplierDetails supplier={selectedSupplier} />}
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Supplier Form Component
const SupplierForm = ({ supplier, onSubmit, onClose, isLoading }: any) => {
  const [formData, setFormData] = useState({
    name: supplier?.name || "",
    contactPerson: supplier?.contactPerson || "",
    phone: supplier?.phone || "",
    email: supplier?.email || "",
    address: supplier?.address || "",
    city: supplier?.city || "",
    status: supplier?.status || "active"
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Supplier Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            required
          />
        </div>
        <div>
          <Label htmlFor="contactPerson">Contact Person</Label>
          <Input
            id="contactPerson"
            value={formData.contactPerson}
            onChange={(e) => setFormData({...formData, contactPerson: e.target.value})}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => setFormData({...formData, phone: e.target.value})}
          />
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
      </div>

      <div>
        <Label htmlFor="address">Address</Label>
        <Textarea
          id="address"
          value={formData.address}
          onChange={(e) => setFormData({...formData, address: e.target.value})}
          rows={3}
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
          <Label htmlFor="status">Status</Label>
          <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value})}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex gap-2 pt-4">
        <Button type="submit" className="flex-1" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              {supplier ? "Updating..." : "Adding..."}
            </>
          ) : (
            <>
              {supplier ? "Update" : "Add"} Supplier
            </>
          )}
        </Button>
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
      </div>
    </form>
  );
};

// Enhanced Supplier Details Component
const SupplierDetails = ({ supplier }: { supplier: any }) => (
  <div className="space-y-6">
    {/* Header Section */}
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{supplier.name}</h2>
          <p className="text-gray-600">{supplier.contactPerson}</p>
        </div>
        <Badge 
          variant={supplier.status === "active" ? "default" : "secondary"}
          className="text-sm px-3 py-1"
        >
          {supplier.status.charAt(0).toUpperCase() + supplier.status.slice(1)}
        </Badge>
      </div>
    </div>

    {/* Contact & Financial Info */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Contact Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-3">
            <Phone className="h-4 w-4 text-gray-500" />
            <span>{supplier.phone || 'Not provided'}</span>
          </div>
          <div className="flex items-center gap-3">
            <Mail className="h-4 w-4 text-gray-500" />
            <span>{supplier.email || 'Not provided'}</span>
          </div>
          <div className="flex items-start gap-3">
            <MapPin className="h-4 w-4 text-gray-500 mt-1" />
            <div>
              <div>{supplier.address || 'Not provided'}</div>
              {supplier.city && <div className="text-sm text-gray-500">{supplier.city}</div>}
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Financial Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Total Purchases:</span>
            <span className="font-semibold">Rs. {(supplier.totalPurchases || 0).toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Pending Payments:</span>
            <span className={`font-semibold ${supplier.pendingPayments > 0 ? 'text-red-600' : 'text-green-600'}`}>
              Rs. {(supplier.pendingPayments || 0).toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Products Count:</span>
            <span className="font-semibold">{supplier.productsCount || 0}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Last Order:</span>
            <span className="font-semibold">
              {supplier.lastOrderDate ? new Date(supplier.lastOrderDate).toLocaleDateString() : 'N/A'}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
    
    {/* Products Section */}
    {supplier.products && supplier.products.length > 0 && (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Products Supplied ({supplier.products.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {supplier.products.map((product: any) => (
              <div key={product.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div>
                  <span className="font-medium">{product.name}</span>
                  <span className="text-sm text-gray-500 ml-2">({product.sku})</span>
                </div>
                <span className="font-medium text-blue-600">Rs. {product.costPrice?.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )}
    
    {/* Recent Orders Section */}
    {supplier.recentOrders && supplier.recentOrders.length > 0 && (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Recent Orders ({supplier.recentOrders.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {supplier.recentOrders.map((order: any) => (
              <div key={order.id} className="flex justify-between items-center p-3 border rounded-lg">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{order.orderNumber}</span>
                    <Badge variant={order.status === "completed" ? "default" : "secondary"} className="text-xs">
                      {order.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <Calendar className="h-3 w-3" />
                    {new Date(order.date).toLocaleDateString()}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-green-600">Rs. {order.amount?.toLocaleString()}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )}

    {/* No Data Messages */}
    {(!supplier.products || supplier.products.length === 0) && 
     (!supplier.recentOrders || supplier.recentOrders.length === 0) && (
      <Card>
        <CardContent className="text-center py-8">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Additional Data</h3>
          <p className="text-gray-500">No products or recent orders found for this supplier.</p>
        </CardContent>
      </Card>
    )}
  </div>
);

export default Suppliers;
