import { useState, useEffect } from 'react';
import client from '../api/client';

export const useNewsData = (sourceId) => {
  const [news, setNews] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchNews = async () => {
    if (!sourceId) {
      setNews([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Use configured Axios client
      const response = await client.get(`/news`, {
        params: { sourceId }
      });

      const result = response.data;

      // Check if the response has the expected structure
      if (result.success && result.data) {
        setNews(result.data);
      } else {
        throw new Error('Invalid response format from API');
      }
    } catch (err) {
      console.error('Error fetching news:', err);
      // Axios error handling
      const errorMessage = err.response?.data?.error || err.message || 'Failed to fetch news';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, [sourceId]);

  return { news, isLoading, error, refetch: fetchNews };
};