import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { User, Edit2, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { customersApi } from "@/services/api";

interface CustomerEditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer: any;
  onCustomerUpdated?: () => void;
  onCustomerDeleted?: () => void;
}

export const CustomerEditModal = ({ 
  open, 
  onOpenChange, 
  customer, 
  onCustomerUpdated, 
  onCustomerDeleted 
}: CustomerEditModalProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    type: "Permanent",
    address: "",
    city: "",
    creditLimit: 0,
    notes: ""
  });
  const [loading, setLoading] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    if (customer) {
      setFormData({
        name: customer.name || "",
        email: customer.email || "",
        phone: customer.phone || "",
        type: customer.type || "Permanent",
        address: customer.address || "",
        city: customer.city || "",
        creditLimit: customer.creditLimit || 0,
        notes: customer.notes || ""
      });
    }
  }, [customer]);

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);

      if (!formData.name.trim()) {
        toast({
          title: "Validation Error",
          description: "Customer name is required",
          variant: "destructive"
        });
        return;
      }

      const updateData = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim() || "N/A",
        type: formData.type,
        address: formData.address.trim(),
        city: formData.city.trim(),
        creditLimit: Number(formData.creditLimit),
        notes: formData.notes.trim()
      };

      console.log('Updating customer:', updateData);

      const response = await customersApi.update(customer.id, updateData);
      
      if (response.success) {
        toast({
          title: "Customer Updated",
          description: "Customer information has been updated successfully",
        });
        onCustomerUpdated?.();
        onOpenChange(false);
      } else {
        throw new Error(response.message || 'Failed to update customer');
      }
    } catch (error) {
      console.error('Failed to update customer:', error);
      toast({
        title: "Update Failed",
        description: `Error: ${error.message || 'Unknown error occurred'}`,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setDeleteLoading(true);

      console.log('Deleting customer ID:', customer.id);

      const response = await customersApi.delete(customer.id);
      
      if (response.success) {
        toast({
          title: "Customer Deleted",
          description: "Customer has been deleted successfully",
        });
        onCustomerDeleted?.();
        setShowDeleteDialog(false);
        onOpenChange(false);
      } else {
        throw new Error(response.message || 'Failed to delete customer');
      }
    } catch (error) {
      console.error('Failed to delete customer:', error);
      toast({
        title: "Delete Failed",
        description: `Error: ${error.message || 'Unknown error occurred'}`,
        variant: "destructive"
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  if (!customer) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-blue-600" />
              Edit Customer - {customer.name}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="customer-name">Customer Name *</Label>
                <Input
                  id="customer-name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter customer name"
                />
              </div>

              <div>
                <Label htmlFor="customer-phone">Phone Number</Label>
                <Input
                  id="customer-phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="Enter phone number (optional)"
                />
              </div>

              <div>
                <Label htmlFor="customer-email">Email Address</Label>
                <Input
                  id="customer-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="Enter email address"
                />
              </div>

              <div>
                <Label htmlFor="customer-type">Customer Type</Label>
                <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select customer type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Temporary">Temporary</SelectItem>
                    <SelectItem value="Semi-Permanent">Semi-Permanent</SelectItem>
                    <SelectItem value="Permanent">Permanent</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="customer-city">City</Label>
                <Input
                  id="customer-city"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  placeholder="Enter city"
                />
              </div>

              <div>
                <Label htmlFor="customer-credit">Credit Limit (PKR)</Label>
                <Input
                  id="customer-credit"
                  type="number"
                  min="0"
                  value={formData.creditLimit}
                  onChange={(e) => handleInputChange('creditLimit', parseInt(e.target.value) || 0)}
                  placeholder="Enter credit limit"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="customer-address">Address</Label>
              <Textarea
                id="customer-address"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="Enter customer address"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="customer-notes">Notes</Label>
              <Textarea
                id="customer-notes"
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Enter any additional notes"
                rows={3}
              />
            </div>

            <div className="flex gap-2 justify-between">
              <Button
                variant="destructive"
                onClick={() => setShowDeleteDialog(true)}
                className="bg-red-600 hover:bg-red-700"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Customer
              </Button>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Edit2 className="h-4 w-4 mr-2" />
                  {loading ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Customer</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{customer?.name}"? This action cannot be undone and may affect order history.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteLoading ? 'Deleting...' : 'Delete Customer'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
