
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import URLShortener from '@/pages/URLShortener';
import Statistics from '@/pages/Statistics';
import RedirectHandler from '@/pages/RedirectHandler';
import { Toaster } from '@/components/ui/toaster';
import logger from '@/middleware/logger';

function App() {
  React.useEffect(() => {
    logger.info('URL Shortener App initialized');
  }, []);

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900">
        <Routes>
          {/* Redirect handler route - must come before other routes */}
          <Route path="/:shortCode" element={<RedirectHandler />} />
          
          {/* Main app routes */}
          <Route path="/*" element={
            <>
              <Navigation />
              <Routes>
                <Route path="/" element={<URLShortener />} />
                <Route path="/statistics" element={<Statistics />} />
              </Routes>
            </>
          } />
        </Routes>
        <Toaster />
      </div>
    </Router>
  );
}

export default App;
