import jsPDF from 'jspdf';
import QRCode from 'qrcode';
import { useToast } from "@/hooks/use-toast";

interface Sale {
  id: number;
  orderNumber: string;
  customerId: number | null;
  customerName: string | null;
  date: string;
  time: string;
  items: Array<{
    productId: number;
    productName: string;
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
  createdBy: string;
  createdAt: string;
}

// Helper function to format time to 12-hour Pakistani format
const formatPakistaniTime = (timeString: string): string => {
  try {
    // Create a date object for today with the given time
    const [hours, minutes] = timeString.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    
    // Convert to Pakistani timezone and format to 12-hour format
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZone: 'Asia/Karachi'
    });
  } catch (error) {
    console.error('Error formatting time:', error);
    return timeString; // Return original if formatting fails
  }
};

export const useOrderPDFGenerator = () => {
  const { toast } = useToast();

  const generateOrderPDF = async (order: Sale) => {
    try {
      // Calculate final total without tax (subtotal - discount)
      const finalTotal = order.subtotal - order.discount;
      
      // Generate QR code with proper encoding
      const qrData = `USMAN-HARDWARE-${order.orderNumber}-${finalTotal}-VERIFIED`;
      const qrCodeDataURL = await QRCode.toDataURL(qrData, {
        width: 60,
        margin: 1,
        color: {
          dark: '#1a365d',
          light: '#ffffff'
        },
        errorCorrectionLevel: 'H'
      });

      // Dynamic height calculation
      let staticHeight = 0;
      staticHeight += 8;   // Top margin
      staticHeight += 40;  // Header section
      staticHeight += 16;  // Receipt title
      staticHeight += 26 + 4; // Receipt details box + spacing
      staticHeight += 7;   // Items header
      staticHeight += 3;   // Separator line after items
      staticHeight += 6;   // Space after separator
      staticHeight += 12;  // Totals section
      staticHeight += 5 + 5 + 12; // Payment method title + badge + spacing
      staticHeight += 4 + 28; // QR code title + QR code section
      staticHeight += 20;  // Thank you message section
      staticHeight += 23;  // Footer policies section
      staticHeight += 8;   // Final footer (generated, receipt id)

      // Calculate items section height
      let itemsHeight = 0;
      order.items.forEach((item: any) => {
        const maxCharsPerLine = 20;
        const productName = item.productName;
        let lines = [];
        if (productName.length <= maxCharsPerLine) {
          lines.push(productName);
        } else {
          let remaining = productName;
          while (remaining.length > maxCharsPerLine) {
            let breakPoint = maxCharsPerLine;
            const lastSpace = remaining.substring(0, maxCharsPerLine).lastIndexOf(' ');
            if (lastSpace > maxCharsPerLine * 0.7) {
              breakPoint = lastSpace;
            }
            lines.push(remaining.substring(0, breakPoint));
            remaining = remaining.substring(breakPoint).trim();
          }
          if (remaining.length > 0) {
            lines.push(remaining);
          }
        }
        const itemHeight = Math.max(5, lines.length * 4);
        itemsHeight += itemHeight;
      });

      const totalHeight = staticHeight + itemsHeight + 10;

      // Create 80mm thermal receipt with dynamic height
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [80, totalHeight]
      });

      const pageWidth = 80;
      let yPos = 8;

      pdf.setFont('helvetica', 'normal');

      // SUBTLE WATERMARK
      pdf.setTextColor(250, 250, 250);
      pdf.setFontSize(20);
      pdf.setFont('helvetica', 'bold');
      
      pdf.saveGraphicsState();
      pdf.setGState(pdf.GState({ opacity: 0.05 }));
      
      for (let i = 0; i < 6; i++) {
        const yWatermark = 40 + (i * 30);
        pdf.text('USMAN HARDWARE', pageWidth / 2, yWatermark, {
          angle: -20,
          align: 'center'
        });
      }
      
      pdf.restoreGraphicsState();
      pdf.setTextColor(0, 0, 0);

      // HEADER SECTION
        pdf.setFillColor(26, 54, 93);
      pdf.roundedRect(4, yPos, pageWidth - 8, 32, 2, 2, 'F');
      
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('USMAN HARDWARE', pageWidth / 2, yPos + 7, { align: 'center' });
      
      pdf.setFontSize(7);
      pdf.setFont('helvetica', 'normal');
      pdf.text('Premium Furniture Hardware', pageWidth / 2, yPos + 13, { align: 'center' });
      pdf.text('Hafizabad, Punjab', pageWidth / 2, yPos + 18, { align: 'center' });
      pdf.text('+92-322-6506118', pageWidth / 2, yPos + 23, { align: 'center' });
      pdf.text('www.usmanhardware.com', pageWidth / 2, yPos + 28, { align: 'center' });

      yPos += 40;

      // RECEIPT TITLE
      pdf.setTextColor(0, 0, 0);
      pdf.setFillColor(248, 250, 252);
      pdf.roundedRect(6, yPos, pageWidth - 12, 10, 1, 1, 'F');
      pdf.setDrawColor(26, 54, 93);
      pdf.setLineWidth(0.3);
      pdf.roundedRect(6, yPos, pageWidth - 12, 10, 1, 1, 'S');
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(26, 54, 93);
      pdf.text('SALES RECEIPT', pageWidth / 2, yPos + 6.5, { align: 'center' });
      
      yPos += 16;

      // RECEIPT DETAILS
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'normal');
      
      pdf.setFillColor(252, 252, 254);
      pdf.roundedRect(5, yPos, pageWidth - 10, 26, 1, 1, 'F');
      
      yPos += 4;
      
      pdf.setFont('helvetica', 'bold');
      pdf.text('Receipt:', 8, yPos);
      pdf.setFont('helvetica', 'normal');
      pdf.text(order.orderNumber, 25, yPos);
      yPos += 5;
      
      pdf.setFont('helvetica', 'bold');
      pdf.text('Date:', 8, yPos);
      pdf.setFont('helvetica', 'normal');
      pdf.text(new Date(order.date).toLocaleDateString('en-GB'), 25, yPos);
      yPos += 5;
      
      pdf.setFont('helvetica', 'bold');
      pdf.text('Time:', 8, yPos);
      pdf.setFont('helvetica', 'normal');
      pdf.text(formatPakistaniTime(order.time), 25, yPos);
      yPos += 5;
      
      pdf.setFont('helvetica', 'bold');
      pdf.text('Customer:', 8, yPos);
      pdf.setFont('helvetica', 'normal');
      const customerDisplayName = order.customerName || 'Walk-in Customer';
      pdf.text(customerDisplayName.length > 23 ? customerDisplayName.substring(0, 23) + '...' : customerDisplayName, 25, yPos);
      yPos += 5;
      
      pdf.setFont('helvetica', 'bold');
      pdf.text('Cashier:', 8, yPos);
      pdf.setFont('helvetica', 'normal');
      pdf.text(order.createdBy, 25, yPos);
      yPos += 8;

      // ITEMS HEADER
      pdf.setFillColor(26, 54, 93);
      pdf.roundedRect(5, yPos, pageWidth - 8, 7, 1, 1, 'F');
      
      pdf.setTextColor(255, 255, 255);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(7);
      pdf.text('ITEM', 8, yPos + 4.5);
      pdf.text('QTY', 50, yPos + 4.5);
      pdf.text('RATE', 58, yPos + 4.5);
      pdf.text('TOTAL', 68, yPos + 4.5);
      
      yPos += 7;

      // ITEMS
      pdf.setTextColor(0, 0, 0);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(7);
      
      order.items.forEach((item: any, index: number) => {
        const maxCharsPerLine = 20;
        const productName = item.productName;
        const lines = [];
        if (productName.length <= maxCharsPerLine) {
          lines.push(productName);
        } else {
          let remaining = productName;
          while (remaining.length > maxCharsPerLine) {
            let breakPoint = maxCharsPerLine;
            const lastSpace = remaining.substring(0, maxCharsPerLine).lastIndexOf(' ');
            if (lastSpace > maxCharsPerLine * 0.7) {
              breakPoint = lastSpace;
            }
            lines.push(remaining.substring(0, breakPoint));
            remaining = remaining.substring(breakPoint).trim();
          }
          if (remaining.length > 0) {
            lines.push(remaining);
          }
        }
        const itemHeight = Math.max(5, lines.length * 4);
        if (index % 2 === 1) {
          pdf.setFillColor(248, 250, 252);
          pdf.rect(5, yPos, pageWidth - 10, itemHeight, 'F');
        }
        lines.forEach((line, lineIndex) => {
          pdf.text(line, 8, yPos + 3 + (lineIndex * 3.5));
        });
        pdf.text(item.quantity.toString(), 50, yPos + 3);
        pdf.text(item.unitPrice.toFixed(0), 58, yPos + 3);
        pdf.text(item.total.toFixed(0), 68, yPos + 3);
        yPos += itemHeight;
      });

      // SEPARATOR LINE
      yPos += 3;
      pdf.setDrawColor(26, 54, 93);
      pdf.setLineWidth(0.5);
      pdf.line(8, yPos, pageWidth - 8, yPos);
      yPos += 6;

      // TOTALS SECTION
      const totalsStartX = 8;
      pdf.setFontSize(7);
      pdf.setFont('helvetica', 'normal');
      pdf.text('Subtotal:', totalsStartX, yPos);
      pdf.text(`PKR ${order.subtotal.toFixed(0)}`, totalsStartX + 42, yPos);
      yPos += 4;
      if (order.discount > 0) {
        pdf.setTextColor(220, 38, 127);
        pdf.text('Discount:', totalsStartX, yPos);
        pdf.text(`-PKR ${order.discount.toFixed(0)}`, totalsStartX + 35, yPos);
        pdf.setTextColor(0, 0, 0);
        yPos += 4;
      }
      pdf.setFillColor(26, 54, 93);
      pdf.roundedRect(5, yPos, pageWidth - 8, 7, 1, 1, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(8);
      pdf.text('TOTAL:', 8, yPos + 4);
      pdf.text(`PKR ${finalTotal.toFixed(0)}`, 50, yPos + 4.5);
      yPos += 12;

      // PAYMENT METHOD
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Payment Method:', pageWidth / 2, yPos, { align: 'center' });
      yPos += 5;
      const paymentColor = order.paymentMethod === 'cash' ? [34, 197, 94] : [59, 130, 246];
      pdf.setFillColor(paymentColor[0], paymentColor[1], paymentColor[2]);
      pdf.roundedRect(pageWidth / 2 - 12, yPos, 24, 5, 2, 2, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(7);
      pdf.text(order.paymentMethod.toUpperCase(), pageWidth / 2, yPos + 3.5, { align: 'center' });
      yPos += 12;

      // QR CODE SECTION
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Scan to Verify:', pageWidth / 2, yPos, { align: 'center' });
      yPos += 4;
      const qrSize = 20;
      const qrX = pageWidth / 2 - qrSize / 2;
      pdf.setFillColor(255, 255, 255);
      pdf.roundedRect(qrX - 2, yPos, qrSize + 4, qrSize + 4, 1, 1, 'F');
      pdf.setDrawColor(26, 54, 93);
      pdf.setLineWidth(0.5);
      pdf.roundedRect(qrX - 2, yPos, qrSize + 4, qrSize + 4, 1, 1, 'S');
      pdf.addImage(qrCodeDataURL, 'PNG', qrX, yPos + 2, qrSize, qrSize);
      yPos += 28;

      // THANK YOU MESSAGE
      pdf.setFillColor(248, 250, 252);
      pdf.roundedRect(6, yPos, pageWidth - 12, 15, 2, 2, 'F');
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(26, 54, 93);
      pdf.text('Thank You!', pageWidth / 2, yPos + 6, { align: 'center' });
      pdf.setFontSize(6);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(100, 100, 100);
      pdf.text('Your trust means everything to us', pageWidth / 2, yPos + 10, { align: 'center' });
      pdf.text('Visit us again soon!', pageWidth / 2, yPos + 13, { align: 'center' });
      yPos += 20;

      // FOOTER POLICIES
      pdf.setFillColor(26, 54, 93);
      pdf.roundedRect(4, yPos, pageWidth - 8, 18, 1, 1, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(6);
      pdf.setFont('helvetica', 'bold');
      pdf.text('EXCHANGE POLICY', pageWidth / 2, yPos + 4, { align: 'center' });
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(5);
      pdf.text('Items exchangeable within 7 days', pageWidth / 2, yPos + 7, { align: 'center' });
      pdf.text('Original receipt required', pageWidth / 2, yPos + 10, { align: 'center' });
      pdf.text('Support: +92-322-6506118', pageWidth / 2, yPos + 13, { align: 'center' });
      pdf.text('Hours: Sat-Thu 8AM-8PM', pageWidth / 2, yPos + 16, { align: 'center' });
      yPos += 23;

      // FINAL FOOTER
      pdf.setTextColor(120, 120, 120);
      pdf.setFontSize(5);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Generated: ${new Date().toLocaleString()}`, pageWidth / 2, yPos, { align: 'center' });
      pdf.text(`Receipt ID: ${order.orderNumber}`, pageWidth / 2, yPos + 3, { align: 'center' });

      // Create filename with customer name + order number
      const customerFilenamePart = order.customerName || 'Walk-in-Customer';
      const sanitizedCustomerName = customerFilenamePart.replace(/[^a-zA-Z0-9-_]/g, '-');
      const filename = `${sanitizedCustomerName} ${order.orderNumber}.pdf`;

      // Save with new filename format
      pdf.save(filename);
      
      toast({
        title: "Receipt Generated!",
        description: `Thermal receipt for order ${order.orderNumber}`,
      });
    } catch (error) {
      console.error('Failed to generate receipt:', error);
      const errorMessage = error instanceof Error ? error.message : "Failed to generate thermal receipt. Please try again.";
      toast({
        title: "Receipt Generation Failed",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  return { generateOrderPDF };
};
