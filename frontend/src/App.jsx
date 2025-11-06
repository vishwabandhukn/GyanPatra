import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './App.css'
import Sidebar from './components/Sidebar'
import NewsGrid from './components/NewsGrid'
import NotesPage from './pages/NotesPage'
import { useLocalStorage } from './hooks/useLocalStorage'
import { useNewsData } from './hooks/useNewsData'

function NewsApp() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [selectedLanguage, setSelectedLanguage] = useLocalStorage('selectedLanguage', null)
  const [selectedSource, setSelectedSource] = useLocalStorage('selectedSource', null)
  
  // Use the custom hook to fetch news data
  const { news, isLoading, error, refetch } = useNewsData(selectedSource)
  
  // Languages data
  const languages = [
    { id: 'english', label: 'English', flag: '🇬🇧' },
    { id: 'kannada', label: 'ಕನ್ನಡ', flag: '🇮🇳' },
    { id: 'hindi', label: 'हिन्दी', flag: '🇮🇳' }
  ]
  
  const [sources, setSources] = useState([])
  
  // Fetch sources based on selected language
  useEffect(() => {
    if (!selectedLanguage) {
      setSources([])
      return
    }
    
    // Define sources for each language
    if (selectedLanguage === 'english') {
      setSources([
        { id: 'the-hindu', label: 'The Hindu' },
        { id: 'indian-express', label: 'Indian Express' },
        { id: 'deccan-herald', label: 'Deccan Herald' }
      ])
    } else if (selectedLanguage === 'kannada') {
      setSources([
        { id: 'prajavani', label: 'Prajavani' },
        { id: 'kannada-prabha', label: 'Kannada Prabha' }
      ])
    } else if (selectedLanguage === 'hindi') {
      setSources([
        { id: 'news18-hindi', label: 'News18 Hindi' },
        { id: 'live-hindustan', label: 'Live Hindustan' },
        { id: 'aaj-tak', label: 'Aaj Tak' }
      ])
    }
  }, [selectedLanguage])
  
  const handleLanguageChange = (langId) => {
    setSelectedLanguage(langId)
    setSelectedSource(null) // Reset source when language changes
  }
  
  const handleSourceChange = (sourceId) => {
    setSelectedSource(sourceId)
  }
  
  const handleRefresh = () => {
    if (refetch) {
      refetch()
    }
  }
  
  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Sidebar 
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        languages={languages}
        sources={sources}
        selectedLanguage={selectedLanguage}
        selectedSource={selectedSource}
        onLanguageChange={handleLanguageChange}
        onSourceChange={handleSourceChange}
        onRefresh={handleRefresh}
        isLoading={isLoading}
      />
      
      <div className="flex-1 overflow-auto">
        {/* Simple Header */}
        <header className="bg-white shadow-lg border-b-4 border-gradient-to-r from-blue-500 to-purple-600">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <button 
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden text-gray-600 hover:text-gray-900 focus:outline-none p-2 rounded-lg hover:bg-gray-100"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-lg">N</span>
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    NEWS HUB
                  </h1>
                  <p className="text-sm text-gray-600">
                    {selectedSource ? sources.find(s => s.id === selectedSource)?.label : 'Select a language and newspaper'}
                  </p>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex items-center space-x-3">
                {/* Make a Note Button */}
                <button
                  onClick={() => window.location.href = '/notes'}
                  className="px-4 py-2 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-lg hover:from-green-700 hover:to-teal-700 transition-all duration-200 transform hover:scale-105 shadow-md flex items-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  <span>Make a Note</span>
                </button>
                
                {/* Refresh Button */}
                {selectedSource && (
                  <button
                    onClick={() => refetch && refetch()}
                    disabled={isLoading}
                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 transition-all duration-200 transform hover:scale-105 shadow-md"
                  >
                    {isLoading ? '🔄 Loading...' : '🔄 Refresh'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </header>
        
        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <NewsGrid news={news} isLoading={isLoading} error={error} />
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<NewsApp />} />
        <Route path="/notes" element={<NotesPage onBack={() => window.history.back()} />} />
      </Routes>
    </Router>
  );
}

export default App;