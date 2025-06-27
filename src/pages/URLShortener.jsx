
import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import URLForm from '@/components/URLForm';
import URLResults from '@/components/URLResults';
import logger from '@/middleware/logger';

const URLShortener = () => {
  const [recentURLs, setRecentURLs] = useState([]);

  const handleURLsCreated = (newURLs) => {
    setRecentURLs(newURLs);
    logger.info('New URLs created and displayed', { count: newURLs.length });
  };

  return (
    <>
      <Helmet>
        <title>URL Shortener - LinkShort</title>
        <meta name="description" content="Shorten up to 5 URLs at once with custom shortcodes and validity periods. Fast, reliable, and easy to use URL shortening service." />
      </Helmet>
      
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              URL Shortener
            </h1>
            <p className="text-xl text-white/80 max-w-2xl mx-auto">
              Transform your long URLs into short, manageable links. Shorten up to 5 URLs at once with custom shortcodes and validity periods.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <URLForm onURLsCreated={handleURLsCreated} />
          </motion.div>

          {recentURLs.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <URLResults urls={recentURLs} />
            </motion.div>
          )}
        </div>
      </div>
    </>
  );
};

export default URLShortener;
