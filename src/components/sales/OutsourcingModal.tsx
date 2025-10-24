import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import { suppliersApi } from "@/services/api";
import { SupplierForm } from "@/components/suppliers/SupplierForm";
import { toast } from "sonner";

interface OutsourcingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cartItem: {
    productId: number;
    name: string;
    quantity: number;
    price: number;
    unit: string;
  } | null;
  onConfirm: (data: {
    supplierId: number;
    costPerUnit: number;
    notes?: string;
  }) => void;
}

interface Supplier {
  id: number;
  name: string;
  contact_person?: string;
  phone?: string;
  email?: string;
}

export const OutsourcingModal: React.FC<OutsourcingModalProps> = ({
  open,
  onOpenChange,
  cartItem,
  onConfirm
}) => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>("");
  const [costPerUnit, setCostPerUnit] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [loadingSuppliers, setLoadingSuppliers] = useState(false);
  const [isAddSupplierOpen, setIsAddSupplierOpen] = useState(false);
  const [isAddingSupplier, setIsAddingSupplier] = useState(false);

  // Load suppliers when modal opens
  useEffect(() => {
    if (open) {
      loadSuppliers();
    }
  }, [open]);

  // Reset form when modal closes or item changes
  useEffect(() => {
    if (!open || !cartItem) {
      setSelectedSupplierId("");
      setCostPerUnit("");
      setNotes("");
    }
  }, [open, cartItem]);

  const loadSuppliers = async () => {
    try {
      setLoadingSuppliers(true);
      const response = await suppliersApi.getAll();
      
      // Handle different API response structures
      let suppliersList: Supplier[] = [];
      if (response?.success && response?.data) {
        if (Array.isArray(response.data)) {
          suppliersList = response.data;
        } else if (response.data.suppliers && Array.isArray(response.data.suppliers)) {
          suppliersList = response.data.suppliers;
        }
      }
      
      setSuppliers(suppliersList);
    } catch (error) {
      console.error('Failed to load suppliers:', error);
      toast.error('Failed to load suppliers');
    } finally {
      setLoadingSuppliers(false);
    }
  };

  const handleAddSupplier = async (formData: any) => {
    try {
      setIsAddingSupplier(true);
      const response = await suppliersApi.create(formData);
      
      if (response?.success && response?.data) {
        // Add the new supplier to the list
        setSuppliers(prev => [...prev, response.data]);
        // Select the new supplier
        setSelectedSupplierId(response.data.id.toString());
        // Close the add supplier modal
        setIsAddSupplierOpen(false);
        
        toast.success('Supplier added successfully');
      } else {
        throw new Error('Failed to create supplier');
      }
    } catch (error) {
      console.error('Failed to add supplier:', error);
      toast.error('Failed to add supplier');
    } finally {
      setIsAddingSupplier(false);
    }
  };

  const handleConfirm = () => {
    if (!selectedSupplierId) {
      toast.error('Please select a supplier');
      return;
    }

    if (!costPerUnit || parseFloat(costPerUnit) <= 0) {
      toast.error('Please enter a valid cost per unit');
      return;
    }

    setLoading(true);
    
    try {
      onConfirm({
        supplierId: parseInt(selectedSupplierId),
        costPerUnit: parseFloat(costPerUnit),
        notes: notes.trim() || undefined
      });
      
      onOpenChange(false);
      toast.success('Item marked for outsourcing');
    } catch (error) {
      console.error('Failed to confirm outsourcing:', error);
      toast.error('Failed to confirm outsourcing');
    } finally {
      setLoading(false);
    }
  };

  const totalCost = cartItem && costPerUnit 
    ? (parseFloat(costPerUnit) * cartItem.quantity).toFixed(2)
    : "0.00";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-card">
        <DialogHeader>
          <DialogTitle className="text-card-foreground">
            Outsource Item
          </DialogTitle>
        </DialogHeader>

        {cartItem && (
          <div className="space-y-4">
            {/* Item Details */}
            <div className="bg-muted/50 p-3 rounded-lg border">
              <h4 className="font-medium text-sm mb-2">Item Details</h4>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Product:</span>
                  <span className="font-medium">{cartItem.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Quantity:</span>
                  <span>{cartItem.quantity} {cartItem.unit}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Sale Price:</span>
                  <span>PKR {cartItem.price.toLocaleString()} / {cartItem.unit}</span>
                </div>
              </div>
            </div>

            {/* Supplier Selection */}
            <div className="space-y-2">
              <Label htmlFor="supplier" className="text-sm font-medium">
                Select Supplier *
              </Label>
              <div className="flex gap-2">
                <Select 
                  value={selectedSupplierId} 
                  onValueChange={setSelectedSupplierId}
                  disabled={loadingSuppliers}
                >
                  <SelectTrigger className="bg-background flex-1">
                    <SelectValue placeholder={
                      loadingSuppliers ? "Loading suppliers..." : "Choose a supplier"
                    } />
                  </SelectTrigger>
                  <SelectContent>
                    {suppliers.map((supplier) => (
                      <SelectItem key={supplier.id} value={supplier.id.toString()}>
                        <div>
                          <div className="font-medium">{supplier.name}</div>
                          {supplier.contact_person && (
                            <div className="text-xs text-muted-foreground">
                              Contact: {supplier.contact_person}
                            </div>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="px-3 flex-shrink-0"
                  onClick={() => setIsAddSupplierOpen(true)}
                  disabled={loadingSuppliers}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {suppliers.length === 0 && !loadingSuppliers && (
                <p className="text-xs text-muted-foreground">
                  No suppliers available. Please add suppliers first.
                </p>
              )}
            </div>

            {/* Cost Per Unit */}
            <div className="space-y-2">
              <Label htmlFor="costPerUnit" className="text-sm font-medium">
                Outsourcing Cost per {cartItem.unit} *
              </Label>
              <Input
                id="costPerUnit"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={costPerUnit}
                onChange={(e) => setCostPerUnit(e.target.value)}
                className="bg-background"
              />
              {costPerUnit && (
                <div className="text-xs text-muted-foreground">
                  Total outsourcing cost: PKR {totalCost}
                </div>
              )}
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes" className="text-sm font-medium">
                Notes (Optional)
              </Label>
              <Input
                id="notes"
                placeholder="Additional notes for outsourcing..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="bg-background"
              />
            </div>

            {/* Profit Calculation */}
            {costPerUnit && (
              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-700">
                <h4 className="font-medium text-sm mb-2 text-blue-900 dark:text-blue-100">
                  Profit Analysis
                </h4>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-blue-700 dark:text-blue-300">Sale Revenue:</span>
                    <span className="text-blue-900 dark:text-blue-100 font-medium">
                      PKR {(cartItem.price * cartItem.quantity).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700 dark:text-blue-300">Outsourcing Cost:</span>
                    <span className="text-blue-900 dark:text-blue-100 font-medium">
                      PKR {totalCost}
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-blue-200 dark:border-blue-700 pt-1">
                    <span className="text-blue-700 dark:text-blue-300 font-medium">Profit:</span>
                    <span className={`font-bold ${
                      (cartItem.price * cartItem.quantity) - parseFloat(totalCost) >= 0 
                        ? 'text-green-600 dark:text-green-400' 
                        : 'text-red-600 dark:text-red-400'
                    }`}>
                      PKR {((cartItem.price * cartItem.quantity) - parseFloat(totalCost)).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="flex-1"
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirm}
                className="flex-1 bg-orange-600 hover:bg-orange-700 text-white"
                disabled={loading || !selectedSupplierId || !costPerUnit}
              >
                {loading ? 'Processing...' : 'Confirm Outsourcing'}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>

      {/* Add Supplier Modal */}
      <Dialog open={isAddSupplierOpen} onOpenChange={setIsAddSupplierOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Supplier</DialogTitle>
          </DialogHeader>
          <SupplierForm 
            onSubmit={handleAddSupplier}
            onClose={() => setIsAddSupplierOpen(false)}
            isLoading={isAddingSupplier}
          />
        </DialogContent>
      </Dialog>
    </Dialog>
  );
};