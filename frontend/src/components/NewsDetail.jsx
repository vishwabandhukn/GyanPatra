import React from 'react';
import { ArrowLeft, ExternalLink, Calendar, User, Tag, Clock } from 'lucide-react';

const NewsDetail = ({ article, onBack }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
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
    <div className="h-full overflow-auto bg-white">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-gray-200 z-10">
        <div className="px-6 py-4">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to news</span>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Article Header */}
        <div className="mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4 leading-tight">
            {article.title}
          </h1>

          {/* Meta Information */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-6">
            {article.publishedAt && (
              <div className="flex items-center space-x-1">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(article.publishedAt)}</span>
              </div>
            )}
            
            {article.publishedAt && (
              <div className="flex items-center space-x-1">
                <Clock className="w-4 h-4" />
                <span>{formatRelativeTime(article.publishedAt)}</span>
              </div>
            )}

            {article.author && (
              <div className="flex items-center space-x-1">
                <User className="w-4 h-4" />
                <span>{article.author}</span>
              </div>
            )}
          </div>

          {/* Categories */}
          {article.categories && article.categories.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {article.categories.map((category, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                >
                  <Tag className="w-3 h-3 mr-1" />
                  {category}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Featured Image */}
        {article.imageUrl && (
          <div className="mb-8">
            <img
              src={article.imageUrl}
              alt={article.title}
              className="w-full h-64 lg:h-96 object-cover rounded-lg shadow-lg"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </div>
        )}

        {/* Article Content */}
        <div className="prose prose-lg max-w-none">
          {article.description && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Summary</h2>
              <p className="text-gray-700 leading-relaxed text-lg">
                {stripHtml(article.description)}
              </p>
            </div>
          )}

          {article.content && article.content !== article.description && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Full Article</h2>
              <div 
                className="text-gray-700 leading-relaxed"
                dangerouslySetInnerHTML={{ 
                  __html: article.content.replace(/<[^>]*>/g, '').replace(/\n/g, '<br>') 
                }}
              />
            </div>
          )}
        </div>

        {/* Read More Link */}
        {article.link && (
          <div className="mt-12 pt-8 border-t border-gray-200">
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Read the full article
              </h3>
              <p className="text-gray-600 mb-4">
                This is a summary. Click below to read the complete article on the original website.
              </p>
              <a
                href={article.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <span>Read Full Article</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewsDetail;
