import { FurnitureProduct } from '../types/furniture';

export const formatPrice = (price: string): string => {
  return price;
};

export const truncateDescription = (description: string, maxLength: number = 80): string => {
  if (description.length <= maxLength) return description;
  return description.substring(0, maxLength) + '...';
};

export const scrollToElement = (elementId: string): void => {
  const element = document.getElementById(elementId);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' });
  }
};

export const filterProductsByCategory = (
  products: FurnitureProduct[], 
  category: string
): FurnitureProduct[] => {
  if (category === 'all') return products;
  return products.filter(product => product.category === category);
};

export const validateImageUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const getProductsByCategory = (
  products: FurnitureProduct[]
): Record<string, number> => {
  const categoryCounts: Record<string, number> = {};
  
  products.forEach(product => {
    categoryCounts[product.category] = (categoryCounts[product.category] || 0) + 1;
  });
  
  return categoryCounts;
};
