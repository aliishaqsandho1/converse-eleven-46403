import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PincodeProtection } from "@/components/PincodeProtection";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { newFinanceApi } from "@/services/newFinanceApi";
import { OverviewTab } from "@/components/finances/OverviewTab";
import { ExpensesTab } from "@/components/finances/ExpensesTab";
import { AccountsTab } from "@/components/finances/AccountsTab";
import { CashflowTab } from "@/components/finances/CashflowTab";
import { 
  DollarSign, 
  TrendingUp, 
  Building2, 
  ArrowUpDown,
  Calculator,
  CreditCard,
  Banknote,
  PiggyBank,
  RefreshCw
} from "lucide-react";

const Finances = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [tabStats, setTabStats] = useState({
    overview: { value: "₨ 0", change: "0%", positive: true },
    expenses: { value: "₨ 0", change: "0%", positive: false },
    accounts: { value: "0 Active", change: "+0", positive: true },
    cashflow: { value: "₨ 0", change: "0%", positive: true }
  });

  const tabIcons = {
    overview: DollarSign,
    expenses: TrendingUp,
    accounts: Building2,
    cashflow: ArrowUpDown
  };

  useEffect(() => {
    loadFinancialStats();
  }, []);

  const loadFinancialStats = async () => {
    setLoading(true);
    try {
      const [
        accountsSummary,
        expensesSummary,
        cashFlowSummary
      ] = await Promise.all([
        newFinanceApi.getAccountsSummary().catch(() => ({ data: null })),
        newFinanceApi.getExpensesSummary().catch(() => ({ data: null })),
        newFinanceApi.getFinanceCashFlow({ per_page: 1 }).catch(() => ({ data: null }))
      ]);

      const formatCurrency = (amount: string | number) => {
        const num = typeof amount === 'string' ? parseFloat(amount) : amount;
        return new Intl.NumberFormat('en-PK', {
          style: 'currency',
          currency: 'PKR',
          minimumFractionDigits: 0
        }).format(num || 0);
      };

      setTabStats({
        overview: { 
          value: formatCurrency(accountsSummary.data?.total_balance || 0), 
          change: "+0%", 
          positive: true 
        },
        expenses: { 
          value: formatCurrency(expensesSummary.data?.total_expenses || 0), 
          change: "0%", 
          positive: false 
        },
        accounts: { 
          value: `${accountsSummary.data?.active_accounts || 0} Active`, 
          change: `+${(accountsSummary.data?.total_accounts || 0) - (accountsSummary.data?.active_accounts || 0)}`, 
          positive: true 
        },
        cashflow: { 
          value: formatCurrency(cashFlowSummary.data?.summary?.total_inflow || 0), 
          change: "+0%", 
          positive: true 
        }
      });
    } catch (error) {
      console.error('Error loading financial stats:', error);
      toast({
        title: "Error",
        description: "Failed to load financial statistics",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <PincodeProtection 
      title="Financial Management" 
      description="Access comprehensive financial oversight and control"
    >
      <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Financial Management
          </h1>
          <p className="text-muted-foreground mt-2">
            Comprehensive financial oversight and control
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
            <Calculator className="w-3 h-3 mr-1" />
            Auto-Sync
          </Badge>
          <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-100">
            <PiggyBank className="w-3 h-3 mr-1" />
            Live Data
          </Badge>
          <button
            onClick={loadFinancialStats}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3"
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {Object.entries(tabStats).map(([key, stat]) => {
          const Icon = tabIcons[key as keyof typeof tabIcons];
          return (
            <Card 
              key={key} 
              className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                activeTab === key 
                  ? 'ring-2 ring-primary bg-primary/5 border-primary/20' 
                  : 'hover:bg-accent/50'
              }`}
              onClick={() => setActiveTab(key)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground capitalize">
                      {key}
                    </p>
                    <p className="text-2xl font-bold text-foreground">
                      {stat.value}
                    </p>
                    <div className="flex items-center space-x-1">
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${
                          stat.positive 
                            ? 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-100'
                            : 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-100'
                        }`}
                      >
                        {stat.change}
                      </Badge>
                    </div>
                  </div>
                  <div className={`p-3 rounded-full ${
                    activeTab === key 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted'
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main Content Tabs */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="border-b bg-gradient-to-r from-background to-accent/20">
          <CardTitle className="flex items-center space-x-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <Banknote className="w-5 h-5 text-primary" />
            </div>
            <span>Finance Dashboard</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 rounded-none border-b bg-muted/30">
              {Object.entries(tabIcons).map(([key, Icon]) => (
                <TabsTrigger 
                  key={key} 
                  value={key} 
                  className="flex items-center space-x-2 data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm capitalize"
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{key}</span>
                </TabsTrigger>
              ))}
            </TabsList>
            
            <div className="min-h-[600px]">
              <TabsContent value="overview" className="m-0 p-6">
                <OverviewTab />
              </TabsContent>
              
              <TabsContent value="expenses" className="m-0 p-6">
                <ExpensesTab />
              </TabsContent>
              
              <TabsContent value="accounts" className="m-0 p-6">
                <AccountsTab />
              </TabsContent>
              
              <TabsContent value="cashflow" className="m-0 p-6">
                <CashflowTab />
              </TabsContent>
            </div>
          </Tabs>
        </CardContent>
      </Card>
      </div>
    </PincodeProtection>
  );
};

export default Finances;