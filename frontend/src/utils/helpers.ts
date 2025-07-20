export const formatFileSize = (bytes?: number): string => {
  if (!bytes) return '';
  
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(1)} ${units[unitIndex]}`;
};

export function formatDuration(seconds?: number): string {
  if (!seconds || isNaN(seconds)) return 'N/A';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function getFormatField(format: any, keys: string[]): any {
  for (const key of keys) {
    if (format[key] !== undefined) return format[key];
  }
  return undefined;
} 