
import { apiConfig } from '@/utils/apiConfig';

export interface BalanceTransaction {
  id: number;
  customerId: number;
  orderId?: number;
  amount: number;
  type: 'credit' | 'debit' | 'adjustment';
  orderNumber?: string;
  description: string;
  previousBalance: number;
  newBalance: number;
  createdAt: string;
  createdBy?: string;
}

export interface CustomerBalanceDetails {
  customerId: number;
  currentBalance: number;
  creditLimit: number;
  availableCredit: number;
  totalPurchases: number;
  lastTransactionDate?: string;
  transactions: BalanceTransaction[];
}

export interface TransactionHistoryResponse {
  transactions: any[];
  total: number;
  has_more: boolean;
}

export interface BalanceUpdateRequest {
  customerId: number;
  orderId?: number;
  amount: number;
  type: 'credit' | 'debit' | 'adjustment';
  orderNumber?: string;
  description: string;
  includesTax?: boolean;
}

// Generic API request function with proper error handling
const apiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ success: boolean; data?: T; message?: string }> => {
  const url = `${apiConfig.getBaseUrl()}${endpoint}`;

  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Customer balance API request failed for ${endpoint}:`, error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};

export const customerBalanceService = {
  // Get detailed balance information for a customer
  getCustomerBalance: async (customerId: number): Promise<{ success: boolean; data?: CustomerBalanceDetails; message?: string }> => {
    try {
      const response = await apiRequest<CustomerBalanceDetails>(`/customers/${customerId}/balance-details`);
      
      if (response.success && response.data) {
        return response;
      }

      // Fallback: get basic customer info and calculate balance
      const customerResponse = await apiRequest<any>(`/customers/${customerId}`);
      if (customerResponse.success && customerResponse.data) {
        const customer = customerResponse.data;
        return {
          success: true,
          data: {
            customerId,
            currentBalance: customer.currentBalance || 0,
            creditLimit: customer.creditLimit || 0,
            availableCredit: (customer.creditLimit || 0) - (customer.currentBalance || 0),
            totalPurchases: customer.totalPurchases || 0,
            transactions: []
          }
        };
      }

      return { success: false, message: 'Customer not found' };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to get customer balance'
      };
    }
  },

  // Update customer balance with transaction tracking
  updateBalance: async (request: BalanceUpdateRequest): Promise<{ success: boolean; data?: BalanceTransaction; message?: string }> => {
    try {
      console.log('Updating customer balance:', request);

      // Calculate actual amount (exclude tax if specified)
      let actualAmount = request.amount;
      if (request.includesTax) {
        // Assuming 18% tax - this should be configurable
        actualAmount = request.amount / 1.18;
      }

      const updateData = {
        ...request,
        amount: actualAmount
      };

      const response = await apiRequest<BalanceTransaction>('/customers/update-balance', {
        method: 'POST',
        body: JSON.stringify(updateData),
      });

      if (response.success) {
        console.log('Balance updated successfully:', response.data);
      }

      return response;
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to update balance'
      };
    }
  },

  // Handle order status changes and update balance accordingly
  updateBalanceForOrderStatus: async (
    orderId: number,
    customerId: number,
    orderNumber: string,
    orderTotal: number,
    newStatus: string,
    previousStatus: string
  ): Promise<{ success: boolean; data?: BalanceTransaction; message?: string }> => {
    try {
      console.log('Updating balance for order status change:', {
        orderId, customerId, orderNumber, orderTotal, newStatus, previousStatus
      });

      let balanceUpdate: BalanceUpdateRequest | null = null;

      // Determine balance change based on status transition
      if (newStatus === 'credit' && previousStatus !== 'credit') {
        // Customer now owes money
        balanceUpdate = {
          customerId,
          orderId,
          amount: orderTotal,
          type: 'credit',
          orderNumber,
          description: `Order ${orderNumber} changed to credit - customer owes amount`,
          includesTax: false // Order total should already be tax-free for balance calculations
        };
      } else if (previousStatus === 'credit' && newStatus !== 'credit') {
        // Customer no longer owes money
        balanceUpdate = {
          customerId,
          orderId,
          amount: orderTotal,
          type: 'debit',
          orderNumber,
          description: `Order ${orderNumber} status changed from credit - debt cleared`
        };
      }

      if (balanceUpdate) {
        return await customerBalanceService.updateBalance(balanceUpdate);
      }

      return { success: true, message: 'No balance update required' };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to update balance for order status'
      };
    }
  },

  // Handle payment method changes
  updateBalanceForPaymentMethod: async (
    orderId: number,
    customerId: number,
    orderNumber: string,
    orderTotal: number,
    newPaymentMethod: string,
    previousPaymentMethod: string
  ): Promise<{ success: boolean; data?: BalanceTransaction; message?: string }> => {
    try {
      console.log('Updating balance for payment method change:', {
        orderId, customerId, orderNumber, orderTotal, newPaymentMethod, previousPaymentMethod
      });

      let balanceUpdate: BalanceUpdateRequest | null = null;

      // Handle payment method transitions that affect customer balance
      if (previousPaymentMethod === 'cash' && newPaymentMethod === 'credit') {
        // Cash to Credit: Customer now owes money
        balanceUpdate = {
          customerId,
          orderId,
          amount: orderTotal,
          type: 'credit',
          orderNumber,
          description: `Order ${orderNumber} payment changed from cash to credit`
        };
      } else if (previousPaymentMethod === 'credit' && newPaymentMethod === 'cash') {
        // Credit to Cash: Customer paid, reduce debt
        balanceUpdate = {
          customerId,
          orderId,
          amount: orderTotal,
          type: 'debit',
          orderNumber,
          description: `Order ${orderNumber} payment changed from credit to cash - debt cleared`
        };
      } else if (previousPaymentMethod === 'credit' && ['card', 'bank_transfer'].includes(newPaymentMethod)) {
        // Credit to electronic payment: Customer paid, reduce debt
        balanceUpdate = {
          customerId,
          orderId,
          amount: orderTotal,
          type: 'debit',
          orderNumber,
          description: `Order ${orderNumber} payment changed from credit to ${newPaymentMethod} - debt cleared`
        };
      } else if (['card', 'bank_transfer'].includes(previousPaymentMethod) && newPaymentMethod === 'credit') {
        // Electronic payment to Credit: Customer now owes money
        balanceUpdate = {
          customerId,
          orderId,
          amount: orderTotal,
          type: 'credit',
          orderNumber,
          description: `Order ${orderNumber} payment changed from ${previousPaymentMethod} to credit`
        };
      }

      if (balanceUpdate) {
        return await customerBalanceService.updateBalance(balanceUpdate);
      }

      return { success: true, message: 'No balance update required for this payment method change' };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to update balance for payment method change'
      };
    }
  },

  // Sync all customer balances
  syncAllBalances: async (): Promise<{ success: boolean; data?: { updated: number; errors: number }; message?: string }> => {
    try {
      console.log('Starting comprehensive customer balance sync...');
      
      const response = await apiRequest<{ updated: number; errors: number }>('/customers/sync-balances', {
        method: 'POST',
        body: JSON.stringify({
          includesTax: false, // Ensure tax-free calculations
          recalculateAll: true
        }),
      });

      return response;
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to sync customer balances'
      };
    }
  },

  // Record manual payment
  recordPayment: async (
    customerId: number,
    amount: number,
    paymentMethod: string,
    reference?: string,
    notes?: string
  ): Promise<{ success: boolean; data?: BalanceTransaction; message?: string }> => {
    try {
      const balanceUpdate: BalanceUpdateRequest = {
        customerId,
        amount,
        type: 'debit',
        description: `Manual payment recorded - ${paymentMethod}${reference ? ` (Ref: ${reference})` : ''}${notes ? ` - ${notes}` : ''}`
      };

      return await customerBalanceService.updateBalance(balanceUpdate);
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to record payment'
      };
    }
  },

  // Get customer transaction history
  getTransactionHistory: async (
    customerId: number,
    limit: number = 50,
    offset: number = 0
  ): Promise<{ success: boolean; data?: TransactionHistoryResponse; message?: string }> => {
    try {
      const response = await apiRequest<TransactionHistoryResponse>(
        `/customers/${customerId}/transactions?limit=${limit}&offset=${offset}`
      );
      
      return response;
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to get transaction history'
      };
    }
  }
};
