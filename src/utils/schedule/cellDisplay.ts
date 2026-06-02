/** 편성 셀 제목 길이에 따른 폰트 크기 */
export function cellTitleFontSize(text: string): string {
  const weight = [...text].reduce((acc, ch) => {
    const code = ch.charCodeAt(0);
    const isWide = (code >= 0xAC00 && code <= 0xD7A3)
      || (code >= 0x4E00 && code <= 0x9FFF)
      || (code >= 0x3040 && code <= 0x30FF);
    return acc + (isWide ? 2 : 1);
  }, 0);

  if (weight <= 8) return '12px';
  if (weight <= 12) return '11px';
  if (weight <= 16) return '10px';
  if (weight <= 20) return '9px';
  return '8px';
}
