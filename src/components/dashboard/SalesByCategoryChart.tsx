
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package } from "lucide-react";

interface CategoryData {
  name: string;
  value: number;
  percentage: number;
  color: string;
}

interface SalesByCategoryChartProps {
  data: CategoryData[];
  title?: string;
  subtitle?: string;
}

// Enhanced color palette with better contrast
const ENHANCED_COLORS = [
  '#3B82F6', // Blue
  '#10B981', // Emerald
  '#F59E0B', // Amber
  '#EF4444', // Red
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#06B6D4', // Cyan
  '#84CC16', // Lime
  '#F97316', // Orange
  '#6366F1', // Indigo
  '#14B8A6', // Teal
  '#F59E0B', // Yellow
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
        <p className="font-medium text-gray-900">{data.name}</p>
        <p className="text-sm text-gray-600">
          Revenue: Rs. {data.value.toLocaleString()}
        </p>
        <p className="text-sm text-gray-600">
          Share: {data.percentage.toFixed(1)}%
        </p>
      </div>
    );
  }
  return null;
};

const CustomLegend = ({ payload }: any) => {
  return (
    <div className="grid grid-cols-2 gap-2 mt-4">
      {payload.map((entry: any, index: number) => (
        <div key={index} className="flex items-center gap-2 text-sm">
          <div 
            className="w-3 h-3 rounded-full flex-shrink-0"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-gray-700 truncate">{entry.value}</span>
          <Badge variant="outline" className="ml-auto text-xs">
            {entry.payload.percentage.toFixed(1)}%
          </Badge>
        </div>
      ))}
    </div>
  );
};

export function SalesByCategoryChart({ 
  data, 
  title = "Sales by Category",
  subtitle = "Revenue distribution across product categories (in Rs.)"
}: SalesByCategoryChartProps) {
  // Process data and assign colors
  const processedData = data.map((item, index) => ({
    ...item,
    color: item.color || ENHANCED_COLORS[index % ENHANCED_COLORS.length]
  }));

  // Calculate total for better context
  const totalRevenue = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-green-100 rounded-lg">
            <Package className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <CardTitle className="text-lg font-semibold text-gray-900">
              {title}
            </CardTitle>
            <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
          </div>
        </div>
        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700">Total Revenue</span>
            <span className="text-lg font-bold text-green-600">
              Rs. {totalRevenue.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between items-center mt-1">
            <span className="text-xs text-gray-500">Categories</span>
            <span className="text-sm font-medium text-gray-700">
              {data.length} active
            </span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Enhanced Pie Chart */}
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={processedData}
                  cx="50%"
                  cy="50%"
                  outerRadius={120}
                  innerRadius={45}
                  paddingAngle={2}
                  dataKey="value"
                  stroke="#ffffff"
                  strokeWidth={2}
                >
                  {processedData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.color}
                      className="hover:opacity-80 transition-opacity cursor-pointer"
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Enhanced Legend with Statistics */}
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900 mb-3">Category Breakdown</h4>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {processedData
                .sort((a, b) => b.value - a.value)
                .map((item, index) => (
                <div 
                  key={index} 
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div 
                      className="w-4 h-4 rounded-full flex-shrink-0"
                      style={{ backgroundColor: item.color }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {item.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        Rs. {item.value.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Badge 
                      variant={item.percentage > 20 ? "default" : "outline"}
                      className="text-xs"
                    >
                      {item.percentage.toFixed(1)}%
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Top Categories Summary */}
            {processedData.length > 3 && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <h5 className="text-sm font-medium text-blue-900 mb-2">
                  Top 3 Categories
                </h5>
                <div className="space-y-1">
                  {processedData
                    .sort((a, b) => b.value - a.value)
                    .slice(0, 3)
                    .map((item, index) => (
                    <div key={index} className="flex justify-between text-xs">
                      <span className="text-blue-700">{item.name}</span>
                      <span className="font-medium text-blue-900">
                        {item.percentage.toFixed(1)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
