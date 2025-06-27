
import React, { useEffect, useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ExternalLink, Clock, AlertCircle } from 'lucide-react';
import urlService from '@/services/urlService';
import logger from '@/middleware/logger';

const RedirectHandler = () => {
  const { shortCode } = useParams();
  const [status, setStatus] = useState('loading'); // loading, redirecting, expired, notfound
  const [urlData, setUrlData] = useState(null);
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    handleRedirect();
  }, [shortCode]);

  useEffect(() => {
    if (status === 'redirecting' && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (status === 'redirecting' && countdown === 0) {
      window.location.href = urlData.originalURL;
    }
  }, [status, countdown, urlData]);

  const handleRedirect = async () => {
    try {
      logger.info('Attempting to redirect', { shortCode });
      
      const url = urlService.getURLByShortCode(shortCode);
      
      if (!url) {
        setStatus('notfound');
        logger.warn('Short URL not found', { shortCode });
        return;
      }

      if (urlService.isURLExpired(url)) {
        setStatus('expired');
        logger.warn('Short URL expired', { shortCode, expiresAt: url.expiresAt });
        return;
      }

      // Record the click
      await urlService.recordClick(shortCode, 'direct');
      
      setUrlData(url);
      setStatus('redirecting');
      logger.info('Redirecting to original URL', { shortCode, originalURL: url.originalURL });
      
    } catch (error) {
      logger.error('Error during redirect', { shortCode, error: error.message });
      setStatus('notfound');
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-xl">Loading...</p>
        </motion.div>
      </div>
    );
  }

  if (status === 'notfound') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md mx-auto px-4"
        >
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-white mb-4">URL Not Found</h1>
          <p className="text-white/80 mb-6">
            The short URL you're looking for doesn't exist or may have been removed.
          </p>
          <Navigate to="/" replace />
        </motion.div>
      </div>
    );
  }

  if (status === 'expired') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md mx-auto px-4"
        >
          <Clock className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-white mb-4">URL Expired</h1>
          <p className="text-white/80 mb-6">
            This short URL has expired and is no longer valid.
          </p>
          <Navigate to="/" replace />
        </motion.div>
      </div>
    );
  }

  if (status === 'redirecting') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md mx-auto px-4"
        >
          <ExternalLink className="w-16 h-16 text-green-400 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-white mb-4">Redirecting...</h1>
          <p className="text-white/80 mb-6">
            You will be redirected to your destination in {countdown} seconds.
          </p>
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/20">
            <p className="text-white/70 text-sm mb-2">Destination:</p>
            <p className="text-white font-mono text-sm break-all">
              {urlData?.originalURL}
            </p>
          </div>
          <p className="text-white/60 text-xs mt-4">
            If you're not redirected automatically, 
            <button 
              onClick={() => window.location.href = urlData.originalURL}
              className="text-blue-400 hover:text-blue-300 underline ml-1"
            >
              click here
            </button>
          </p>
        </motion.div>
      </div>
    );
  }

  return null;
};

export default RedirectHandler;
