import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, Filter, Eye, Edit, Send, Download, CheckCircle, Trash2, FileText, Clock, XCircle, Calendar, User, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { quotationsApi, customersApi } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import QuotationForm from "@/components/quotations/QuotationForm";
import QuotationDetails from "@/components/quotations/QuotationDetails";
import { generateQuotationPDF } from "@/utils/pdfGenerator";

export default function Quotations() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // State management
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [customerFilter, setCustomerFilter] = useState("all");
  const [dateFromFilter, setDateFromFilter] = useState("");
  const [dateToFilter, setDateToFilter] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [selectedQuotation, setSelectedQuotation] = useState<any>(null);
  
  const itemsPerPage = 20;

  // Fetch quotations
  const { data: quotationsData, isLoading: quotationsLoading, refetch } = useQuery({
    queryKey: ['quotations', currentPage, statusFilter, customerFilter, searchTerm, dateFromFilter, dateToFilter],
    queryFn: () => quotationsApi.getAll({
      page: currentPage,
      limit: itemsPerPage,
      status: statusFilter === 'all' ? undefined : statusFilter,
      customerId: customerFilter === 'all' ? undefined : parseInt(customerFilter),
      quoteNumber: searchTerm || undefined,
      dateFrom: dateFromFilter || undefined,
      dateTo: dateToFilter || undefined,
    }),
  });

  // Fetch customers for filter
  const { data: customersData } = useQuery({
    queryKey: ['customers-list'],
    queryFn: () => customersApi.getAll({ limit: 100 }),
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: quotationsApi.create,
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['quotations'] });
      setShowCreateForm(false);
      
      // Auto-generate and download PDF
      if (response.data) {
        generateQuotationPDF({
          quoteNumber: response.data.quoteNumber,
          customerName: response.data.customerName,
          date: response.data.date,
          validUntil: response.data.validUntil,
          items: response.data.items || [],
          subtotal: response.data.subtotal || 0,
          discount: response.data.discount || 0,
          total: response.data.total || 0,
          notes: response.data.notes,
          createdBy: response.data.createdBy,
        });
      }
      
      toast({
        title: "Success",
        description: "Quotation created successfully and PDF downloaded",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create quotation",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => quotationsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotations'] });
      setShowEditForm(false);
      setSelectedQuotation(null);
      toast({
        title: "Success",
        description: "Quotation updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update quotation",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: quotationsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotations'] });
      toast({
        title: "Success",
        description: "Quotation deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete quotation",
        variant: "destructive",
      });
    },
  });

  const sendMutation = useMutation({
    mutationFn: quotationsApi.send,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotations'] });
      toast({
        title: "Success",
        description: "Quotation sent successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send quotation",
        variant: "destructive",
      });
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => quotationsApi.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotations'] });
      toast({
        title: "Success",
        description: "Quotation status updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update quotation status",
        variant: "destructive",
      });
    },
  });

  const convertToSaleMutation = useMutation({
    mutationFn: quotationsApi.convertToSale,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotations'] });
      toast({
        title: "Success",
        description: "Quotation converted to sale successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to convert quotation to sale",
        variant: "destructive",
      });
    },
  });

  // Data extraction
  const quotations = quotationsData?.data?.quotations || quotationsData?.quotations || [];
  const pagination = quotationsData?.data?.pagination || quotationsData?.pagination;
  const customers = customersData?.data?.customers || customersData?.customers || [];

  // Calculate statistics
  const stats = {
    total: quotations.length,
    draft: quotations.filter((q: any) => q.status === 'draft').length,
    sent: quotations.filter((q: any) => q.status === 'sent').length,
    accepted: quotations.filter((q: any) => q.status === 'accepted').length,
    rejected: quotations.filter((q: any) => q.status === 'rejected').length,
    totalValue: quotations.reduce((sum: number, q: any) => sum + (q.total || 0), 0),
  };

  // Helper functions
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'expired': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'draft': return <Clock className="h-4 w-4" />;
      case 'sent': return <Send className="h-4 w-4" />;
      case 'accepted': return <CheckCircle className="h-4 w-4" />;
      case 'rejected': return <XCircle className="h-4 w-4" />;
      case 'expired': return <Calendar className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const handleDownloadPDF = (quotation: any) => {
    generateQuotationPDF({
      quoteNumber: quotation.quoteNumber,
      customerName: quotation.customerName,
      date: quotation.date,
      validUntil: quotation.validUntil,
      items: quotation.items || [],
      subtotal: quotation.subtotal || 0,
      discount: quotation.discount || 0,
      total: quotation.total || 0,
      notes: quotation.notes,
      createdBy: quotation.createdBy,
    });
  };

  const getAvailableActions = (quotation: any) => {
    const actions = [];
    
    // View is always available
    actions.push({
      label: "View",
      icon: <Eye className="h-4 w-4" />,
      action: () => {
        setSelectedQuotation(quotation);
        setShowDetailsDialog(true);
      },
      variant: "outline" as const
    });

    // Download PDF is always available
    actions.push({
      label: "PDF",
      icon: <Download className="h-4 w-4" />,
      action: () => handleDownloadPDF(quotation),
      variant: "outline" as const,
      className: "text-green-600 hover:text-green-700"
    });

    // Edit only for draft quotations
    if (quotation.status === 'draft') {
      actions.push({
        label: "Edit",
        icon: <Edit className="h-4 w-4" />,
        action: () => {
          setSelectedQuotation(quotation);
          setShowEditForm(true);
        },
        variant: "outline" as const
      });
    }

    // Send only for draft quotations
    if (quotation.status === 'draft') {
      actions.push({
        label: "Send",
        icon: <Send className="h-4 w-4" />,
        action: () => sendMutation.mutate(quotation.id),
        variant: "outline" as const,
        className: "text-blue-600 hover:text-blue-700"
      });
    }

    // Convert to sale only for sent quotations
    if (quotation.status === 'sent') {
      actions.push({
        label: "Convert",
        icon: <CheckCircle className="h-4 w-4" />,
        action: () => convertToSaleMutation.mutate(quotation.id),
        variant: "outline" as const,
        className: "text-green-600 hover:text-green-700"
      });
    }

    // Delete only for draft quotations
    if (quotation.status === 'draft') {
      actions.push({
        label: "Delete",
        icon: <Trash2 className="h-4 w-4" />,
        action: () => deleteMutation.mutate(quotation.id),
        variant: "outline" as const,
        className: "text-red-600 hover:text-red-700",
        confirm: true
      });
    }

    return actions;
  };

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setCustomerFilter("all");
    setDateFromFilter("");
    setDateToFilter("");
    setCurrentPage(1);
  };

  return (
    <div className="p-3 space-y-3">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-500">Quotations</h1>
          <p className="text-gray-600">Manage customer quotations and price estimates</p>
        </div>
        <Button 
          className="bg-blue-600 hover:bg-blue-700"
          onClick={() => setShowCreateForm(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Quotation
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <FileText className="h-5 w-5 text-blue-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Clock className="h-5 w-5 text-gray-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600">Draft</p>
                <p className="text-2xl font-bold text-gray-900">{stats.draft}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Send className="h-5 w-5 text-blue-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600">Sent</p>
                <p className="text-2xl font-bold text-blue-600">{stats.sent}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600">Accepted</p>
                <p className="text-2xl font-bold text-green-600">{stats.accepted}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <XCircle className="h-5 w-5 text-red-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600">Rejected</p>
                <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <DollarSign className="h-5 w-5 text-green-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total Value</p>
                <p className="text-2xl font-bold text-green-600">Rs. {stats.totalValue.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters & Search</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input 
                placeholder="Search by quote number..." 
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
                <SelectItem value="accepted">Accepted</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>

            <Select value={customerFilter} onValueChange={setCustomerFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Customers" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Customers</SelectItem>
                {customers.map((customer: any) => (
                  <SelectItem key={customer.id} value={customer.id.toString()}>
                    {customer.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input
              type="date"
              placeholder="From Date"
              value={dateFromFilter}
              onChange={(e) => setDateFromFilter(e.target.value)}
            />

            <Input
              type="date"
              placeholder="To Date"
              value={dateToFilter}
              onChange={(e) => setDateToFilter(e.target.value)}
            />

            <Button variant="outline" onClick={clearFilters}>
              <Filter className="h-4 w-4 mr-2" />
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quotations Table */}
      <Card>
        <CardContent className="p-0">
          {quotationsLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className="text-gray-500">Loading quotations...</div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Quote Number</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Valid Until</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {quotations.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <div className="text-gray-500">No quotations found</div>
                    </TableCell>
                  </TableRow>
                ) : (
                  quotations.map((quotation: any) => (
                    <TableRow key={quotation.id}>
                      <TableCell className="font-medium">{quotation.quoteNumber}</TableCell>
                      <TableCell>{quotation.customerName}</TableCell>
                      <TableCell>{new Date(quotation.date).toLocaleDateString()}</TableCell>
                      <TableCell>{new Date(quotation.validUntil).toLocaleDateString()}</TableCell>
                      <TableCell>{quotation.items?.length || 0}</TableCell>
                      <TableCell>Rs. {quotation.total?.toLocaleString() || 0}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(quotation.status)}>
                          {getStatusIcon(quotation.status)}
                          <span className="ml-1 capitalize">{quotation.status}</span>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {getAvailableActions(quotation).map((action, index) => (
                            action.confirm ? (
                              <AlertDialog key={index}>
                                <AlertDialogTrigger asChild>
                                  <Button size="sm" variant={action.variant} className={action.className}>
                                    {action.icon}
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Confirm Action</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to {action.label.toLowerCase()} this quotation? This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={action.action}>
                                      {action.label}
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            ) : (
                              <Button 
                                key={index}
                                size="sm" 
                                variant={action.variant}
                                onClick={action.action}
                                className={action.className}
                              >
                                {action.icon}
                              </Button>
                            )
                          ))}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage > 1) setCurrentPage(currentPage - 1);
                  }}
                />
              </PaginationItem>
              {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                const page = i + 1;
                return (
                  <PaginationItem key={page}>
                    <PaginationLink 
                      href="#"
                      isActive={page === currentPage}
                      onClick={(e) => {
                        e.preventDefault();
                        setCurrentPage(page);
                      }}
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                );
              })}
              <PaginationItem>
                <PaginationNext 
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage < pagination.totalPages) setCurrentPage(currentPage + 1);
                  }}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      {/* Create Quotation Dialog */}
      <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Quotation</DialogTitle>
          </DialogHeader>
          <QuotationForm 
            onSubmit={(data) => createMutation.mutate(data)}
            onCancel={() => setShowCreateForm(false)}
            isLoading={createMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Quotation Dialog */}
      <Dialog open={showEditForm} onOpenChange={setShowEditForm}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Quotation</DialogTitle>
          </DialogHeader>
          {selectedQuotation && (
            <QuotationForm 
              quotation={selectedQuotation}
              onSubmit={(data) => updateMutation.mutate({ id: selectedQuotation.id, data })}
              onCancel={() => {
                setShowEditForm(false);
                setSelectedQuotation(null);
              }}
              isLoading={updateMutation.isPending}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Quotation Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Quotation Details</DialogTitle>
          </DialogHeader>
          {selectedQuotation && (
            <QuotationDetails 
              quotation={selectedQuotation}
              onClose={() => {
                setShowDetailsDialog(false);
                setSelectedQuotation(null);
              }}
              onSend={() => sendMutation.mutate(selectedQuotation.id)}
              onConvert={() => convertToSaleMutation.mutate(selectedQuotation.id)}
              onStatusUpdate={(status) => statusMutation.mutate({ id: selectedQuotation.id, status })}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
