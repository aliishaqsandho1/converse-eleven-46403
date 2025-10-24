
import jsPDF from 'jspdf';

interface CustomerPurchaseData {
  customer: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    type: string;
    address?: string;
    city?: string;
    totalPurchases: number;
    currentBalance: number;
    creditLimit: number;
    lastPurchase?: string;
  };
  purchases: Array<{
    id: string;
    orderNumber: string;
    date: string;
    amount: number;
    items: Array<{
      productName: string;
      quantity: number;
      unitPrice: number;
      total: number;
    }>;
    paymentStatus: string;
    notes?: string;
  }>;
}

export const generateCustomerPurchasePDF = (data: CustomerPurchaseData) => {
  const doc = new jsPDF();
  let yPos = 20;

  // Header with company branding
  doc.setFillColor(59, 130, 246);
  doc.rect(0, 0, 210, 25, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.text('CUSTOMER PURCHASE REPORT', 20, 16);
  
  yPos = 40;

  // Customer Information Section
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(16);
  doc.setTextColor(59, 130, 246);
  doc.text('CUSTOMER INFORMATION', 20, yPos);
  
  yPos += 10;
  doc.setDrawColor(59, 130, 246);
  doc.line(20, yPos, 190, yPos);
  yPos += 15;

  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text(`Name: ${data.customer.name}`, 20, yPos);
  yPos += 8;
  
  if (data.customer.phone) {
    doc.text(`Phone: ${data.customer.phone}`, 20, yPos);
    yPos += 8;
  }
  
  if (data.customer.email) {
    doc.text(`Email: ${data.customer.email}`, 20, yPos);
    yPos += 8;
  }
  
  if (data.customer.address) {
    doc.text(`Address: ${data.customer.address}`, 20, yPos);
    yPos += 8;
  }
  
  if (data.customer.city) {
    doc.text(`City: ${data.customer.city}`, 20, yPos);
    yPos += 8;
  }
  
  doc.text(`Customer Type: ${data.customer.type}`, 20, yPos);
  yPos += 8;
  doc.text(`Credit Limit: PKR ${data.customer.creditLimit.toLocaleString()}`, 20, yPos);
  yPos += 8;
  doc.text(`Current Balance: PKR ${data.customer.currentBalance.toLocaleString()}`, 20, yPos);
  yPos += 15;

  // Purchase Summary Section
  doc.setFontSize(16);
  doc.setTextColor(34, 197, 94);
  doc.text('PURCHASE SUMMARY', 20, yPos);
  
  yPos += 10;
  doc.setDrawColor(34, 197, 94);
  doc.line(20, yPos, 190, yPos);
  yPos += 15;

  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text(`Total Purchases: PKR ${data.customer.totalPurchases.toLocaleString()}`, 20, yPos);
  yPos += 8;
  doc.text(`Number of Orders: ${data.purchases.length}`, 20, yPos);
  yPos += 8;
  
  if (data.customer.lastPurchase) {
    doc.text(`Last Purchase: ${new Date(data.customer.lastPurchase).toLocaleDateString()}`, 20, yPos);
  }
  yPos += 8;
  doc.text(`Average Order Value: PKR ${(data.customer.totalPurchases / data.purchases.length || 0).toLocaleString()}`, 20, yPos);
  yPos += 20;

  // Individual Purchases Section
  if (data.purchases.length > 0) {
    doc.setFontSize(16);
    doc.setTextColor(147, 51, 234);
    doc.text('PURCHASE DETAILS', 20, yPos);
    
    yPos += 10;
    doc.setDrawColor(147, 51, 234);
    doc.line(20, yPos, 190, yPos);
    yPos += 15;

    data.purchases.forEach((purchase, index) => {
      // Check if we need a new page
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }

      // Purchase header
      doc.setFillColor(248, 250, 252);
      doc.rect(20, yPos - 5, 170, 12, 'F');
      
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text(`Order #${purchase.orderNumber}`, 25, yPos + 3);
      doc.text(`Date: ${new Date(purchase.date).toLocaleDateString()}`, 120, yPos + 3);
      yPos += 15;

      // Purchase amount and status
      doc.setFontSize(10);
      doc.text(`Total Amount: PKR ${purchase.amount.toLocaleString()}`, 25, yPos);
      doc.text(`Payment Status: ${purchase.paymentStatus}`, 120, yPos);
      yPos += 10;

      // Items table header
      if (purchase.items && purchase.items.length > 0) {
        doc.setFillColor(229, 231, 235);
        doc.rect(25, yPos, 160, 8, 'F');
        doc.setFontSize(9);
        doc.text('Product', 28, yPos + 5);
        doc.text('Qty', 100, yPos + 5);
        doc.text('Unit Price', 120, yPos + 5);
        doc.text('Total', 155, yPos + 5);
        yPos += 12;

        // Items
        purchase.items.forEach((item) => {
          if (yPos > 270) {
            doc.addPage();
            yPos = 20;
          }
          
          doc.setFontSize(8);
          doc.text(item.productName.substring(0, 30), 28, yPos);
          doc.text(item.quantity.toString(), 100, yPos);
          doc.text(`PKR ${item.unitPrice.toLocaleString()}`, 120, yPos);
          doc.text(`PKR ${item.total.toLocaleString()}`, 155, yPos);
          yPos += 8;
        });
      }

      // Notes if available
      if (purchase.notes) {
        yPos += 5;
        doc.setFontSize(9);
        doc.text(`Notes: ${purchase.notes}`, 25, yPos);
        yPos += 8;
      }

      yPos += 10;
    });
  }

  // Footer
  const pageCount = (doc as any).internal.pages.length - 1;
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text(`Generated on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`, 20, 285);
    doc.text(`Page ${i} of ${pageCount}`, 160, 285);
    doc.text('Customer Purchase Report - IMS', 20, 290);
  }

  // Download the PDF
  const fileName = `${data.customer.name.replace(/\s+/g, '_')}_Purchase_Report_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
};
