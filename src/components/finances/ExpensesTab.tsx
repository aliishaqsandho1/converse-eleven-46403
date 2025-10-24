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
import { newFinanceApi, type Expense, type ScheduledExpense } from "@/services/newFinanceApi";
import {
  Plus,
  Calendar,
  DollarSign,
  TrendingUp,
  Clock,
  RefreshCw,
  Edit,
  Trash2,
  Play,
  Pause,
  Receipt,
  Filter,
  Download
} from "lucide-react";

export const ExpensesTab = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [scheduledExpenses, setScheduledExpenses] = useState<ScheduledExpense[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showScheduleExpense, setShowScheduleExpense] = useState(false);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [editingScheduled, setEditingScheduled] = useState<ScheduledExpense | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<string>("all");
  const [newCategory, setNewCategory] = useState("");

  const [expenseForm, setExpenseForm] = useState({
    category: "",
    amount: "",
    date: new Date().toISOString().split('T')[0],
    payment_method: "cash",
    description: "",
    account_id: "",
    reference: ""
  });

  const [scheduledForm, setScheduledForm] = useState({
    category: "",
    amount: "",
    frequency: "monthly",
    start_date: new Date().toISOString().split('T')[0],
    account_id: "",
    payment_method: "cash",
    description: ""
  });

  useEffect(() => {
    loadExpensesData();
  }, []);

  useEffect(() => {
    if (editingExpense) {
      setExpenseForm({
        category: editingExpense.category,
        amount: editingExpense.amount,
        date: editingExpense.date,
        payment_method: editingExpense.payment_method,
        description: editingExpense.description,
        account_id: editingExpense.account_id,
        reference: editingExpense.reference || ""
      });
      setShowAddExpense(true);
    }
  }, [editingExpense]);

  useEffect(() => {
    if (editingScheduled) {
      setScheduledForm({
        category: editingScheduled.category,
        amount: editingScheduled.amount,
        frequency: editingScheduled.frequency,
        start_date: editingScheduled.start_date,
        account_id: editingScheduled.account_id,
        payment_method: editingScheduled.payment_method,
        description: editingScheduled.description
      });
      setShowScheduleExpense(true);
    }
  }, [editingScheduled]);

  const loadExpensesData = async () => {
    setLoading(true);
    try {
      const [
        expensesRes,
        scheduledRes,
        summaryRes,
        categoriesRes
      ] = await Promise.all([
        newFinanceApi.getExpenses({ limit: 10 }).catch(() => ({ data: [] })),
        newFinanceApi.getScheduledExpenses({ limit: 10 }).catch(() => ({ data: [] })),
        newFinanceApi.getExpensesSummary().catch(() => ({ data: null })),
        newFinanceApi.getExpenseCategories().catch(() => ({ data: [] }))
      ]);

      setExpenses(Array.isArray(expensesRes.data) ? expensesRes.data : []);
      setScheduledExpenses(Array.isArray(scheduledRes.data) ? scheduledRes.data : []);
      setSummary(summaryRes.data);
      setCategories(Array.isArray(categoriesRes.data) ? categoriesRes.data : []);
    } catch (error) {
      console.error('Error loading expenses data:', error);
      toast({
        title: "Error",
        description: "Failed to load expenses data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddExpense = async () => {
    try {
      const expenseData = {
        ...expenseForm,
        amount: parseFloat(expenseForm.amount)
      };

      if (editingExpense) {
        await newFinanceApi.updateExpense(editingExpense.id, expenseData);
        toast({
          title: "Success",
          description: "Expense updated successfully"
        });
      } else {
        await newFinanceApi.createExpense(expenseData);
        toast({
          title: "Success",
          description: "Expense added successfully"
        });
      }
      
      setShowAddExpense(false);
      setEditingExpense(null);
      resetExpenseForm();
      loadExpensesData();
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${editingExpense ? 'update' : 'add'} expense`,
        variant: "destructive"
      });
    }
  };

  const handleDeleteExpense = async (id: string) => {
    if (!confirm("Are you sure you want to delete this expense?")) return;
    
    try {
      await newFinanceApi.deleteExpense(id);
      toast({
        title: "Success",
        description: "Expense deleted successfully"
      });
      loadExpensesData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete expense",
        variant: "destructive"
      });
    }
  };

  const resetExpenseForm = () => {
    setExpenseForm({
      category: "",
      amount: "",
      date: new Date().toISOString().split('T')[0],
      payment_method: "cash",
      description: "",
      account_id: "",
      reference: ""
    });
  };

  const handleScheduleExpense = async () => {
    try {
      const scheduledData = {
        ...scheduledForm,
        amount: parseFloat(scheduledForm.amount),
        frequency: scheduledForm.frequency as any
      };

      if (editingScheduled) {
        await newFinanceApi.updateScheduledExpense(editingScheduled.id, scheduledData);
        toast({
          title: "Success",
          description: "Scheduled expense updated successfully"
        });
      } else {
        await newFinanceApi.createScheduledExpense(scheduledData);
        toast({
          title: "Success",
          description: "Expense scheduled successfully"
        });
      }
      
      setShowScheduleExpense(false);
      setEditingScheduled(null);
      resetScheduledForm();
      loadExpensesData();
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${editingScheduled ? 'update' : 'schedule'} expense`,
        variant: "destructive"
      });
    }
  };

  const handleDeleteScheduledExpense = async (id: string) => {
    if (!confirm("Are you sure you want to delete this scheduled expense?")) return;
    
    try {
      await newFinanceApi.deleteScheduledExpense(id);
      toast({
        title: "Success",
        description: "Scheduled expense deleted successfully"
      });
      loadExpensesData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete scheduled expense",
        variant: "destructive"
      });
    }
  };

  const resetScheduledForm = () => {
    setScheduledForm({
      category: "",
      amount: "",
      frequency: "monthly",
      start_date: new Date().toISOString().split('T')[0],
      account_id: "",
      payment_method: "cash",
      description: ""
    });
  };

  const handleAddCategory = async () => {
    if (!newCategory.trim()) return;
    
    try {
      await newFinanceApi.createExpenseCategory(newCategory);
      toast({
        title: "Success",
        description: "Category added successfully"
      });
      setNewCategory("");
      setShowAddCategory(false);
      loadExpensesData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add category",
        variant: "destructive"
      });
    }
  };

  const toggleScheduledExpenseStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'paused' : 'active';
    try {
      await newFinanceApi.updateScheduledExpenseStatus(id, newStatus as any);
      toast({
        title: "Success",
        description: `Scheduled expense ${newStatus === 'active' ? 'activated' : 'paused'}`
      });
      loadExpensesData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update expense status",
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

  const filteredExpenses = expenses.filter(expense => {
    const matchesCategory = categoryFilter === "all" || expense.category === categoryFilter;
    const matchesPaymentMethod = paymentMethodFilter === "all" || expense.payment_method === paymentMethodFilter;
    return matchesCategory && matchesPaymentMethod;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground mr-2" />
        <span className="text-muted-foreground">Loading expenses...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Action Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h2 className="text-xl font-semibold">Expense Management</h2>
          <Badge variant="outline">
            {expenses.length} Expenses
          </Badge>
          <Badge variant="outline">
            {scheduledExpenses.length} Scheduled
          </Badge>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={paymentMethodFilter} onValueChange={setPaymentMethodFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Payment method" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Methods</SelectItem>
              <SelectItem value="cash">Cash</SelectItem>
              <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
              <SelectItem value="cheque">Cheque</SelectItem>
              <SelectItem value="credit_card">Credit Card</SelectItem>
            </SelectContent>
          </Select>
          <Dialog open={showAddCategory} onOpenChange={setShowAddCategory}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Category
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Category</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Category Name</Label>
                  <Input
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    placeholder="Enter category name"
                  />
                </div>
                <Button onClick={handleAddCategory} className="w-full">
                  Add Category
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Dialog open={showAddExpense} onOpenChange={(open) => {
            setShowAddExpense(open);
            if (!open) {
              setEditingExpense(null);
              resetExpenseForm();
            }
          }}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Expense
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingExpense ? 'Edit Expense' : 'Add New Expense'}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Category</Label>
                  <Select value={expenseForm.category} onValueChange={(value) => setExpenseForm({...expenseForm, category: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Amount</Label>
                  <Input
                    type="number"
                    value={expenseForm.amount}
                    onChange={(e) => setExpenseForm({...expenseForm, amount: e.target.value})}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label>Date</Label>
                  <Input
                    type="date"
                    value={expenseForm.date}
                    onChange={(e) => setExpenseForm({...expenseForm, date: e.target.value})}
                  />
                </div>
                <div>
                  <Label>Payment Method</Label>
                  <Select value={expenseForm.payment_method} onValueChange={(value) => setExpenseForm({...expenseForm, payment_method: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                      <SelectItem value="cheque">Cheque</SelectItem>
                      <SelectItem value="credit_card">Credit Card</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={expenseForm.description}
                    onChange={(e) => setExpenseForm({...expenseForm, description: e.target.value})}
                    placeholder="Expense details..."
                  />
                </div>
                <Button onClick={handleAddExpense} className="w-full">
                  {editingExpense ? 'Update Expense' : 'Add Expense'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          <Dialog open={showScheduleExpense} onOpenChange={(open) => {
            setShowScheduleExpense(open);
            if (!open) {
              setEditingScheduled(null);
              resetScheduledForm();
            }
          }}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Clock className="w-4 h-4 mr-2" />
                Schedule
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingScheduled ? 'Edit Scheduled Expense' : 'Schedule Recurring Expense'}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Category</Label>
                  <Select value={scheduledForm.category} onValueChange={(value) => setScheduledForm({...scheduledForm, category: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Amount</Label>
                  <Input
                    type="number"
                    value={scheduledForm.amount}
                    onChange={(e) => setScheduledForm({...scheduledForm, amount: e.target.value})}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label>Frequency</Label>
                  <Select value={scheduledForm.frequency} onValueChange={(value) => setScheduledForm({...scheduledForm, frequency: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Start Date</Label>
                  <Input
                    type="date"
                    value={scheduledForm.start_date}
                    onChange={(e) => setScheduledForm({...scheduledForm, start_date: e.target.value})}
                  />
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={scheduledForm.description}
                    onChange={(e) => setScheduledForm({...scheduledForm, description: e.target.value})}
                    placeholder="Expense details..."
                  />
                </div>
                <Button onClick={handleScheduleExpense} className="w-full">
                  {editingScheduled ? 'Update Schedule' : 'Schedule Expense'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-red-900 border-red-200 dark:border-red-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-red-700 dark:text-red-300">Total Expenses</p>
                  <p className="text-2xl font-bold text-red-900 dark:text-red-100">
                    {formatCurrency(summary.total_expenses)}
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Transaction Count</p>
                  <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                    {summary.expense_count}
                  </p>
                </div>
                <Receipt className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-700 dark:text-green-300">Categories</p>
                  <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                    {summary.categories?.length || 0}
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Expenses */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Recent Expenses</CardTitle>
            <Button variant="outline" size="sm" onClick={loadExpensesData}>
              <RefreshCw className="w-4 h-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {filteredExpenses.length > 0 ? (
              filteredExpenses.map((expense) => (
                <div key={expense.id} className="flex items-center justify-between p-3 rounded-lg border bg-card">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{expense.description}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge variant="outline" className="text-xs">{expense.category}</Badge>
                      <Badge variant="outline" className="text-xs">{expense.payment_method}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(expense.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-red-600">{formatCurrency(expense.amount)}</p>
                    <div className="flex items-center space-x-1 mt-1">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setEditingExpense(expense)}
                      >
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDeleteExpense(expense.id)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Receipt className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No expenses recorded yet</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Scheduled Expenses */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Scheduled Expenses</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {scheduledExpenses.length > 0 ? (
              scheduledExpenses.map((expense) => (
                <div key={expense.id} className="flex items-center justify-between p-3 rounded-lg border bg-card">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{expense.description}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge variant="outline" className="text-xs">{expense.category}</Badge>
                      <Badge variant="outline" className="text-xs capitalize">{expense.frequency}</Badge>
                      <Badge 
                        variant={expense.status === 'active' ? 'default' : 'secondary'} 
                        className="text-xs"
                      >
                        {expense.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Next: {expense.next_execution ? new Date(expense.next_execution).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{formatCurrency(expense.amount)}</p>
                    <div className="flex items-center space-x-1 mt-1">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => toggleScheduledExpenseStatus(expense.id, expense.status)}
                      >
                        {expense.status === 'active' ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setEditingScheduled(expense)}
                      >
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDeleteScheduledExpense(expense.id)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No scheduled expenses</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};