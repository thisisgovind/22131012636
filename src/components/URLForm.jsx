
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, Link as LinkIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import urlService from '@/services/urlService';
import logger from '@/middleware/logger';

const URLForm = ({ onURLsCreated }) => {
  const [urls, setUrls] = useState([
    { id: 1, originalURL: '', validityMinutes: 30, customShortCode: '' }
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const addURLField = () => {
    if (urls.length >= 5) {
      toast({
        title: "Maximum Limit Reached",
        description: "You can only shorten up to 5 URLs at once.",
        variant: "destructive"
      });
      return;
    }

    const newUrl = {
      id: Date.now(),
      originalURL: '',
      validityMinutes: 30,
      customShortCode: ''
    };
    setUrls([...urls, newUrl]);
    logger.info('URL field added', { totalFields: urls.length + 1 });
  };

  const removeURLField = (id) => {
    if (urls.length === 1) {
      toast({
        title: "Cannot Remove",
        description: "At least one URL field is required.",
        variant: "destructive"
      });
      return;
    }
    
    setUrls(urls.filter(url => url.id !== id));
    logger.info('URL field removed', { totalFields: urls.length - 1 });
  };

  const updateURL = (id, field, value) => {
    setUrls(urls.map(url => 
      url.id === id ? { ...url, [field]: value } : url
    ));
  };

  const validateForm = () => {
    const errors = [];
    
    urls.forEach((url, index) => {
      if (!url.originalURL.trim()) {
        errors.push(`URL ${index + 1}: Original URL is required`);
      } else if (!urlService.isValidURL(url.originalURL)) {
        errors.push(`URL ${index + 1}: Invalid URL format`);
      }
      
      if (!Number.isInteger(Number(url.validityMinutes)) || Number(url.validityMinutes) <= 0) {
        errors.push(`URL ${index + 1}: Validity must be a positive integer`);
      }
      
      if (url.customShortCode && (!/^[a-zA-Z0-9]+$/.test(url.customShortCode) || url.customShortCode.length > 20)) {
        errors.push(`URL ${index + 1}: Custom shortcode must be alphanumeric and max 20 characters`);
      }
    });

    // Check for duplicate custom shortcodes
    const customCodes = urls.filter(url => url.customShortCode).map(url => url.customShortCode);
    const duplicates = customCodes.filter((code, index) => customCodes.indexOf(code) !== index);
    if (duplicates.length > 0) {
      errors.push('Duplicate custom shortcodes are not allowed');
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      validationErrors.forEach(error => {
        toast({
          title: "Validation Error",
          description: error,
          variant: "destructive"
        });
      });
      logger.error('Form validation failed', { errors: validationErrors });
      return;
    }

    setIsLoading(true);
    logger.info('Starting URL shortening process', { urlCount: urls.length });

    try {
      const results = [];
      
      for (const url of urls) {
        try {
          const result = urlService.createShortURL(
            url.originalURL,
            url.customShortCode || null,
            Number(url.validityMinutes)
          );
          results.push(result);
        } catch (error) {
          toast({
            title: "Error Creating Short URL",
            description: error.message,
            variant: "destructive"
          });
          logger.error('Failed to create short URL', { url: url.originalURL, error: error.message });
        }
      }

      if (results.length > 0) {
        toast({
          title: "Success!",
          description: `${results.length} URL${results.length > 1 ? 's' : ''} shortened successfully!`
        });
        
        // Reset form
        setUrls([{ id: Date.now(), originalURL: '', validityMinutes: 30, customShortCode: '' }]);
        
        // Notify parent component
        if (onURLsCreated) {
          onURLsCreated(results);
        }
        
        logger.info('URLs shortened successfully', { count: results.length });
      }
    } catch (error) {
      toast({
        title: "Unexpected Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
      logger.error('Unexpected error during URL shortening', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="bg-white/10 backdrop-blur-md border-white/20">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-white">
          <LinkIcon className="w-6 h-6" />
          <span>Shorten Your URLs</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {urls.map((url, index) => (
            <motion.div
              key={url.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="p-4 bg-white/5 rounded-lg border border-white/10 space-y-4"
            >
              <div className="flex items-center justify-between">
                <span className="text-white font-medium">URL {index + 1}</span>
                {urls.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeURLField(url.id)}
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor={`url-${url.id}`} className="text-white/80">
                    Original URL *
                  </Label>
                  <Input
                    id={`url-${url.id}`}
                    type="url"
                    placeholder="https://example.com"
                    value={url.originalURL}
                    onChange={(e) => updateURL(url.id, 'originalURL', e.target.value)}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor={`validity-${url.id}`} className="text-white/80">
                    Validity (minutes) *
                  </Label>
                  <Input
                    id={`validity-${url.id}`}
                    type="number"
                    min="1"
                    placeholder="30"
                    value={url.validityMinutes}
                    onChange={(e) => updateURL(url.id, 'validityMinutes', parseInt(e.target.value) || '')}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                    required
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor={`shortcode-${url.id}`} className="text-white/80">
                  Custom Shortcode (optional)
                </Label>
                <Input
                  id={`shortcode-${url.id}`}
                  type="text"
                  placeholder="my-custom-code"
                  value={url.customShortCode}
                  onChange={(e) => updateURL(url.id, 'customShortCode', e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                  maxLength={20}
                />
                <p className="text-xs text-white/60 mt-1">
                  Alphanumeric characters only, max 20 characters
                </p>
              </div>
            </motion.div>
          ))}
          
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={addURLField}
              disabled={urls.length >= 5}
              className="flex items-center space-x-2 bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <Plus className="w-4 h-4" />
              <span>Add Another URL ({urls.length}/5)</span>
            </Button>
            
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium"
            >
              {isLoading ? 'Shortening...' : 'Shorten URLs'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default URLForm;
