import React from 'react';
import { Newspaper } from 'lucide-react';

const NewspaperSelector = ({ sources, selectedSource, onSourceChange, isLoading }) => {
  if (!sources || sources.length === 0) {
    return null;
  }

  return (
    <div className="relative">
      <label htmlFor="newspaper-select" className="block text-sm font-medium text-gray-700 mb-2">
        <Newspaper className="inline w-4 h-4 mr-2" />
        Select Newspaper
      </label>
      <select
        id="newspaper-select"
        value={selectedSource || ''}
        onChange={(e) => onSourceChange(e.target.value)}
        disabled={isLoading}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <option value="">Choose a newspaper...</option>
        {sources.map((source) => (
          <option key={source.id} value={source.id}>
            {source.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default NewspaperSelector;




