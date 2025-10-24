import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Pin, PinOff, Info, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ProductDetailsModal } from "./ProductDetailsModal";
import { QuantitySuggestionPopup } from "./QuantitySuggestionPopup";
import { useStockManagement } from '@/hooks/useStockManagement';
import { formatQuantity } from "@/lib/utils";

interface ProductCardProps {
  product: any;
  isPinned: boolean;
  quantityInput: string;
  onTogglePin: (productId: number) => void;
  onQuantityChange: (productId: number, value: string) => void;
  onAddToCart: (product: any, quantity?: number) => void;
  onAddCustomQuantity: (product: any) => void;
  viewMode?: 'card' | 'slim';
  index?: number; // For displaying product index in slim view
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  isPinned,
  quantityInput,
  onTogglePin,
  onQuantityChange,
  onAddToCart,
  onAddCustomQuantity,
  viewMode = 'card',
  index
}) => {
  const { toast } = useToast();
  const { validateStock } = useStockManagement();
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isValidating, setIsValidating] = useState(false);

  const handleQuantityInputChange = (value: string) => {
    // Allow decimal numbers with up to 2 decimal places
    if (value === '' || /^\d*\.?\d{0,2}$/.test(value)) {
      onQuantityChange(product.id, value);
    }
  };

  const handleAddCustomQuantity = () => {
    const quantity = parseFloat(quantityInput);
    
    if (quantityInput && !isNaN(quantity) && quantity > 0) {
      // Skip heavy stock validation for better performance
      // Basic stock check only
      if (!product.incompleteQuantity && !product.needsQuantityUpdate && (product.stock || 0) < quantity) {
        toast({
          title: "Insufficient Stock",
          description: `Only ${product.stock || 0} ${product.unit} available`,
          variant: "destructive"
        });
        return;
      }
      
      onAddCustomQuantity(product);
    } else {
      toast({
        title: "Invalid Quantity",
        description: "Please enter a valid quantity (e.g., 1, 0.5, 2.25)",
        variant: "destructive"
      });
    }
  };

  const handleQuantitySuggestion = (quantity: number) => {
    // Skip heavy validation for better performance
    // Basic stock check only
    if (!product.incompleteQuantity && !product.needsQuantityUpdate && (product.stock || 0) < quantity) {
      toast({
        title: "Insufficient Stock",
        description: `Only ${product.stock || 0} ${product.unit} available`,
        variant: "destructive"
      });
      return;
    }
    
    // Add the suggested quantity to cart
    onAddToCart(product, quantity);
  };

  const handleQuickAdd = () => {
    // Use quantity from input if available, otherwise default to 1
    const quantity = quantityInput && !isNaN(parseFloat(quantityInput)) ? parseFloat(quantityInput) : 1;
    
    // Skip heavy validation for better performance  
    // Basic stock check only
    if (!product.incompleteQuantity && !product.needsQuantityUpdate && (product.stock || 0) < quantity) {
      toast({
        title: "Insufficient Stock",
        description: `Only ${product.stock || 0} ${product.unit} available`,
        variant: "destructive"
      });
      return;
    }
    
    onAddToCart(product, quantity);
  };

  // Check if product has incomplete quantity information
  const hasIncompleteQuantity = product.incompleteQuantity || product.needsQuantityUpdate;
  const isOutOfStock = !hasIncompleteQuantity && (product.stock || 0) <= 0;

  if (viewMode === 'slim') {
    return (
      <>
        <div className={`flex items-center gap-2 p-2 border rounded-lg hover:shadow-sm transition-all duration-200 ${
          isPinned 
            ? 'border-blue-300 bg-blue-50 dark:border-blue-600 dark:bg-blue-900/20' 
            : hasIncompleteQuantity
            ? 'border-orange-300 bg-orange-50 dark:border-orange-600 dark:bg-orange-900/20'
            : isOutOfStock
            ? 'border-red-300 bg-red-50 dark:border-red-600 dark:bg-red-900/20'
            : 'border-border bg-card'
        }`}>
          {/* Product Index */}
          {index && (
            <div className="flex-shrink-0 w-8 text-center">
              <span className="text-xs font-bold text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">
                {index}
              </span>
            </div>
          )}

          {/* Stock Status Warning */}
          {(hasIncompleteQuantity || isOutOfStock) && (
            <div className="flex-shrink-0" title={
              hasIncompleteQuantity 
                ? (product.quantityNote || "Incomplete quantity information")
                : "Out of stock"
            }>
              <AlertTriangle className={`h-4 w-4 ${
                isOutOfStock ? 'text-red-600' : 'text-orange-600'
              }`} />
            </div>
          )}

          {/* Product Name */}
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-sm truncate" title={product.name}>
              {product.name}
            </h3>
          </div>

          {/* SKU */}
          <div className="w-24 flex-shrink-0">
            <p className="text-xs text-muted-foreground truncate" title={product.sku}>
              {product.sku}
            </p>
          </div>

          {/* Price */}
          <div className="w-24 flex-shrink-0">
            <div className="text-sm font-bold text-blue-600">
              PKR {product.price.toLocaleString()}
            </div>
            <div className="text-[10px] text-muted-foreground">
              {hasIncompleteQuantity ? (
                <span className="text-orange-600 font-medium">Unknown qty</span>
              ) : isOutOfStock ? (
                <span className="text-red-600 font-medium">Out of stock</span>
              ) : (
                <>{formatQuantity(product.stock)} {product.unit}</>
              )}
            </div>
          </div>

          {/* Quantity Input */}
          <div className="w-20 flex-shrink-0">
            <Input
              type="text"
              placeholder={`Qty`}
              value={quantityInput}
              onChange={(e) => handleQuantityInputChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleQuickAdd();
                }
              }}
              className="h-8 text-xs"
              disabled={isOutOfStock && !hasIncompleteQuantity}
            />
          </div>

          {/* Quick Add Button */}
          <div className="w-20 flex-shrink-0">
            <Button
              onClick={handleQuickAdd}
              className={`w-full text-white text-xs h-8 ${
                hasIncompleteQuantity 
                  ? 'bg-orange-600 hover:bg-orange-700' 
                  : isOutOfStock
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
              disabled={isOutOfStock && !hasIncompleteQuantity || isValidating}
            >
              {isValidating ? 'Wait...' : hasIncompleteQuantity ? 'Add ⚠️' : isOutOfStock ? 'N/A' : 'Add'}
            </Button>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 flex-shrink-0">
            <QuantitySuggestionPopup
              product={product}
              onAddQuantity={handleQuantitySuggestion}
              disabled={isOutOfStock && !hasIncompleteQuantity || isValidating}
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsDetailsOpen(true)}
              className="h-8 w-8 p-0"
              title="View product details"
            >
              <Info className="h-4 w-4 text-muted-foreground hover:text-blue-600" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onTogglePin(product.id)}
              className="h-8 w-8 p-0"
            >
              {isPinned ? 
                <Pin className="h-4 w-4 text-blue-600" /> : 
                <PinOff className="h-4 w-4 text-muted-foreground" />
              }
            </Button>
          </div>
        </div>

        {/* Product Details Modal */}
        <ProductDetailsModal
          open={isDetailsOpen}
          onOpenChange={setIsDetailsOpen}
          product={product}
        />
      </>
    );
  }

  return (
    <>
      <Card className={`hover:shadow-md transition-all duration-200 h-full ${
        isPinned 
          ? 'border-blue-300 bg-blue-50 dark:border-blue-600 dark:bg-blue-900/20' 
          : hasIncompleteQuantity
          ? 'border-orange-300 bg-orange-50 dark:border-orange-600 dark:bg-orange-900/20'
          : isOutOfStock
          ? 'border-red-300 bg-red-50 dark:border-red-600 dark:bg-red-900/20'
          : 'border-border bg-card'
      } relative`}>
        {/* Pin Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onTogglePin(product.id)}
          className="absolute top-1 right-1 h-5 w-5 p-0 z-10"
        >
          {isPinned ? 
            <Pin className="h-2.5 w-2.5 text-blue-600" /> : 
            <PinOff className="h-2.5 w-2.5 text-muted-foreground" />
          }
        </Button>

        {/* Details Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsDetailsOpen(true)}
          className="absolute top-1 right-7 h-5 w-5 p-0 z-10"
          title="View product details"
        >
          <Info className="h-2.5 w-2.5 text-muted-foreground hover:text-blue-600" />
        </Button>

        {/* Stock Status Warning */}
        {(hasIncompleteQuantity || isOutOfStock) && (
          <div className="absolute top-1 left-1 h-5 w-5 z-10" title={
            hasIncompleteQuantity 
              ? (product.quantityNote || "Incomplete quantity information")
              : "Out of stock"
          }>
            <AlertTriangle className={`h-2.5 w-2.5 ${
              isOutOfStock ? 'text-red-600' : 'text-orange-600'
            }`} />
          </div>
        )}
        
        <CardContent className="p-2 h-full flex flex-col">
          <div className="flex-1 space-y-2">
            {/* Product Info */}
            <div className="space-y-0.5">
              <h3 className="font-medium text-card-foreground text-xs leading-tight line-clamp-2 min-h-[2rem] pr-12">
                {product.name}
              </h3>
              <p className="text-[10px] text-muted-foreground">SKU: {product.sku}</p>
            </div>
            
            {/* Price and Stock */}
            <div className="space-y-0.5">
              <div className="text-sm font-bold text-blue-600">
                PKR {product.price.toLocaleString()}
              </div>
              <div className="text-[10px] text-muted-foreground">
                {hasIncompleteQuantity ? (
                  <span className="text-orange-600 font-medium">
                    Quantity unknown
                  </span>
                ) : isOutOfStock ? (
                  <span className="text-red-600 font-medium">
                    Out of stock
                  </span>
                ) : (
                  <>
                    {formatQuantity(product.stock)} {product.unit} available
                  </>
                )}
              </div>
              {hasIncompleteQuantity && product.quantityNote && (
                <div className="text-[9px] text-orange-600 italic">
                  {product.quantityNote}
                </div>
              )}
            </div>
          </div>

          {/* Actions - Always at bottom */}
          <div className="space-y-1.5 mt-auto">
            {/* Quantity Input */}
            <div className="flex items-center gap-1">
              <Input
                type="text"
                placeholder={`Qty (${product.unit})`}
                value={quantityInput}
                onChange={(e) => handleQuantityInputChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleQuickAdd();
                  }
                }}
                className="h-6 text-[10px] flex-1 bg-background border-input px-1"
                disabled={isOutOfStock && !hasIncompleteQuantity}
              />
              <QuantitySuggestionPopup
                product={product}
                onAddQuantity={handleQuantitySuggestion}
                disabled={isOutOfStock && !hasIncompleteQuantity || isValidating}
              />
            </div>
            
            {/* Quick Add Button */}
            <Button
              onClick={handleQuickAdd}
              className={`w-full text-white text-[10px] h-6 ${
                hasIncompleteQuantity 
                  ? 'bg-orange-600 hover:bg-orange-700' 
                  : isOutOfStock
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
              disabled={isOutOfStock && !hasIncompleteQuantity || isValidating}
            >
              {isValidating ? (
                'Validating...'
              ) : hasIncompleteQuantity ? (
                <>Quick Add ({formatQuantity(quantityInput || '1')} {product.unit}) ⚠️</>
              ) : isOutOfStock ? (
                'Out of Stock'
              ) : (
                <>Quick Add ({formatQuantity(quantityInput || '1')} {product.unit})</>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Product Details Modal */}
      <ProductDetailsModal
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
        product={product}
      />
    </>
  );
};
