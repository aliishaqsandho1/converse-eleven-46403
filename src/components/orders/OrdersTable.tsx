import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious, PaginationEllipsis } from "@/components/ui/pagination";
import { Calendar, FileText, User, Package, ChevronDown, ChevronRight } from "lucide-react";
import { ExpandedOrderRow } from "./ExpandedOrderRow";

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

interface OrdersTableProps {
  orders: Sale[];
  currentPage: number;
  totalPages: number;
  onOrderPDF: (order: Sale) => void;
  onPageChange: (page: number) => void;
  onOrderUpdated?: () => void;
}

export const OrdersTable = ({ 
  orders, 
  currentPage, 
  totalPages, 
  onOrderPDF, 
  onPageChange,
  onOrderUpdated 
}: OrdersTableProps) => {
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20">Completed</Badge>;
      case "pending":
        return <Badge className="bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20">Pending</Badge>;
      case "cancelled":
        return <Badge className="bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20">Cancelled</Badge>;
      default:
        return <Badge className="bg-muted text-muted-foreground border-border">{status}</Badge>;
    }
  };

  const getPaymentMethodBadge = (method: string) => {
    switch (method) {
      case "cash":
        return <Badge variant="outline" className="bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20">Cash</Badge>;
      case "credit":
        return <Badge variant="outline" className="bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20">Credit</Badge>;
      case "card":
        return <Badge variant="outline" className="bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20">Card</Badge>;
      default:
        return <Badge variant="outline">{method}</Badge>;
    }
  };

  return (
    <>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order #</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => {
              const finalTotal = order.subtotal - order.discount;
              return (
                <React.Fragment key={order.id}>
                  <TableRow 
                    className="cursor-pointer hover:bg-muted/30 transition-all duration-300 group"
                    onClick={() => setExpandedRow(expandedRow === order.id ? null : order.id)}
                  >
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {expandedRow === order.id ? (
                          <ChevronDown className="h-4 w-4 text-muted-foreground transition-all duration-300 ease-in-out" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-muted-foreground transition-all duration-300 ease-in-out" />
                        )}
                        {order.orderNumber}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        {order.customerName || "Walk-in"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        {new Date(order.date).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-muted-foreground" />
                        <div className="text-sm">
                          {order.items.length} item{order.items.length > 1 ? 's' : ''}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">Rs. {finalTotal.toLocaleString()}</TableCell>
                    <TableCell>{getPaymentMethodBadge(order.paymentMethod)}</TableCell>
                    <TableCell>{getStatusBadge(order.status)}</TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-red-500/20 text-red-700 dark:text-red-400 hover:bg-red-500/10"
                        onClick={(e) => {
                          e.stopPropagation();
                          onOrderPDF(order);
                        }}
                      >
                        <FileText className="h-3 w-3 mr-1" />
                        PDF
                      </Button>
                    </TableCell>
                  </TableRow>
                  
                  {/* Expandable Row Content */}
                  {expandedRow === order.id && (
                    <TableRow className="bg-muted/20 hover:bg-muted/20">
                      <TableCell colSpan={8} className="p-0">
                        <div className="animate-accordion-down overflow-hidden">
                          <ExpandedOrderRow order={order} onOrderUpdated={onOrderUpdated} />
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {orders.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No orders found matching your criteria.
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                  className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
              
{(() => {
                const pages: (number | 'ellipsis')[] = [];
                const showNeighbors = 2;
                const addPage = (p: number) => {
                  if (p >= 1 && p <= totalPages) pages.push(p);
                };

                addPage(1);
                const start = Math.max(2, currentPage - showNeighbors);
                const end = Math.min(totalPages - 1, currentPage + showNeighbors);

                if (start > 2) pages.push('ellipsis');
                for (let p = start; p <= end; p++) addPage(p);
                if (end < totalPages - 1) pages.push('ellipsis');
                if (totalPages > 1) addPage(totalPages);

                return pages.map((p, idx) =>
                  p === 'ellipsis' ? (
                    <PaginationItem key={`e-${idx}`}>
                      <PaginationEllipsis />
                    </PaginationItem>
                  ) : (
                    <PaginationItem key={p}>
                      <PaginationLink
                        onClick={() => onPageChange(p)}
                        isActive={currentPage === p}
                        className="cursor-pointer"
                      >
                        {p}
                      </PaginationLink>
                    </PaginationItem>
                  )
                );
              })()}
              
              <PaginationItem>
                <PaginationNext 
                  onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                  className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </>
  );
};
