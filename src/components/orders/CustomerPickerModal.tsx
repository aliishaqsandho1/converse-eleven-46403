
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, User, Check } from "lucide-react";

interface CustomerPickerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customers: Array<{ id: number; name: string }>;
  selectedCustomers: number[];
  onCustomersSelected: (customers: number[]) => void;
  onNext: () => void;
  isSingleMode?: boolean;
}

export const CustomerPickerModal = ({ 
  open, 
  onOpenChange, 
  customers,
  selectedCustomers,
  onCustomersSelected,
  onNext,
  isSingleMode = false
}: CustomerPickerModalProps) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.id.toString().includes(searchTerm)
  );

  const handleCustomerToggle = (customerId: number) => {
    if (isSingleMode) {
      onCustomersSelected([customerId]);
    } else {
      const isSelected = selectedCustomers.includes(customerId);
      if (isSelected) {
        onCustomersSelected(selectedCustomers.filter(id => id !== customerId));
      } else {
        onCustomersSelected([...selectedCustomers, customerId]);
      }
    }
  };

  const isCustomerSelected = (customerId: number) => selectedCustomers.includes(customerId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-800">
            {isSingleMode ? 'Select Customer' : 'Select Multiple Customers'}
          </DialogTitle>
          <p className="text-gray-600">
            {isSingleMode ? 'Choose one customer for the export' : 'Choose customers to include in the export'}
          </p>
        </DialogHeader>

        <div className="flex-1 space-y-4 overflow-hidden">
          {/* Search Box */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search customers by name or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Selected Count */}
          {!isSingleMode && selectedCustomers.length > 0 && (
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                {selectedCustomers.length} customer{selectedCustomers.length > 1 ? 's' : ''} selected
              </Badge>
            </div>
          )}

          {/* Customer List with ScrollArea */}
          <ScrollArea className="flex-1 h-[400px]">
            <div className="space-y-2 pr-4">
              {filteredCustomers.map((customer) => (
                <Card
                  key={customer.id}
                  className={`cursor-pointer transition-all duration-200 ${
                    isCustomerSelected(customer.id)
                      ? 'border-blue-500 bg-blue-50 shadow-md'
                      : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                  }`}
                  onClick={() => handleCustomerToggle(customer.id)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-full ${
                          isCustomerSelected(customer.id) 
                            ? 'bg-blue-100' 
                            : 'bg-gray-100'
                        }`}>
                          <User className={`h-4 w-4 ${
                            isCustomerSelected(customer.id) 
                              ? 'text-blue-600' 
                              : 'text-gray-600'
                          }`} />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-800">
                            {customer.name || `Customer #${customer.id}`}
                          </h4>
                          <p className="text-sm text-gray-500">ID: {customer.id}</p>
                        </div>
                      </div>
                      {isCustomerSelected(customer.id) && (
                        <div className="p-1 bg-blue-500 rounded-full">
                          <Check className="h-4 w-4 text-white" />
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>

          {filteredCustomers.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <User className="h-12 w-12 mx-auto mb-2 text-gray-300" />
              <p>No customers found</p>
            </div>
          )}
        </div>

        <DialogFooter className="flex gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={onNext}
            disabled={selectedCustomers.length === 0}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Next: Select Date Range
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
