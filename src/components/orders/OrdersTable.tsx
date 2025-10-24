import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious, PaginationEllipsis } from "@/components/ui/pagination";
import { Calendar, Eye, FileText, User, Package, ChevronDown, ChevronRight } from "lucide-react";
import { formatQuantity } from "@/lib/utils";

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
  onViewOrder: (order: Sale) => void;
  onOrderPDF: (order: Sale) => void;
  onPageChange: (page: number) => void;
}

export const OrdersTable = ({ 
  orders, 
  currentPage, 
  totalPages, 
  onViewOrder, 
  onOrderPDF, 
  onPageChange 
}: OrdersTableProps) => {
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-100 text-green-700 border-green-200">Completed</Badge>;
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">Pending</Badge>;
      case "cancelled":
        return <Badge className="bg-red-100 text-red-700 border-red-200">Cancelled</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-700 border-gray-200">{status}</Badge>;
    }
  };

  const getPaymentMethodBadge = (method: string) => {
    switch (method) {
      case "cash":
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Cash</Badge>;
      case "credit":
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Credit</Badge>;
      case "card":
        return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">Card</Badge>;
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
                        <User className="h-4 w-4 text-slate-400" />
                        {order.customerName || "Walk-in"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-slate-400" />
                        {new Date(order.date).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-slate-400" />
                        <div className="text-sm">
                          {order.items.length} item{order.items.length > 1 ? 's' : ''}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">Rs. {finalTotal.toLocaleString()}</TableCell>
                    <TableCell>{getPaymentMethodBadge(order.paymentMethod)}</TableCell>
                    <TableCell>{getStatusBadge(order.status)}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-blue-300 text-blue-700 hover:bg-blue-50"
                          onClick={(e) => {
                            e.stopPropagation();
                            onViewOrder(order);
                          }}
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          View
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-red-300 text-red-700 hover:bg-red-50"
                          onClick={(e) => {
                            e.stopPropagation();
                            onOrderPDF(order);
                          }}
                        >
                          <FileText className="h-3 w-3 mr-1" />
                          PDF
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                  
                  {/* Expandable Row Content */}
                  {expandedRow === order.id && (
                    <TableRow className="bg-muted/20 hover:bg-muted/20">
                      <TableCell colSpan={8} className="p-0">
                        <div className="animate-accordion-down overflow-hidden">
                          <div className="border-t border-border bg-card/30">
                            <div className="flex items-center justify-between p-4 bg-primary/5 border-b border-border">
                              <div className="flex items-center gap-2">
                                <Package className="h-5 w-5 text-primary" />
                                <h4 className="font-semibold text-foreground">
                                  Order Items ({order.items?.length || 0})
                                </h4>
                              </div>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <span>Subtotal: <span className="font-semibold text-foreground">Rs. {order.subtotal.toLocaleString()}</span></span>
                                {order.discount > 0 && (
                                  <span>Discount: <span className="font-semibold text-red-600">-Rs. {order.discount.toLocaleString()}</span></span>
                                )}
                                <span>Total: <span className="font-semibold text-primary">Rs. {finalTotal.toLocaleString()}</span></span>
                              </div>
                            </div>
                            
                            {order.items && order.items.length > 0 ? (
                              <div className="p-0">
                                <Table>
                                  <TableHeader>
                                    <TableRow className="bg-muted/40">
                                      <TableHead className="w-12 text-center">#</TableHead>
                                      <TableHead className="min-w-[300px]">Product Name</TableHead>
                                      <TableHead className="text-center w-24">Qty</TableHead>
                                      <TableHead className="text-right w-32">Unit Price</TableHead>
                                      <TableHead className="text-right w-32">Total</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {order.items.map((item: any, index: number) => (
                                      <TableRow 
                                        key={index} 
                                        className="hover:bg-muted/20 transition-all duration-200"
                                      >
                                        <TableCell className="text-center text-muted-foreground font-mono">
                                          {index + 1}
                                        </TableCell>
                                        <TableCell className="font-medium">
                                          <div className="flex flex-col">
                                            <span className="text-foreground">{item.productName}</span>
                                            {item.productId && (
                                              <span className="text-xs text-muted-foreground">ID: {item.productId}</span>
                                            )}
                                          </div>
                                        </TableCell>
                                        <TableCell className="text-center">
                                          <Badge variant="secondary" className="font-mono">
                                            {formatQuantity(item.quantity)}
                                          </Badge>
                                        </TableCell>
                                        <TableCell className="text-right font-mono text-muted-foreground">
                                          Rs. {item.unitPrice?.toLocaleString()}
                                        </TableCell>
                                        <TableCell className="text-right font-mono font-semibold text-primary">
                                          Rs. {item.total?.toLocaleString()}
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </div>
                            ) : (
                              <div className="text-center py-8 text-muted-foreground">
                                <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
                                <p className="text-sm">No items found in this order</p>
                              </div>
                            )}
                            
                            <div className="px-4 pb-4">
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-3 bg-muted/30 rounded-lg border border-border">
                                <div className="text-sm">
                                  <span className="font-medium text-muted-foreground">Payment Method: </span>
                                  <span className="text-foreground">{order.paymentMethod}</span>
                                </div>
                                <div className="text-sm">
                                  <span className="font-medium text-muted-foreground">Time: </span>
                                  <span className="text-foreground">{order.time}</span>
                                </div>
                                <div className="text-sm">
                                  <span className="font-medium text-muted-foreground">Created By: </span>
                                  <span className="text-foreground">{order.createdBy}</span>
                                </div>
                                <div className="text-sm">
                                  <span className="font-medium text-muted-foreground">Status: </span>
                                  <span className="text-foreground capitalize">{order.status}</span>
                                </div>
                              </div>
                            </div>
                          </div>
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
        <div className="text-center py-8 text-slate-500">
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
