import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Package, Search, Plus, AlertTriangle, TrendingUp, DollarSign, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { inventoryApi, productsApi, categoriesApi } from "@/services/api";
import { FilteredProductsModal } from "@/components/FilteredProductsModal";
import { InventorySummaryCards } from "@/components/inventory/InventorySummaryCards";
import { useInventorySummary } from "@/hooks/useInventorySummary";

const Inventory = () => {
  const { toast } = useToast();
  const { summary, loading: summaryLoading, refetch: refetchSummary } = useInventorySummary();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [inventory, setInventory] = useState<any[]>([]);
  const [movements, setMovements] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [units, setUnits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isStockAdjustmentOpen, setIsStockAdjustmentOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage] = useState(20);
  const [filteredProductsModal, setFilteredProductsModal] = useState({
    open: false,  
    title: '',
    filterType: 'all' as 'lowStock' | 'outOfStock' | 'inStock' | 'all'
  });

  useEffect(() => {
    fetchInventory();
    fetchMovements();
    fetchCategories();
    fetchUnits();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
    fetchInventory();
  }, [searchTerm, categoryFilter, statusFilter]);

  useEffect(() => {
    fetchInventory();
  }, [currentPage]);

  // Add function to fetch all products for the modal
  const fetchAllProductsForModal = async (): Promise<any[]> => {
    try {
      const response = await inventoryApi.getAll({
        limit: 10000 // Large number to get all products
      });
      
      if (response.success) {
        const inventoryData = response.data?.inventory || response.data || [];
        return Array.isArray(inventoryData) ? inventoryData : [];
      }
      return [];
    } catch (error) {
      console.error('Failed to fetch all products for modal:', error);
      return [];
    }
  };

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const params: any = {
        page: currentPage,
        limit: itemsPerPage
      };
      
      if (searchTerm) params.search = searchTerm;
      if (categoryFilter !== 'all') params.category = categoryFilter;
      if (statusFilter === 'low') params.lowStock = true;
      if (statusFilter === 'out') params.outOfStock = true;

      console.log('Fetching inventory with params:', params);
      const response = await inventoryApi.getAll(params);
      console.log('Inventory API response:', response);
      
      if (response.success) {
        const inventoryData = response.data?.inventory || response.data || [];
        console.log('Inventory data:', inventoryData);
        
        const inventoryArray = Array.isArray(inventoryData) ? inventoryData : [];
        setInventory(inventoryArray);
        
        // Handle pagination metadata - prioritize API response data
        let finalTotalItems = 0;
        let finalTotalPages = 1;
        
        if (response.data?.pagination) {
          console.log('Using pagination metadata:', response.data.pagination);
          finalTotalPages = response.data.pagination.totalPages || 1;
          finalTotalItems = response.data.pagination.totalItems || 0;
        } else if (response.data?.totalPages) {
          console.log('Using totalPages from response:', response.data.totalPages);
          finalTotalPages = response.data.totalPages;
          finalTotalItems = response.data.totalItems || 0;
        } else {
          // If no pagination info, assume there might be more data
          // Set a reasonable estimate based on current data
          finalTotalItems = Math.max(inventoryArray.length, summary.totalProducts); // Assume at least summary.totalProducts products as mentioned
          finalTotalPages = Math.ceil(finalTotalItems / itemsPerPage);
        }
        
        setTotalPages(finalTotalPages);
        setTotalItems(finalTotalItems);
        
        console.log('Final pagination state:', { 
          currentPage, 
          totalPages: finalTotalPages,
          totalItems: finalTotalItems,
          inventoryLength: inventoryArray.length 
        });
      }
    } catch (error) {
      console.error('Failed to fetch inventory:', error);
      setInventory([]);
      toast({
        title: "Error",
        description: "Failed to load inventory",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchMovements = async () => {
    try {
      const response = await inventoryApi.getMovements({ limit: 20 });
      if (response.success) {
        const movementData = response.data?.movements || response.data || [];
        setMovements(Array.isArray(movementData) ? movementData : []);
      }
    } catch (error) {
      console.error('Failed to fetch movements:', error);
      setMovements([]);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await categoriesApi.getAll();
      if (response.success && response.data) {
        const categoryList = [
          { value: "all", label: "All Categories" }
        ];
        
        const categories = Array.isArray(response.data) ? response.data : [];
        categories.forEach((cat: any) => {
          if (typeof cat === 'string') {
            categoryList.push({ value: cat, label: cat });
          } else if (cat && typeof cat === 'object' && (cat.name || cat.id)) {
            const name = cat.name || cat.id;
            categoryList.push({ value: name, label: name });
          }
        });
        
        setCategories(categoryList);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      setCategories([{ value: "all", label: "All Categories" }]);
    }
  };

  const fetchUnits = async () => {
    // Use predefined comprehensive units list instead of API call
    const { units: predefinedUnits } = await import("@/data/storeData");
    setUnits(predefinedUnits);
  };

  const handleStockAdjustment = async (formData: any) => {
    if (!selectedProduct) return;

    try {
      const response = await productsApi.adjustStock(selectedProduct.productId || selectedProduct.id, formData);
      if (response.success) {
        setIsStockAdjustmentOpen(false);
        setSelectedProduct(null);
        fetchInventory();
        fetchMovements();
        toast({
          title: "Stock Adjusted",
          description: "Stock has been adjusted successfully.",
        });
      }
    } catch (error) {
      console.error('Failed to adjust stock:', error);
      toast({
        title: "Error",
        description: "Failed to adjust stock",
        variant: "destructive"
      });
    }
  };

  const handleEditProduct = async (formData: any) => {
    if (!selectedProduct) return;

    try {
      const response = await productsApi.update(selectedProduct.productId || selectedProduct.id, formData);
      if (response.success) {
        setIsEditDialogOpen(false);
        setSelectedProduct(null);
        fetchInventory();
        toast({
          title: "Product Updated",
          description: "Product has been updated successfully.",
        });
      }
    } catch (error) {
      console.error('Failed to update product:', error);
      toast({
        title: "Error",
        description: "Failed to update product",
        variant: "destructive"
      });
    }
  };

  const handleDeleteProduct = async (productId: string | number) => {
    try {
      const response = await productsApi.delete(Number(productId));
      if (response.success) {
        fetchInventory();
        toast({
          title: "Product Deleted",
          description: "Product has been deleted successfully.",
        });
      }
    } catch (error) {
      console.error('Failed to delete product:', error);
      toast({
        title: "Error",
        description: "Failed to delete product",
        variant: "destructive"
      });
    }
  };

  const getStockStatus = (currentStock: number, minStock: number) => {
    if (currentStock === 0) return { status: 'out', color: 'bg-red-500 text-white' };
    if (currentStock <= minStock) return { status: 'low', color: 'bg-orange-500 text-white' };
    return { status: 'adequate', color: 'bg-green-500 text-white' };
  };

  const renderPagination = () => {
    console.log('Rendering pagination with:', { totalPages, currentPage, totalItems });
    
    // Always show pagination if we have more than 1 page or if we have data that suggests pagination
    if (totalPages <= 1 && totalItems <= itemsPerPage) {
      console.log('Not showing pagination - total pages:', totalPages, 'total items:', totalItems);
      return null;
    }

    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);
      
      // Calculate range around current page
      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);
      
      // Adjust range if too close to start or end
      if (currentPage <= 3) {
        end = Math.min(totalPages - 1, 4);
      }
      if (currentPage >= totalPages - 2) {
        start = Math.max(2, totalPages - 3);
      }
      
      // Add ellipsis after first page if needed
      if (start > 2) {
        pages.push('ellipsis-start');
      }
      
      // Add pages in range
      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) {
          pages.push(i);
        }
      }
      
      // Add ellipsis before last page if needed
      if (end < totalPages - 1) {
        pages.push('ellipsis-end');
      }
      
      // Always show last page (if different from first)
      if (totalPages > 1 && !pages.includes(totalPages)) {
        pages.push(totalPages);
      }
    }

    console.log('Pagination pages to render:', pages);

    return (
      <div className="flex flex-col items-center space-y-4 mt-6">
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious 
                onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
                className={currentPage <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
              />
            </PaginationItem>
            
            {pages.map((page, index) => (
              <PaginationItem key={index}>
                {page === 'ellipsis-start' || page === 'ellipsis-end' ? (
                  <PaginationEllipsis />
                ) : (
                  <PaginationLink
                    onClick={() => setCurrentPage(page as number)}
                    isActive={currentPage === page}
                    className="cursor-pointer"
                  >
                    {page}
                  </PaginationLink>
                )}
              </PaginationItem>
            ))}
            
            <PaginationItem>
              <PaginationNext
                onClick={() => currentPage < totalPages && setCurrentPage(currentPage + 1)}
                className={currentPage >= totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
        
        {/* Show pagination info like in the image */}
        <div className="text-sm text-muted-foreground">
          Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} products
        </div>
      </div>
    );
  };

  const openFilteredModal = (filterType: 'lowStock' | 'outOfStock' | 'inStock' | 'all', title: string) => {
    setFilteredProductsModal({
      open: true,
      title,
      filterType
    });
  };

  if (loading || summaryLoading) {
    return (
      <div className="flex-1 p-6 space-y-6 min-h-screen bg-background">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-muted-foreground">Loading inventory...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 space-y-6 min-h-[calc(100vh-65px)] bg-background">
      <div className="flex items-center gap-4">
        <SidebarTrigger />
        <div>
          <h1 className="text-3xl font-bold text-foreground">Inventory Management</h1>
          <p className="text-muted-foreground">Monitor stock levels and track inventory movements</p>
        </div>
      </div>

      {/* Use the new reusable summary cards */}
      <InventorySummaryCards 
        summary={summary}
        onCardClick={openFilteredModal}
      />

      <Tabs defaultValue="inventory" className="space-y-4">
        <TabsList>
          <TabsTrigger value="inventory">Current Inventory</TabsTrigger>
          <TabsTrigger value="movements">Stock Movements</TabsTrigger>
        </TabsList>

        <TabsContent value="inventory" className="space-y-4">
          {/* Search and Filter */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="low">Low Stock</SelectItem>
                    <SelectItem value="out">Out of Stock</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Inventory Grid */}
          <Card>
            <CardHeader>
              <CardTitle>Inventory Items</CardTitle>
            </CardHeader>
            <CardContent>
              {inventory.length === 0 ? (
                <div className="flex items-center justify-center h-32">
                  <p className="text-muted-foreground">No inventory items found</p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {inventory.map((item) => {
                      const stockStatus = getStockStatus(item.currentStock || 0, item.minStock || 0);
                      return (
                        <Card key={item.productId || item.id} className="hover:shadow-md transition-shadow">
                          <CardContent className="p-4">
                            <div className="space-y-3">
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <h4 className="font-medium text-foreground">{item.productName || item.name}</h4>
                                  <p className="text-sm text-muted-foreground">SKU: {item.sku}</p>
                                  <p className="text-sm text-muted-foreground">Category: {item.category}</p>
                                </div>
                                <Badge className={`text-xs ${stockStatus.color}`}>
                                  {stockStatus.status}
                                </Badge>
                              </div>

                              <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                  <span className="text-muted-foreground">Current Stock:</span>
                                  <span className="font-medium text-foreground">{item.currentStock || 0} {item.unit}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                  <span className="text-muted-foreground">Min Stock:</span>
                                  <span className="text-foreground">{item.minStock || 0} {item.unit}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                  <span className="text-muted-foreground">Value:</span>
                                  <span className="font-medium text-green-600">PKR {item.value?.toLocaleString() || '0'}</span>
                                </div>
                              </div>

                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="flex-1"
                                  onClick={() => {
                                    setSelectedProduct(item);
                                    setIsEditDialogOpen(true);
                                  }}
                                >
                                  <Edit className="h-3 w-3 mr-1" />
                                  Edit
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setSelectedProduct(item);
                                    setIsStockAdjustmentOpen(true);
                                  }}
                                >
                                  <TrendingUp className="h-3 w-3 mr-1" />
                                  Adjust
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-red-600 hover:text-red-700"
                                  onClick={() => handleDeleteProduct(item.productId || item.id)}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                  
                  {/* Pagination */}
                  {renderPagination()}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="movements" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Stock Movements</CardTitle>
            </CardHeader>
            <CardContent>
              {movements.length === 0 ? (
                <div className="flex items-center justify-center h-32">
                  <p className="text-muted-foreground">No stock movements found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {movements.map((movement) => (
                    <div key={movement.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-full ${
                          movement.type === 'sale' ? 'bg-red-100 text-red-600' :
                          movement.type === 'purchase' ? 'bg-green-100 text-green-600' :
                          'bg-blue-100 text-blue-600'
                        }`}>
                          <Package className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{movement.productName}</p>
                          <p className="text-sm text-muted-foreground">{movement.reason}</p>
                          <p className="text-xs text-muted-foreground">{movement.createdAt}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold ${movement.quantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {movement.quantity > 0 ? '+' : ''}{movement.quantity}
                        </p>
                        <p className="text-sm text-muted-foreground">Balance: {movement.balanceAfter}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Stock Adjustment Dialog */}
      {selectedProduct && (
        <Dialog open={isStockAdjustmentOpen} onOpenChange={setIsStockAdjustmentOpen}>
          <StockAdjustmentDialog
            product={selectedProduct}
            onSubmit={handleStockAdjustment}
            onClose={() => {
              setIsStockAdjustmentOpen(false);
              setSelectedProduct(null);
            }}
          />
        </Dialog>
      )}

      {/* Edit Product Dialog */}
      {selectedProduct && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <EditProductDialog
            product={selectedProduct}
            categories={categories}
            units={units}
            onSubmit={handleEditProduct}
            onClose={() => {
              setIsEditDialogOpen(false);
              setSelectedProduct(null);
            }}
          />
        </Dialog>
      )}

      {/* Filtered Products Modal - Now with fetchAllProducts function */}
      <FilteredProductsModal
        open={filteredProductsModal.open}
        onOpenChange={(open) => setFilteredProductsModal(prev => ({ ...prev, open }))}
        title={filteredProductsModal.title}
        filterType={filteredProductsModal.filterType}
        onFetchAllProducts={fetchAllProductsForModal}
      />
    </div>
  );
};

// Stock Adjustment Dialog Component
const StockAdjustmentDialog = ({ 
  product, 
  onSubmit, 
  onClose 
}: { 
  product: any; 
  onSubmit: (data: any) => void; 
  onClose: () => void;
}) => {
  const [formData, setFormData] = useState({
    type: "adjustment",
    quantity: "",
    reason: "",
    reference: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      quantity: parseFloat(formData.quantity)
    });
  };

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Stock Adjustment - {product.productName || product.name}</DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="type">Adjustment Type</Label>
          <Select value={formData.type} onValueChange={(value) => setFormData({...formData, type: value})}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="adjustment">Stock Adjustment</SelectItem>
              <SelectItem value="restock">Restock</SelectItem>
              <SelectItem value="damage">Damage</SelectItem>
              <SelectItem value="return">Return</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="quantity">Quantity ({product.unit})</Label>
          <Input
            id="quantity"
            type="number"
            step="0.01"
            value={formData.quantity}
            onChange={(e) => setFormData({...formData, quantity: e.target.value})}
            placeholder="Enter quantity (+ for increase, - for decrease)"
            required
          />
          <p className="text-sm text-muted-foreground mt-1">
            Current stock: {product.currentStock || 0} {product.unit}
          </p>
        </div>

        <div>
          <Label htmlFor="reason">Reason</Label>
          <Input
            id="reason"
            value={formData.reason}
            onChange={(e) => setFormData({...formData, reason: e.target.value})}
            placeholder="Reason for adjustment"
            required
          />
        </div>

        <div>
          <Label htmlFor="reference">Reference</Label>
          <Input
            id="reference"
            value={formData.reference}
            onChange={(e) => setFormData({...formData, reference: e.target.value})}
            placeholder="Reference number (optional)"
          />
        </div>

        <div className="flex gap-2">
          <Button type="submit" className="flex-1">Adjust Stock</Button>
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
        </div>
      </form>
    </DialogContent>
  );
};

// Edit Product Dialog Component
const EditProductDialog = ({ 
  product, 
  categories, 
  units, 
  onSubmit, 
  onClose 
}: { 
  product: any; 
  categories: any[]; 
  units: any[]; 
  onSubmit: (data: any) => void; 
  onClose: () => void;
}) => {
  const [formData, setFormData] = useState({
    name: product.productName || product.name || "",
    category: product.category || "",
    minStock: product.minStock?.toString() || "",
    maxStock: product.maxStock?.toString() || "",
    unit: product.unit || ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      minStock: parseFloat(formData.minStock),
      maxStock: parseFloat(formData.maxStock)
    });
  };

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Edit Product - {product.productName || product.name}</DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="name">Product Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            required
          />
        </div>

        <div>
          <Label htmlFor="category">Category</Label>
          <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categories.filter(cat => cat.value !== "all").map((category) => (
                <SelectItem key={category.value} value={category.value}>{category.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="minStock">Minimum Stock</Label>
            <Input
              id="minStock"
              type="number"
              step="0.01"
              value={formData.minStock}
              onChange={(e) => setFormData({...formData, minStock: e.target.value})}
              required
            />
          </div>
          <div>
            <Label htmlFor="maxStock">Maximum Stock</Label>
            <Input
              id="maxStock"
              type="number"
              step="0.01"
              value={formData.maxStock}
              onChange={(e) => setFormData({...formData, maxStock: e.target.value})}
              required
            />
          </div>
        </div>

        <div>
          <Label htmlFor="unit">Unit</Label>
          <Select value={formData.unit} onValueChange={(value) => setFormData({...formData, unit: value})}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {units.map((unit) => (
                <SelectItem key={unit.value || unit.name} value={unit.value || unit.name}>
                  {unit.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2">
          <Button type="submit" className="flex-1">Update Product</Button>
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
        </div>
      </form>
    </DialogContent>
  );
};

export default Inventory;
