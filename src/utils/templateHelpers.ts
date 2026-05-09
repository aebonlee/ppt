export function formatPageNumber(num: number, format: string): string {
  switch (format) {
    case 'pad3': return String(num).padStart(3, '0');
    case 'pad2': return String(num).padStart(2, '0');
    case 'dash': return `\u2014 ${String(num).padStart(3, '0')} \u2014`;
    case 'plain': return String(num);
    default: return String(num).padStart(3, '0');
  }
}

export function getBulletChar(style: string): string {
  switch (style) {
    case 'diamond': return '\u2666';
    case 'circle': return '\u25CF';
    case 'dash': return '\u2013';
    case 'none': return '';
    default: return '\u2666';
  }
}

export function getShapeBorderRadius(shape: string, size: number): string {
  switch (shape) {
    case 'circle': return '50%';
    case 'rounded': return `${Math.round(size * 0.2)}px`;
    case 'pill': return `${Math.round(size / 2)}px`;
    case 'square': return '0px';
    default: return '0px';
  }
}
