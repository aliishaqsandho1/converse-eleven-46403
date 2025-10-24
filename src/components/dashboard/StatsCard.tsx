
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: LucideIcon;
  gradientFrom: string;
  gradientTo: string;
  iconColor?: string;
}

export function StatsCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  gradientFrom, 
  gradientTo,
  iconColor = "text-white"
}: StatsCardProps) {
  return (
    <Card className="overflow-hidden border-0 shadow-lg">
      <CardContent className="p-0">
        <div className={`bg-gradient-to-br ${gradientFrom} ${gradientTo} p-4 text-white`}>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-xs font-medium text-white/90 mb-1">{title}</p>
              <p className="text-lg sm:text-2xl font-bold text-white mb-1">
                {value}
              </p>
              <p className="text-xs text-white/80">
                {subtitle}
              </p>
            </div>
            <div className="bg-white/20 p-2 rounded-full">
              <Icon className={`h-4 w-4 ${iconColor}`} />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
