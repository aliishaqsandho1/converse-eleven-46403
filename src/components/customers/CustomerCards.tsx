import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Phone, MapPin, Mail, Calendar, Edit, Download } from "lucide-react";
import { generateCustomerPurchasePDF } from "@/utils/customerPdfGenerator";
import { useToast } from "@/hooks/use-toast";
import { apiConfig } from "@/utils/apiConfig";

interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  type: string;
  address?: string;
  city?: string;
  status: string;
  creditLimit: number;
  currentBalance: number;
  totalPurchases: number;
  lastPurchase?: string;
}

interface CustomerCardsProps {
  customers: Customer[];
  loading: boolean;
  onSelectCustomer: (customer: Customer) => void;
  onEditCustomer: (customer: Customer) => void;
}

export const CustomerCards = ({ customers, loading, onSelectCustomer, onEditCustomer }: CustomerCardsProps) => {
  const { toast } = useToast();
  const [exportingCustomer, setExportingCustomer] = useState<string | null>(null);

  const getCustomerTypeColor = (type: string) => {
    const colors = {
      Temporary: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100",
      "Semi-Permanent": "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100",
      Permanent: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
      // Legacy support for old values
      individual: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100",
      business: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
    };
    return colors[type] || "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100";
  };

  const getStatusColor = (status: string) => {
    return status === "active" || !status ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100" : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100";
  };

  const handleExportCustomer = async (customer: Customer) => {
    try {
      setExportingCustomer(customer.id);
      
      console.log('Fetching purchase data for customer:', customer.id);
      
      // Use the new API endpoint you created
      const ordersResponse = await fetch(`${apiConfig.getBaseUrl()}/customers/${customer.id}/orders?includeItems=true`);
      
      if (!ordersResponse.ok) {
        throw new Error('Failed to fetch customer orders');
      }
      
      const ordersData = await ordersResponse.json();
      console.log('Orders API Response:', ordersData);
      
      if (!ordersData.success) {
        throw new Error(ordersData.message || 'Failed to fetch customer orders');
      }
      
      // Transform API data to match PDF generator interface - fix field name mapping
      const purchases = (ordersData.data?.orders || []).map((order: any) => ({
        id: order.id?.toString() || '',
        orderNumber: order.order_number || `ORD-${order.id}`,
        date: order.created_at || order.date || new Date().toISOString(),
        amount: parseFloat(order.total_amount || '0'),
        items: (order.items || []).map((item: any) => ({
          productName: item.product_name || 'Unknown Product', // Fix: use product_name from API
          quantity: parseFloat(item.quantity || '0'),
          unitPrice: parseFloat(item.unit_price || '0'), // Fix: use unit_price from API
          total: parseFloat(item.total || '0')
        })),
        paymentStatus: order.payment_status || 'Pending', // Fix: use payment_status from API
        notes: order.notes || ''
      }));

      const purchaseData = {
        customer: customer,
        purchases: purchases
      };

      console.log('Generating PDF with data:', purchaseData);
      generateCustomerPurchasePDF(purchaseData);
      
      toast({
        title: "Export Successful",
        description: `Purchase report for ${customer.name} has been downloaded with ${purchases.length} orders.`,
      });
      
    } catch (error) {
      console.error('Failed to export customer data:', error);
      toast({
        title: "Export Failed",
        description: `Failed to generate the purchase report: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setExportingCustomer(null);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <Card key={index} className="animate-pulse">
            <CardHeader>
              <div className="h-6 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (customers.length === 0) {
    return (
      <Card className="col-span-full">
        <CardContent className="p-8">
          <div className="text-center">
            <div className="h-12 w-12 text-muted-foreground mx-auto mb-4">👥</div>
            <p className="text-muted-foreground">No customers found</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {customers.map((customer) => (
        <Card key={customer.id} className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <CardTitle className="text-lg text-foreground">{customer.name}</CardTitle>
                  <Badge className={`text-xs ${getCustomerTypeColor(customer.type || 'business')}`}>
                    {customer.type || 'business'}
                  </Badge>
                  <Badge className={`text-xs ${getStatusColor(customer.status)}`}>
                    {customer.status || 'active'}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                  <Phone className="h-4 w-4" />
                  {customer.phone || 'No phone'}
                </div>
              </div>
              <div className="flex flex-col gap-2">
                {(customer.currentBalance || 0) > 0 && (
                  <Badge variant="destructive" className="ml-2">
                    Due: PKR {customer.currentBalance?.toLocaleString()}
                  </Badge>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-green-50 hover:bg-green-100 text-green-600 border-green-200"
                  onClick={() => handleExportCustomer(customer)}
                  disabled={exportingCustomer === customer.id}
                >
                  <Download className="h-4 w-4 mr-1" />
                  {exportingCustomer === customer.id ? 'Exporting...' : ''}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span className="truncate">{customer.address || 'Address not provided'}</span>
            </div>

            {customer.email && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span className="truncate">{customer.email}</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Total Purchases</p>
                <p className="font-bold text-green-600">PKR {customer.totalPurchases?.toLocaleString() || '0'}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Credit Limit</p>
                <p className="font-medium text-foreground">PKR {customer.creditLimit?.toLocaleString() || '0'}</p>
              </div>
            </div>

            {customer.lastPurchase && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Last purchase: {customer.lastPurchase}</span>
              </div>
            )}

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => onSelectCustomer(customer)}
              >
                View Details
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="bg-blue-50 hover:bg-blue-100 text-blue-600 border-blue-200"
                onClick={() => onEditCustomer(customer)}
              >
                <Edit className="h-4 w-4 mr-1" />
                Edit
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
