import jsPDF from 'jspdf';

interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  type: string;
  address?: string;
  city?: string;
  status: string;
  creditLimit: number;
  currentBalance: number;
  totalPurchases: number;
  lastPurchase?: string;
}

export const generateAllCustomersPDF = (customers: Customer[]) => {
  const doc = new jsPDF('p', 'mm', 'a4');
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
  doc.text('CUSTOMERS EXPORT REPORT', pageWidth / 2, yPos, { align: 'center' });
  yPos += 15;

  // REPORT INFO SECTION
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin, yPos, pageWidth - 2 * margin, 30, 2, 2, 'F');
  
  doc.setTextColor(60, 60, 60);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  const infoStartY = yPos + 6;
  const activeCustomers = customers.filter(c => c.status === 'active' || !c.status).length;
  const totalDues = customers.reduce((sum, c) => sum + (c.currentBalance || 0), 0);
  const totalPurchases = customers.reduce((sum, c) => sum + (c.totalPurchases || 0), 0);
  const customersWithDues = customers.filter(c => (c.currentBalance || 0) > 0).length;
  
  doc.text(`Export Date: ${new Date().toLocaleDateString()}`, margin + 5, infoStartY);
  doc.text(`Total Customers: ${customers.length}`, margin + 5, infoStartY + 5);
  doc.text(`Active Customers: ${activeCustomers}`, margin + 5, infoStartY + 10);
  doc.text(`Customers with Dues: ${customersWithDues}`, margin + 5, infoStartY + 15);
  doc.text(`Total Outstanding: PKR ${totalDues.toLocaleString()}`, margin + 5, infoStartY + 20);
  
  doc.text(`Total Purchases: PKR ${totalPurchases.toLocaleString()}`, pageWidth - margin - 5, infoStartY, { align: 'right' });
  doc.text(`Average Customer Value: PKR ${Math.round(totalPurchases / customers.length).toLocaleString()}`, pageWidth - margin - 5, infoStartY + 5, { align: 'right' });
  
  yPos += 40;

  // TABLE HEADER
  doc.setFillColor(26, 54, 93);
  doc.roundedRect(margin, yPos, pageWidth - 2 * margin, 10, 1, 1, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  
  // Column positions and widths
  const col1X = margin + 3; // Index
  const col2X = margin + 12; // Customer Name
  const col3X = margin + 70; // Type
  const col4X = margin + 90; // Phone
  const col5X = margin + 125; // City
  const col6X = margin + 145; // Credit Limit
  const col7X = margin + 165; // Balance
  const col8X = margin + 185; // Status
  
  doc.text('#', col1X, yPos + 6.5);
  doc.text('Customer Name', col2X, yPos + 6.5);
  doc.text('Type', col3X, yPos + 6.5);
  doc.text('Phone', col4X, yPos + 6.5);
  doc.text('City', col5X, yPos + 6.5);
  doc.text('Credit', col6X, yPos + 6.5);
  doc.text('Balance', col7X, yPos + 6.5);
  doc.text('Status', col8X, yPos + 6.5);
  
  yPos += 12;

  // TABLE ROWS
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  
  customers.forEach((customer, index) => {
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
      doc.text('Customer Name', col2X, yPos + 6.5);
      doc.text('Type', col3X, yPos + 6.5);
      doc.text('Phone', col4X, yPos + 6.5);
      doc.text('City', col5X, yPos + 6.5);
      doc.text('Credit', col6X, yPos + 6.5);
      doc.text('Balance', col7X, yPos + 6.5);
      doc.text('Status', col8X, yPos + 6.5);
      
      yPos += 12;
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
    }

    // Alternating row colors
    if (index % 2 === 1) {
      doc.setFillColor(250, 250, 250);
      doc.rect(margin, yPos - 2, pageWidth - 2 * margin, 8, 'F');
    }

    // Row data
    const rowY = yPos + 3;
    doc.text((index + 1).toString(), col1X, rowY); // Index
    
    // Handle long customer names
    const customerName = customer.name.length > 30 ? 
      customer.name.substring(0, 30) + '...' : customer.name;
    doc.text(customerName, col2X, rowY);
    
    // Customer type with color coding
    const type = customer.type || 'Business';
    if (type === 'Permanent') {
      doc.setTextColor(34, 197, 94); // Green
    } else if (type === 'Semi-Permanent') {
      doc.setTextColor(59, 130, 246); // Blue
    } else if (type === 'Temporary') {
      doc.setTextColor(251, 146, 60); // Orange
    }
    doc.text(type.substring(0, 8), col3X, rowY);
    doc.setTextColor(0, 0, 0); // Reset to black
    
    doc.text((customer.phone || 'N/A').substring(0, 15), col4X, rowY);
    doc.text((customer.city || 'N/A').substring(0, 10), col5X, rowY);
    doc.text(`${(customer.creditLimit || 0).toLocaleString()}`.substring(0, 8), col6X, rowY);
    
    // Balance with color coding
    const balance = customer.currentBalance || 0;
    if (balance > 0) {
      doc.setTextColor(239, 68, 68); // Red for debt
      doc.text(`${balance.toLocaleString()}`.substring(0, 8), col7X, rowY);
    } else {
      doc.setTextColor(34, 197, 94); // Green for no debt
      doc.text('0', col7X, rowY);
    }
    doc.setTextColor(0, 0, 0); // Reset to black
    
    // Status
    const status = customer.status || 'active';
    if (status === 'active') {
      doc.setTextColor(34, 197, 94); // Green
    } else {
      doc.setTextColor(239, 68, 68); // Red
    }
    doc.text(status.substring(0, 6), col8X, rowY);
    doc.setTextColor(0, 0, 0); // Reset to black
    
    yPos += 6;
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
  const businessCustomers = customers.filter(c => c.type === 'business' || c.type === 'Permanent').length;
  const avgCreditLimit = customers.reduce((sum, c) => sum + (c.creditLimit || 0), 0) / customers.length;
  const highValueCustomers = customers.filter(c => (c.totalPurchases || 0) > 100000).length;
  
  doc.text(`• Business/Permanent Customers: ${businessCustomers} (${((businessCustomers / customers.length) * 100).toFixed(1)}%)`, margin + 5, summaryY);
  doc.text(`• Average Credit Limit: PKR ${avgCreditLimit.toFixed(0)}`, margin + 5, summaryY + 5);
  doc.text(`• High Value Customers (>100K): ${highValueCustomers}`, margin + 5, summaryY + 10);
  doc.text(`• Collection Efficiency: ${(((totalPurchases - totalDues) / totalPurchases) * 100).toFixed(1)}%`, margin + 5, summaryY + 15);
  
  yPos += 45;

  // FOOTER
  const footerY = pageHeight - 20;
  doc.setTextColor(128, 128, 128);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('Generated by Customer Management System', pageWidth / 2, footerY, { align: 'center' });
  doc.text(`Report ID: CUST-${Date.now()}`, pageWidth / 2, footerY + 4, { align: 'center' });

  // Add page numbers to all pages
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setTextColor(128, 128, 128);
    doc.setFontSize(8);
    doc.text(`Page ${i} of ${pageCount}`, pageWidth - margin, footerY + 8, { align: 'right' });
  }

  // Save the PDF
  const fileName = `Customers_Report_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
  
  return fileName;
};