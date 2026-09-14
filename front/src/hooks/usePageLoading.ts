import { useState, useCallback, useEffect } from 'react';

export const usePageLoading = (initialLoading = true, delay = 500) => {
  const [loading, setLoading] = useState(initialLoading);

  const startLoading = useCallback(() => setLoading(true), []);

  const stopLoading = useCallback(() => {
    setTimeout(() => setLoading(false), delay);
  }, [delay]);

  useEffect(() => {
    if (initialLoading) {
      stopLoading();
    }
  }, [initialLoading, stopLoading]);

  return { loading, startLoading, stopLoading };
};