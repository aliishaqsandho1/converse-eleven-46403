import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { newFinanceApi, type Account } from "@/services/newFinanceApi";
import {
  Plus,
  Building2,
  CreditCard,
  Wallet,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Edit,
  Trash2,
  DollarSign,
  Filter,
  Search,
  AlertCircle
} from "lucide-react";

export const AccountsTab = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [showAddAccount, setShowAddAccount] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  const [accountForm, setAccountForm] = useState({
    account_code: "",
    account_name: "",
    account_type: "current",
    balance: "",
    is_active: true
  });

  useEffect(() => {
    loadAccountsData();
  }, []);

  useEffect(() => {
    if (editingAccount) {
      setAccountForm({
        account_code: editingAccount.account_code,
        account_name: editingAccount.account_name,
        account_type: editingAccount.account_type,
        balance: editingAccount.balance,
        is_active: editingAccount.is_active
      });
      setShowAddAccount(true);
    }
  }, [editingAccount]);

  const loadAccountsData = async () => {
    setLoading(true);
    try {
      const [accountsRes, summaryRes] = await Promise.all([
        newFinanceApi.getAccounts({ limit: 50 }).catch(() => ({ data: [] })),
        newFinanceApi.getAccountsSummary().catch(() => ({ data: null }))
      ]);

      setAccounts(Array.isArray(accountsRes.data) ? accountsRes.data : []);
      setSummary(summaryRes.data);
    } catch (error) {
      console.error('Error loading accounts data:', error);
      toast({
        title: "Error",
        description: "Failed to load accounts data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAccount = async () => {
    try {
      const accountData = {
        ...accountForm,
        balance: parseFloat(accountForm.balance) || 0
      };

      if (editingAccount) {
        await newFinanceApi.updateAccount(editingAccount.id, accountData);
        toast({
          title: "Success",
          description: "Account updated successfully"
        });
      } else {
        await newFinanceApi.createAccount(accountData);
        toast({
          title: "Success",
          description: "Account created successfully"
        });
      }
      
      setShowAddAccount(false);
      setEditingAccount(null);
      resetForm();
      loadAccountsData();
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${editingAccount ? 'update' : 'create'} account`,
        variant: "destructive"
      });
    }
  };

  const handleDeleteAccount = async (id: string) => {
    if (!confirm("Are you sure you want to delete this account?")) return;
    
    try {
      await newFinanceApi.deleteAccount(id);
      toast({
        title: "Success",
        description: "Account deleted successfully"
      });
      loadAccountsData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete account",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setAccountForm({
      account_code: "",
      account_name: "",
      account_type: "current",
      balance: "",
      is_active: true
    });
  };

  const filteredAccounts = accounts.filter(account => {
    const matchesSearch = account.account_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         account.account_code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "all" || account.account_type === typeFilter;
    return matchesSearch && matchesType;
  });

  const formatCurrency = (amount: string | number) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0
    }).format(num || 0);
  };

  const getAccountTypeIcon = (type: string) => {
    switch (type) {
      case 'savings': return Wallet;
      case 'current': return CreditCard;
      case 'fixed': return Building2;
      default: return CreditCard;
    }
  };

  const getAccountTypeColor = (type: string) => {
    switch (type) {
      case 'savings': return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-100';
      case 'current': return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900 dark:text-blue-100';
      case 'fixed': return 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900 dark:text-purple-100';
      default: return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900 dark:text-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground mr-2" />
        <span className="text-muted-foreground">Loading accounts...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <h2 className="text-xl font-semibold">Account Management</h2>
          <Badge variant="outline">
            {accounts.length} Total
          </Badge>
          <Badge variant="outline">
            {accounts.filter(a => a.is_active).length} Active
          </Badge>
        </div>
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search accounts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 w-40"
            />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="current">Current</SelectItem>
              <SelectItem value="savings">Savings</SelectItem>
              <SelectItem value="fixed">Fixed</SelectItem>
            </SelectContent>
          </Select>
          <Dialog open={showAddAccount} onOpenChange={(open) => {
            setShowAddAccount(open);
            if (!open) {
              setEditingAccount(null);
              resetForm();
            }
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Account
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingAccount ? 'Edit Account' : 'Add New Account'}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Account Code</Label>
                  <Input
                    value={accountForm.account_code}
                    onChange={(e) => setAccountForm({...accountForm, account_code: e.target.value})}
                    placeholder="ACC001"
                  />
                </div>
                <div>
                  <Label>Account Name</Label>
                  <Input
                    value={accountForm.account_name}
                    onChange={(e) => setAccountForm({...accountForm, account_name: e.target.value})}
                    placeholder="Main Business Account"
                  />
                </div>
                <div>
                  <Label>Account Type</Label>
                  <Select value={accountForm.account_type} onValueChange={(value) => setAccountForm({...accountForm, account_type: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="current">Current Account</SelectItem>
                      <SelectItem value="savings">Savings Account</SelectItem>
                      <SelectItem value="fixed">Fixed Deposit</SelectItem>
                      <SelectItem value="cash">Cash Account</SelectItem>
                      <SelectItem value="credit">Credit Account</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Opening Balance</Label>
                  <Input
                    type="number"
                    value={accountForm.balance}
                    onChange={(e) => setAccountForm({...accountForm, balance: e.target.value})}
                    placeholder="0.00"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={accountForm.is_active}
                    onCheckedChange={(checked) => setAccountForm({...accountForm, is_active: checked})}
                  />
                  <Label>Active Account</Label>
                </div>
                <Separator />
                <Button onClick={handleSaveAccount} className="w-full">
                  {editingAccount ? 'Update Account' : 'Create Account'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Total Balance</p>
                  <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                    {formatCurrency(summary.total_balance)}
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-700 dark:text-green-300">Total Accounts</p>
                  <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                    {summary.total_accounts}
                  </p>
                </div>
                <Building2 className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200 dark:border-purple-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-700 dark:text-purple-300">Active Accounts</p>
                  <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                    {summary.active_accounts}
                  </p>
                </div>
                <CreditCard className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 border-orange-200 dark:border-orange-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-700 dark:text-orange-300">Account Types</p>
                  <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                    {summary.account_types?.length || 0}
                  </p>
                </div>
                <Wallet className="w-8 h-8 text-orange-600 dark:text-orange-400" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Accounts List */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">All Accounts</CardTitle>
          <Button variant="outline" size="sm" onClick={loadAccountsData}>
            <RefreshCw className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <div className="space-y-2 p-4">
            {filteredAccounts.length > 0 ? (
              filteredAccounts.map((account) => {
                const IconComponent = getAccountTypeIcon(account.account_type);
                const balance = parseFloat(account.balance || '0');
                return (
                  <div key={account.id} className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <IconComponent className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="font-medium">{account.account_name}</h3>
                          {!account.is_active && (
                            <Badge variant="secondary" className="text-xs">
                              <AlertCircle className="w-3 h-3 mr-1" />
                              Inactive
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center space-x-2 mt-1">
                          <p className="text-sm text-muted-foreground">{account.account_code}</p>
                          <Badge 
                            variant="outline" 
                            className={`text-xs capitalize ${getAccountTypeColor(account.account_type)}`}
                          >
                            {account.account_type}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className={`font-bold text-lg ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatCurrency(balance)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Updated: {new Date(account.updated_at).toLocaleDateString()}
                        </p>
                      </div>
                      
                      <div className="flex items-center space-x-1">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setEditingAccount(account)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDeleteAccount(account.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Building2 className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">No Accounts Found</h3>
                <p className="text-sm">
                  {searchTerm || typeFilter !== "all" 
                    ? "No accounts match your current filters"
                    : "Create your first account to get started"
                  }
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};