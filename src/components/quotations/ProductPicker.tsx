
import { useState, useEffect } from "react";
import { Search, Package, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { productsApi } from "@/services/api";
import { useToast } from "@/hooks/use-toast";

interface Product {
  id: number;
  name: string;
  sku?: string;
  category?: string;
  price?: number;
  salePrice?: number;
  stock?: number;
}

interface ProductPickerProps {
  selectedProduct: Product | null;
  onProductSelect: (product: Product) => void;
  onCreateNew?: () => void;
}

export default function ProductPicker({ selectedProduct, onProductSelect, onCreateNew }: ProductPickerProps) {
  const [open, setOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const response = await productsApi.getAll({ 
          limit: 200,
          search: searchTerm || undefined 
        });
        if (response.success) {
          setProducts(response.data.products || response.products || []);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
        toast({
          title: "Error",
          description: "Failed to load products",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (open) {
      fetchProducts();
    }
  }, [open, searchTerm, toast]);

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Product *</label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between h-auto min-h-[50px] p-3"
          >
            {selectedProduct ? (
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-full">
                  <Package className="w-4 h-4 text-green-600" />
                </div>
                <div className="text-left">
                  <p className="font-medium">{selectedProduct.name}</p>
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    {selectedProduct.sku && <span>SKU: {selectedProduct.sku}</span>}
                    <span>Rs. {selectedProduct.salePrice || selectedProduct.price || 0}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-2 text-gray-500">
                <Search className="w-4 h-4" />
                <span>Search and select a product...</span>
              </div>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[450px] p-0" align="start">
          <Command>
            <CommandInput 
              placeholder="Search products by name, SKU, or category..." 
              value={searchTerm}
              onValueChange={setSearchTerm}
            />
            <CommandList>
              <CommandEmpty>
                <div className="text-center py-6">
                  <p className="text-sm text-gray-500 mb-4">No products found</p>
                  {onCreateNew && (
                    <Button size="sm" onClick={onCreateNew}>
                      <Plus className="w-4 h-4 mr-2" />
                      Create New Product
                    </Button>
                  )}
                </div>
              </CommandEmpty>
              <CommandGroup>
                <ScrollArea className="h-[300px]">
                  {filteredProducts.map((product) => (
                    <CommandItem
                      key={product.id}
                      value={product.name}
                      onSelect={() => {
                        onProductSelect(product);
                        setOpen(false);
                      }}
                      className="p-3 cursor-pointer"
                    >
                      <div className="flex items-center space-x-3 w-full">
                        <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-full">
                          <Package className="w-4 h-4 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <p className="font-medium">{product.name}</p>
                            {product.category && (
                              <Badge variant="outline" className="text-xs">
                                {product.category}
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center space-x-2 text-sm text-gray-500">
                            {product.sku && <span>SKU: {product.sku}</span>}
                            <span>• Rs. {product.salePrice || product.price || 0}</span>
                            {product.stock !== undefined && (
                              <span className={product.stock > 0 ? "text-green-600" : "text-red-600"}>
                                • Stock: {product.stock}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </CommandItem>
                  ))}
                </ScrollArea>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
