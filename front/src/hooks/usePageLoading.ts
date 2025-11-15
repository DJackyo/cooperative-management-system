import { useState, useEffect } from 'react';

export const usePageLoading = (initialLoading = true, delay = 500) => {
  const [loading, setLoading] = useState(initialLoading);

  const startLoading = () => setLoading(true);
  const stopLoading = () => {
    setTimeout(() => setLoading(false), delay);
  };

  useEffect(() => {
    if (initialLoading) {
      stopLoading();
    }
  }, [initialLoading, delay]);

  return { loading, startLoading, stopLoading };
};