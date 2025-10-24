
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { customersApi } from "@/services/api";

interface QuickCustomerFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCustomerCreated: (customer: any) => void;
}

export function QuickCustomerForm({ open, onOpenChange, onCustomerCreated }: QuickCustomerFormProps) {
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("+92");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setName("");
      setPhone("+92");
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide customer name",
        variant: "destructive"
      });
      return;
    }

    if (!phone.trim() || phone.trim() === "+92") {
      toast({
        title: "Missing Information",
        description: "Please provide customer phone number",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const customerData = {
        name: name.trim(),
        phone: phone.trim(),
        type: "Temporary", // Updated to use new enum value
        creditLimit: 0
      };

      console.log('Creating customer with data:', customerData);

      const response = await customersApi.create(customerData);
      
      if (response.success) {
        onCustomerCreated(response.data);
        
        // Reset form
        setName("");
        setPhone("+92");
        onOpenChange(false);

        toast({
          title: "Customer Added",
          description: `${response.data.name} has been added successfully`,
        });
      } else {
        throw new Error(response.message || 'Failed to create customer');
      }
    } catch (error) {
      console.error('Failed to create customer:', error);
      toast({
        title: "Error",
        description: `Failed to create customer: ${error.message || 'Unknown error'}`,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-blue-600" />
            Quick Add Customer
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Customer Name *</Label>
            <Input
              id="name"
              placeholder="Enter customer name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="border-gray-300"
              disabled={isSubmitting}
              autoFocus
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number *</Label>
            <Input
              id="phone"
              placeholder="+92XXXXXXXXXX"
              value={phone}
              onChange={(e) => {
                // Ensure +92 prefix is always present
                const value = e.target.value;
                if (!value.startsWith("+92")) {
                  setPhone("+92");
                } else {
                  setPhone(value);
                }
              }}
              className="border-gray-300"
              disabled={isSubmitting}
            />
          </div>
          
          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700"
              disabled={isSubmitting || !name.trim() || !phone.trim() || phone.trim() === "+92"}
            >
              {isSubmitting ? "Adding..." : "Add Customer"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
