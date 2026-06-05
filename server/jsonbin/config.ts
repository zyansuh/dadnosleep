export function getServerJsonBinAccessKey(): string {
  const raw = process.env.JSONBIN_ACCESS_KEY
    ?? process.env.VITE_JSONBIN_ACCESS_KEY
    ?? '';
  return raw.replace(/^["']|["']$/g, '').trim();
}

export function getServerCommunityBinId(): string {
  return (process.env.JSONBIN_BIN_ID
    ?? process.env.VITE_JSONBIN_BIN_ID
    ?? '').trim();
}

export function hasServerJsonBin(): boolean {
  return Boolean(getServerJsonBinAccessKey() && getServerCommunityBinId());
}
