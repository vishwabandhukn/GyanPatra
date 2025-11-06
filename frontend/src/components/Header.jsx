import React from 'react';
import { RefreshCw, Newspaper } from 'lucide-react';
import LanguageSelector from './LanguageSelector';
import NewspaperSelector from './NewspaperSelector';

const Header = ({ 
  languages, 
  sources, 
  selectedLanguage, 
  selectedSource, 
  onLanguageChange, 
  onSourceChange, 
  onRefresh, 
  isLoading 
}) => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between py-4 gap-4">
          {/* Logo and Title */}
          <div className="flex items-center">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <Newspaper className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">
                MultiLang News Hub
              </h1>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-4 flex-1 lg:justify-end">
            {/* Language Selector */}
            <div className="min-w-0 flex-1 sm:max-w-xs">
              <LanguageSelector
                languages={languages}
                selectedLanguage={selectedLanguage}
                onLanguageChange={onLanguageChange}
                isLoading={isLoading}
              />
            </div>

            {/* Newspaper Selector */}
            {selectedLanguage && sources && sources.length > 0 && (
              <div className="min-w-0 flex-1 sm:max-w-xs">
                <NewspaperSelector
                  sources={sources}
                  selectedSource={selectedSource}
                  onSourceChange={onSourceChange}
                  isLoading={isLoading}
                />
              </div>
            )}

            {/* Refresh Button */}
            {selectedSource && (
              <div className="flex items-end">
                <button
                  onClick={onRefresh}
                  disabled={isLoading}
                  className="btn-primary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                  <span>Refresh</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
