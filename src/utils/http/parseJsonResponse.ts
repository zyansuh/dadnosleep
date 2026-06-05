export async function readJsonResponse<T>(res: Response): Promise<T> {
  const text = await res.text();
  if (!text.trim()) {
    throw new Error(`서버 응답이 비어 있습니다. (${res.status})`);
  }
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error(
      res.ok
        ? '서버 응답 형식이 올바르지 않습니다.'
        : `서버에 연결할 수 없습니다. (${res.status})`,
    );
  }
}
