import { useCallback, useEffect, useRef, useState } from 'react';

export interface UseAsyncResourceResult<T> {
  data: T | null;
  error: string;
  isLoading: boolean;
  refetch: () => void;
}

export const useAsyncResource = <T>(
  key: string | null,
  load: (signal: AbortSignal) => Promise<T>,
): UseAsyncResourceResult<T> => {
  const [revision, setRevision] = useState(0);
  const requestKey = JSON.stringify([key, revision]);
  const loader = useRef(load);
  const [result, setResult] = useState<{
    key: string;
    data: T | null;
    error: string;
  }>({ key: '', data: null, error: '' });

  useEffect(() => {
    loader.current = load;
  }, [load]);

  useEffect(() => {
    if (!key) return;
    const controller = new AbortController();

    loader
      .current(controller.signal)
      .then((data) => {
        if (!controller.signal.aborted) setResult({ key: requestKey, data, error: '' });
      })
      .catch((error: Error) => {
        if (!controller.signal.aborted) {
          setResult({ key: requestKey, data: null, error: error.message });
        }
      });

    return () => controller.abort();
  }, [key, requestKey]);

  const refetch = useCallback(() => setRevision((value) => value + 1), []);

  return {
    data: key && result.key === requestKey ? result.data : null,
    error: key && result.key === requestKey ? result.error : '',
    isLoading: key !== null && result.key !== requestKey,
    refetch,
  };
};
