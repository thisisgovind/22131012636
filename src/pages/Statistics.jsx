
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { BarChart3, Clock, MapPin, MousePointer, ExternalLink, Copy } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import urlService from '@/services/urlService';
import logger from '@/middleware/logger';

const Statistics = () => {
  const [urls, setUrls] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStatistics();
  }, []);

  const loadStatistics = () => {
    setLoading(true);
    try {
      // Clean up expired URLs first
      const deletedCount = urlService.deleteExpiredURLs();
      if (deletedCount > 0) {
        logger.info('Expired URLs cleaned up on statistics page load', { deletedCount });
      }
      
      const allUrls = urlService.getAllURLs();
      setUrls(allUrls);
      logger.info('Statistics loaded', { urlCount: allUrls.length });
    } catch (error) {
      logger.error('Failed to load statistics', error);
      toast({
        title: "Error",
        description: "Failed to load statistics",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text, label) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied!",
        description: `${label} copied to clipboard`
      });
      logger.info('Text copied to clipboard from statistics', { text, label });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy to clipboard",
        variant: "destructive"
      });
      logger.error('Failed to copy to clipboard from statistics', error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const isExpired = (expiresAt) => {
    return new Date() > new Date(expiresAt);
  };

  const getStatusColor = (expiresAt) => {
    if (isExpired(expiresAt)) return 'text-red-400';
    
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diff = expiry - now;
    const minutes = Math.floor(diff / (1000 * 60));
    
    if (minutes < 60) return 'text-yellow-400';
    return 'text-green-400';
  };

  const getStatusText = (expiresAt) => {
    if (isExpired(expiresAt)) return 'Expired';
    
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diff = expiry - now;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ${hours % 24}h remaining`;
    if (hours > 0) return `${hours}h ${minutes % 60}m remaining`;
    return `${minutes}m remaining`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading statistics...</div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>URL Statistics - LinkShort</title>
        <meta name="description" content="View detailed statistics and analytics for all your shortened URLs including click data, geographical information, and expiry status." />
      </Helmet>
      
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              URL Statistics
            </h1>
            <p className="text-xl text-white/80 max-w-2xl mx-auto">
              Comprehensive analytics and insights for all your shortened URLs
            </p>
          </motion.div>

          {urls.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12"
            >
              <BarChart3 className="w-16 h-16 text-white/50 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">No URLs Found</h2>
              <p className="text-white/70">
                You haven't created any shortened URLs yet. Go to the URL Shortener page to get started!
              </p>
            </motion.div>
          ) : (
            <div className="space-y-6">
              {urls.map((url, index) => (
                <motion.div
                  key={url.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="bg-white/10 backdrop-blur-md border-white/20">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between text-white">
                        <div className="flex items-center space-x-2">
                          <BarChart3 className="w-5 h-5" />
                          <span className="truncate">{url.shortCode}</span>
                        </div>
                        <div className={`flex items-center space-x-1 text-sm ${getStatusColor(url.expiresAt)}`}>
                          <Clock className="w-4 h-4" />
                          <span>{getStatusText(url.expiresAt)}</span>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* URL Information */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
                      </div>

                      {/* Statistics Summary */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-white/5 p-3 rounded-lg text-center">
                          <MousePointer className="w-6 h-6 text-blue-400 mx-auto mb-1" />
                          <p className="text-2xl font-bold text-white">{url.totalClicks}</p>
                          <p className="text-white/70 text-sm">Total Clicks</p>
                        </div>
                        
                        <div className="bg-white/5 p-3 rounded-lg text-center">
                          <Clock className="w-6 h-6 text-green-400 mx-auto mb-1" />
                          <p className="text-lg font-bold text-white">{formatDate(url.createdAt).split(',')[0]}</p>
                          <p className="text-white/70 text-sm">Created</p>
                        </div>
                        
                        <div className="bg-white/5 p-3 rounded-lg text-center">
                          <Clock className="w-6 h-6 text-orange-400 mx-auto mb-1" />
                          <p className="text-lg font-bold text-white">{formatDate(url.expiresAt).split(',')[0]}</p>
                          <p className="text-white/70 text-sm">Expires</p>
                        </div>
                        
                        <div className="bg-white/5 p-3 rounded-lg text-center">
                          <BarChart3 className="w-6 h-6 text-purple-400 mx-auto mb-1" />
                          <p className="text-lg font-bold text-white">{url.validityMinutes}m</p>
                          <p className="text-white/70 text-sm">Validity</p>
                        </div>
                      </div>

                      {/* Click Details */}
                      {url.clicks && url.clicks.length > 0 && (
                        <div>
                          <h3 className="text-white font-semibold mb-3 flex items-center space-x-2">
                            <MousePointer className="w-4 h-4" />
                            <span>Click Details</span>
                          </h3>
                          <div className="space-y-2 max-h-60 overflow-y-auto">
                            {url.clicks.map((click, clickIndex) => (
                              <div
                                key={click.id}
                                className="bg-white/5 p-3 rounded-lg flex items-center justify-between text-sm"
                              >
                                <div className="flex items-center space-x-4">
                                  <div>
                                    <p className="text-white font-medium">
                                      {formatDate(click.timestamp)}
                                    </p>
                                    <p className="text-white/70">Source: {click.source}</p>
                                  </div>
                                  <div className="flex items-center space-x-1 text-white/70">
                                    <MapPin className="w-4 h-4" />
                                    <span>{click.location}</span>
                                  </div>
                                </div>
                                <div className="text-white/50 text-xs">
                                  #{clickIndex + 1}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Statistics;
