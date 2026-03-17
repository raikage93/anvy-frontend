export function formatVND(value: string | number): string {
  const num = typeof value === 'string' ? parseInt(value.replace(/\D/g, ''), 10) : value;
  if (isNaN(num) || num === 0) return '';
  return num.toLocaleString('vi-VN');
}

export function parseAmount(formatted: string): number {
  return parseInt(formatted.replace(/\D/g, ''), 10) || 0;
}

export function readNumber(n: number): string {
  if (n === 0) return 'không đồng';
  
  const units = ['', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín'];
  const groups = ['', 'nghìn', 'triệu', 'tỷ'];
  
  const readGroup = (num: number): string => {
    const h = Math.floor(num / 100);
    const t = Math.floor((num % 100) / 10);
    const u = num % 10;
    let result = '';
    
    if (h > 0) result += units[h] + ' trăm ';
    if (t > 1) result += units[t] + ' mươi ';
    else if (t === 1) result += 'mười ';
    else if (h > 0 && u > 0) result += 'lẻ ';
    
    if (t > 1 && u === 1) result += 'mốt';
    else if (t >= 1 && u === 5) result += 'lăm';
    else if (u > 0) result += units[u];
    
    return result.trim();
  };
  
  const parts: string[] = [];
  let remaining = n;
  let groupIndex = 0;
  
  while (remaining > 0) {
    const group = remaining % 1000;
    if (group > 0) {
      parts.unshift(readGroup(group) + (groups[groupIndex] ? ' ' + groups[groupIndex] : ''));
    }
    remaining = Math.floor(remaining / 1000);
    groupIndex++;
  }
  
  return parts.join(' ') + ' đồng';
}
