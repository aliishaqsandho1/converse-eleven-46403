import jsPDF from 'jspdf';
import { salesApi } from '@/services/api';

interface StockReportProduct {
  id: number;
  name: string;
  category: string;
  stock: number;
  unit: string;
  price: number;
  costPrice?: number;
  timesSold?: number;
}

interface StockReportData {
  title: string;
  products: StockReportProduct[];
  categories: string[];
  exportDate: string;
  totalProducts: number;
  totalStockValue: number;
}

export const generateStockReportPDF = async (reportData: StockReportData) => {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  const margin = 15;
  let yPos = margin;

  // Fetch all sales once and build a productId -> timesSold map to avoid N network requests
  let timesSoldMap = new Map<number, number>();
  try {
    const response = await salesApi.getAll({ limit: 10000 });
    if (response.success) {
      const allSales = response.data?.sales || response.data || [];
      allSales.forEach((sale: any) => {
        (sale.items || []).forEach((item: any) => {
          const pid = Number(item.productId);
          const qty = Number(item.quantity) || 0;
          timesSoldMap.set(pid, (timesSoldMap.get(pid) || 0) + qty);
        });
      });
    }
  } catch (error) {
    console.error('Error fetching sales for stock report:', error);
  }

  const productsWithSales = reportData.products.map((product) => ({
    ...product,
    timesSold: timesSoldMap.get(product.id) || 0,
  }));

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
  doc.roundedRect(margin, yPos, pageWidth - 2 * margin, 25, 2, 2, 'F');
  
  doc.setTextColor(60, 60, 60);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  const infoStartY = yPos + 6;
  doc.text(`Export Date: ${reportData.exportDate}`, margin + 5, infoStartY);
  doc.text(`Total Products: ${reportData.totalProducts}`, margin + 5, infoStartY + 5);
  doc.text(`Categories: ${reportData.categories.join(', ')}`, margin + 5, infoStartY + 10);
  doc.text(`Total Stock Value: PKR ${reportData.totalStockValue.toLocaleString()}`, margin + 5, infoStartY + 15);
  
  yPos += 35;

  // TABLE HEADER
  doc.setFillColor(26, 54, 93);
  doc.roundedRect(margin, yPos, pageWidth - 2 * margin, 10, 1, 1, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  
  // Column positions and widths
  const col1X = margin + 3; // Index
  const col2X = margin + 12; // Product Name
  const col3X = margin + 85; // Category
  const col4X = margin + 120; // Stock
  const col5X = margin + 140; // Unit
  const col6X = margin + 155; // Price
  const col7X = margin + 175; // Times Sold
  
  doc.text('#', col1X, yPos + 6.5);
  doc.text('Product Name', col2X, yPos + 6.5);
  doc.text('Category', col3X, yPos + 6.5);
  doc.text('Stock', col4X, yPos + 6.5);
  doc.text('Unit', col5X, yPos + 6.5);
  doc.text('Price', col6X, yPos + 6.5);
  doc.text('Sold', col7X, yPos + 6.5);
  
  yPos += 12;

  // TABLE ROWS
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  
  productsWithSales.forEach((product, index) => {
    // Check if we need a new page
    if (yPos > pageHeight - 30) {
      doc.addPage();
      yPos = margin;
      
      // Repeat header on new page
      doc.setFillColor(26, 54, 93);
      doc.roundedRect(margin, yPos, pageWidth - 2 * margin, 10, 1, 1, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      
      doc.text('#', col1X, yPos + 6.5);
      doc.text('Product Name', col2X, yPos + 6.5);
      doc.text('Category', col3X, yPos + 6.5);
      doc.text('Stock', col4X, yPos + 6.5);
      doc.text('Unit', col5X, yPos + 6.5);
      doc.text('Price', col6X, yPos + 6.5);
      doc.text('Sold', col7X, yPos + 6.5);
      
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
    
    // Handle long product names - wrap text if needed
    const productName = product.name || '';
    const maxNameWidth = 70; // Maximum width for product name column
    const nameLines = doc.splitTextToSize(productName, maxNameWidth);
    
    if (nameLines.length > 1) {
      // Multi-line product name
      nameLines.forEach((line: string, lineIndex: number) => {
        doc.text(line, col2X, rowY + (lineIndex * 3));
      });
      const nameHeight = nameLines.length * 3;
      yPos += Math.max(6, nameHeight);
    } else {
      // Single line
      doc.text(productName, col2X, rowY);
      yPos += 6;
    }
    
    // Reset yPos for other columns to align with first line of product name
    const otherColY = rowY;
    doc.text((product.category || '').substring(0, 15), col3X, otherColY);
    doc.text(product.stock.toString(), col4X, otherColY);
    doc.text(product.unit || 'pcs', col5X, otherColY);
    doc.text(`${product.price.toLocaleString()}`, col6X, otherColY);
    
    // Times sold with color coding
    const timesSold = product.timesSold || 0;
    if (timesSold > 50) {
      doc.setTextColor(34, 197, 94); // Green for high sales
    } else if (timesSold > 10) {
      doc.setTextColor(251, 146, 60); // Orange for medium sales
    } else {
      doc.setTextColor(239, 68, 68); // Red for low sales
    }
    doc.text(timesSold.toString(), col7X, otherColY);
    doc.setTextColor(0, 0, 0); // Reset to black
    
    yPos += 2; // Extra spacing between rows
  });

  // SUMMARY SECTION
  yPos += 10;
  if (yPos > pageHeight - 50) {
    doc.addPage();
    yPos = margin;
  }

  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin, yPos, pageWidth - 2 * margin, 30, 2, 2, 'F');
  
  doc.setTextColor(26, 54, 93);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('REPORT SUMMARY', pageWidth / 2, yPos + 8, { align: 'center' });
  
  doc.setTextColor(60, 60, 60);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  
  const summaryY = yPos + 15;
  const totalSold = productsWithSales.reduce((sum, product) => sum + (product.timesSold || 0), 0);
  const avgPrice = productsWithSales.reduce((sum, product) => sum + product.price, 0) / productsWithSales.length;
  const lowStockCount = productsWithSales.filter(product => product.stock <= 10).length;
  
  doc.text(`• Total Items Sold: ${totalSold.toLocaleString()} units`, margin + 5, summaryY);
  doc.text(`• Average Product Price: PKR ${avgPrice.toFixed(0)}`, margin + 5, summaryY + 5);
  doc.text(`• Low Stock Items: ${lowStockCount} products`, margin + 5, summaryY + 10);
  
  yPos += 40;

  // FOOTER
  const footerY = pageHeight - 20;
  doc.setTextColor(128, 128, 128);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('Generated by Inventory Management System', pageWidth / 2, footerY, { align: 'center' });
  doc.text(`Report ID: STOCK-${Date.now()}`, pageWidth / 2, footerY + 4, { align: 'center' });

  // Add page numbers to all pages
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setTextColor(128, 128, 128);
    doc.setFontSize(8);
    doc.text(`Page ${i} of ${pageCount}`, pageWidth - margin, footerY + 8, { align: 'right' });
  }

  // Save the PDF
  const filename = `Stock_Report_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(filename);
  
  return filename;
};