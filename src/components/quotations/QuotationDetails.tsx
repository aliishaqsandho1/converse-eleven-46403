
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Send, CheckCircle, XCircle, FileText, Calendar, User, DollarSign, Download } from "lucide-react";
import { generateQuotationPDF } from "@/utils/pdfGenerator";

interface QuotationDetailsProps {
  quotation: any;
  onClose: () => void;
  onSend?: () => void;
  onConvert?: () => void;
  onStatusUpdate?: (status: string) => void;
}

export default function QuotationDetails({ 
  quotation, 
  onClose, 
  onSend, 
  onConvert, 
  onStatusUpdate 
}: QuotationDetailsProps) {
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

  const isExpired = new Date(quotation.validUntil) < new Date();

  const handleDownloadPDF = () => {
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

  return (
    <div className="space-y-6">
      {/* Header Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Quotation Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-gray-600">Quote Number</Label>
              <p className="text-lg font-semibold">{quotation.quoteNumber}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-600">Status</Label>
              <div className="mt-1">
                <Badge className={getStatusColor(quotation.status)}>
                  {quotation.status.charAt(0).toUpperCase() + quotation.status.slice(1)}
                </Badge>
                {isExpired && quotation.status === 'sent' && (
                  <Badge className="ml-2 bg-orange-100 text-orange-800">Expired</Badge>
                )}
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-600">Created By</Label>
              <p className="flex items-center gap-2">
                <User className="h-4 w-4" />
                {quotation.createdBy}
              </p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-600">Created At</Label>
              <p className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {new Date(quotation.createdAt).toLocaleString()}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Customer & Dates
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-gray-600">Customer</Label>
              <p className="text-lg font-semibold">{quotation.customerName}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-600">Quotation Date</Label>
              <p>{new Date(quotation.date).toLocaleDateString()}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-600">Valid Until</Label>
              <p className={isExpired ? "text-red-600 font-medium" : ""}>
                {new Date(quotation.validUntil).toLocaleDateString()}
                {isExpired && " (Expired)"}
              </p>
            </div>
            <div>
              <Button 
                onClick={handleDownloadPDF}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Items Table */}
      <Card>
        <CardHeader>
          <CardTitle>Quotation Items</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead className="text-right">Quantity</TableHead>
                <TableHead className="text-right">Unit Price</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {quotation.items?.map((item: any, index: number) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{item.productName}</TableCell>
                  <TableCell className="text-right">{item.quantity}</TableCell>
                  <TableCell className="text-right">Rs. {item.unitPrice?.toLocaleString()}</TableCell>
                  <TableCell className="text-right">Rs. {item.total?.toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <Separator className="my-4" />

          {/* Totals */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="font-medium">Subtotal:</span>
              <span>Rs. {quotation.subtotal?.toLocaleString()}</span>
            </div>
            {quotation.discount > 0 && (
              <div className="flex justify-between">
                <span className="font-medium">Discount:</span>
                <span>- Rs. {quotation.discount?.toLocaleString()}</span>
              </div>
            )}
            <Separator />
            <div className="flex justify-between text-lg font-bold">
              <span>Total:</span>
              <span className="flex items-center gap-1">
                <DollarSign className="h-4 w-4" />
                Rs. {quotation.total?.toLocaleString()}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notes */}
      {quotation.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 whitespace-pre-wrap">{quotation.notes}</p>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex gap-4 justify-end">
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>

        <Button 
          onClick={handleDownloadPDF}
          variant="outline"
          className="bg-green-50 text-green-700 hover:bg-green-100"
        >
          <Download className="h-4 w-4 mr-2" />
          Download PDF
        </Button>

        {quotation.status === 'draft' && onSend && (
          <Button onClick={onSend} className="bg-blue-600 hover:bg-blue-700">
            <Send className="h-4 w-4 mr-2" />
            Send Quotation
          </Button>
        )}

        {quotation.status === 'sent' && !isExpired && (
          <>
            {onStatusUpdate && (
              <>
                <Button 
                  onClick={() => onStatusUpdate('accepted')} 
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Accept
                </Button>
                <Button 
                  onClick={() => onStatusUpdate('rejected')} 
                  variant="outline"
                  className="text-red-600 hover:text-red-700"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject
                </Button>
              </>
            )}
            {onConvert && (
              <Button onClick={onConvert} className="bg-green-600 hover:bg-green-700">
                <CheckCircle className="h-4 w-4 mr-2" />
                Convert to Sale
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
