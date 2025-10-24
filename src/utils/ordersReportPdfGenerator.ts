import jsPDF from 'jspdf';
import { formatQuantity } from '@/lib/utils';

interface OrderItem {
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface Order {
  id: number;
  orderNumber: string;
  customerId: number | null;
  customerName: string | null;
  date: string;
  time: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paymentMethod: string;
  status: string;
  createdBy: string;
  createdAt: string;
}

interface OrdersReportData {
  title: string;
  orders: Order[];
  exportDate: string;
  totalOrders: number;
  totalSales: number;
  totalItems: number;
  avgOrderValue: number;
  filters?: string;
}

export const generateOrdersReportPDF = async (reportData: OrdersReportData) => {
  const doc = new jsPDF('l', 'mm', 'a4'); // Landscape for better table layout
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  const margin = 15;
  let yPos = margin;

  // HEADER SECTION
  doc.setFillColor(26, 54, 93);
  doc.roundedRect(margin, yPos, pageWidth - 2 * margin, 25, 3, 3, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('USMAN HARDWARE', pageWidth / 2, yPos + 8, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Premium Furniture Hardware Solutions', pageWidth / 2, yPos + 14, { align: 'center' });
  doc.text('Hafizabad, Punjab | +92-322-6506118', pageWidth / 2, yPos + 19, { align: 'center' });
  
  yPos += 35;

  // REPORT TITLE
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(reportData.title, pageWidth / 2, yPos, { align: 'center' });
  yPos += 15;

  // REPORT INFO SECTION
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin, yPos, pageWidth - 2 * margin, 30, 2, 2, 'F');
  
  doc.setTextColor(60, 60, 60);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  const infoStartY = yPos + 6;
  doc.text(`Export Date: ${reportData.exportDate}`, margin + 5, infoStartY);
  doc.text(`Total Orders: ${reportData.totalOrders}`, margin + 5, infoStartY + 5);
  doc.text(`Total Items Sold: ${reportData.totalItems}`, margin + 5, infoStartY + 10);
  doc.text(`Total Sales: PKR ${reportData.totalSales.toLocaleString()}`, margin + 5, infoStartY + 15);
  doc.text(`Average Order Value: PKR ${reportData.avgOrderValue.toLocaleString()}`, margin + 5, infoStartY + 20);
  
  if (reportData.filters) {
    doc.text(`Filters: ${reportData.filters}`, pageWidth - margin - 5, infoStartY, { align: 'right' });
  }
  
  yPos += 40;

  // TABLE HEADER
  doc.setFillColor(26, 54, 93);
  doc.roundedRect(margin, yPos, pageWidth - 2 * margin, 10, 1, 1, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  
  // Column positions and widths (optimized for landscape with tighter spacing)
  const col1X = margin + 3; // Index
  const col2X = margin + 15; // Order Number
  const col3X = margin + 45; // Customer
  const col4X = margin + 75; // Date
  const col5X = margin + 95; // Items Summary
  const col6X = margin + 165; // Total Qty
  const col7X = margin + 180; // Subtotal
  const col8X = margin + 200; // Discount
  const col9X = margin + 220; // Final Total
  const col10X = margin + 245; // Payment
  
  doc.text('#', col1X, yPos + 6.5);
  doc.text('Order Number', col2X, yPos + 6.5);
  doc.text('Customer', col3X, yPos + 6.5);
  doc.text('Date', col4X, yPos + 6.5);
  doc.text('Items Summary', col5X, yPos + 6.5);
  doc.text('Qty', col6X, yPos + 6.5);
  doc.text('Subtotal', col7X, yPos + 6.5);
  doc.text('Discount', col8X, yPos + 6.5);
  doc.text('Final Total', col9X, yPos + 6.5);
  doc.text('Payment', col10X, yPos + 6.5);
  
  yPos += 12;

  // TABLE ROWS
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  
  reportData.orders.forEach((order, index) => {
    // Check if we need a new page
    if (yPos > pageHeight - 40) {
      doc.addPage();
      yPos = margin;
      
      // Repeat header on new page
      doc.setFillColor(26, 54, 93);
      doc.roundedRect(margin, yPos, pageWidth - 2 * margin, 10, 1, 1, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      
      doc.text('#', col1X, yPos + 6.5);
      doc.text('Order Number', col2X, yPos + 6.5);
      doc.text('Customer', col3X, yPos + 6.5);
      doc.text('Date', col4X, yPos + 6.5);
      doc.text('Items Summary', col5X, yPos + 6.5);
      doc.text('Qty', col6X, yPos + 6.5);
      doc.text('Subtotal', col7X, yPos + 6.5);
      doc.text('Discount', col8X, yPos + 6.5);
      doc.text('Final Total', col9X, yPos + 6.5);
      doc.text('Payment', col10X, yPos + 6.5);
      
      yPos += 12;
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
    }

    // Calculate order data
    const totalQuantity = order.items.reduce((sum, item) => sum + item.quantity, 0);
    const finalTotal = order.subtotal - order.discount;
    
    // Create items summary (show ALL items with quantities)
    const itemsSummary = order.items
      .map(item => `${item.productName} (${formatQuantity(item.quantity)})`)
      .join('  •  ');
    
    // Calculate text wrapping for proper row height
    const maxSummaryWidth = 65;
    const summaryLines = doc.splitTextToSize(itemsSummary, maxSummaryWidth);
    const lineHeight = 4.2; // mm between wrapped lines (more spacing between items)
    const dynamicRowHeight = Math.max(7, summaryLines.length * lineHeight + 5);

    // If row won't fit, start a new page with repeated header
    if (yPos + dynamicRowHeight > pageHeight - 40) {
      doc.addPage();
      yPos = margin;
      doc.setFillColor(26, 54, 93);
      doc.roundedRect(margin, yPos, pageWidth - 2 * margin, 10, 1, 1, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text('#', col1X, yPos + 6.5);
      doc.text('Order Number', col2X, yPos + 6.5);
      doc.text('Customer', col3X, yPos + 6.5);
      doc.text('Date', col4X, yPos + 6.5);
      doc.text('Items Summary', col5X, yPos + 6.5);
      doc.text('Qty', col6X, yPos + 6.5);
      doc.text('Subtotal', col7X, yPos + 6.5);
      doc.text('Discount', col8X, yPos + 6.5);
      doc.text('Final Total', col9X, yPos + 6.5);
      doc.text('Payment', col10X, yPos + 6.5);
      yPos += 12;
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
    }

    // Alternating row colors with dynamic height
    if (index % 2 === 1) {
      doc.setFillColor(250, 250, 250);
      doc.rect(margin, yPos - 1, pageWidth - 2 * margin, dynamicRowHeight + 2, 'F');
    }

    // Row data
    const rowY = yPos + 3;
    doc.text((index + 1).toString(), col1X, rowY); // Index
    
    // Handle long order numbers
    const orderNum = order.orderNumber.length > 15 ? 
      order.orderNumber.substring(0, 15) + '...' : order.orderNumber;
    doc.text(orderNum, col2X, rowY);
    
    // Handle long customer names
    const customerName = (order.customerName || 'Walk-in').length > 20 ? 
      (order.customerName || 'Walk-in').substring(0, 20) + '...' : 
      (order.customerName || 'Walk-in');
    doc.text(customerName, col3X, rowY);
    
    doc.text(new Date(order.date).toLocaleDateString('en-GB'), col4X, rowY);
    
    // Handle long items summary with optimized text wrapping
    if (summaryLines.length > 0) {
      summaryLines.forEach((line: string, lineIndex: number) => {
        doc.text(line, col5X, rowY + (lineIndex * lineHeight));
      });
    } else {
      doc.text(itemsSummary, col5X, rowY);
    }
    
    // Reset yPos for other columns to align with first line
    const otherColY = rowY;
    doc.text(totalQuantity.toString(), col6X, otherColY);
    doc.text(`${order.subtotal.toLocaleString()}`, col7X, otherColY);
    
    // Color code discount
    if (order.discount > 0) {
      doc.setTextColor(239, 68, 68); // Red for discount
      doc.text(`${order.discount.toLocaleString()}`, col8X, otherColY);
      doc.setTextColor(0, 0, 0); // Reset to black
    } else {
      doc.text('0', col8X, otherColY);
    }
    
    // Color code final total based on amount
    if (finalTotal > 50000) {
      doc.setTextColor(34, 197, 94); // Green for high value
    } else if (finalTotal > 20000) {
      doc.setTextColor(251, 146, 60); // Orange for medium value
    } else {
      doc.setTextColor(0, 0, 0); // Black for regular value
    }
    doc.text(`${finalTotal.toLocaleString()}`, col9X, otherColY);
    doc.setTextColor(0, 0, 0); // Reset to black
    
    // Payment method
    const paymentMethod = order.paymentMethod.length > 8 ? 
      order.paymentMethod.substring(0, 8) : order.paymentMethod;
    doc.text(paymentMethod, col10X, otherColY);
    
    // Update yPos with calculated row height + minimal spacing
    yPos += dynamicRowHeight + 2; // Slightly more spacing to avoid clipping
  });

  // SUMMARY SECTION
  yPos += 10;
  if (yPos > pageHeight - 50) {
    doc.addPage();
    yPos = margin;
  }

  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin, yPos, pageWidth - 2 * margin, 35, 2, 2, 'F');
  
  doc.setTextColor(26, 54, 93);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('REPORT SUMMARY', pageWidth / 2, yPos + 8, { align: 'center' });
  
  doc.setTextColor(60, 60, 60);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  
  const summaryY = yPos + 15;
  const highValueOrders = reportData.orders.filter(order => (order.subtotal - order.discount) > 50000).length;
  const totalDiscount = reportData.orders.reduce((sum, order) => sum + order.discount, 0);
  const cashOrders = reportData.orders.filter(order => order.paymentMethod === 'cash').length;
  const creditOrders = reportData.orders.filter(order => order.paymentMethod === 'credit').length;
  
  doc.text(`• High Value Orders (>50K): ${highValueOrders} orders`, margin + 5, summaryY);
  doc.text(`• Total Discounts Given: PKR ${totalDiscount.toLocaleString()}`, margin + 5, summaryY + 5);
  doc.text(`• Cash Orders: ${cashOrders} | Credit Orders: ${creditOrders}`, margin + 5, summaryY + 10);
  
  yPos += 35;

  // FOOTER
  const footerY = pageHeight - 20;
  doc.setTextColor(128, 128, 128);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('Generated by Order Management System', pageWidth / 2, footerY, { align: 'center' });
  doc.text(`Report ID: ORD-${Date.now()}`, pageWidth / 2, footerY + 4, { align: 'center' });

  // Add page numbers to all pages
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setTextColor(128, 128, 128);
    doc.setFontSize(8);
    doc.text(`Page ${i} of ${pageCount}`, pageWidth - margin, footerY + 8, { align: 'right' });
  }

  // Save the PDF
  const filename = `Orders_Report_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(filename);
  
  return filename;
};