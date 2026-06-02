import { useEffect, useRef } from 'react';

/** effect에서 최신 props/state를 읽을 때 사용 (render 중 ref 갱신 금지 대응) */
export function useLatestRef<T>(value: T) {
  const ref = useRef(value);
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref;
}
