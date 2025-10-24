
import { useState, useEffect } from "react";
import { Search, User, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { customersApi } from "@/services/api";
import { useToast } from "@/hooks/use-toast";

interface Customer {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  type?: string;
}

interface CustomerPickerProps {
  selectedCustomer: Customer | null;
  onCustomerSelect: (customer: Customer) => void;
  onCreateNew?: () => void;
}

export default function CustomerPicker({ selectedCustomer, onCustomerSelect, onCreateNew }: CustomerPickerProps) {
  const [open, setOpen] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchCustomers = async () => {
      setLoading(true);
      try {
        const response = await customersApi.getAll({ 
          limit: 100,
          search: searchTerm || undefined 
        });
        if (response.success) {
          setCustomers(response.data.customers || response.customers || []);
        }
      } catch (error) {
        console.error("Error fetching customers:", error);
        toast({
          title: "Error",
          description: "Failed to load customers",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (open) {
      fetchCustomers();
    }
  }, [open, searchTerm, toast]);

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone?.includes(searchTerm)
  );

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Customer *</label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between h-auto min-h-[50px] p-3"
          >
            {selectedCustomer ? (
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
                  <User className="w-4 h-4 text-blue-600" />
                </div>
                <div className="text-left">
                  <p className="font-medium">{selectedCustomer.name}</p>
                  {selectedCustomer.email && (
                    <p className="text-sm text-gray-500">{selectedCustomer.email}</p>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-2 text-gray-500">
                <Search className="w-4 h-4" />
                <span>Search and select a customer...</span>
              </div>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[400px] p-0" align="start">
          <Command>
            <CommandInput 
              placeholder="Search customers..." 
              value={searchTerm}
              onValueChange={setSearchTerm}
            />
            <CommandList>
              <CommandEmpty>
                <div className="text-center py-6">
                  <p className="text-sm text-gray-500 mb-4">No customers found</p>
                  {onCreateNew && (
                    <Button size="sm" onClick={onCreateNew}>
                      <Plus className="w-4 h-4 mr-2" />
                      Create New Customer
                    </Button>
                  )}
                </div>
              </CommandEmpty>
              <CommandGroup>
                <ScrollArea className="h-[300px]">
                  {filteredCustomers.map((customer) => (
                    <CommandItem
                      key={customer.id}
                      value={customer.name}
                      onSelect={() => {
                        onCustomerSelect(customer);
                        setOpen(false);
                      }}
                      className="p-3 cursor-pointer"
                    >
                      <div className="flex items-center space-x-3 w-full">
                        <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
                          <User className="w-4 h-4 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{customer.name}</p>
                          <div className="flex items-center space-x-2 text-sm text-gray-500">
                            {customer.email && <span>{customer.email}</span>}
                            {customer.phone && <span>• {customer.phone}</span>}
                          </div>
                          {customer.type && (
                            <Badge variant="outline" className="mt-1 text-xs">
                              {customer.type}
                            </Badge>
                          )}
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
