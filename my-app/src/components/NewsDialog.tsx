import React, { useState } from 'react';
import { Newspaper, Search, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface NewsDialogProps {
  onFetchNews: (query: string) => Promise<void>;
  isLoadingNews: boolean;
}

export const NewsDialog: React.FC<NewsDialogProps> = ({ onFetchNews, isLoadingNews }) => {
  const [newsQuery, setNewsQuery] = useState('law');
  const [isOpen, setIsOpen] = useState(false);

  const handleFetchNews = async () => {
    await onFetchNews(newsQuery);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="w-full gap-2 text-sm"
          disabled={isLoadingNews}
        >
          {isLoadingNews ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Fetching News...
            </>
          ) : (
            <>
              <Newspaper className="w-4 h-4" />
              Get Legal News
            </>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Fetch Legal News</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Search Query</label>
            <Input
              value={newsQuery}
              onChange={(e) => setNewsQuery(e.target.value)}
              placeholder="Enter news search query (e.g., law, legal, court)"
              className="mt-1"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleFetchNews();
                }
              }}
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={handleFetchNews} disabled={isLoadingNews || !newsQuery.trim()} className="flex-1">
              {isLoadingNews ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Fetching...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4 mr-2" />
                  Fetch News
                </>
              )}
            </Button>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
