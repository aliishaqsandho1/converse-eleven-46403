
import { Button } from "@/components/ui/button";
import { FileText, RefreshCw } from "lucide-react";

interface OrdersHeaderProps {
  onPDFExport: () => void;
  exportLoading: boolean;
}

export const OrdersHeader = ({ onPDFExport, exportLoading }: OrdersHeaderProps) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
      <div className="flex items-center gap-2">
        <div>
          <h1 className="text-3xl font-bold text-slate-500">Sales Management</h1>
          <p className="text-slate-600">View and manage all customer orders</p>
        </div>
      </div>
      <div className="flex gap-2 w-full md:w-auto">
        <Button 
          variant="outline" 
          onClick={onPDFExport}
          disabled={exportLoading}
          className="bg-red-600 hover:bg-red-700 text-white border-red-600 w-full sm:w-auto"
        >
          {exportLoading ? (
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <FileText className="h-4 w-4 mr-2" />
          )}
          {exportLoading ? 'Exporting...' : 'Export Orders'}
        </Button>
      </div>
    </div>
  );
};
