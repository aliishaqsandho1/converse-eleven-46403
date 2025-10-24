
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, CheckCircle } from "lucide-react";

interface NotificationsTabProps {
  stats: any;
}

export function NotificationsTab({ stats }: NotificationsTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Notifications</CardTitle>
        <CardDescription>System alerts and notifications</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {stats?.inventory?.lowStockItems > 0 && (
            <div className="flex items-center space-x-3 p-3 bg-orange-50 rounded-lg">
              <AlertTriangle className="h-4 w-4 text-orange-500" />
              <div>
                <p className="text-sm font-medium">Low Stock Alert</p>
                <p className="text-xs text-muted-foreground">
                  {stats.inventory.lowStockItems} items running low
                </p>
              </div>
            </div>
          )}
          {stats?.inventory?.outOfStockItems > 0 && (
            <div className="flex items-center space-x-3 p-3 bg-red-50 rounded-lg">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <div>
                <p className="text-sm font-medium">Out of Stock</p>
                <p className="text-xs text-muted-foreground">
                  {stats.inventory.outOfStockItems} items unavailable
                </p>
              </div>
            </div>
          )}
          <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <div>
              <p className="text-sm font-medium">System Operational</p>
              <p className="text-xs text-muted-foreground">All systems running</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
