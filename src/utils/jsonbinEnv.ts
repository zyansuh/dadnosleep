/** JSONBin Access Key — .env 에 따옴표가 있어도 제거 */
export function getJsonBinAccessKey(): string {
  const raw = (import.meta.env.VITE_JSONBIN_ACCESS_KEY as string) ?? '';
  return raw.replace(/^["']|["']$/g, '').trim();
}

export function getCommunityBinId(): string {
  return ((import.meta.env.VITE_JSONBIN_BIN_ID as string) ?? '').trim();
}

/** 전용 Bin 없으면 후기 Bin(VITE_JSONBIN_BIN_ID)에 members 필드로 저장 */
export function getMembersBinId(): string {
  const dedicated = (import.meta.env.VITE_JSONBIN_BIN_MEMBERS as string) ?? '';
  if (dedicated.trim()) return dedicated.trim();
  return getCommunityBinId();
}

export function usesSharedCommunityBinForMembers(): boolean {
  const dedicated = (import.meta.env.VITE_JSONBIN_BIN_MEMBERS as string) ?? '';
  return !dedicated.trim() && Boolean(getCommunityBinId());
}

export function hasJsonBinAccessKey(): boolean {
  return Boolean(getJsonBinAccessKey());
}

export function hasMembersBinConfigured(): boolean {
  return Boolean(getMembersBinId() && getJsonBinAccessKey());
}

/** JSONBin Access Key 자리에 bcrypt 해시 등을 넣은 경우 (읽기 401 → 빈 명단) */
export function looksLikeInvalidJsonBinAccessKey(): boolean {
  const key = getJsonBinAccessKey();
  return key.startsWith('$2a$') || key.startsWith('$2b$');
}
