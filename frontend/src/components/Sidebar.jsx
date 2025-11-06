import React from 'react';
import { X, Globe, Newspaper, RefreshCw, ChevronRight, Sparkles, Menu } from 'lucide-react';

const Sidebar = ({ 
  isOpen, 
  onClose, 
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
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-40 w-80 bg-gradient-to-b from-white to-gray-50 shadow-xl lg:shadow-none
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        flex flex-col border-r border-gray-200
      `}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold">NewsHub</h2>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-md text-white hover:bg-white hover:bg-opacity-20 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Languages Section */}
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center">
              <Globe className="w-4 h-4 mr-2 text-blue-600" />
              Select Language
            </h3>
            <div className="space-y-2">
              {languages.map((language) => (
                <button
                  key={language.id}
                  onClick={() => onLanguageChange(language.id)}
                  className={`
                    w-full flex items-center justify-between p-4 rounded-xl text-left transition-all duration-200 transform hover:scale-105
                    ${selectedLanguage === language.id
                      ? 'bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 border-2 border-blue-200 shadow-lg'
                      : 'text-gray-700 hover:bg-gray-50 hover:shadow-md border-2 border-transparent'
                    }
                  `}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{language.flag}</span>
                    <span className="font-semibold text-lg">{language.label}</span>
                  </div>
                  {selectedLanguage === language.id && (
                    <ChevronRight className="w-5 h-5 text-blue-600" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Sources Section - Only show if language is selected */}
          {selectedLanguage && sources && sources.length > 0 && (
            <div className="p-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center">
                <Newspaper className="w-4 h-4 mr-2 text-green-600" />
                Select Newspaper
              </h3>
              <div className="space-y-2">
                {sources.map((source) => (
                  <button
                    key={source.id}
                    onClick={() => onSourceChange(source.id)}
                    className={`
                      w-full flex items-center justify-between p-4 rounded-xl text-left transition-all duration-200 transform hover:scale-105
                      ${selectedSource === source.id
                        ? 'bg-gradient-to-r from-green-50 to-blue-50 text-green-700 border-2 border-green-200 shadow-lg'
                        : 'text-gray-700 hover:bg-gray-50 hover:shadow-md border-2 border-transparent'
                      }
                    `}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${selectedSource === source.id ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                      <span className="font-semibold text-lg">{source.label}</span>
                    </div>
                    {selectedSource === source.id && (
                      <ChevronRight className="w-5 h-5 text-green-600" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Instructions */}
          {!selectedLanguage && (
            <div className="p-6">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Menu className="w-5 h-5 text-blue-600" />
                  <span className="font-semibold text-blue-800">How to use:</span>
                </div>
                <ol className="text-sm text-blue-700 space-y-1">
                  <li>1. Select a language first</li>
                  <li>2. Choose a newspaper</li>
                  <li>3. View the latest news!</li>
                </ol>
              </div>
            </div>
          )}

          {/* Refresh Section - Only show if source is selected */}
          {selectedSource && (
            <div className="p-6 border-t border-gray-200">
              <button
                onClick={onRefresh}
                disabled={isLoading}
                className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
                <span className="font-semibold">Refresh News</span>
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="text-xs text-gray-500 text-center">
            <p className="flex items-center justify-center space-x-1">
              <Sparkles className="w-3 h-3" />
              <span>Data refreshed every 15 minutes</span>
            </p>
            <p className="mt-1 font-medium">MultiLang News Hub</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
