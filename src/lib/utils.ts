export function getReadingTime(content: string): number {
  const CHARS_PER_MINUTE = 500;
  const charCount = content.replace(/\s/g, '').length;
  return Math.max(1, Math.ceil(charCount / CHARS_PER_MINUTE));
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
