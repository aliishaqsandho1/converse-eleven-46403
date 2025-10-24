
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Helper function to format quantity properly for decimal values
export const formatQuantity = (quantity: any): string => {
  // Handle null, undefined, or empty values
  if (quantity === null || quantity === undefined || quantity === '') {
    return '0';
  }
  
  // Convert to number if it's a string or other type
  const numQuantity = Number(quantity);
  
  // Check if conversion resulted in NaN
  if (isNaN(numQuantity)) {
    return '0';
  }
  
  // If quantity is a whole number, show without decimals
  if (numQuantity % 1 === 0) {
    return numQuantity.toString();
  }
  
  // If quantity has decimals, show up to 2 decimal places, removing trailing zeros
  return parseFloat(numQuantity.toFixed(2)).toString();
};
