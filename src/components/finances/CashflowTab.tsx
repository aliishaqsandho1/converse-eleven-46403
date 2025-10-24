import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { newFinanceApi, type CashFlowEntry } from "@/services/newFinanceApi";
import {
  Plus,
  ArrowUpDown,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Filter,
  Download,
  Calendar,
  DollarSign,
  Building2,
  Eye,
  ChevronDown,
  ChevronUp
} from "lucide-react";

export const CashflowTab = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [cashFlowData, setCashFlowData] = useState<CashFlowEntry[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [showAddEntry, setShowAddEntry] = useState(false);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [expandedEntry, setExpandedEntry] = useState<string | null>(null);

  const [entryForm, setEntryForm] = useState({
    type: "inflow" as "inflow" | "outflow",
    amount: "",
    date: new Date().toISOString().split('T')[0],
    account_id: "",
    reference: "",
    description: ""
  });

  useEffect(() => {
    loadCashFlowData();
  }, [dateFrom, dateTo, typeFilter]);

  const loadCashFlowData = async () => {
    setLoading(true);
    try {
      const params: any = { per_page: 20 };
      
      if (dateFrom) {
        params.date_from = dateFrom;
      }
      if (dateTo) {
        params.date_to = dateTo;
      }
      if (typeFilter !== "all") {
        params.type = typeFilter;
      }

      const [cashFlowRes] = await Promise.all([
        newFinanceApi.getFinanceCashFlow(params).catch(() => ({ data: null }))
      ]);

      if (cashFlowRes.data) {
        setCashFlowData(Array.isArray(cashFlowRes.data.transactions) ? cashFlowRes.data.transactions : []);
        setSummary(cashFlowRes.data.summary);
      } else {
        setCashFlowData([]);
        setSummary(null);
      }
    } catch (error) {
      console.error('Error loading cash flow data:', error);
      toast({
        title: "Error",
        description: "Failed to load cash flow data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddEntry = async () => {
    try {
      await newFinanceApi.createFinanceCashFlow({
        ...entryForm,
        amount: parseFloat(entryForm.amount),
        account_id: entryForm.account_id ? parseInt(entryForm.account_id) : undefined
      });
      
      toast({
        title: "Success",
        description: "Cash flow entry added successfully"
      });
      
      setShowAddEntry(false);
      setEntryForm({
        type: "inflow",
        amount: "",
        date: new Date().toISOString().split('T')[0],
        account_id: "",
        reference: "",
        description: ""
      });
      loadCashFlowData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add cash flow entry",
        variant: "destructive"
      });
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-PK', {
      year: 'numeric',
      month: 'short',
      day: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground mr-2" />
        <span className="text-muted-foreground">Loading cash flow data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <h2 className="text-xl font-semibold">Cash Flow Management</h2>
          <Badge variant="outline">
            {cashFlowData.length} Entries
          </Badge>
        </div>
        <div className="flex items-center space-x-2">
          <Input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            placeholder="From date"
            className="w-32"
          />
          <Input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            placeholder="To date"
            className="w-32"
          />
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="inflow">Inflows</SelectItem>
              <SelectItem value="outflow">Outflows</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Dialog open={showAddEntry} onOpenChange={setShowAddEntry}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Entry
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add Cash Flow Entry</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Type</Label>
                  <Select value={entryForm.type} onValueChange={(value: "inflow" | "outflow") => setEntryForm({...entryForm, type: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="inflow">Cash Inflow</SelectItem>
                      <SelectItem value="outflow">Cash Outflow</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Amount</Label>
                  <Input
                    type="number"
                    value={entryForm.amount}
                    onChange={(e) => setEntryForm({...entryForm, amount: e.target.value})}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label>Date</Label>
                  <Input
                    type="date"
                    value={entryForm.date}
                    onChange={(e) => setEntryForm({...entryForm, date: e.target.value})}
                  />
                </div>
                <div>
                  <Label>Account ID (Optional)</Label>
                  <Input
                    value={entryForm.account_id}
                    onChange={(e) => setEntryForm({...entryForm, account_id: e.target.value})}
                    placeholder="Account ID"
                  />
                </div>
                <div>
                  <Label>Reference</Label>
                  <Input
                    value={entryForm.reference}
                    onChange={(e) => setEntryForm({...entryForm, reference: e.target.value})}
                    placeholder="Payment reference"
                  />
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={entryForm.description}
                    onChange={(e) => setEntryForm({...entryForm, description: e.target.value})}
                    placeholder="Transaction details..."
                  />
                </div>
                <Button onClick={handleAddEntry} className="w-full">
                  Add Entry
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-700 dark:text-green-300">Total Inflow</p>
                  <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                    {formatCurrency(summary.total_inflow)}
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-red-900 border-red-200 dark:border-red-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-red-700 dark:text-red-300">Total Outflow</p>
                  <p className="text-2xl font-bold text-red-900 dark:text-red-100">
                    {formatCurrency(summary.total_outflow)}
                  </p>
                </div>
                <TrendingDown className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Net Cash Flow</p>
                  <p className={`text-2xl font-bold ${
                    parseFloat(summary.total_inflow) - parseFloat(summary.total_outflow) >= 0 
                      ? 'text-green-600' 
                      : 'text-red-600'
                  }`}>
                    {formatCurrency(parseFloat(summary.total_inflow) - parseFloat(summary.total_outflow))}
                  </p>
                </div>
                <ArrowUpDown className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200 dark:border-purple-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-700 dark:text-purple-300">Transactions</p>
                  <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                    {summary.total_transactions}
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Cash Flow Entries */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Cash Flow Entries</CardTitle>
          <Button variant="outline" size="sm" onClick={loadCashFlowData}>
            <RefreshCw className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <div className="space-y-2 p-4">
            {cashFlowData.length > 0 ? (
              cashFlowData.map((entry) => (
                <div key={entry.id} className="border rounded-lg bg-card">
                  <div 
                    className="flex items-center justify-between p-4 cursor-pointer hover:bg-accent/50 transition-colors"
                    onClick={() => setExpandedEntry(expandedEntry === entry.id ? null : entry.id)}
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`p-2 rounded-lg ${
                        entry.type === 'inflow' 
                          ? 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400' 
                          : 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400'
                      }`}>
                        {entry.type === 'inflow' ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="font-medium">{entry.description || 'Cash flow entry'}</h3>
                          <Badge 
                            variant={entry.type === 'inflow' ? 'default' : 'destructive'}
                            className="text-xs capitalize"
                          >
                            {entry.type}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {entry.reference} • {formatDate(entry.date)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className={`font-bold text-lg ${
                          entry.type === 'inflow' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {entry.type === 'inflow' ? '+' : '-'}{formatCurrency(entry.amount)}
                        </p>
                        {entry.account_name && (
                          <p className="text-xs text-muted-foreground">
                            {entry.account_name}
                          </p>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                        {expandedEntry === entry.id ? 
                          <ChevronUp className="w-5 h-5 text-muted-foreground" /> : 
                          <ChevronDown className="w-5 h-5 text-muted-foreground" />
                        }
                      </div>
                    </div>
                  </div>
                  
                  {expandedEntry === entry.id && (
                    <div className="px-4 pb-4 border-t bg-accent/20">
                      <div className="pt-4 space-y-3">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label className="text-xs text-muted-foreground">Transaction ID</Label>
                            <p className="text-sm font-medium">{entry.transaction_id}</p>
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground">Account</Label>
                            <p className="text-sm font-medium">
                              {entry.account_name ? `${entry.account_name} (${entry.account_code})` : 'N/A'}
                            </p>
                          </div>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Full Description</Label>
                          <p className="text-sm">{entry.description || 'No description provided'}</p>
                        </div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>Created: {formatDate(entry.created_at)}</span>
                          <span>Reference: {entry.reference}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <ArrowUpDown className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">No Cash Flow Data</h3>
                <p className="text-sm">
                  {dateFrom || dateTo || typeFilter !== "all" 
                    ? "No entries match your current filters"
                    : "Start tracking your cash flow by adding entries"
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