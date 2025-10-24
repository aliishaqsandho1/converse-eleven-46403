
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Package, DollarSign, AlertTriangle } from "lucide-react";

interface InventorySummary {
  totalProducts: number;
  totalValue: number;
  lowStockItems: number;
  outOfStockItems: number;
}

interface InventorySummaryCardsProps {
  summary: InventorySummary;
  onCardClick?: (filterType: 'all' | 'lowStock' | 'outOfStock', title: string) => void;
}

export function InventorySummaryCards({ summary, onCardClick }: InventorySummaryCardsProps) {
  const handleCardClick = (filterType: 'all' | 'lowStock' | 'outOfStock', title: string) => {
    if (onCardClick) {
      onCardClick(filterType, title);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <Card 
        className="border-l-4 border-l-blue-500 cursor-pointer hover:shadow-lg transition-shadow" 
        onClick={() => handleCardClick('all', 'All Products')}
      >
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Package className="h-8 w-8 text-blue-500" />
            <div>
              <p className="text-sm text-muted-foreground">Total Products</p>
              <p className="text-2xl font-bold text-blue-600">{summary.totalProducts}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card 
        className="border-l-4 border-l-green-500 cursor-pointer hover:shadow-lg transition-shadow" 
        onClick={() => handleCardClick('all', 'Total Inventory Value')}
      >
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <DollarSign className="h-8 w-8 text-green-500" />
            <div>
              <p className="text-sm text-muted-foreground">Total Value</p>
              <p className="text-2xl font-bold text-green-600">PKR {summary.totalValue.toLocaleString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card 
        className="border-l-4 border-l-orange-500 cursor-pointer hover:shadow-lg transition-shadow" 
        onClick={() => handleCardClick('lowStock', 'Low Stock Items')}
      >
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-8 w-8 text-orange-500" />
            <div>
              <p className="text-sm text-muted-foreground">Low Stock</p>
              <p className="text-2xl font-bold text-orange-600">{summary.lowStockItems}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card 
        className="border-l-4 border-l-red-500 cursor-pointer hover:shadow-lg transition-shadow" 
        onClick={() => handleCardClick('outOfStock', 'Out of Stock Items')}
      >
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Package className="h-8 w-8 text-red-500" />
            <div>
              <p className="text-sm text-muted-foreground">Out of Stock</p>
              <p className="text-2xl font-bold text-red-600">{summary.outOfStockItems}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
