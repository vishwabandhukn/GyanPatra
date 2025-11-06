import React from 'react';
import { ExternalLink, Calendar, User, Tag, Clock } from 'lucide-react';

const NewsListItem = ({ article, onClick }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const stripHtml = (html) => {
    if (!html) return '';
    return html.replace(/<[^>]*>/g, '');
  };

  return (
    <article 
      className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-all duration-200 cursor-pointer group"
      onClick={onClick}
    >
      <div className="flex gap-4">
        {/* Image */}
        {article.imageUrl && (
          <div className="flex-shrink-0">
            <img
              src={article.imageUrl}
              alt={article.title}
              className="w-24 h-24 object-cover rounded-lg group-hover:scale-105 transition-transform duration-200"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </div>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
            {article.title}
          </h3>

          {article.description && (
            <p className="text-gray-600 text-sm mb-3 line-clamp-2">
              {stripHtml(article.description)}
            </p>
          )}

          {/* Meta information */}
          <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 mb-3">
            {article.publishedAt && (
              <div className="flex items-center space-x-1">
                <Calendar className="w-3 h-3" />
                <span>{formatDate(article.publishedAt)}</span>
              </div>
            )}
            
            {article.publishedAt && (
              <div className="flex items-center space-x-1">
                <Clock className="w-3 h-3" />
                <span>{formatRelativeTime(article.publishedAt)}</span>
              </div>
            )}

            {article.author && (
              <div className="flex items-center space-x-1">
                <User className="w-3 h-3" />
                <span>{article.author}</span>
              </div>
            )}
          </div>

          {/* Categories */}
          {article.categories && article.categories.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {article.categories.slice(0, 3).map((category, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700"
                >
                  <Tag className="w-3 h-3 mr-1" />
                  {category}
                </span>
              ))}
            </div>
          )}

          {/* Read more link */}
          {article.link && (
            <div className="flex items-center text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors">
              <span>Read full article</span>
              <ExternalLink className="w-3 h-3 ml-1" />
            </div>
          )}
        </div>
      </div>
    </article>
  );
};

export default NewsListItem;
