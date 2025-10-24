
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Clock, CalendarDays, CalendarRange } from "lucide-react";

interface DateRangeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onExport: (timeScope: string, startDate?: string, endDate?: string) => void;
  isLoading: boolean;
}

export const DateRangeModal = ({ 
  open, 
  onOpenChange, 
  onExport,
  isLoading 
}: DateRangeModalProps) => {
  const [selectedTimeScope, setSelectedTimeScope] = useState<string>('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const timeOptions = [
    {
      id: 'today',
      title: 'Today',
      description: 'Export today\'s orders only',
      icon: Clock,
      color: 'blue'
    },
    {
      id: 'weekly',
      title: 'This Week',
      description: 'Export orders from this week',
      icon: CalendarDays,
      color: 'green'
    },
    {
      id: 'monthly',
      title: 'This Month',
      description: 'Export orders from this month',
      icon: Calendar,
      color: 'purple'
    },
    {
      id: 'all',
      title: 'All Time',
      description: 'Export all available orders',
      icon: CalendarRange,
      color: 'orange'
    },
    {
      id: 'custom',
      title: 'Custom Range',
      description: 'Select specific date range',
      icon: CalendarRange,
      color: 'pink'
    }
  ];

  const handleExport = () => {
    if (selectedTimeScope === 'custom') {
      onExport(selectedTimeScope, startDate, endDate);
    } else {
      onExport(selectedTimeScope);
    }
  };

  const isExportDisabled = () => {
    if (!selectedTimeScope) return true;
    if (selectedTimeScope === 'custom' && (!startDate || !endDate)) return true;
    return false;
  };

  const getColorClasses = (color: string, isSelected: boolean) => {
    const colors = {
      blue: isSelected ? 'border-blue-500 bg-blue-50' : 'hover:border-blue-300',
      green: isSelected ? 'border-green-500 bg-green-50' : 'hover:border-green-300',
      purple: isSelected ? 'border-purple-500 bg-purple-50' : 'hover:border-purple-300',
      orange: isSelected ? 'border-orange-500 bg-orange-50' : 'hover:border-orange-300',
      pink: isSelected ? 'border-pink-500 bg-pink-50' : 'hover:border-pink-300'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  const getIconColorClasses = (color: string) => {
    const colors = {
      blue: 'bg-blue-100 text-blue-600',
      green: 'bg-green-100 text-green-600',
      purple: 'bg-purple-100 text-purple-600',
      orange: 'bg-orange-100 text-orange-600',
      pink: 'bg-pink-100 text-pink-600'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-800">
            Select Date Range
          </DialogTitle>
          <p className="text-gray-600">
            Choose the time period for your export
          </p>
        </DialogHeader>

        <div className="flex-1 overflow-auto">
          {/* Time Options Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
            {timeOptions.map((option) => {
              const Icon = option.icon;
              const isSelected = selectedTimeScope === option.id;
              
              return (
                <Card
                  key={option.id}
                  className={`cursor-pointer transition-all duration-200 border-2 ${getColorClasses(option.color, isSelected)} hover:shadow-md h-24`}
                  onClick={() => setSelectedTimeScope(option.id)}
                >
                  <CardContent className="p-3 h-full flex flex-col items-center justify-center text-center">
                    <div className={`p-2 rounded-full mb-1 ${getIconColorClasses(option.color)}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <h3 className="font-semibold text-sm text-gray-800">{option.title}</h3>
                    <p className="text-xs text-gray-600 leading-tight">{option.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Custom Date Range Inputs */}
          {selectedTimeScope === 'custom' && (
            <Card className="border-2 border-pink-200 bg-pink-50">
              <CardContent className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Start Date
                    </label>
                    <Input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="border-pink-300 focus:border-pink-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      End Date
                    </label>
                    <Input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="border-pink-300 focus:border-pink-500"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <DialogFooter className="flex gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleExport}
            disabled={isExportDisabled() || isLoading}
            className="bg-red-600 hover:bg-red-700"
          >
            {isLoading ? 'Exporting...' : 'Export PDF'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
