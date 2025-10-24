
export const generateSKU = (productName: string): string => {
  if (!productName.trim()) {
    return '';
  }

  // Convert to uppercase, remove special characters, and take first 3 words
  const cleanName = productName
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9\s]/g, '') // Remove special characters
    .split(' ')
    .filter(word => word.length > 0)
    .slice(0, 3) // Take first 3 words
    .join('');

  // Extract numbers from the product name
  const numbersInName = productName.match(/\d+/g);
  let numberSuffix: string;
  
  if (numbersInName && numbersInName.length > 0) {
    // Use the first number found in the name, pad to 3 digits if needed
    const firstNumber = parseInt(numbersInName[0]);
    numberSuffix = firstNumber.toString().padStart(3, '0');
  } else {
    // Generate a random 3-digit number if no numbers in name
    numberSuffix = (Math.floor(Math.random() * 900) + 100).toString();
  }

  // Combine name abbreviation with number
  const sku = `${cleanName.substring(0, 6)}${numberSuffix}`;
  
  return sku;
};
