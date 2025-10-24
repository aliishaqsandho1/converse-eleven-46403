
import jsPDF from 'jspdf';

interface QuotationItem {
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface QuotationData {
  quoteNumber: string;
  customerName: string;
  date: string;
  validUntil: string;
  items: QuotationItem[];
  subtotal: number;
  discount: number;
  total: number;
  notes?: string;
  createdBy: string;
}

export const generateQuotationPDF = (quotation: QuotationData) => {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(20);
  doc.setTextColor(41, 128, 185);
  doc.text('QUOTATION', 20, 30);
  
  // Quote details
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text(`Quote Number: ${quotation.quoteNumber}`, 20, 50);
  doc.text(`Customer: ${quotation.customerName}`, 20, 60);
  doc.text(`Date: ${new Date(quotation.date).toLocaleDateString()}`, 20, 70);
  doc.text(`Valid Until: ${new Date(quotation.validUntil).toLocaleDateString()}`, 20, 80);
  doc.text(`Created By: ${quotation.createdBy}`, 120, 50);
  
  // Table header
  let yPos = 100;
  doc.setFillColor(240, 240, 240);
  doc.rect(20, yPos, 170, 10, 'F');
  doc.setFontSize(10);
  doc.text('Product', 25, yPos + 7);
  doc.text('Qty', 100, yPos + 7);
  doc.text('Unit Price', 120, yPos + 7);
  doc.text('Total', 160, yPos + 7);
  
  // Table rows
  yPos += 15;
  quotation.items.forEach((item) => {
    doc.text(item.productName, 25, yPos);
    doc.text(item.quantity.toString(), 100, yPos);
    doc.text(`Rs. ${item.unitPrice.toLocaleString()}`, 120, yPos);
    doc.text(`Rs. ${item.total.toLocaleString()}`, 160, yPos);
    yPos += 10;
  });
  
  // Totals
  yPos += 10;
  doc.line(20, yPos, 190, yPos);
  yPos += 10;
  doc.text(`Subtotal: Rs. ${quotation.subtotal.toLocaleString()}`, 120, yPos);
  yPos += 10;
  if (quotation.discount > 0) {
    doc.text(`Discount: Rs. ${quotation.discount.toLocaleString()}`, 120, yPos);
    yPos += 10;
  }
  doc.setFontSize(12);
  doc.text(`Total: Rs. ${quotation.total.toLocaleString()}`, 120, yPos);
  
  // Notes
  if (quotation.notes) {
    yPos += 20;
    doc.setFontSize(10);
    doc.text('Notes:', 20, yPos);
    yPos += 10;
    const splitNotes = doc.splitTextToSize(quotation.notes, 170);
    doc.text(splitNotes, 20, yPos);
  }
  
  // Download
  doc.save(`${quotation.quoteNumber}.pdf`);
};
