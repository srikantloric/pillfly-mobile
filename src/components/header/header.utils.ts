export function formatCartBadgeCount(count: number): string {
  if (count > 99) {
    return '99+';
  }
  return String(count);
}
