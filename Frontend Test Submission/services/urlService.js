
import logger from '@/middleware/logger';

class URLService {
  constructor() {
    this.urls = this.loadURLs();
    this.initializeService();
  }

  initializeService() {
    logger.info('URL Service initialized', { urlCount: this.urls.length });
  }

  loadURLs() {
    try {
      const stored = localStorage.getItem('shortened_urls');
      const urls = stored ? JSON.parse(stored) : [];
      logger.info('URLs loaded from storage', { count: urls.length });
      return urls;
    } catch (error) {
      logger.error('Failed to load URLs from storage', error);
      return [];
    }
  }

  saveURLs() {
    try {
      localStorage.setItem('shortened_urls', JSON.stringify(this.urls));
      logger.info('URLs saved to storage', { count: this.urls.length });
    } catch (error) {
      logger.error('Failed to save URLs to storage', error);
    }
  }

  generateShortCode(length = 6) {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  isValidURL(url) {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  isShortCodeUnique(shortCode) {
    return !this.urls.some(url => url.shortCode === shortCode);
  }

  createShortURL(originalURL, customShortCode = null, validityMinutes = 30) {
    logger.info('Creating short URL', { originalURL, customShortCode, validityMinutes });

    // Validate URL
    if (!this.isValidURL(originalURL)) {
      const error = 'Invalid URL format';
      logger.error(error, { originalURL });
      throw new Error(error);
    }

    // Validate validity period
    if (!Number.isInteger(validityMinutes) || validityMinutes <= 0) {
      const error = 'Validity period must be a positive integer';
      logger.error(error, { validityMinutes });
      throw new Error(error);
    }

    // Handle custom short code
    let shortCode = customShortCode;
    if (customShortCode) {
      // Validate custom short code format
      if (!/^[a-zA-Z0-9]+$/.test(customShortCode) || customShortCode.length > 20) {
        const error = 'Custom shortcode must be alphanumeric and max 20 characters';
        logger.error(error, { customShortCode });
        throw new Error(error);
      }

      if (!this.isShortCodeUnique(customShortCode)) {
        const error = 'Custom shortcode already exists';
        logger.error(error, { customShortCode });
        throw new Error(error);
      }
    } else {
      // Generate unique short code
      do {
        shortCode = this.generateShortCode();
      } while (!this.isShortCodeUnique(shortCode));
    }

    const now = new Date();
    const expiryDate = new Date(now.getTime() + validityMinutes * 60 * 1000);

    const urlData = {
      id: Date.now() + Math.random(),
      originalURL,
      shortCode,
      shortURL: `http://localhost:3000/${shortCode}`,
      createdAt: now.toISOString(),
      expiresAt: expiryDate.toISOString(),
      validityMinutes,
      clicks: [],
      totalClicks: 0
    };

    this.urls.push(urlData);
    this.saveURLs();

    logger.info('Short URL created successfully', { shortCode, originalURL });
    return urlData;
  }

  getURLByShortCode(shortCode) {
    const url = this.urls.find(u => u.shortCode === shortCode);
    if (url) {
      logger.info('URL found by short code', { shortCode, originalURL: url.originalURL });
    } else {
      logger.warn('URL not found by short code', { shortCode });
    }
    return url;
  }

  isURLExpired(urlData) {
    const now = new Date();
    const expiry = new Date(urlData.expiresAt);
    return now > expiry;
  }

  async getLocationData() {
    try {
      // Mock geographical data - in real app, you'd use a geolocation service
      const mockLocations = [
        'New York, US',
        'London, UK',
        'Tokyo, JP',
        'Sydney, AU',
        'Berlin, DE',
        'Toronto, CA',
        'Mumbai, IN',
        'São Paulo, BR'
      ];
      
      return mockLocations[Math.floor(Math.random() * mockLocations.length)];
    } catch (error) {
      logger.error('Failed to get location data', error);
      return 'Unknown Location';
    }
  }

  async recordClick(shortCode, source = 'direct') {
    logger.info('Recording click', { shortCode, source });

    const urlData = this.getURLByShortCode(shortCode);
    if (!urlData) {
      const error = 'URL not found';
      logger.error(error, { shortCode });
      throw new Error(error);
    }

    if (this.isURLExpired(urlData)) {
      const error = 'URL has expired';
      logger.error(error, { shortCode, expiresAt: urlData.expiresAt });
      throw new Error(error);
    }

    const location = await this.getLocationData();
    const clickData = {
      id: Date.now() + Math.random(),
      timestamp: new Date().toISOString(),
      source,
      location,
      userAgent: navigator.userAgent
    };

    urlData.clicks.push(clickData);
    urlData.totalClicks = urlData.clicks.length;
    this.saveURLs();

    logger.info('Click recorded successfully', { shortCode, totalClicks: urlData.totalClicks });
    return urlData;
  }

  getAllURLs() {
    logger.info('Retrieving all URLs', { count: this.urls.length });
    return this.urls.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  deleteExpiredURLs() {
    const initialCount = this.urls.length;
    this.urls = this.urls.filter(url => !this.isURLExpired(url));
    const deletedCount = initialCount - this.urls.length;
    
    if (deletedCount > 0) {
      this.saveURLs();
      logger.info('Expired URLs cleaned up', { deletedCount });
    }
    
    return deletedCount;
  }
}

export default new URLService();
