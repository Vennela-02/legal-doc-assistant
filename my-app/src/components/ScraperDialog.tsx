import React, { useState } from 'react';
import { Globe, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface ScraperDialogProps {
  onScrapeUrl: (url: string) => Promise<void>;
  isScraping: boolean;
}

export const ScraperDialog: React.FC<ScraperDialogProps> = ({ onScrapeUrl, isScraping }) => {
  const [scrapeUrl, setScrapeUrl] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const handleScrapeUrl = async () => {
    if (scrapeUrl.trim()) {
      await onScrapeUrl(scrapeUrl.trim());
      setScrapeUrl('');
      setIsOpen(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="w-full gap-2 text-sm"
          disabled={isScraping}
        >
          {isScraping ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Scraping...
            </>
          ) : (
            <>
              <Globe className="w-4 h-4" />
              Scrape Website
            </>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Scrape Website Content</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Website URL</label>
            <Input
              value={scrapeUrl}
              onChange={(e) => setScrapeUrl(e.target.value)}
              placeholder="https://example.com"
              className="mt-1"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleScrapeUrl();
                }
              }}
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={handleScrapeUrl} disabled={isScraping || !scrapeUrl.trim()} className="flex-1">
              {isScraping ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Scraping...
                </>
              ) : (
                <>
                  <Globe className="w-4 h-4 mr-2" />
                  Scrape Content
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
