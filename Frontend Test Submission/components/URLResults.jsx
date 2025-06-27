
import React from 'react';
import { motion } from 'framer-motion';
import { Copy, ExternalLink, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import logger from '@/middleware/logger';

const URLResults = ({ urls }) => {
  const copyToClipboard = async (text, label) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied!",
        description: `${label} copied to clipboard`
      });
      logger.info('Text copied to clipboard', { text, label });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy to clipboard",
        variant: "destructive"
      });
      logger.error('Failed to copy to clipboard', error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const getTimeRemaining = (expiresAt) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diff = expiry - now;
    
    if (diff <= 0) return 'Expired';
    
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ${hours % 24}h remaining`;
    if (hours > 0) return `${hours}h ${minutes % 60}m remaining`;
    return `${minutes}m remaining`;
  };

  if (!urls || urls.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-white mb-4">Your Shortened URLs</h2>
      
      {urls.map((url, index) => (
        <motion.div
          key={url.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-white flex items-center justify-between">
                <span className="truncate">Short URL #{index + 1}</span>
                <div className="flex items-center space-x-1 text-sm text-white/70">
                  <Clock className="w-4 h-4" />
                  <span>{getTimeRemaining(url.expiresAt)}</span>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-white/70 text-sm mb-1">Original URL:</p>
                <div className="flex items-center space-x-2">
                  <p className="text-white bg-white/5 p-2 rounded flex-1 truncate text-sm">
                    {url.originalURL}
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(url.originalURL, 'Original URL')}
                    className="text-white/70 hover:text-white hover:bg-white/10"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              <div>
                <p className="text-white/70 text-sm mb-1">Short URL:</p>
                <div className="flex items-center space-x-2">
                  <p className="text-white bg-gradient-to-r from-purple-500/20 to-pink-500/20 p-2 rounded flex-1 font-mono text-sm">
                    {url.shortURL}
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(url.shortURL, 'Short URL')}
                    className="text-white/70 hover:text-white hover:bg-white/10"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(url.shortURL, '_blank')}
                    className="text-white/70 hover:text-white hover:bg-white/10"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-white/70">Created:</p>
                  <p className="text-white">{formatDate(url.createdAt)}</p>
                </div>
                <div>
                  <p className="text-white/70">Expires:</p>
                  <p className="text-white">{formatDate(url.expiresAt)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};

export default URLResults;
