import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { newFinanceApi } from "@/services/newFinanceApi";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  CreditCard,
  Building2,
  ArrowUpDown,
  Calendar,
  RefreshCw,
  AlertTriangle
} from "lucide-react";

export const OverviewTab = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    accountsSummary: null,
    recentTransactions: [],
    cashFlowSummary: null,
    accountsReceivable: [],
    accountsPayable: []
  });

  useEffect(() => {
    loadOverviewData();
  }, []);

  const loadOverviewData = async () => {
    setLoading(true);
    try {
      const [
        accountsSummary,
        recentTransactions,
        cashFlow,
        receivables,
        payables
      ] = await Promise.all([
        newFinanceApi.getAccountsSummary().catch(() => ({ data: null })),
        newFinanceApi.getTransactions({ limit: 5 }).catch(() => ({ data: [] })),
        newFinanceApi.getFinanceCashFlow({ per_page: 1 }).catch(() => ({ data: null })),
        newFinanceApi.getAccountsReceivable().catch(() => ({ data: [] })),
        newFinanceApi.getAccountsPayable().catch(() => ({ data: [] }))
      ]);

      setData({
        accountsSummary: accountsSummary.data,
        recentTransactions: Array.isArray(recentTransactions.data) ? recentTransactions.data : [],
        cashFlowSummary: cashFlow.data,
        accountsReceivable: Array.isArray(receivables.data) ? receivables.data.slice(0, 3) : [],
        accountsPayable: Array.isArray(payables.data) ? payables.data.slice(0, 3) : []
      });
    } catch (error) {
      console.error('Error loading overview data:', error);
      toast({
        title: "Error",
        description: "Failed to load financial overview data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: string | number) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0
    }).format(num || 0);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground mr-2" />
          <span className="text-muted-foreground">Loading financial overview...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Total Balance</p>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                  {formatCurrency(data.accountsSummary?.total_balance || 0)}
                </p>
              </div>
              <Building2 className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700 dark:text-green-300">Active Accounts</p>
                <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                  {data.accountsSummary?.active_accounts || 0}
                </p>
              </div>
              <CreditCard className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 border-orange-200 dark:border-orange-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-700 dark:text-orange-300">Receivables</p>
                <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                  {data.accountsReceivable.length}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-orange-600 dark:text-orange-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-red-900 border-red-200 dark:border-red-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-700 dark:text-red-300">Payables</p>
                <p className="text-2xl font-bold text-red-900 dark:text-red-100">
                  {data.accountsPayable.length}
                </p>
              </div>
              <TrendingDown className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Transactions */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg flex items-center space-x-2">
              <ArrowUpDown className="w-5 h-5 text-primary" />
              <span>Recent Transactions</span>
            </CardTitle>
            <Button variant="outline" size="sm" onClick={loadOverviewData}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.recentTransactions.length > 0 ? (
              data.recentTransactions.map((transaction: any, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-accent/50">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{transaction.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {transaction.transaction_number} • {new Date(transaction.transaction_date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">
                      {formatCurrency(transaction.total_amount)}
                    </p>
                    <Badge variant="outline" className="text-xs">
                      {transaction.reference_type}
                    </Badge>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No recent transactions</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Account Types Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center space-x-2">
              <Building2 className="w-5 h-5 text-primary" />
              <span>Account Types</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.accountsSummary?.account_types?.length > 0 ? (
              data.accountsSummary.account_types.map((type: any, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-accent/50">
                  <div>
                    <p className="font-medium capitalize">{type.type}</p>
                    <p className="text-sm text-muted-foreground">{type.count} accounts</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{formatCurrency(type.total_balance)}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Building2 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No account data available</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Outstanding Items */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Accounts Receivable */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <span>Recent Receivables</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.accountsReceivable.length > 0 ? (
              data.accountsReceivable.map((item: any, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg border bg-green-50 dark:bg-green-950/20">
                  <div>
                    <p className="font-medium text-sm">{item.customer_name}</p>
                    <p className="text-xs text-muted-foreground">
                      Order: {item.order_number} • Due: {new Date(item.due_date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-700 dark:text-green-300">
                      {formatCurrency(item.due_amount)}
                    </p>
                    {parseInt(item.days_overdue) > 0 && (
                      <Badge variant="destructive" className="text-xs">
                        {item.days_overdue} days overdue
                      </Badge>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                <p className="text-sm">No outstanding receivables</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Accounts Payable */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center space-x-2">
              <TrendingDown className="w-5 h-5 text-red-600" />
              <span>Recent Payables</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.accountsPayable.length > 0 ? (
              data.accountsPayable.map((item: any, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg border bg-red-50 dark:bg-red-950/20">
                  <div>
                    <p className="font-medium text-sm">{item.supplier_name}</p>
                    <p className="text-xs text-muted-foreground">
                      Order: {item.order_number} • Expected: {new Date(item.expected_delivery).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-red-700 dark:text-red-300">
                      {formatCurrency(item.due_amount)}
                    </p>
                    {parseInt(item.days_outstanding) > 30 && (
                      <Badge variant="destructive" className="text-xs">
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        {item.days_outstanding} days
                      </Badge>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                <p className="text-sm">No outstanding payables</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};