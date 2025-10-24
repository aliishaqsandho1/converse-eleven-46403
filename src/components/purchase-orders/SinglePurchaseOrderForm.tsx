import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { 
  Search, 
  Plus, 
  X, 
  Package, 
  User, 
  Calendar, 
  Loader2, 
  Trash2, 
  UserPlus, 
  PackagePlus,
  CheckCircle,
  Building2,
  Phone,
  Mail,
  MapPin
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { suppliersApi, productsApi, categoriesApi } from "@/services/api";
import { generateSKU } from "@/utils/skuGenerator";
import { units as predefinedUnits } from "@/data/storeData";

interface PurchaseOrderFormProps {
  onSubmit: (data: any) => void;
  onClose: () => void;
  isLoading: boolean;
}

interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export const SinglePurchaseOrderForm = ({ onSubmit, onClose, isLoading }: PurchaseOrderFormProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Form states
  const [selectedSupplier, setSelectedSupplier] = useState<any>(null);
  const [supplierSearch, setSupplierSearch] = useState("");
  const [productSearch, setProductSearch] = useState("");
  const [expectedDelivery, setExpectedDelivery] = useState("");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<OrderItem[]>([]);
  const [selectedStatus, setSelectedStatus] = useState("draft");
  
  // UI states
  const [showSupplierDropdown, setShowSupplierDropdown] = useState(false);
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const [isAddSupplierOpen, setIsAddSupplierOpen] = useState(false);
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [units, setUnits] = useState<any[]>([]);

  // Fetch suppliers with search
  const { data: suppliersData } = useQuery({
    queryKey: ['suppliers-search', supplierSearch],
    queryFn: () => suppliersApi.getAll({ 
      search: supplierSearch,
      limit: 50,
      status: 'active'
    }),
    enabled: showSupplierDropdown || supplierSearch.length > 0
  });

  // Fetch products with search
  const { data: productsData } = useQuery({
    queryKey: ['products-search', productSearch],
    queryFn: () => productsApi.getAll({ 
      search: productSearch,
      limit: 50,
      status: 'active'
    }),
    enabled: showProductDropdown || productSearch.length > 0
  });

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesApi.getAll(),
  });

  useEffect(() => {
    if (categoriesData?.success && categoriesData.data) {
      const categoryList = Array.isArray(categoriesData.data) 
        ? categoriesData.data.map((cat: any) => ({
            value: typeof cat === 'string' ? cat : cat.name,
            label: typeof cat === 'string' ? cat : cat.name
          }))
        : [];
      setCategories(categoryList);
    }
  }, [categoriesData]);

  useEffect(() => {
    setUnits(predefinedUnits);
  }, []);

  // Create supplier mutation
  const createSupplierMutation = useMutation({
    mutationFn: suppliersApi.create,
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['suppliers-search'] });
      setIsAddSupplierOpen(false);
      if (response.success && response.data) {
        setSelectedSupplier(response.data);
        setSupplierSearch(response.data.name);
      }
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

  // Create product mutation
  const createProductMutation = useMutation({
    mutationFn: productsApi.create,
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['products-search'] });
      setIsAddProductOpen(false);
      if (response.success && response.data) {
        addProduct(response.data);
      }
      toast({
        title: "Product Added",
        description: "New product has been added successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add product",
        variant: "destructive",
      });
    },
  });

  const suppliers = suppliersData?.data?.suppliers || suppliersData?.data || [];
  const products = productsData?.data?.products || productsData?.data || [];

  const filteredSuppliers = suppliers.filter((supplier: any) =>
    supplier.name.toLowerCase().includes(supplierSearch.toLowerCase()) ||
    supplier.contactPerson?.toLowerCase().includes(supplierSearch.toLowerCase()) ||
    supplier.city?.toLowerCase().includes(supplierSearch.toLowerCase())
  );

  const filteredProducts = products.filter((product: any) =>
    product.name.toLowerCase().includes(productSearch.toLowerCase()) ||
    product.sku?.toLowerCase().includes(productSearch.toLowerCase()) ||
    product.category?.toLowerCase().includes(productSearch.toLowerCase())
  );

  const addProduct = (product: any) => {
    const existingItem = items.find(item => item.productId === product.id.toString());
    
    if (existingItem) {
      updateItemQuantity(product.id.toString(), existingItem.quantity + 1);
    } else {
      const newItem: OrderItem = {
        productId: product.id.toString(),
        productName: product.name,
        quantity: 0, // Keep quantity empty as requested
        unitPrice: product.costPrice || product.price || 0,
        total: 0
      };
      setItems([...items, newItem]);
    }
    
    setProductSearch("");
    setShowProductDropdown(false);
    
    toast({
      title: "Product Added",
      description: `${product.name} added to purchase order`,
    });
  };

  const updateItemQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity < 0) return;
    
    setItems(items.map(item => 
      item.productId === productId 
        ? { ...item, quantity: newQuantity, total: newQuantity * item.unitPrice }
        : item
    ));
  };

  const updateItemPrice = (productId: string, newPrice: number) => {
    setItems(items.map(item => 
      item.productId === productId 
        ? { ...item, unitPrice: newPrice, total: item.quantity * newPrice }
        : item
    ));
  };

  const removeItem = (productId: string) => {
    setItems(items.filter(item => item.productId !== productId));
  };

  const getTotalAmount = () => {
    return items.reduce((sum, item) => sum + item.total, 0);
  };

  const handleSubmit = (status: string = selectedStatus) => {
    if (!selectedSupplier) {
      toast({
        title: "Supplier Required",
        description: "Please select a supplier for this purchase order",
        variant: "destructive"
      });
      return;
    }

    if (!expectedDelivery) {
      toast({
        title: "Delivery Date Required",
        description: "Please set an expected delivery date",
        variant: "destructive"
      });
      return;
    }

    if (items.length === 0) {
      toast({
        title: "Items Required",
        description: "Please add at least one item to the purchase order",
        variant: "destructive"
      });
      return;
    }

    // Check if any item has zero quantity
    const zeroQuantityItems = items.filter(item => item.quantity === 0);
    if (zeroQuantityItems.length > 0) {
      toast({
        title: "Quantity Required",
        description: "Please specify quantities for all items",
        variant: "destructive"
      });
      return;
    }

    const submitData = {
      supplierId: selectedSupplier.id,
      expectedDelivery,
      notes,
      status,
      items: items.map(item => ({
        productId: parseInt(item.productId),
        quantity: item.quantity,
        unitPrice: item.unitPrice
      }))
    };

    onSubmit(submitData);
  };

  return (
    <div className="w-full p-6 pt-0 space-y-6 max-h-[90vh] bg-white overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between sticky top-0 bg-white pb-4 border-b z-10">
        <div className="p-3 pl-0">
          <h2 className="text-2xl font-bold text-foreground">Create Purchase Order</h2>
          <p className="text-sm text-muted-foreground">Fill in the details to create a new purchase order</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Supplier & Details */}
        <div className="lg:col-span-1 space-y-4">
          
          {/* Supplier Selection */}
          <Card className="border-2">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Building2 className="h-5 w-5 text-primary" />
                  Supplier
                </CardTitle>
                <Button
                  onClick={() => setIsAddSupplierOpen(true)}
                  size="sm"
                  variant="outline"
                  className="h-7 px-2"
                >
                  <UserPlus className="h-3 w-3 mr-1" />
                  Add
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search suppliers..."
                  value={supplierSearch}
                  onChange={(e) => {
                    setSupplierSearch(e.target.value);
                    setShowSupplierDropdown(true);
                  }}
                  onFocus={() => setShowSupplierDropdown(true)}
                  className="pl-8 h-8"
                />
                
                {showSupplierDropdown && (
                  <div className="absolute z-50 w-full mt-1 bg-popover border rounded-md shadow-lg max-h-48 overflow-y-auto">
                    {filteredSuppliers.length > 0 ? (
                      filteredSuppliers.map((supplier: any) => (
                        <div
                          key={supplier.id}
                          className="p-2 hover:bg-accent cursor-pointer border-b last:border-b-0"
                          onClick={() => {
                            setSelectedSupplier(supplier);
                            setSupplierSearch(supplier.name);
                            setShowSupplierDropdown(false);
                          }}
                        >
                          <div className="font-medium text-sm">{supplier.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {supplier.contactPerson} • {supplier.city}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-3 text-center text-muted-foreground text-sm">
                        No suppliers found
                      </div>
                    )}
                  </div>
                )}
              </div>

              {selectedSupplier && (
                <Card className="bg-primary/5 border-primary/20">
                  <CardContent className="p-3">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-primary" />
                        <span className="font-medium text-sm">{selectedSupplier.name}</span>
                      </div>
                      <div className="text-xs text-muted-foreground space-y-1">
                        <div className="flex items-center gap-2">
                          <Phone className="h-3 w-3" />
                          {selectedSupplier.phone}
                        </div>
                        <div className="flex items-center gap-2">
                          <Mail className="h-3 w-3" />
                          {selectedSupplier.email}
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-3 w-3" />
                          {selectedSupplier.city}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>

          {/* Order Details */}
          <Card className="border-2">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Calendar className="h-5 w-5 text-primary" />
                Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label htmlFor="expectedDelivery" className="text-sm font-medium">
                  Expected Delivery *
                </Label>
                <Input
                  id="expectedDelivery"
                  type="date"
                  value={expectedDelivery}
                  onChange={(e) => setExpectedDelivery(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="h-8"
                />
              </div>
              
              <div>
                <Label htmlFor="notes" className="text-sm font-medium">
                  Notes
                </Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Special instructions..."
                  rows={3}
                  className="resize-none"
                />
              </div>
            </CardContent>
          </Card>

          {/* Order Summary */}
          {items.length > 0 && (
            <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
              <CardContent className="p-4">
                <div className="text-center space-y-2">
                  <div className="text-sm text-muted-foreground">Total Amount</div>
                  <div className="text-2xl font-bold text-primary">
                    Rs. {getTotalAmount().toLocaleString()}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {items.length} item{items.length !== 1 ? 's' : ''}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Products */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="border-2">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Package className="h-5 w-5 text-primary" />
                  Products
                </CardTitle>
                <Button
                  onClick={() => setIsAddProductOpen(true)}
                  size="sm"
                  variant="outline"
                  className="h-7 px-2"
                >
                  <PackagePlus className="h-3 w-3 mr-1" />
                  Add
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              
              {/* Product Search */}
              <div className="relative">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search products..."
                  value={productSearch}
                  onChange={(e) => {
                    setProductSearch(e.target.value);
                    setShowProductDropdown(true);
                  }}
                  onFocus={() => setShowProductDropdown(true)}
                  className="pl-8 h-8"
                />
                
                {showProductDropdown && productSearch && (
                  <div className="absolute z-50 w-full mt-1 bg-popover border rounded-md shadow-lg max-h-48 overflow-y-auto">
                    {filteredProducts.length > 0 ? (
                      filteredProducts.map((product: any) => (
                        <div
                          key={product.id}
                          className="p-2 hover:bg-accent cursor-pointer border-b last:border-b-0"
                          onClick={() => addProduct(product)}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium text-sm">{product.name}</div>
                              <div className="text-xs text-muted-foreground">
                                {product.sku} • Rs. {(product.costPrice || product.price)?.toLocaleString()}
                              </div>
                            </div>
                            <Plus className="h-4 w-4 text-primary" />
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-3 text-center text-muted-foreground text-sm">
                        No products found
                      </div>
                    )}
                  </div>
                )}
              </div>

              <Separator />

              {/* Selected Items */}
              <div className="space-y-3">
                {items.length > 0 ? (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {/* Column Headers */}
                    <div className="flex items-center gap-3 px-2 py-1 text-sm font-medium text-muted-foreground">
                      <div className="flex-1 min-w-0">Product Name</div>
                      <div className="flex items-center gap-2 shrink-0">
                        <div className="w-16 text-center">Quantity</div>
                        <div className="w-20 text-center">Unit Price</div>
                        <div className="w-20 text-center">Total</div>
                        <div className="w-7"></div>
                      </div>
                    </div>
                    
                    {/* Product Items */}
                    {items.map((item) => (
                      <Card key={item.productId} className="border hover:shadow-sm transition-shadow">
                        <CardContent className="p-2">
                          <div className="flex items-center gap-3">
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-sm truncate">{item.productName}</h4>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <div className="w-16">
                                <Input
                                  type="number"
                                  value={item.quantity}
                                  onChange={(e) => updateItemQuantity(item.productId, parseInt(e.target.value) || 0)}
                                  className="h-7 text-xs"
                                  min="0"
                                  placeholder="Qty"
                                />
                              </div>
                              <div className="w-20">
                                <Input
                                  type="number"
                                  value={item.unitPrice}
                                  onChange={(e) => updateItemPrice(item.productId, parseFloat(e.target.value) || 0)}
                                  className="h-7 text-xs"
                                  min="0"
                                  step="0.01"
                                  placeholder="Price"
                                />
                              </div>
                              <div className="w-20 text-xs font-medium text-primary">
                                Rs. {item.total.toLocaleString()}
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeItem(item.productId)}
                                className="h-7 w-7 p-0 text-destructive hover:bg-destructive/10"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p className="text-sm">No items added yet</p>
                    <p className="text-xs">Search and add products above</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Submit Buttons */}
      <div className="flex justify-between items-center pt-4 border-t">
        <div className="flex items-center gap-2">
          <Label className="text-sm font-medium">Save as:</Label>
          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="w-32 h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="received">Received</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex gap-2">
          <Button 
            onClick={() => handleSubmit("draft")} 
            disabled={isLoading || items.length === 0}
            variant="outline"
            className="px-4"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              "Save Draft"
            )}
          </Button>
          
          <Button 
            onClick={() => handleSubmit("confirmed")} 
            disabled={isLoading || items.length === 0}
            className="px-4"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Confirm Order
              </>
            )}
          </Button>
          
          <Button 
            onClick={() => handleSubmit("received")} 
            disabled={isLoading || items.length === 0}
            variant="secondary"
            className="px-4"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              "Mark Received"
            )}
          </Button>
        </div>
      </div>

      {/* Add Supplier Modal */}
      <Dialog open={isAddSupplierOpen} onOpenChange={setIsAddSupplierOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Supplier</DialogTitle>
          </DialogHeader>
          <SupplierForm 
            onSubmit={(data: any) => createSupplierMutation.mutate(data)} 
            onClose={() => setIsAddSupplierOpen(false)}
            isLoading={createSupplierMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Add Product Modal */}
      <Dialog open={isAddProductOpen} onOpenChange={setIsAddProductOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Product</DialogTitle>
          </DialogHeader>
          <ProductForm 
            onSubmit={(data: any) => createProductMutation.mutate(data)} 
            onClose={() => setIsAddProductOpen(false)}
            isLoading={createProductMutation.isPending}
            categories={categories}
            units={units}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Compact Supplier Form Component
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
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="name" className="text-sm">Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            className="h-8"
            required
          />
        </div>
        <div>
          <Label htmlFor="contactPerson" className="text-sm">Contact Person</Label>
          <Input
            id="contactPerson"
            value={formData.contactPerson}
            onChange={(e) => setFormData({...formData, contactPerson: e.target.value})}
            className="h-8"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="phone" className="text-sm">Phone</Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => setFormData({...formData, phone: e.target.value})}
            className="h-8"
          />
        </div>
        <div>
          <Label htmlFor="email" className="text-sm">Email</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            className="h-8"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="city" className="text-sm">City</Label>
          <Input
            id="city"
            value={formData.city}
            onChange={(e) => setFormData({...formData, city: e.target.value})}
            className="h-8"
          />
        </div>
        <div>
          <Label htmlFor="status" className="text-sm">Status</Label>
          <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value})}>
            <SelectTrigger className="h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="address" className="text-sm">Address</Label>
        <Textarea
          id="address"
          value={formData.address}
          onChange={(e) => setFormData({...formData, address: e.target.value})}
          rows={2}
          className="resize-none"
        />
      </div>

      <div className="flex gap-2 pt-3">
        <Button type="submit" size="sm" className="flex-1" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
              Adding...
            </>
          ) : (
            <>Add Supplier</>
          )}
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={onClose}>
          Cancel
        </Button>
      </div>
    </form>
  );
};

// Compact Product Form Component
const ProductForm = ({ 
  onSubmit, 
  onClose, 
  categories, 
  units,
  isLoading = false
}: { 
  onSubmit: (data: any) => void; 
  onClose: () => void; 
  categories: any[];
  units: any[];
  isLoading?: boolean;
}) => {
  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    price: "",
    stock: "",
    category: "",
    unit: "",
    minStock: "",
    description: "",
    costPrice: "",
    maxStock: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const submitData = {
      ...formData,
      price: parseFloat(formData.price),
      stock: parseFloat(formData.stock),
      minStock: parseFloat(formData.minStock),
      costPrice: parseFloat(formData.costPrice),
      maxStock: parseFloat(formData.maxStock)
    };
    onSubmit(submitData);
    setFormData({ 
      name: "", sku: "", price: "", stock: "", category: "", 
      unit: "", minStock: "", description: "", costPrice: "", maxStock: "" 
    });
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      
      if (field === 'name') {
        newData.sku = generateSKU(value);
      }
      
      return newData;
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 max-h-96 overflow-y-auto">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="name" className="text-sm">Product Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            required
            className="h-8"
          />
        </div>
        <div>
          <Label htmlFor="sku" className="text-sm">SKU (Auto-generated)</Label>
          <Input
            id="sku"
            value={formData.sku}
            onChange={(e) => handleInputChange('sku', e.target.value)}
            className="h-8"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <Label htmlFor="price" className="text-sm">Price *</Label>
          <Input
            id="price"
            type="number"
            value={formData.price}
            onChange={(e) => handleInputChange('price', e.target.value)}
            required
            min="0"
            step="0.01"
            className="h-8"
          />
        </div>
        <div>
          <Label htmlFor="costPrice" className="text-sm">Cost Price</Label>
          <Input
            id="costPrice"
            type="number"
            value={formData.costPrice}
            onChange={(e) => handleInputChange('costPrice', e.target.value)}
            min="0"
            step="0.01"
            className="h-8"
          />
        </div>
        <div>
          <Label htmlFor="stock" className="text-sm">Stock</Label>
          <Input
            id="stock"
            type="number"
            value={formData.stock}
            onChange={(e) => handleInputChange('stock', e.target.value)}
            min="0"
            className="h-8"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="category" className="text-sm">Category</Label>
          <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
            <SelectTrigger className="h-8">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.value} value={category.value}>
                  {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="unit" className="text-sm">Unit</Label>
          <Select value={formData.unit} onValueChange={(value) => handleInputChange('unit', value)}>
            <SelectTrigger className="h-8">
              <SelectValue placeholder="Select unit" />
            </SelectTrigger>
            <SelectContent>
              {units.map((unit) => (
                <SelectItem key={unit.value} value={unit.value}>
                  {unit.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="minStock" className="text-sm">Min Stock</Label>
          <Input
            id="minStock"
            type="number"
            value={formData.minStock}
            onChange={(e) => handleInputChange('minStock', e.target.value)}
            min="0"
            className="h-8"
          />
        </div>
        <div>
          <Label htmlFor="maxStock" className="text-sm">Max Stock</Label>
          <Input
            id="maxStock"
            type="number"
            value={formData.maxStock}
            onChange={(e) => handleInputChange('maxStock', e.target.value)}
            min="0"
            className="h-8"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="description" className="text-sm">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          rows={2}
          className="resize-none"
        />
      </div>

      <div className="flex gap-2 pt-3">
        <Button type="submit" size="sm" className="flex-1" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
              Adding...
            </>
          ) : (
            <>Add Product</>
          )}
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={onClose}>
          Cancel
        </Button>
      </div>
    </form>
  );
};