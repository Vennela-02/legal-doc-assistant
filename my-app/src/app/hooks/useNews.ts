import { useState } from 'react';

const API_BASE_URL = 'http://localhost:8000';

interface NewsArticle {
  title: string;
  url: string;
  source: string;
}

interface NewsResponse {
  news?: NewsArticle[];
  error?: string;
}

interface UseNewsProps {
  onMessage: (type: 'bot' | 'user', content: string, isFile?: boolean, updateId?: number) => any;
}

export const useNews = ({ onMessage }: UseNewsProps) => {
  const [isLoadingNews, setIsLoadingNews] = useState(false);

  const fetchNews = async (query: string = 'law') => {
    if (!query.trim()) {
      onMessage('bot', '❌ Please enter a search query for news.');
      return { success: false, error: 'Empty query' };
    }

    setIsLoadingNews(true);
    
    // Add user message to show what they're searching for
    onMessage('user', `🔍 Searching for news: "${query}"`, false);
    
    try {
      const response = await fetch(`${API_BASE_URL}/news?query=${encodeURIComponent(query.trim())}`);
      
      if (!response.ok) {
        if (response.status === 500) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || 'Server error occurred while fetching news');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: NewsResponse = await response.json();

      if (data.news && data.news.length > 0) {
        // Format news articles for display with better formatting
        const newsContent = data.news
          .slice(0, 5) // Limit to top 5 articles
          .map((article, index) => {
            const title = article.title.length > 100 
              ? article.title.substring(0, 100) + '...' 
              : article.title;
            return `**${index + 1}. ${title}**\n   📰 Source: ${article.source}\n   🔗 Link: ${article.url}`;
          })
          .join('\n\n');

        onMessage('bot', `📰 **Latest Legal News for "${query}":**\n\n${newsContent}\n\n*Click on the links to read full articles*`);
        return { success: true, articles: data.news };
      } else {
        const errorMsg = data.error || `No news articles found for "${query}". Try different keywords like "legal", "court", "law", or "legislation".`;
        onMessage('bot', `❌ ${errorMsg}`);
        return { success: false, error: errorMsg };
      }
    } catch (error) {
      console.error('Error fetching news:', error);
      const errorMessage = error instanceof Error ? error.message : 'Network error occurred';
      
      // Provide more helpful error messages
      if (errorMessage.includes('fetch') || errorMessage.includes('NetworkError')) {
        onMessage('bot', '❌ Connection error: Unable to reach the news service. Please check your internet connection and ensure the backend server is running.');
      } else if (errorMessage.includes('NEWS_API_KEY')) {
        onMessage('bot', '❌ News service configuration error: API key is missing. Please contact the administrator to configure the news service.');
      } else {
        onMessage('bot', `❌ Error fetching news: ${errorMessage}. Please try again with different keywords.`);
      }
      
      return { success: false, error: errorMessage };
    } finally {
      setIsLoadingNews(false);
    }
  };

  return {
    fetchNews,
    isLoadingNews
  };
};

export default useNews;
