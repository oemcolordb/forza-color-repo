// Country flag emoji mapping
export const countryFlags: Record<string, string> = {
  // Primary countries from car data
  'United States': '🇺🇸',
  'USA': '🇺🇸',
  'Germany': '🇩🇪',
  'Japan': '🇯🇵',
  'Italy': '🇮🇹',
  'United Kingdom': '🇬🇧',
  'UK': '🇬🇧',
  'Britain': '🇬🇧',
  'France': '🇫🇷',
  
  // Additional automotive countries
  'Sweden': '🇸🇪',
  'South Korea': '🇰🇷',
  'Korea': '🇰🇷',
  'Spain': '🇪🇸',
  'Netherlands': '🇳🇱',
  'Austria': '🇦🇹',
  'Czech Republic': '🇨🇿',
  'Australia': '🇦🇺',
  'Canada': '🇨🇦',
  'Switzerland': '🇨🇭',
  'Belgium': '🇧🇪',
  'Norway': '🇳🇴',
  'Denmark': '🇩🇰',
  'Finland': '🇫🇮',
  'Poland': '🇵🇱',
  'Russia': '🇷🇺',
  'China': '🇨🇳',
  'India': '🇮🇳',
  'Brazil': '🇧🇷',
  'Mexico': '🇲🇽',
  'Argentina': '🇦🇷',
  'Chile': '🇨🇱',
  'Colombia': '🇨🇴',
  'Venezuela': '🇻🇪',
  'Peru': '🇵🇪',
  'Ecuador': '🇪🇨',
  'Uruguay': '🇺🇾',
  'Paraguay': '🇵🇾',
  'Bolivia': '🇧🇴',
  'Guyana': '🇬🇾',
  'Suriname': '🇸🇷',
  'French Guiana': '🇬🇫'
};

export function getCountryFlag(country: string): string {
  return countryFlags[country] || '🏁';
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}