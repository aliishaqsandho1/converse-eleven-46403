
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Eye, FileText, CreditCard, Receipt, DollarSign, Download, Printer } from "lucide-react";
import { salesApi } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import QRCode from 'qrcode';
import jsPDF from 'jspdf';

interface SalesReceipt {
  id: number;
  orderNumber: string;
  customerId: number | null;
  customerName: string;
  customerDetails?: {
    email: string;
    phone: string;
    address: string;
  };
  date: string;
  time: string;
  items: Array<{
    productId: number;
    productName: string;
    sku?: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paymentMethod: string;
  status: string;
  notes?: string;
  createdBy: string;
  createdAt: string;
}

const SalesReceipts = () => {
  const { toast } = useToast();
  const [salesReceipts, setSalesReceipts] = useState<SalesReceipt[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedReceipt, setSelectedReceipt] = useState<SalesReceipt | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSalesReceipts();
  }, []);

  const fetchSalesReceipts = async () => {
    try {
      setLoading(true);
      const response = await salesApi.getAll({ 
        limit: 100,
        status: 'completed'
      });
      
      if (response.success) {
        const receiptsData = response.data?.sales || response.data || [];
        setSalesReceipts(Array.isArray(receiptsData) ? receiptsData : []);
      } else {
        setSalesReceipts([]);
      }
    } catch (error) {
      console.error('Failed to fetch sales receipts:', error);
      setSalesReceipts([]);
      toast({
        title: "Error",
        description: "Failed to load sales receipts",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredReceipts = salesReceipts.filter(receipt =>
    receipt.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    receipt.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    receipt.id.toString().includes(searchTerm.toLowerCase())
  );

  const totalCashSales = salesReceipts
    .filter(r => r.paymentMethod === "cash")
    .reduce((sum, r) => sum + r.total, 0);

  const totalCreditSales = salesReceipts
    .filter(r => r.paymentMethod === "credit")
    .reduce((sum, r) => sum + r.total, 0);

  const handlePrintReceipt = () => {
    window.print();
  };

  // IMPROVED: Download receipt with better formatting and real QR code
  const handleDownloadReceipt = async () => {
    if (!selectedReceipt) return;

    try {
      // Generate QR code for the receipt
      const qrData = `USMAN-HARDWARE-${selectedReceipt.orderNumber}-${selectedReceipt.total}`;
      const qrCodeDataURL = await QRCode.toDataURL(qrData, {
        width: 100,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });

      // Create improved PDF receipt
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [80, 200] // Thermal receipt size (80mm width)
      });

      const pageWidth = 80;
      let yPos = 10;

      // Company Header
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('USMAN HARDWARE', pageWidth / 2, yPos, { align: 'center' });
      yPos += 6;
      
      
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'normal');
      pdf.text('Furniture Hardware Specialist', pageWidth / 2, yPos, { align: 'center' });
      yPos += 4;
      pdf.text('Hafizabad, Punjab, Pakistan', pageWidth / 2, yPos, { align: 'center' });
      yPos += 4;
      pdf.text('Phone: +92-322-6506118', pageWidth / 2, yPos, { align: 'center' });
      yPos += 8;

      // Separator line
      pdf.line(5, yPos, pageWidth - 5, yPos);
      yPos += 5;

      // Receipt Title
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('SALES RECEIPT', pageWidth / 2, yPos, { align: 'center' });
      yPos += 8;

      // Order Information
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Receipt No: ${selectedReceipt.orderNumber}`, 5, yPos);
      yPos += 4;
      pdf.text(`Date: ${new Date(selectedReceipt.date).toLocaleDateString()}`, 5, yPos);
      yPos += 4;
      pdf.text(`Time: ${selectedReceipt.time}`, 5, yPos);
      yPos += 4;
      pdf.text(`Customer: ${selectedReceipt.customerName}`, 5, yPos);
      yPos += 4;
      pdf.text(`Cashier: ${selectedReceipt.createdBy}`, 5, yPos);
      yPos += 4;
      pdf.text(`Payment: ${selectedReceipt.paymentMethod.toUpperCase()}`, 5, yPos);
      yPos += 6;

      // Items header
      pdf.line(5, yPos, pageWidth - 5, yPos);
      yPos += 3;
      
      pdf.setFont('helvetica', 'bold');
      pdf.text('Item', 5, yPos);
      pdf.text('Qty', 45, yPos);
      pdf.text('Rate', 55, yPos);
      pdf.text('Amount', 65, yPos);
      yPos += 3;
      
      pdf.line(5, yPos, pageWidth - 5, yPos);
      yPos += 4;

      // Items
      pdf.setFont('helvetica', 'normal');
      selectedReceipt.items.forEach((item) => {
        // Product name (truncate if too long)
        const productName = item.productName.length > 20 
          ? item.productName.substring(0, 20) + '...' 
          : item.productName;
        
        pdf.text(productName, 5, yPos);
        pdf.text(item.quantity.toString(), 45, yPos);
        pdf.text(item.unitPrice.toFixed(0), 55, yPos);
        pdf.text(item.total.toFixed(0), 65, yPos);
        yPos += 4;
      });

      yPos += 2;
      pdf.line(5, yPos, pageWidth - 5, yPos);
      yPos += 4;

      // Totals
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Subtotal:`, 45, yPos);
      pdf.text(`PKR ${selectedReceipt.subtotal.toFixed(0)}`, 60, yPos);
      yPos += 4;
      
      if (selectedReceipt.discount > 0) {
        pdf.text(`Discount:`, 45, yPos);
        pdf.text(`PKR ${selectedReceipt.discount.toFixed(0)}`, 60, yPos);
        yPos += 4;
      }
      
      if (selectedReceipt.tax > 0) {
        pdf.text(`Tax:`, 45, yPos);
        pdf.text(`PKR ${selectedReceipt.tax.toFixed(0)}`, 60, yPos);
        yPos += 4;
      }
      
      // Total
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(10);
      pdf.text(`TOTAL:`, 45, yPos);
      pdf.text(`PKR ${selectedReceipt.total.toFixed(0)}`, 60, yPos);
      yPos += 8;

      // QR Code
      pdf.addImage(qrCodeDataURL, 'PNG', pageWidth / 2 - 15, yPos, 30, 30);
      yPos += 35;

      // Footer
      pdf.setFontSize(7);
      pdf.setFont('helvetica', 'normal');
      pdf.text('Thank you for your business!', pageWidth / 2, yPos, { align: 'center' });
      yPos += 3;
      pdf.text('For queries: +92-322-6506118', pageWidth / 2, yPos, { align: 'center' });
      yPos += 3;
      pdf.text('www.usmanhardware.com', pageWidth / 2, yPos, { align: 'center' });
      yPos += 5;
      
      pdf.setFontSize(6);
      pdf.text(`Generated: ${new Date().toLocaleString()}`, pageWidth / 2, yPos, { align: 'center' });

      // Save PDF
      pdf.save(`receipt_${selectedReceipt.orderNumber}.pdf`);
      
      toast({
        title: "Receipt Downloaded",
        description: `Professional receipt for order ${selectedReceipt.orderNumber} downloaded successfully`,
      });
    } catch (error) {
      console.error('Failed to generate receipt PDF:', error);
      toast({
        title: "Download Failed",
        description: "Failed to generate receipt PDF. Please try again.",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="flex-1 p-6 space-y-6 bg-slate-50 min-h-screen">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-slate-600">Loading sales receipts...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 space-y-6 bg-slate-50 min-h-[calc(100vh-65px)]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <SidebarTrigger />
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Sales Receipts</h1>
            <p className="text-slate-600">View all sales receipts and transaction history</p>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-blue-700 hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Receipt className="h-8 w-8 text-blue-700" />
              <div>
                <p className="text-sm text-slate-600">Total Receipts</p>
                <p className="text-2xl font-bold text-blue-700">{salesReceipts.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-emerald-700 hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <DollarSign className="h-8 w-8 text-emerald-700" />
              <div>
                <p className="text-sm text-slate-600">Cash Sales</p>
                <p className="text-2xl font-bold text-emerald-700">Rs. {totalCashSales.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-700 hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <CreditCard className="h-8 w-8 text-orange-700" />
              <div>
                <p className="text-sm text-slate-600">Credit Sales</p>
                <p className="text-2xl font-bold text-orange-700">Rs. {totalCreditSales.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-700 hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <FileText className="h-8 w-8 text-purple-700" />
              <div>
                <p className="text-sm text-slate-600">Total Sales</p>
                <p className="text-2xl font-bold text-purple-700">
                  Rs. {(totalCashSales + totalCreditSales).toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card className="hover:shadow-lg transition-shadow duration-300">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
            <Input
              placeholder="Search by order number, receipt ID, or customer name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-slate-300 focus:border-blue-700 focus:ring-blue-700"
            />
          </div>
        </CardContent>
      </Card>

      {/* Sales Receipts Table */}
      <Card className="hover:shadow-lg transition-shadow duration-300">
        <CardHeader>
          <CardTitle className="text-slate-900">Sales History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-slate-700">Receipt Details</TableHead>
                <TableHead className="text-slate-700">Customer</TableHead>
                <TableHead className="text-slate-700">Items</TableHead>
                <TableHead className="text-slate-700">Amount</TableHead>
                <TableHead className="text-slate-700">Payment Method</TableHead>
                <TableHead className="text-slate-700">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReceipts.map((receipt) => (
                <TableRow key={receipt.id} className="hover:bg-slate-50">
                  <TableCell>
                    <div>
                      <p className="font-medium text-slate-900">{receipt.orderNumber}</p>
                      <p className="text-sm text-slate-500">ID: {receipt.id}</p>
                      <p className="text-sm text-slate-500">Date: {receipt.date} at {receipt.time}</p>
                      <p className="text-sm text-slate-500">By: {receipt.createdBy}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="font-medium text-slate-900">{receipt.customerName}</p>
                    {receipt.customerId && (
                      <p className="text-sm text-slate-500">ID: {receipt.customerId}</p>
                    )}
                  </TableCell>
                  <TableCell>
                    <p className="text-sm text-slate-900">{receipt.items.length} items</p>
                    <p className="text-xs text-slate-500">
                      {receipt.items.slice(0, 2).map(item => item.productName).join(", ")}
                      {receipt.items.length > 2 && "..."}
                    </p>
                  </TableCell>
                  <TableCell>
                    <p className="font-medium text-slate-900">Rs. {receipt.total.toLocaleString()}</p>
                    {receipt.discount > 0 && (
                      <p className="text-xs text-green-600">Discount: Rs. {receipt.discount}</p>
                    )}
                    {receipt.tax > 0 && (
                      <p className="text-xs text-slate-500">Tax: Rs. {receipt.tax}</p>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge 
                      className={receipt.paymentMethod === "cash" 
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300' 
                        : 'bg-blue-100 text-blue-800 border-blue-300'
                      }
                    >
                      {receipt.paymentMethod.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-slate-300 text-slate-700 hover:bg-slate-100"
                      onClick={() => setSelectedReceipt(receipt)}
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Receipt Details Dialog */}
      <Dialog open={!!selectedReceipt} onOpenChange={() => setSelectedReceipt(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="text-slate-900">Receipt - {selectedReceipt?.orderNumber}</DialogTitle>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={handleDownloadReceipt}>
                  <Download className="h-4 w-4 mr-1" />
                  Download
                </Button>
                <Button size="sm" variant="outline" onClick={handlePrintReceipt}>
                  <Printer className="h-4 w-4 mr-1" />
                  Print
                </Button>
              </div>
            </div>
          </DialogHeader>
          {selectedReceipt && <ReceiptDetails receipt={selectedReceipt} />}
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Enhanced Receipt Details Component for Printing
const ReceiptDetails = ({ receipt }: { receipt: SalesReceipt }) => (
  <div id="receipt-content" className="bg-white">
    {/* Modern Receipt Design */}
    <div className="max-w-md mx-auto bg-white shadow-lg rounded-lg overflow-hidden border">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 text-center">
        <h1 className="text-2xl font-bold">USMAN HARDWARE</h1>
        <p className="text-blue-100 text-sm">Furniture Hardware Specialist</p>
        <p className="text-blue-100 text-xs">Hafizabad, Punjab, Pakistan</p>
        <p className="text-blue-100 text-xs">Phone: +92-322-6506118</p>
      </div>

      {/* Receipt Info */}
      <div className="bg-gray-50 px-6 py-4 border-b">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-600">Receipt No.</p>
            <p className="font-bold text-lg">{receipt.orderNumber}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Date & Time</p>
            <p className="font-semibold">{receipt.date}</p>
            <p className="text-sm text-gray-500">{receipt.time}</p>
          </div>
        </div>
      </div>

      {/* Customer Info */}
      <div className="px-6 py-4 border-b">
        <div className="flex justify-between">
          <div>
            <p className="text-sm text-gray-600">Customer</p>
            <p className="font-semibold">{receipt.customerName}</p>
            {receipt.customerDetails?.phone && (
              <p className="text-sm text-gray-500">{receipt.customerDetails.phone}</p>
            )}
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Cashier</p>
            <p className="font-semibold">{receipt.createdBy}</p>
          </div>
        </div>
      </div>

      {/* Items */}
      <div className="px-6 py-4">
        <h3 className="font-semibold text-gray-800 mb-3 border-b pb-2">Items Purchased</h3>
        <div className="space-y-3">
          {receipt.items.map((item, index) => (
            <div key={index} className="flex justify-between items-start">
              <div className="flex-1">
                <p className="font-medium text-gray-900">{item.productName}</p>
                {item.sku && <p className="text-xs text-gray-500">SKU: {item.sku}</p>}
                <p className="text-sm text-gray-600">
                  {item.quantity} × Rs. {item.unitPrice.toLocaleString()}
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold">Rs. {item.total.toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Totals */}
      <div className="px-6 py-4 border-t bg-gray-50">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Subtotal:</span>
            <span>Rs. {receipt.subtotal.toLocaleString()}</span>
          </div>
          {receipt.discount > 0 && (
            <div className="flex justify-between text-sm text-green-600">
              <span>Discount:</span>
              <span>- Rs. {receipt.discount.toLocaleString()}</span>
            </div>
          )}
          {receipt.tax > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Tax:</span>
              <span>Rs. {receipt.tax.toLocaleString()}</span>
            </div>
          )}
        </div>
      </div>

      {/* FIXED: Total section with proper full-width alignment */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4">
        <div className="flex justify-between items-center">
          <span className="text-lg font-bold">TOTAL:</span>
          <span className="text-xl font-bold">Rs. {receipt.total.toLocaleString()}</span>
        </div>
      </div>

      {/* Payment Method */}
      <div className="px-6 py-3 bg-blue-50 border-t">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Payment Method:</span>
          <Badge className={receipt.paymentMethod === "cash" ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}>
            {receipt.paymentMethod.toUpperCase()}
          </Badge>
        </div>
      </div>

      {/* Notes */}
      {receipt.notes && (
        <div className="px-6 py-3 border-t">
          <p className="text-sm text-gray-600">Notes:</p>
          <p className="text-sm text-gray-800">{receipt.notes}</p>
        </div>
      )}

      {/* Footer */}
      <div className="px-6 py-4 border-t text-center">
        <p className="text-xs text-gray-500 mb-2">Thank you for your business!</p>
        <p className="text-xs text-gray-400">For queries: +92-322-6506118</p>
        <div className="mt-4 pt-3 border-t border-dashed">
          <p className="text-xs text-gray-400">
            Generated: {new Date().toLocaleString()}
          </p>
        </div>
      </div>

      {/* Barcode Placeholder */}
      <div className="px-6 py-2 border-t text-center bg-gray-50">
        <div className="inline-block">
          <div className="flex space-x-1">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="w-1 h-8 bg-gray-800" style={{height: `${Math.random() * 20 + 20}px`}}></div>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-1">{receipt.orderNumber}</p>
        </div>
      </div>
    </div>
  </div>
);

export default SalesReceipts;
