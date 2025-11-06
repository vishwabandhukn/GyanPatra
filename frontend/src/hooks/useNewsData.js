import { useState, useEffect } from 'react';

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
      // Use the correct backend API endpoint with query parameter
        const response = await fetch(`http://localhost:8001/api/news?sourceId=${sourceId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch news');
      }
      const result = await response.json();
      
      // Check if the response has the expected structure
      if (result.success && result.data) {
        setNews(result.data);
      } else {
        throw new Error('Invalid response format from API');
      }
    } catch (err) {
      console.error('Error fetching news:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, [sourceId]);

  return { news, isLoading, error, refetch: fetchNews };
};