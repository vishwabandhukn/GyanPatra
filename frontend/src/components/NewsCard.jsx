import React from 'react';
import { ExternalLink, Clock, Newspaper, Calendar, User } from 'lucide-react';

const NewsCard = ({ item, index = 0 }) => {
  if (!item) return null;

  // Color themes for different news sources
  const getColorTheme = (sourceId) => {
    const themes = {
      'the-hindu': 'from-blue-500 to-blue-700',
      'indian-express': 'from-green-500 to-green-700', 
      'hindustan-times': 'from-purple-500 to-purple-700',
      'prajavani': 'from-orange-500 to-orange-700',
      'kannada-prabha': 'from-red-500 to-red-700',
      'news18-hindi': 'from-pink-500 to-pink-700',
      'live-hindustan': 'from-indigo-500 to-indigo-700',
      'aaj-tak': 'from-yellow-500 to-yellow-700',
      'deccan-herald': 'from-teal-500 to-teal-700'
    };
    return themes[sourceId] || 'from-gray-500 to-gray-700';
  };

  const formatDateTime = (dateString) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Just now';
      
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.round(diffMs / 60000);
      
      if (diffMins < 60) {
        return diffMins <= 1 ? 'Just now' : `${diffMins}m ago`;
      } else if (diffMins < 1440) {
        const hours = Math.floor(diffMins / 60);
        return `${hours}h ago`;
      } else {
        return date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      }
    } catch (error) {
      return 'Recent';
    }
  };

  const getSourceLabel = (sourceId) => {
    const labels = {
      'the-hindu': 'The Hindu',
      'indian-express': 'Indian Express',
      'deccan-herald': 'Deccan Herald',
      'prajavani': 'Prajavani',
      'kannada-prabha': 'Kannada Prabha',
      'news18-hindi': 'News18 Hindi',
      'live-hindustan': 'Live Hindustan',
      'aaj-tak': 'Aaj Tak'
    };
    return labels[sourceId] || sourceId?.replace('-', ' ').toUpperCase() || 'NEWS';
  };

  return (
    <div 
      className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-700 transform hover:-translate-y-3 hover:scale-105 border-l-8 border-gradient-to-b from-blue-400 to-purple-500 h-full flex flex-col group animate-fadeIn"
      style={{ animationDelay: `${index * 0.15}s` }}
    >
      {/* Header with gradient */}
      <div className={`bg-gradient-to-r ${getColorTheme(item.sourceId)} p-6 text-white flex-shrink-0`}>
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <Newspaper className="w-5 h-5" />
            <span className="text-lg font-bold">
              {getSourceLabel(item.sourceId)}
            </span>
          </div>
          <div className="flex items-center space-x-2 text-sm opacity-90">
            <Clock className="w-4 h-4" />
            <span>{formatDateTime(item.publishedAt || item.pubDate)}</span>
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="p-6 flex-1 flex flex-col">
        {/* Full Headline */}
        <h3 className="text-2xl font-bold text-gray-900 mb-4 leading-tight flex-shrink-0 group-hover:text-blue-600 transition-colors duration-300">
          {item.title}
        </h3>
        
        {/* Description */}
        <div className="flex-1 mb-6">
          {item.description && (
            <p className="text-gray-600 leading-relaxed text-lg">
              {item.description}
            </p>
          )}
        </div>
        
        {/* Meta Information */}
        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          <div className="flex items-center space-x-4">
            {item.author && (
              <div className="flex items-center space-x-1">
                <User className="w-4 h-4" />
                <span>{item.author}</span>
              </div>
            )}
            <div className="flex items-center space-x-1">
              <Calendar className="w-4 h-4" />
              <span>{new Date(item.publishedAt || item.pubDate).toLocaleDateString()}</span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-green-600 font-medium">Live</span>
          </div>
        </div>
        
        {/* Footer with NavLink */}
        <div className="mt-auto">
          {item.link && (
            <a 
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-lg font-semibold rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl group"
            >
              <span>Read Full Article</span>
              <ExternalLink className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default NewsCard;