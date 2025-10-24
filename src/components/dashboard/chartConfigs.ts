
export const cashFlowChartConfig = {
  inflow: {
    label: "Cash Inflow",
    color: "#10b981",
  },
  outflow: {
    label: "Cash Outflow",
    color: "#ef4444",
  },
  net: {
    label: "Net Cash Flow",
    color: "#3b82f6",
  },
}

// Enhanced color palette for better visual separation
export const defaultColors = [
  "#3B82F6", // Blue - Primary
  "#10B981", // Emerald - Success
  "#F59E0B", // Amber - Warning
  "#EF4444", // Red - Danger
  "#8B5CF6", // Purple
  "#EC4899", // Pink
  "#06B6D4", // Cyan
  "#84CC16", // Lime
  "#F97316", // Orange
  "#6366F1", // Indigo
  "#14B8A6", // Teal
  "#F59E0B", // Yellow
];

// Updated category config with more distinct colors
export const categoryChartConfig = {
  "UV Sheets": { label: "UV Sheets", color: "#3B82F6" },
  "Taj Sheets": { label: "Taj Sheets", color: "#10B981" },
  "ZRK": { label: "ZRK", color: "#F59E0B" },
  "Lamination": { label: "Lamination", color: "#EF4444" },
  "Test Category": { label: "Test Category", color: "#8B5CF6" },
  "PATEX": { label: "PATEX", color: "#06B6D4" },
  "LMDF": { label: "LMDF", color: "#84CC16" },
  "ASH VEENIER": { label: "ASH VEENIER", color: "#F97316" },
  sheets: { label: "Sheets", color: "#3b82f6" },
  uncategorized: { label: "Uncategorized", color: "#ef4444" },
  new: { label: "New", color: "#10b981" },
  electronics: { label: "Electronics", color: "#f59e0b" },
  plus: { label: "Plus", color: "#8b5cf6" },
}

export const salesChartConfig = {
  sales: {
    label: "Actual Sales",
    color: "#10b981",
  },
  target: {
    label: "Target",
    color: "#f59e0b",
  },
}

export const inventoryChartConfig = {
  stock: {
    label: "Current Stock",
    color: "#3b82f6",
  },
  sold: {
    label: "Units Sold",
    color: "#10b981",
  },
  reorderLevel: {
    label: "Reorder Level",
    color: "#ef4444",
  },
}
