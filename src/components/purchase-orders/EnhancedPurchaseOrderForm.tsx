
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Plus, X, Package, User, Calendar, Loader2, Trash2, CheckCircle, UserPlus, PackagePlus } from "lucide-react";
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

export const EnhancedPurchaseOrderForm = ({ onSubmit, onClose, isLoading }: PurchaseOrderFormProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [step, setStep] = useState(1);
  const [selectedSupplier, setSelectedSupplier] = useState<any>(null);
  const [supplierSearch, setSupplierSearch] = useState("");
  const [productSearch, setProductSearch] = useState("");
  const [expectedDelivery, setExpectedDelivery] = useState("");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<OrderItem[]>([]);
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
    // Setup categories and units
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

  // Load units on component mount
  useEffect(() => {
    // Use predefined comprehensive units instead of API
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
      // Increase quantity if product already exists
      updateItemQuantity(product.id.toString(), existingItem.quantity + 1);
    } else {
      const newItem: OrderItem = {
        productId: product.id.toString(),
        productName: product.name,
        quantity: 1,
        unitPrice: product.costPrice || product.price || 0,
        total: product.costPrice || product.price || 0
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
    if (newQuantity <= 0) {
      removeItem(productId);
      return;
    }
    
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

  const handleSubmit = () => {
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

    const submitData = {
      supplierId: selectedSupplier.id,
      expectedDelivery,
      notes,
      items: items.map(item => ({
        productId: parseInt(item.productId),
        quantity: item.quantity,
        unitPrice: item.unitPrice
      }))
    };

    onSubmit(submitData);
  };

  const nextStep = () => {
    if (step === 1 && !selectedSupplier) {
      toast({
        title: "Supplier Required",
        description: "Please select a supplier to continue",
        variant: "destructive"
      });
      return;
    }
    if (step === 2 && !expectedDelivery) {
      toast({
        title: "Delivery Date Required",
        description: "Please set an expected delivery date",
        variant: "destructive"
      });
      return;
    }
    setStep(step + 1);
  };

  const prevStep = () => {
    setStep(step - 1);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-4">
      {/* Compact Progress Steps */}
      <div className="relative mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {[
              { num: 1, title: "Supplier", icon: User },
              { num: 2, title: "Details", icon: Calendar },
              { num: 3, title: "Products", icon: Package }
            ].map((stepData, index) => (
              <div key={stepData.num} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full border transition-all ${
                    step >= stepData.num 
                      ? 'bg-primary border-primary text-primary-foreground' 
                      : step === stepData.num
                      ? 'border-primary text-primary bg-primary/10'
                      : 'border-muted-foreground text-muted-foreground bg-background'
                  }`}>
                    {step > stepData.num ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <stepData.icon className="h-4 w-4" />
                    )}
                  </div>
                  <span className={`mt-1 text-xs font-medium ${
                    step >= stepData.num ? 'text-primary' : 'text-muted-foreground'
                  }`}>
                    {stepData.title}
                  </span>
                </div>
                {index < 2 && (
                  <div className={`w-12 h-px mx-3 transition-all ${
                    step > stepData.num ? 'bg-primary' : 'bg-border'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <Button variant="outline" size="sm" onClick={onClose}>
            <X className="h-4 w-4 mr-1" />
            Cancel
          </Button>
        </div>
      </div>

      {/* Step 1: Supplier Selection */}
      {step === 1 && (
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                <User className="h-5 w-5 text-primary" />
                Select Supplier
              </CardTitle>
              <Button
                onClick={() => setIsAddSupplierOpen(true)}
                size="sm"
                variant="outline"
              >
                <UserPlus className="h-4 w-4 mr-1" />
                Add Supplier
              </Button>
            </div>
            <p className="text-muted-foreground text-sm">Choose an existing supplier or create a new one</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search suppliers..."
                value={supplierSearch}
                onChange={(e) => {
                  setSupplierSearch(e.target.value);
                  setShowSupplierDropdown(true);
                }}
                onFocus={() => setShowSupplierDropdown(true)}
                className="pl-9"
              />
              
              {showSupplierDropdown && (
                <div className="absolute z-50 w-full mt-1 bg-popover border rounded-md shadow-md max-h-60 overflow-y-auto">
                  {filteredSuppliers.length > 0 ? (
                    filteredSuppliers.map((supplier: any) => (
                      <div
                        key={supplier.id}
                        className="p-3 hover:bg-accent cursor-pointer border-b last:border-b-0 transition-colors"
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
                        <div className="text-xs text-muted-foreground">
                          {supplier.phone} • {supplier.email}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-muted-foreground">
                      <User className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No suppliers found</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {selectedSupplier && (
              <Card className="bg-accent/50 border-primary/20">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-full">
                        <User className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium text-sm">{selectedSupplier.name}</h3>
                        <p className="text-xs text-muted-foreground">
                          {selectedSupplier.contactPerson} • {selectedSupplier.city}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {selectedSupplier.phone} • {selectedSupplier.email}
                        </p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      Selected
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="flex justify-between pt-3">
              <div></div>
              <Button 
                onClick={nextStep} 
                disabled={!selectedSupplier}
                size="sm"
              >
                Continue to Details →
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Order Details */}
      {step === 2 && (
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calendar className="h-5 w-5 text-primary" />
              Order Details
            </CardTitle>
            <p className="text-muted-foreground text-sm">Set delivery date and add any special instructions</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="expectedDelivery" className="text-sm font-medium">
                  Expected Delivery Date *
                </Label>
                <Input
                  id="expectedDelivery"
                  type="date"
                  value={expectedDelivery}
                  onChange={(e) => setExpectedDelivery(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-sm font-medium">Selected Supplier</Label>
                <Card className="bg-accent/50">
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-primary" />
                      <div>
                        <h4 className="text-sm font-medium">{selectedSupplier?.name}</h4>
                        <p className="text-xs text-muted-foreground">{selectedSupplier?.contactPerson}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="notes" className="text-sm font-medium">
                Additional Notes
              </Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Special instructions, delivery requirements..."
                rows={3}
                className="resize-none"
              />
            </div>

            <div className="flex justify-between pt-3">
              <Button 
                variant="outline" 
                onClick={prevStep}
                size="sm"
              >
                ← Back
              </Button>
              <Button 
                onClick={nextStep} 
                disabled={!expectedDelivery}
                size="sm"
              >
                Continue to Products →
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Add Products */}
      {step === 3 && (
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Package className="h-5 w-5 text-primary" />
                  Add Products
                </CardTitle>
                <p className="text-muted-foreground text-sm">Search and add products to your purchase order</p>
              </div>
              <Button
                onClick={() => setIsAddProductOpen(true)}
                size="sm"
                variant="outline"
              >
                <PackagePlus className="h-4 w-4 mr-1" />
                Add Product
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Product Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search products..."
                value={productSearch}
                onChange={(e) => {
                  setProductSearch(e.target.value);
                  setShowProductDropdown(true);
                }}
                onFocus={() => setShowProductDropdown(true)}
                className="pl-9"
              />
              
              {showProductDropdown && productSearch && (
                <div className="absolute z-50 w-full mt-1 bg-popover border rounded-md shadow-md max-h-60 overflow-y-auto">
                  {filteredProducts.length > 0 ? (
                    filteredProducts.map((product: any) => (
                      <div
                        key={product.id}
                        className="p-3 hover:bg-accent cursor-pointer border-b last:border-b-0 transition-colors"
                        onClick={() => addProduct(product)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-sm">{product.name}</div>
                            <div className="text-xs text-muted-foreground">
                              SKU: {product.sku} • {product.category}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Cost: Rs. {(product.costPrice || product.price)?.toLocaleString()} • Stock: {product.stock}
                            </div>
                          </div>
                          <Plus className="h-4 w-4 text-primary" />
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-muted-foreground">
                      <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No products found</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Selected Items */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">
                  Selected Items ({items.length})
                </Label>
                {items.length > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {items.length} item{items.length !== 1 ? 's' : ''}
                  </Badge>
                )}
              </div>
              
              {items.length > 0 ? (
                <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                  {items.map((item) => (
                    <Card key={item.productId} className="border-2 border-gray-100 hover:border-green-200 transition-all duration-200">
                      <CardContent className="p-5">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h4 className="text-lg font-semibold text-gray-800 mb-3">{item.productName}</h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div className="space-y-1">
                                <Label className="text-sm font-medium text-gray-600">Quantity</Label>
                                <Input
                                  type="number"
                                  value={item.quantity}
                                  onChange={(e) => updateItemQuantity(item.productId, parseInt(e.target.value) || 0)}
                                  className="h-10 border-2 border-gray-200 focus:border-green-400 rounded-lg"
                                  min="1"
                                />
                              </div>
                              <div className="space-y-1">
                                <Label className="text-sm font-medium text-gray-600">Unit Price (Rs.)</Label>
                                <Input
                                  type="number"
                                  value={item.unitPrice}
                                  onChange={(e) => updateItemPrice(item.productId, parseFloat(e.target.value) || 0)}
                                  className="h-10 border-2 border-gray-200 focus:border-green-400 rounded-lg"
                                  min="0"
                                  step="0.01"
                                />
                              </div>
                              <div className="space-y-1">
                                <Label className="text-sm font-medium text-gray-600">Total</Label>
                                <div className="h-10 flex items-center px-3 bg-green-50 border-2 border-green-200 rounded-lg">
                                  <span className="text-lg font-bold text-green-700">
                                    Rs. {item.total.toLocaleString()}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeItem(item.productId)}
                            className="ml-4 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="border-2 border-dashed border-gray-300">
                  <CardContent className="text-center py-12">
                    <Package className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-xl font-medium text-gray-600 mb-2">No items added yet</h3>
                    <p className="text-gray-500">Search and add products above to create your purchase order</p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Order Summary */}
            {items.length > 0 && (
              <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200">
                <CardContent className="p-6">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-full">
                        <Package className="h-6 w-6 text-blue-600" />
                      </div>
                      <span className="text-xl font-semibold text-gray-700">Total Amount:</span>
                    </div>
                    <span className="text-3xl font-bold text-blue-600">
                      Rs. {getTotalAmount().toLocaleString()}
                    </span>
                  </div>
                  <div className="mt-3 pt-3 border-t border-blue-200">
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Items: {items.length}</span>
                      <span>Supplier: {selectedSupplier?.name}</span>
                      <span>Delivery: {expectedDelivery ? new Date(expectedDelivery).toLocaleDateString() : 'Not set'}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="flex justify-between pt-6">
              <Button 
                variant="outline" 
                onClick={prevStep}
                className="px-8 py-3 text-lg border-2"
              >
                ← Back to Details
              </Button>
              <Button 
                onClick={handleSubmit} 
                disabled={isLoading || items.length === 0}
                className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 px-8 py-3 text-lg shadow-lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Creating Order...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-5 w-5 mr-2" />
                    Create Purchase Order
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add Supplier Modal */}
      <Dialog open={isAddSupplierOpen} onOpenChange={setIsAddSupplierOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-lg">Add New Supplier</DialogTitle>
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
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-lg">Add New Product</DialogTitle>
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

// Supplier Form Component (from Suppliers.tsx)
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
          <Label htmlFor="name" className="text-sm">Supplier Name *</Label>
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

      <div className="flex gap-2 pt-3">
        <Button type="submit" size="sm" className="flex-1" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
              {supplier ? "Updating..." : "Adding..."}
            </>
          ) : (
            <>
              {supplier ? "Update" : "Add"} Supplier
            </>
          )}
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={onClose}>
          Cancel
        </Button>
      </div>
    </form>
  );
};

// Product Form Component (from Products.tsx)
const ProductForm = ({ 
  onSubmit, 
  onClose, 
  categories, 
  units,
  initialData = null, 
  isEdit = false,
  isLoading = false
}: { 
  onSubmit: (data: any) => void; 
  onClose: () => void; 
  categories: any[];
  units: any[];
  initialData?: any;
  isEdit?: boolean;
  isLoading?: boolean;
}) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    sku: initialData?.sku || "",
    price: initialData?.price?.toString() || "",
    stock: initialData?.stock?.toString() || "",
    category: initialData?.category || "",
    unit: initialData?.unit || "",
    minStock: initialData?.minStock?.toString() || "",
    description: initialData?.description || "",
    costPrice: initialData?.costPrice?.toString() || "",
    maxStock: initialData?.maxStock?.toString() || ""
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
    if (!isEdit) {
      setFormData({ 
        name: "", sku: "", price: "", stock: "", category: "", 
        unit: "", minStock: "", description: "", costPrice: "", maxStock: "" 
      });
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      
      // Auto-generate SKU when name changes (only for new products)
      if (field === 'name' && !isEdit) {
        newData.sku = generateSKU(value);
      }
      
      return newData;
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto">
        <div>
          <Label htmlFor="name">Product Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="sku">SKU {!isEdit && '(Auto-generated)'}</Label>
          <Input
            id="sku"
            value={formData.sku}
            onChange={(e) => handleInputChange('sku', e.target.value)}
            placeholder={isEdit ? "Enter SKU" : "Auto-generated from name"}
            required
          />
        </div>
        <div>
          <Label htmlFor="price">Price (PKR)</Label>
          <Input
            id="price"
            type="number"
            value={formData.price}
            onChange={(e) => handleInputChange('price', e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="costPrice">Cost Price (PKR)</Label>
          <Input
            id="costPrice"
            type="number"
            value={formData.costPrice}
            onChange={(e) => handleInputChange('costPrice', e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="stock">Stock Quantity</Label>
          <Input
            id="stock"
            type="number"
            step="0.01"
            value={formData.stock}
            onChange={(e) => handleInputChange('stock', e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="minStock">Minimum Stock</Label>
          <Input
            id="minStock"
            type="number"
            step="0.01"
            value={formData.minStock}
            onChange={(e) => handleInputChange('minStock', e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="category">Category</Label>
          <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.value} value={category.value}>{category.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="unit">Unit</Label>
          <Select value={formData.unit} onValueChange={(value) => handleInputChange('unit', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select unit" />
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
        <div className="col-span-2">
          <Label htmlFor="description">Description</Label>
          <Input
            id="description"
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            placeholder="Enter product description"
          />
        </div>
      </div>

      <div className="flex gap-2 pt-4">
        <Button type="submit" className="flex-1" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              {isEdit ? 'Updating...' : 'Adding...'}
            </>
          ) : (
            <>
              {isEdit ? 'Update Product' : 'Add Product'}
            </>
          )}
        </Button>
        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
      </div>
    </form>
  );
};
