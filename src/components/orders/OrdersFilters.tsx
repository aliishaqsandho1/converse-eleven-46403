import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";

interface OrdersFiltersProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  filterStatus: string;
  setFilterStatus: (value: string) => void;
  filterPaymentMethod: string;
  setFilterPaymentMethod: (value: string) => void;
  dateFrom: string;
  setDateFrom: (value: string) => void;
  dateTo: string;
  setDateTo: (value: string) => void;
  filterCustomer: string;
  setFilterCustomer: (value: string) => void;
}

export const OrdersFilters = ({
  searchTerm,
  setSearchTerm,
  filterStatus,
  setFilterStatus,
  filterPaymentMethod,
  setFilterPaymentMethod,
  dateFrom,
  setDateFrom,
  dateTo,
  setDateTo,
  filterCustomer,
  setFilterCustomer
}: OrdersFiltersProps) => {
  return (
    <>
      <div className="flex flex-col md:flex-row gap-4 mt-5 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
          <Input
            placeholder="Search by order number, customer name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger>
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterPaymentMethod} onValueChange={setFilterPaymentMethod}>
          <SelectTrigger>
            <SelectValue placeholder="Payment Method" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Methods</SelectItem>
            <SelectItem value="cash">Cash</SelectItem>
            <SelectItem value="credit">Credit</SelectItem>
            <SelectItem value="card">Card</SelectItem>
          </SelectContent>
        </Select>

        <Input
          type="date"
          placeholder="From Date"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
        />

        <Input
          type="date"
          placeholder="To Date"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
        />

        <Input
          placeholder="Customer ID"
          value={filterCustomer}
          onChange={(e) => setFilterCustomer(e.target.value)}
          type="number"
        />
      </div>
    </>
  );
};
