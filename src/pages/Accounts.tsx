import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { 
  Wallet, 
  Building2, 
  DollarSign, 
  Plus, 
  Edit2, 
  Trash2, 
  Eye, 
  CreditCard,
  Banknote,
  PiggyBank,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Search
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { accountsApi, type Account } from "@/services/accountsApi";
import PincodeProtection from "@/components/PincodeProtection";

function AccountsContent() {
  const { toast } = useToast();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [viewingAccount, setViewingAccount] = useState<Account | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string>("");
  const [summary, setSummary] = useState({
    totalAssets: 0,
    totalLiabilities: 0,
    totalEquity: 0,
    totalRevenue: 0,
    totalExpenses: 0,
    totalCash: 0,
    accountsByType: [] as Array<{
      type: string;
      count: number;
      totalBalance: number;
    }>
  });
  const [newAccount, setNewAccount] = useState({
    account_code: "",
    account_name: "",
    account_type: "bank" as Account['account_type'],
    balance: 0
  });

  useEffect(() => {
    fetchAccounts();
    fetchAccountsSummary();
  }, [selectedType]);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (selectedType) params.type = selectedType;
      
      const response = await accountsApi.getAccounts(params);
      if (response.success) {
        // Handle the nested response structure from the API
        const accountsData = (response.data as any)?.accounts || response.data || [];
        setAccounts(Array.isArray(accountsData) ? accountsData : []);
      }
    } catch (error) {
      console.error('Error fetching accounts:', error);
      toast({
        title: "Error",
        description: "Failed to load accounts data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAccountsSummary = async () => {
    try {
      const response = await accountsApi.getAccountsSummary();
      if (response.success) {
        // Handle the actual API response structure
        const apiData = response.data as any;
        const summaryByType = apiData.summary_by_type || [];
        
        // Calculate totals from summary_by_type array
        let totalAssets = 0;
        let totalLiabilities = 0;
        let totalEquity = 0;
        let totalRevenue = 0;
        let totalExpenses = 0;
        let totalCash = 0;
        
        summaryByType.forEach((item: any) => {
          const balance = parseFloat(item.total_balance || 0);
          switch (item.account_type) {
            case 'asset':
              totalAssets += balance;
              break;
            case 'liability':
              totalLiabilities += balance;
              break;
            case 'equity':
              totalEquity += balance;
              break;
            case 'revenue':
              totalRevenue += balance;
              break;
            case 'expense':
              totalExpenses += balance;
              break;
            case 'cash':
              totalCash += balance;
              break;
          }
        });
        
        setSummary({
          totalAssets,
          totalLiabilities,
          totalEquity,
          totalRevenue,
          totalExpenses,
          totalCash,
          accountsByType: summaryByType.map((item: any) => ({
            type: item.account_type,
            count: parseInt(item.total_accounts || 0),
            totalBalance: parseFloat(item.total_balance || 0)
          }))
        });
      }
    } catch (error) {
      console.error('Error fetching accounts summary:', error);
    }
  };

  const accountTypeIcons = {
    bank: Building2,
    cash: Banknote,
    asset: PiggyBank,
    liability: CreditCard,
    equity: DollarSign,
    revenue: TrendingUp,
    expense: TrendingDown
  };

  const accountTypeColors = {
    bank: "bg-blue-100 text-blue-800 border-blue-200",
    cash: "bg-green-100 text-green-800 border-green-200", 
    asset: "bg-purple-100 text-purple-800 border-purple-200",
    liability: "bg-red-100 text-red-800 border-red-200",
    equity: "bg-yellow-100 text-yellow-800 border-yellow-200",
    revenue: "bg-emerald-100 text-emerald-800 border-emerald-200",
    expense: "bg-orange-100 text-orange-800 border-orange-200"
  };

  const handleCreateAccount = async () => {
    if (!newAccount.account_code || !newAccount.account_name) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await accountsApi.createAccount(newAccount);
      if (response.success) {
        toast({
          title: "Success",
          description: "Account created successfully",
        });
        setNewAccount({
          account_code: "",
          account_name: "",
          account_type: "bank",
          balance: 0
        });
        setShowAddModal(false);
        fetchAccounts();
        fetchAccountsSummary();
      }
    } catch (error) {
      console.error('Error creating account:', error);
      toast({
        title: "Error",
        description: "Failed to create account",
        variant: "destructive",
      });
    }
  };

  const handleUpdateAccount = async (id: number, updates: Partial<Account>) => {
    try {
      const response = await accountsApi.updateAccount(id, updates);
      if (response.success) {
        toast({
          title: "Success",
          description: "Account updated successfully",
        });
        setEditingAccount(null);
        fetchAccounts();
        fetchAccountsSummary();
      }
    } catch (error) {
      console.error('Error updating account:', error);
      toast({
        title: "Error",
        description: "Failed to update account",
        variant: "destructive",
      });
    }
  };

  const handleDeleteAccount = async (id: number) => {
    if (!confirm('Are you sure you want to delete this account?')) return;
    
    try {
      const response = await accountsApi.deleteAccount(id);
      if (response.success) {
        toast({
          title: "Success",
          description: "Account deleted successfully",
        });
        fetchAccounts();
        fetchAccountsSummary();
      }
    } catch (error) {
      console.error('Error deleting account:', error);
      toast({
        title: "Error",
        description: "Failed to delete account",
        variant: "destructive",
      });
    }
  };

  const filteredAccounts = accounts.filter(account => {
    const matchesSearch = account.account_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         account.account_code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === "" || selectedType === "all" || account.account_type === selectedType;
    return matchesSearch && matchesType;
  });

  if (loading) {
    return (
      <div className="flex-1 p-6 space-y-6 bg-background min-h-screen">
        <div className="flex items-center justify-center h-64">
          <div className="flex gap-3 items-center text-lg text-muted-foreground">
            <RefreshCw className="animate-spin h-6 w-6" />
            Loading accounts data...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6 min-h-[calc(100vh-65px)]">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <SidebarTrigger />
          <div>
            <h1 className="text-2xl font-bold text-foreground">Chart of Accounts</h1>
            <p className="text-muted-foreground">Manage your business accounts</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchAccounts}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Account
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Account</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Account Code</Label>
                <Input
                  placeholder="e.g., BA001"
                  value={newAccount.account_code}
                  onChange={(e) => setNewAccount({...newAccount, account_code: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>Account Name</Label>
                <Input
                  placeholder="e.g., Main Business Account"
                  value={newAccount.account_name}
                  onChange={(e) => setNewAccount({...newAccount, account_name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>Account Type</Label>
                <Select 
                  value={newAccount.account_type} 
                  onValueChange={(value: Account['account_type']) => setNewAccount({...newAccount, account_type: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="asset">Asset</SelectItem>
                    <SelectItem value="liability">Liability</SelectItem>
                    <SelectItem value="equity">Equity</SelectItem>
                    <SelectItem value="revenue">Revenue</SelectItem>
                    <SelectItem value="expense">Expense</SelectItem>
                    <SelectItem value="bank">Bank</SelectItem>
                    <SelectItem value="cash">Cash</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Opening Balance (Rs.)</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={newAccount.balance}
                  onChange={(e) => setNewAccount({...newAccount, balance: Number(e.target.value)})}
                />
              </div>
              <div className="flex gap-3 pt-4">
                <Button onClick={handleCreateAccount} className="flex-1">
                  Create Account
                </Button>
                <Button variant="outline" onClick={() => setShowAddModal(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
         </Dialog>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input 
            placeholder="Search accounts..." 
            className="pl-10" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={selectedType} onValueChange={setSelectedType}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="asset">Asset</SelectItem>
            <SelectItem value="liability">Liability</SelectItem>
            <SelectItem value="equity">Equity</SelectItem>
            <SelectItem value="revenue">Revenue</SelectItem>
            <SelectItem value="expense">Expense</SelectItem>
            <SelectItem value="bank">Bank</SelectItem>
            <SelectItem value="cash">Cash</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <PiggyBank className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-xs text-muted-foreground">Assets</p>
                <p className="font-semibold">Rs. {summary.totalAssets.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-xs text-muted-foreground">Liabilities</p>
                <p className="font-semibold">Rs. {summary.totalLiabilities.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-xs text-muted-foreground">Equity</p>
                <p className="font-semibold">Rs. {summary.totalEquity.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-xs text-muted-foreground">Revenue</p>
                <p className="font-semibold">Rs. {summary.totalRevenue.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-xs text-muted-foreground">Expenses</p>
                <p className="font-semibold">Rs. {summary.totalExpenses.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Banknote className="h-5 w-5 text-emerald-600" />
              <div>
                <p className="text-xs text-muted-foreground">Cash</p>
                <p className="font-semibold">Rs. {summary.totalCash.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Accounts Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            All Accounts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Account Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Balance</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAccounts.map((account) => {
                  const IconComponent = accountTypeIcons[account.account_type];
                  return (
                    <TableRow key={account.id}>
                      <TableCell className="font-mono font-medium">{account.account_code}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="bg-muted p-2 rounded-lg">
                            <IconComponent className="h-4 w-4" />
                          </div>
                          <span className="font-medium">{account.account_name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${accountTypeColors[account.account_type]} border`}>
                          {account.account_type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        Rs. {(account.balance || 0).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant={account.is_active ? "default" : "secondary"}>
                          {account.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                           <Button 
                             variant="ghost" 
                             size="sm"
                             onClick={() => setViewingAccount(account)}
                             title="View Account Details"
                           >
                             <Eye className="h-4 w-4" />
                           </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => setEditingAccount(account)}
                            title="Edit Account"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleDeleteAccount(account.id)}
                            className="text-destructive hover:text-destructive"
                            title="Delete Account"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* View Account Details Modal */}
      {viewingAccount && (
        <Dialog open={!!viewingAccount} onOpenChange={() => setViewingAccount(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Account Details
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Basic Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label className="text-muted-foreground">Account Code</Label>
                    <p className="font-mono font-semibold text-lg">{viewingAccount.account_code}</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-muted-foreground">Account ID</Label>
                    <p className="font-semibold">#{viewingAccount.id}</p>
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-muted-foreground">Account Name</Label>
                  <p className="font-semibold text-lg">{viewingAccount.account_name}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label className="text-muted-foreground">Account Type</Label>
                    <div className="flex items-center gap-2">
                      {(() => {
                        const IconComponent = accountTypeIcons[viewingAccount.account_type];
                        return <IconComponent className="h-4 w-4" />;
                      })()}
                      <Badge className={`${accountTypeColors[viewingAccount.account_type]} border`}>
                        {viewingAccount.account_type}
                      </Badge>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-muted-foreground">Status</Label>
                    <Badge variant={viewingAccount.is_active ? "default" : "secondary"}>
                      {viewingAccount.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Financial Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Financial Information</h3>
                <div className="bg-muted/30 p-4 rounded-lg">
                  <div className="space-y-1">
                    <Label className="text-muted-foreground">Current Balance</Label>
                    <p className="font-bold text-2xl text-primary">
                      Rs. {(viewingAccount.balance || 0).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Timestamp Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Account History</h3>
                <div className="space-y-1">
                  <Label className="text-muted-foreground">Created Date</Label>
                  <p className="font-medium">
                    {new Date(viewingAccount.created_at).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t">
                <Button 
                  onClick={() => {
                    setEditingAccount(viewingAccount);
                    setViewingAccount(null);
                  }} 
                  className="flex-1"
                >
                  <Edit2 className="h-4 w-4 mr-2" />
                  Edit Account
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setViewingAccount(null)}
                >
                  Close
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Edit Account Modal */}
      {editingAccount && (
        <Dialog open={!!editingAccount} onOpenChange={() => setEditingAccount(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Account</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Account Code</Label>
                <Input
                  value={editingAccount.account_code}
                  onChange={(e) => setEditingAccount({...editingAccount, account_code: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>Account Name</Label>
                <Input
                  value={editingAccount.account_name}
                  onChange={(e) => setEditingAccount({...editingAccount, account_name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>Account Type</Label>
                <Select 
                  value={editingAccount.account_type} 
                  onValueChange={(value: Account['account_type']) => setEditingAccount({...editingAccount, account_type: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="asset">Asset</SelectItem>
                    <SelectItem value="liability">Liability</SelectItem>
                    <SelectItem value="equity">Equity</SelectItem>
                    <SelectItem value="revenue">Revenue</SelectItem>
                    <SelectItem value="expense">Expense</SelectItem>
                    <SelectItem value="bank">Bank</SelectItem>
                    <SelectItem value="cash">Cash</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Balance (Rs.)</Label>
                <Input
                  type="number"
                  value={editingAccount.balance || 0}
                  onChange={(e) => setEditingAccount({...editingAccount, balance: Number(e.target.value)})}
                />
              </div>
              <div className="flex gap-3 pt-4">
                <Button 
                  onClick={() => handleUpdateAccount(editingAccount.id, editingAccount)} 
                  className="flex-1"
                >
                  Update Account
                </Button>
                <Button variant="outline" onClick={() => setEditingAccount(null)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

export default function Accounts() {
  return (
    <PincodeProtection title="Accounts Management">
      <AccountsContent />
    </PincodeProtection>
  );
}