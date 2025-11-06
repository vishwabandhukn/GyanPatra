import React from 'react';
import { Globe } from 'lucide-react';

const LanguageSelector = ({ languages, selectedLanguage, onLanguageChange, isLoading }) => {
  return (
    <div className="relative">
      <label htmlFor="language-select" className="block text-sm font-medium text-gray-700 mb-2">
        <Globe className="inline w-4 h-4 mr-2" />
        Select Language
      </label>
      <select
        id="language-select"
        value={selectedLanguage || ''}
        onChange={(e) => onLanguageChange(e.target.value)}
        disabled={isLoading}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <option value="">Choose a language...</option>
        {languages.map((language) => (
          <option key={language.id} value={language.id}>
            {language.flag} {language.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default LanguageSelector;




