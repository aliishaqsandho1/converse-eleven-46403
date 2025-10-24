
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

import { 
  FileText, 
  RefreshCw, 
  Download, 
  Package, 
  Search,
  CheckCircle2,
  Circle
} from "lucide-react";

interface EnhancedExportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: any[];
  onExport: (selectedCategories: string[], exportType: string) => Promise<void>;
  exportLoading: boolean;
}

export const EnhancedExportModal = ({ 
  open, 
  onOpenChange, 
  categories, 
  onExport, 
  exportLoading 
}: EnhancedExportModalProps) => {
  const [selectedCategories, setSelectedCategories] = useState<string[]>(["all"]);
  const [exportType, setExportType] = useState("detailed");
  const [searchTerm, setSearchTerm] = useState("");

  const availableCategories = categories.filter(cat => cat.value !== "all");
  
  // Filter categories based on search term
  const filteredCategories = availableCategories.filter(cat => 
    cat.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCategoryToggle = (categoryValue: string) => {
    if (categoryValue === "all") {
      setSelectedCategories(["all"]);
    } else {
      setSelectedCategories(prev => {
        const newSelection = prev.includes("all") 
          ? [categoryValue]
          : prev.includes(categoryValue)
            ? prev.filter(cat => cat !== categoryValue)
            : [...prev, categoryValue];
        
        return newSelection.length === 0 ? ["all"] : newSelection.filter(cat => cat !== "all");
      });
    }
  };

  const handleSelectAll = () => {
    setSelectedCategories(["all"]);
  };

  const handleSelectNone = () => {
    setSelectedCategories([]);
  };

  const isAllSelected = selectedCategories.includes("all");
  const isIndeterminate = selectedCategories.length > 0 && selectedCategories.length < availableCategories.length && !isAllSelected;

  const handleExport = async () => {
    const categoriesToExport = selectedCategories.includes("all") || selectedCategories.length === 0 
      ? ["all"] 
      : selectedCategories;
    
    await onExport(categoriesToExport, exportType);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-4">
          <DialogTitle className="flex items-center gap-3 text-xl">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Download className="h-5 w-5 text-blue-600" />
            </div>
            Export Stock Report
          </DialogTitle>
          <p className="text-sm text-muted-foreground mt-2">
            Generate a comprehensive PDF report of your product inventory
          </p>
        </DialogHeader>
        
        <div className="space-y-6 py-2">
          
          {/* Category Selection */}
          <div className="space-y-4">
            <Label className="text-base font-medium flex items-center gap-2">
              <Package className="h-4 w-4" />
              Select Categories
            </Label>
            
            {/* Search Categories */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-10"
              />
            </div>

            {/* Select All/None Actions */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSelectAll}
                className="flex-1 h-9"
                disabled={exportLoading}
              >
                Select All
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSelectNone}
                className="flex-1 h-9"
                disabled={exportLoading}
              >
                Clear Selection
              </Button>
            </div>

            {/* All Categories Checkbox */}
            <div className="border rounded-lg p-4 bg-muted/30">
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="select-all"
                  checked={isAllSelected}
                  onCheckedChange={() => handleCategoryToggle("all")}
                  className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                />
                <div className="flex-1">
                  <Label htmlFor="select-all" className="text-sm font-medium cursor-pointer">
                    All Categories
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Export products from all available categories
                  </p>
                </div>
                <Badge variant="secondary" className="ml-auto">
                  {categories.length - 1} categories
                </Badge>
              </div>
            </div>

            {/* Individual Categories */}
            <div className="max-h-64 overflow-y-auto border rounded-lg bg-background">
              {filteredCategories.length > 0 ? (
                <div className="p-2 space-y-1">
                  {filteredCategories.map((category) => (
                    <div
                      key={category.value}
                      className="flex items-center space-x-3 p-3 rounded-md hover:bg-muted/50 transition-colors"
                    >
                      <Checkbox
                        id={category.value}
                        checked={selectedCategories.includes(category.value)}
                        onCheckedChange={() => handleCategoryToggle(category.value)}
                        className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                      />
                      <Label
                        htmlFor={category.value}
                        className="flex-1 text-sm font-medium cursor-pointer"
                      >
                        {category.label}
                      </Label>
                      {selectedCategories.includes(category.value) && (
                        <CheckCircle2 className="h-4 w-4 text-blue-600" />
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-muted-foreground">
                  <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No categories found matching "{searchTerm}"</p>
                </div>
              )}
            </div>

            {/* Selected Categories Summary */}
            {selectedCategories.length > 0 && !selectedCategories.includes("all") && (
              <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                    {selectedCategories.length} Categories Selected
                  </span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {selectedCategories.slice(0, 3).map((catValue) => {
                    const category = categories.find(cat => cat.value === catValue);
                    return (
                      <Badge 
                        key={catValue} 
                        variant="secondary" 
                        className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100"
                      >
                        {category?.label || catValue}
                      </Badge>
                    );
                  })}
                  {selectedCategories.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{selectedCategories.length - 3} more
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Export Progress */}
          {exportLoading && (
            <div className="space-y-3 p-4 bg-muted/30 rounded-lg">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span className="font-medium">Generating PDF Report...</span>
                </div>
              </div>
              <Progress value={33} className="w-full" />
              <p className="text-xs text-muted-foreground">
                Please wait while we compile your stock data
              </p>
            </div>
          )}

       
         
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4 border-t">
          <Button 
            onClick={handleExport} 
            disabled={exportLoading || (selectedCategories.length === 0 && !selectedCategories.includes("all"))}
            className="flex-1 bg-blue-600 hover:bg-blue-700 h-11"
          >
            {exportLoading ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Generating Report...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Export Stock Report
              </>
            )}
          </Button>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={exportLoading}
            className="px-6 h-11"
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
