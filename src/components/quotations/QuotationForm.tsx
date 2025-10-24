import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, Calculator } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import CustomerPicker from "./CustomerPicker";
import ProductPicker from "./ProductPicker";

const quotationSchema = z.object({
  customerId: z.number().min(1, "Customer is required"),
  validUntil: z.string().min(1, "Valid until date is required"),
  items: z.array(z.object({
    productId: z.number().min(1, "Product is required"),
    quantity: z.number().min(1, "Quantity must be at least 1"),
    unitPrice: z.number().min(0, "Unit price must be positive"),
  })).min(1, "At least one item is required"),
  discount: z.number().min(0, "Discount must be positive").optional(),
  notes: z.string().optional(),
});

type QuotationFormData = z.infer<typeof quotationSchema>;

interface QuotationFormProps {
  quotation?: any;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function QuotationForm({ quotation, onSubmit, onCancel, isLoading }: QuotationFormProps) {
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [selectedProducts, setSelectedProducts] = useState<{ [key: number]: any }>({});
  const { toast } = useToast();

  // Set default valid until date (30 days from now)
  const getDefaultValidUntil = () => {
    const date = new Date();
    date.setDate(date.getDate() + 30);
    return date.toISOString().split('T')[0];
  };

  const form = useForm<QuotationFormData>({
    resolver: zodResolver(quotationSchema),
    defaultValues: {
      customerId: quotation?.customerId || 0,
      validUntil: quotation?.validUntil || getDefaultValidUntil(),
      items: quotation?.items?.map((item: any) => ({
        productId: item.productId || 0,
        quantity: item.quantity || 1,
        unitPrice: item.unitPrice || 0,
      })) || [{ productId: 0, quantity: 1, unitPrice: 0 }],
      discount: quotation?.discount || 0,
      notes: quotation?.notes || "",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  // Set initial customer and products if editing
  useEffect(() => {
    if (quotation) {
      if (quotation.customerId && quotation.customerName) {
        setSelectedCustomer({
          id: quotation.customerId,
          name: quotation.customerName,
        });
      }
      
      // Set initial products for editing
      if (quotation.items) {
        const productMap: { [key: number]: any } = {};
        quotation.items.forEach((item: any, index: number) => {
          if (item.productId && item.productName) {
            productMap[index] = {
              id: item.productId,
              name: item.productName,
              salePrice: item.unitPrice,
            };
          }
        });
        setSelectedProducts(productMap);
      }
    }
  }, [quotation]);

  const handleCustomerSelect = (customer: any) => {
    setSelectedCustomer(customer);
    form.setValue("customerId", Number(customer.id)); // Ensure it's a number!
  };

  const handleProductSelect = (index: number, product: any) => {
    setSelectedProducts(prev => ({ ...prev, [index]: product }));
    form.setValue(`items.${index}.productId`, product.id);
    form.setValue(`items.${index}.unitPrice`, product.salePrice || product.price || 0);
  };

  const calculateSubtotal = () => {
    const items = form.watch("items");
    return items.reduce((sum, item) => {
      return sum + (item.quantity * item.unitPrice);
    }, 0);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const discount = form.watch("discount") || 0;
    return subtotal - discount;
  };

  const handleSubmit = (data: QuotationFormData) => {
    // Ensure customerId is always a number (extra safety, in case)
    const formattedData = {
      ...data,
      customerId: Number(data.customerId),
      items: data.items.map(item => ({
        ...item,
        productId: Number(item.productId), // force numeric productId (for API + schema)
        unitPrice: Number(item.unitPrice),
        quantity: Number(item.quantity),
      })),
      discount: Number(data.discount) || 0,
      notes: data.notes || "",
    };

    onSubmit(formattedData);
  };

  const addNewItem = () => {
    append({ productId: 0, quantity: 1, unitPrice: 0 });
  };

  const removeItem = (index: number) => {
    remove(index);
    setSelectedProducts(prev => {
      const newProducts = { ...prev };
      delete newProducts[index];
      return newProducts;
    });
  };

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
      {/* Customer and Date Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <CustomerPicker
          selectedCustomer={selectedCustomer}
          onCustomerSelect={handleCustomerSelect}
        />

        <div className="space-y-2">
          <Label htmlFor="validUntil">Valid Until *</Label>
          <Input
            id="validUntil"
            type="date"
            {...form.register("validUntil")}
            className="h-[50px]"
          />
          {form.formState.errors.validUntil && (
            <p className="text-sm text-red-600">{form.formState.errors.validUntil.message}</p>
          )}
        </div>
      </div>

      {/* Customer Error */}
      {form.formState.errors.customerId && (
        <p className="text-sm text-red-600">{form.formState.errors.customerId.message}</p>
      )}

      {/* Items Section */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Quotation Items</CardTitle>
            <Button
              type="button"
              onClick={addNewItem}
              size="sm"
              className="bg-green-600 hover:bg-green-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {fields.map((field, index) => (
            <div key={field.id} className="p-4 border rounded-lg space-y-4 bg-gray-50">
              <div className="flex justify-between items-center">
                <span className="font-medium text-lg">Item {index + 1}</span>
                {fields.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeItem(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-2">
                  <ProductPicker
                    selectedProduct={selectedProducts[index] || null}
                    onProductSelect={(product) => handleProductSelect(index, product)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Quantity *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="1"
                    className="h-[50px]"
                    {...form.register(`items.${index}.quantity`, { valueAsNumber: true })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Unit Price *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    className="h-[50px]"
                    {...form.register(`items.${index}.unitPrice`, { valueAsNumber: true })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-3"></div>
                <div className="space-y-2">
                  <Label>Item Total</Label>
                  <div className="h-[50px] px-3 py-2 bg-gray-100 border rounded-md flex items-center font-medium">
                    Rs. {(form.watch(`items.${index}.quantity`) * form.watch(`items.${index}.unitPrice`)).toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {form.formState.errors.items && (
            <p className="text-sm text-red-600">{form.formState.errors.items.message}</p>
          )}
        </CardContent>
      </Card>

      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="discount">Discount Amount</Label>
              <Input
                id="discount"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                className="h-[50px]"
                {...form.register("discount", { valueAsNumber: true })}
              />
            </div>

            <div className="space-y-4">
              <div className="flex justify-between text-lg">
                <span>Subtotal:</span>
                <span className="font-medium">Rs. {calculateSubtotal().toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg">
                <span>Discount:</span>
                <span className="font-medium">Rs. {(form.watch("discount") || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xl font-bold border-t pt-4">
                <span>Total:</span>
                <span className="text-green-600">Rs. {calculateTotal().toFixed(2)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notes */}
      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          placeholder="Additional notes or comments..."
          rows={4}
          {...form.register("notes")}
        />
      </div>

      {/* Form Actions */}
      <div className="flex gap-4 justify-end">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading} className="bg-blue-600 hover:bg-blue-700">
          {isLoading ? "Processing..." : (quotation ? "Update Quotation" : "Create Quotation")}
        </Button>
      </div>
    </form>
  );
}
