/**
 * Format a number with commas as thousand separators
 * @param value - The number to format
 * @returns Formatted string (e.g., "1,500" or "1,567,898")
 */
export const formatNumber = (value: number | string | undefined | null): string => {
  if (value === undefined || value === null || value === '') {
    return '0';
  }
  
  // Convertir en nombre
  let numValue: number;
  if (typeof value === 'string') {
    // Nettoyer la chaîne : enlever les espaces, remplacer les virgules par des points
    const cleanedValue = value.toString().replace(/\s/g, '').replace(/,/g, '.').trim();
    numValue = parseFloat(cleanedValue);
  } else {
    numValue = Number(value);
  }
  
  // Vérifier si c'est un nombre valide
  if (isNaN(numValue) || !isFinite(numValue)) {
    return '0';
  }
  
  // Formater avec des virgules comme séparateurs de milliers
  // Exemple: 1500 -> "1,500", 1567898 -> "1,567,898"
  return numValue.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
};

/**
 * Format a number as currency (FCFA)
 * @param value - The number to format
 * @returns Formatted string with FCFA suffix
 */
export const formatCurrency = (value: number | string | undefined | null): string => {
  const formatted = formatNumber(value);
  return `${formatted} FCFA`;
};

