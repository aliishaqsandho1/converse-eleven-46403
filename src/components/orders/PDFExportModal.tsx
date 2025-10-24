
import { useState } from 'react';
import { CustomerSelectionModal } from './CustomerSelectionModal';
import { CustomerPickerModal } from './CustomerPickerModal';
import { DateRangeModal } from './DateRangeModal';

interface PDFExportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onExport: (options: ExportOptions) => void;
  customers: Array<{ id: number; name: string }>;
  isLoading: boolean;
}

export interface ExportOptions {
  customerScope: 'all' | 'single' | 'multiple';
  selectedCustomers: number[];
  timeScope: 'all' | 'today' | 'weekly' | 'monthly' | 'custom';
  startDate?: string;
  endDate?: string;
}

export const PDFExportModal = ({ 
  open, 
  onOpenChange, 
  onExport, 
  customers, 
  isLoading 
}: PDFExportModalProps) => {
  const [currentStep, setCurrentStep] = useState<'customer' | 'picker' | 'date'>('customer');
  const [customerScope, setCustomerScope] = useState<'all' | 'single' | 'multiple'>('all');
  const [selectedCustomers, setSelectedCustomers] = useState<number[]>([]);

  const handleCustomerSelection = (scope: 'all' | 'single' | 'multiple') => {
    setCustomerScope(scope);
    setSelectedCustomers([]);
    
    if (scope === 'all') {
      setCurrentStep('date');
    } else {
      setCurrentStep('picker');
    }
  };

  const handleCustomerPickerNext = () => {
    setCurrentStep('date');
  };

  const handleExport = (timeScope: string, startDate?: string, endDate?: string) => {
    const options: ExportOptions = {
      customerScope,
      selectedCustomers,
      timeScope: timeScope as any,
      startDate,
      endDate,
    };
    onExport(options);
    handleClose();
  };

  const handleClose = () => {
    setCurrentStep('customer');
    setCustomerScope('all');
    setSelectedCustomers([]);
    onOpenChange(false);
  };

  return (
    <>
      <CustomerSelectionModal
        open={open && currentStep === 'customer'}
        onOpenChange={handleClose}
        onSelection={handleCustomerSelection}
      />

      <CustomerPickerModal
        open={open && currentStep === 'picker'}
        onOpenChange={handleClose}
        customers={customers}
        selectedCustomers={selectedCustomers}
        onCustomersSelected={setSelectedCustomers}
        onNext={handleCustomerPickerNext}
        isSingleMode={customerScope === 'single'}
      />

      <DateRangeModal
        open={open && currentStep === 'date'}
        onOpenChange={handleClose}
        onExport={handleExport}
        isLoading={isLoading}
      />
    </>
  );
};
