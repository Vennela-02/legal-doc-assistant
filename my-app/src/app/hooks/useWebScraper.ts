import { useState } from 'react';

const API_BASE_URL = 'http://localhost:8000';

interface ScrapeResponse {
  content?: string;
  error?: string;
}

interface UseWebScraperProps {
  onMessage: (type: 'bot' | 'user', content: string, isFile?: boolean, updateId?: number) => any;
}

export const useWebScraper = ({ onMessage }: UseWebScraperProps) => {
  const [isScraping, setIsScraping] = useState(false);

  const scrapeUrl = async (url: string) => {
    if (!url.trim()) {
      onMessage('bot', '❌ Please enter a valid URL to scrape.');
      return { success: false, error: 'Empty URL' };
    }

    // Basic URL validation
    const urlPattern = /^https?:\/\/.+/;
    if (!urlPattern.test(url.trim())) {
      onMessage('bot', '❌ Please enter a valid URL starting with http:// or https://');
      return { success: false, error: 'Invalid URL format' };
    }

    setIsScraping(true);
    
    // Add user message to show what they're scraping
    onMessage('user', `🌐 Scraping content from: ${url}`, false);
    
    try {
      const formData = new FormData();
      formData.append('url', url.trim());

      const response = await fetch(`${API_BASE_URL}/scrape`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        if (response.status === 500) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || 'Server error occurred while scraping');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ScrapeResponse = await response.json();

      if (data.content && data.content.trim()) {
        // Truncate content if too long for display
        const maxLength = 2000;
        let content = data.content.trim();
        
        if (content.length > maxLength) {
          content = content.substring(0, maxLength) + '...\n\n[Content truncated - showing first 2000 characters]';
        }

        // Format the scraped content nicely
        const formattedContent = `🌐 **Scraped Content from ${url}:**\n\n${content}\n\n*You can now ask questions about this content!*`;
        onMessage('bot', formattedContent);
        return { success: true, content: data.content };
      } else {
        const errorMsg = data.error || 'No content could be extracted from this URL. The site might be blocking scraping or the content might not be accessible.';
        
        // Handle specific error cases
        if (errorMsg.includes('Redirect')) {
          onMessage('bot', '❌ This website blocks web scraping or redirects requests. Please try a different URL or use a supported site.');
        } else {
          onMessage('bot', `❌ Scraping failed: ${errorMsg}`);
        }
        
        return { success: false, error: errorMsg };
      }
    } catch (error) {
      console.error('Error scraping URL:', error);
      const errorMessage = error instanceof Error ? error.message : 'Network error occurred';
      
      // Provide more helpful error messages
      if (errorMessage.includes('fetch') || errorMessage.includes('NetworkError')) {
        onMessage('bot', '❌ Connection error: Unable to reach the scraping service. Please check your internet connection and ensure the backend server is running.');
      } else if (errorMessage.includes('timeout')) {
        onMessage('bot', '❌ Timeout error: The website took too long to respond. Please try a different URL or try again later.');
      } else if (errorMessage.includes('403') || errorMessage.includes('Forbidden')) {
        onMessage('bot', '❌ Access denied: This website blocks automated access. Please try a different URL.');
      } else if (errorMessage.includes('404')) {
        onMessage('bot', '❌ Page not found: The URL you provided does not exist. Please check the URL and try again.');
      } else {
        onMessage('bot', `❌ Error scraping URL: ${errorMessage}. Please try a different URL or try again later.`);
      }
      
      return { success: false, error: errorMessage };
    } finally {
      setIsScraping(false);
    }
  };

  return {
    scrapeUrl,
    isScraping
  };
};

export default useWebScraper;
