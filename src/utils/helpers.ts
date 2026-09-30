export function formatPrice(price: number): string {
  return `Rs. ${price.toLocaleString('en-PK')}`;
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-PK', {
    year: 'numeric', month: 'long', day: 'numeric'
  });
}

export function generateStars(rating: number): string[] {
  return Array.from({ length: 5 }, (_, i) => {
    if (i < Math.floor(rating)) return 'full';
    if (i < rating) return 'half';
    return 'empty';
  });
}

export function slugify(text: string): string {
  return text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
}

export function truncate(text: string, len: number): string {
  return text.length > len ? text.slice(0, len) + '...' : text;
}

export function getDiscountPercent(original: number, current: number): number {
  return Math.round(((original - current) / original) * 100);
}
