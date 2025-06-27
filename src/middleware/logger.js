
class Logger {
  constructor() {
    this.logs = [];
    this.maxLogs = 1000;
  }

  log(level, message, data = null) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      id: Date.now() + Math.random(),
      timestamp,
      level,
      message,
      data,
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    this.logs.unshift(logEntry);
    
    // Keep only the most recent logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(0, this.maxLogs);
    }

    // Store in localStorage for persistence
    try {
      localStorage.setItem('app_logs', JSON.stringify(this.logs.slice(0, 100)));
    } catch (error) {
      console.warn('Failed to store logs in localStorage:', error);
    }

    // Output to console for development
    const consoleMethod = level === 'error' ? 'error' : level === 'warn' ? 'warn' : 'log';
    console[consoleMethod](`[${timestamp}] ${level.toUpperCase()}: ${message}`, data || '');
  }

  info(message, data) {
    this.log('info', message, data);
  }

  warn(message, data) {
    this.log('warn', message, data);
  }

  error(message, data) {
    this.log('error', message, data);
  }

  debug(message, data) {
    this.log('debug', message, data);
  }

  getLogs() {
    return this.logs;
  }

  clearLogs() {
    this.logs = [];
    localStorage.removeItem('app_logs');
    this.info('Logs cleared');
  }

  // Load logs from localStorage on initialization
  loadLogs() {
    try {
      const storedLogs = localStorage.getItem('app_logs');
      if (storedLogs) {
        this.logs = JSON.parse(storedLogs);
        this.info('Logs loaded from localStorage', { count: this.logs.length });
      }
    } catch (error) {
      this.error('Failed to load logs from localStorage', error);
    }
  }
}

// Create singleton instance
const logger = new Logger();
logger.loadLogs();

export default logger;
