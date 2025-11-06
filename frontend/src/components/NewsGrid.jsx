import React from 'react';
import NewsCard from './NewsCard';
import NewsCardSkeleton from './NewsCardSkeleton';

const NewsGrid = ({ news, isLoading, error }) => {
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="inline-flex items-center space-x-2 text-blue-600">
            <div className="w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-xl font-semibold">Loading latest news...</span>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="h-full">
              <NewsCardSkeleton />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">⚠️</span>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Error Loading News</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!news || news.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">📰</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Welcome to MultiLang News Hub
          </h3>
          <p className="text-gray-600 text-lg mb-6 max-w-md">
            Select a language from the sidebar, then choose a newspaper to view the latest news.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 max-w-md">
            <h4 className="font-semibold text-blue-800 mb-3">Available Languages:</h4>
            <div className="space-y-2 text-sm text-blue-700">
              <div className="flex items-center space-x-2">
                <span>🇬🇧</span>
                <span>English - The Hindu, Indian Express, Deccan Herald</span>
              </div>
              <div className="flex items-center space-x-2">
                <span>🇮🇳</span>
                <span>ಕನ್ನಡ - Prajavani, Kannada Prabha</span>
              </div>
              <div className="flex items-center space-x-2">
                <span>🇮🇳</span>
                <span>हिन्दी - News18 Hindi, Live Hindustan, Aaj Tak</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Latest News
        </h2>
        <p className="text-gray-600">
          {news.length} articles loaded • Updated just now
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {news.map((item, index) => (
          <div key={item.id || index} className="h-full">
            <NewsCard item={item} index={index} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default NewsGrid;