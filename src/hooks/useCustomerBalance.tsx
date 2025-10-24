
import { useToast } from '@/hooks/use-toast';
import { customerBalanceService, BalanceUpdateRequest, CustomerBalanceDetails } from '@/services/customerBalanceService';

export const useCustomerBalance = () => {
  const { toast } = useToast();

  const updateBalanceForOrderStatusChange = async (
    orderId: number,
    customerId: number,
    orderNumber: string,
    orderTotal: number,
    newStatus: string,
    previousStatus: string
  ) => {
    try {
      console.log('Updating customer balance for order status change:', {
        orderId,
        customerId,
        orderNumber,
        orderTotal,
        newStatus,
        previousStatus
      });

      const result = await customerBalanceService.updateBalanceForOrderStatus(
        orderId,
        customerId,
        orderNumber,
        orderTotal,
        newStatus,
        previousStatus
      );

      if (result.success) {
        if (result.data) {
          console.log('Customer balance updated successfully:', result.data);
          toast({
            title: "Balance Updated",
            description: `Customer balance updated for order ${orderNumber}`,
          });
        }
        return result.data;
      } else {
        throw new Error(result.message || 'Failed to update customer balance');
      }
    } catch (error) {
      console.error('Failed to update customer balance:', error);
      toast({
        title: "Balance Update Failed",
        description: `Failed to update customer balance for order ${orderNumber}`,
        variant: "destructive"
      });
      throw error;
    }
  };

  const updateBalanceForPaymentMethodChange = async (
    orderId: number,
    customerId: number,
    orderNumber: string,
    orderTotal: number,
    newPaymentMethod: string,
    previousPaymentMethod: string
  ) => {
    try {
      console.log('Updating customer balance for payment method change:', {
        orderId,
        customerId,
        orderNumber,
        orderTotal,
        newPaymentMethod,
        previousPaymentMethod
      });

      const result = await customerBalanceService.updateBalanceForPaymentMethod(
        orderId,
        customerId,
        orderNumber,
        orderTotal,
        newPaymentMethod,
        previousPaymentMethod
      );

      if (result.success) {
        if (result.data) {
          console.log('Customer balance updated for payment method change:', result.data);
          toast({
            title: "Balance Updated",
            description: `Customer balance updated for payment method change in order ${orderNumber}`,
          });
        }
        return result.data;
      } else {
        throw new Error(result.message || 'Failed to update customer balance');
      }
    } catch (error) {
      console.error('Failed to update customer balance for payment method change:', error);
      toast({
        title: "Balance Update Failed",
        description: `Failed to update customer balance for payment method change in order ${orderNumber}`,
        variant: "destructive"
      });
      throw error;
    }
  };

  const getCustomerBalance = async (customerId: number): Promise<CustomerBalanceDetails | null> => {
    try {
      const result = await customerBalanceService.getCustomerBalance(customerId);
      
      if (result.success && result.data) {
        return result.data;
      } else {
        throw new Error(result.message || 'Failed to fetch customer balance');
      }
    } catch (error) {
      console.error('Failed to fetch customer balance:', error);
      toast({
        title: "Error",
        description: "Failed to fetch customer balance",
        variant: "destructive"
      });
      return null;
    }
  };

  const syncAllCustomerBalances = async () => {
    try {
      console.log('Starting customer balance sync with tax-free calculations...');
      const result = await customerBalanceService.syncAllBalances();
      
      if (result.success && result.data) {
        toast({
          title: "Balances Synced",
          description: `Updated ${result.data.updated} customer balances${result.data.errors > 0 ? ` with ${result.data.errors} errors` : ''}`,
        });
        return result.data;
      } else {
        throw new Error(result.message || 'Failed to sync customer balances');
      }
    } catch (error) {
      console.error('Failed to sync customer balances:', error);
      toast({
        title: "Sync Failed",
        description: "Failed to sync customer balances",
        variant: "destructive"
      });
      throw error;
    }
  };

  const recordManualPayment = async (
    customerId: number,
    amount: number,
    paymentMethod: string,
    reference?: string,
    notes?: string
  ) => {
    try {
      const result = await customerBalanceService.recordPayment(
        customerId,
        amount,
        paymentMethod,
        reference,
        notes
      );

      if (result.success) {
        toast({
          title: "Payment Recorded",
          description: `Payment of ${amount.toLocaleString()} recorded successfully`,
        });
        return result.data;
      } else {
        throw new Error(result.message || 'Failed to record payment');
      }
    } catch (error) {
      console.error('Failed to record payment:', error);
      toast({
        title: "Payment Recording Failed",
        description: "Failed to record payment",
        variant: "destructive"
      });
      throw error;
    }
  };

  const getTransactionHistory = async (customerId: number, limit?: number, offset?: number) => {
    try {
      const result = await customerBalanceService.getTransactionHistory(customerId, limit, offset);
      
      if (result.success && result.data) {
        // API returns data.transactions as an array
        return result.data.transactions || [];
      } else {
        throw new Error(result.message || 'Failed to fetch transaction history');
      }
    } catch (error) {
      console.error('Failed to fetch transaction history:', error);
      toast({
        title: "Error",
        description: "Failed to fetch transaction history",
        variant: "destructive"
      });
      return [];
    }
  };

  return {
    updateBalanceForOrderStatusChange,
    updateBalanceForPaymentMethodChange,
    getCustomerBalance,
    syncAllCustomerBalances,
    recordManualPayment,
    getTransactionHistory
  };
};
