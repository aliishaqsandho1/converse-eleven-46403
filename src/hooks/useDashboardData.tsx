
import { useQuery } from "@tanstack/react-query";
import { dashboardApi } from "@/services/api";
import { reportsApi } from "@/services/reportsApi";

export function useDashboardData() {
  // Fetch dashboard data
  const { data: enhancedStats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard-enhanced-stats'],
    queryFn: dashboardApi.getEnhancedStats,
  });

  const { data: categoryPerformance, isLoading: categoryLoading } = useQuery({
    queryKey: ['dashboard-category-performance'],
    queryFn: dashboardApi.getCategoryPerformance,
  });

  const { data: dailySales, isLoading: salesLoading } = useQuery({
    queryKey: ['dashboard-daily-sales'],
    queryFn: dashboardApi.getDailySales,
  });

  const { data: inventoryStatus, isLoading: inventoryLoading } = useQuery({
    queryKey: ['dashboard-inventory-status'],
    queryFn: dashboardApi.getInventoryStatus,
  });

  // Fetch reports data for Analytics and Reports tabs
  const { data: salesReport, isLoading: salesReportLoading } = useQuery({
    queryKey: ['sales-report-monthly'],
    queryFn: () => reportsApi.getSalesReport({ period: 'daily' }),
  });

  const { data: inventoryReport, isLoading: inventoryReportLoading } = useQuery({
    queryKey: ['inventory-report'],
    queryFn: reportsApi.getInventoryReport,
  });

  const { data: financialReport, isLoading: financialReportLoading } = useQuery({
    queryKey: ['financial-report'],
    queryFn: () => reportsApi.getFinancialReport({ period: 'monthly', year: 2025 }),
  });

  const isLoading = statsLoading || categoryLoading || salesLoading || inventoryLoading;

  return {
    enhancedStats,
    categoryPerformance,
    dailySales,
    inventoryStatus,
    salesReport,
    inventoryReport,
    financialReport,
    isLoading,
    statsLoading,
    categoryLoading,
    salesLoading,
    inventoryLoading,
    salesReportLoading,
    inventoryReportLoading,
    financialReportLoading,
  };
}
