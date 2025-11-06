# MultiLang News Hub

A production-ready MERN stack application that aggregates news from multiple RSS feeds in different languages (English, Kannada, Hindi). The app provides a clean, responsive interface for users to select their preferred language and newspaper, then browse the latest headlines with automatic background updates.

## Features

- 🌍 **Multi-language Support**: English, Kannada (ಕನ್ನಡ), and Hindi (हिन्दी)
- 📰 **Multiple News Sources**: Curated RSS feeds from reputable news sources
- 🔄 **Real-time Updates**: Background refresh every 15 minutes
- 📱 **Responsive Design**: Mobile-first, accessible UI with Tailwind CSS
- 💾 **Persistent Storage**: Remembers user preferences via localStorage
- ⚡ **Fast Performance**: Server-side RSS parsing with MongoDB caching
- 🛡️ **Rate Limiting**: Built-in protection against abuse
- 🎨 **Modern UI**: Clean, card-based layout with skeleton loaders

## Tech Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **rss-parser** for RSS/Atom feed parsing
- **node-cron** for scheduled tasks
- **express-rate-limit** for API protection
- **cheerio** for HTML sanitization

### Frontend
- **React 18** with Vite
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **Axios** for API calls

## News Sources

### English
- The Hindu
- The Indian Express
- Hindustan Times

### Kannada (ಕನ್ನಡ)
- Prajavani
- Vijaya Karnataka

### Hindi (हिन्दी)
- News18 Hindi
- Live Hindustan
- Aaj Tak

## Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd multlang-news-hub
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Set up environment variables**
   
   Backend (create `backend/.env`):
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/multlang-news-hub
   NODE_ENV=development
   ```
   
   Frontend (create `frontend/.env`):
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

5. **Start MongoDB**
   ```bash
   # If using local MongoDB
   mongod
   
   # Or use MongoDB Atlas (cloud)
   # Update MONGODB_URI in .env
   ```

6. **Start the backend server**
   ```bash
   cd backend
   npm run dev
   ```

7. **Start the frontend development server**
   ```bash
   cd frontend
   npm run dev
   ```

8. **Open your browser**
   Navigate to `http://localhost:3000`

## Development Commands

### Backend
```bash
cd backend

# Start development server with auto-reload
npm run dev

# Start production server
npm start

# Install new dependency
npm install <package-name>
```

### Frontend
```bash
cd frontend

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## API Endpoints

### Sources
- `GET /api/sources` - Get all available sources grouped by language

### News
- `GET /api/news?sourceId=<id>` - Get news for specific source
- `GET /api/news?language=<lang>` - Get news for specific language

### Refresh
- `POST /api/refresh?sourceId=<id>` - Force refresh specific source

### Health
- `GET /api/health` - Health check endpoint

## Project Structure

```
multlang-news-hub/
├── backend/
│   ├── constants/
│   │   └── sources.js          # RSS feed configurations
│   ├── models/
│   │   └── NewsItem.js         # MongoDB schema
│   ├── routes/
│   │   └── api.js              # API routes
│   ├── services/
│   │   └── rssService.js       # RSS parsing and caching
│   ├── server.js               # Express server setup
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/         # React components
│   │   ├── hooks/              # Custom React hooks
│   │   ├── services/           # API service layer
│   │   ├── App.jsx             # Main app component
│   │   └── main.jsx            # React entry point
│   ├── public/
│   ├── index.html
│   └── package.json
└── README.md
```

## Configuration

### RSS Feed Sources
Edit `backend/constants/sources.js` to add or modify news sources:

```javascript
const RSS_SOURCES = {
  english: [
    {
      id: 'source-id',
      label: 'Source Name',
      feedUrl: 'https://example.com/rss',
      language: 'english'
    }
  ]
  // ... other languages
};
```

### Background Refresh
The app automatically refreshes RSS feeds every 15 minutes. To modify:

1. Change the cron schedule in `backend/server.js`:
   ```javascript
   cron.schedule('*/15 * * * *', async () => {
     // Refresh logic
   });
   ```

2. Or modify the interval in `rssService.js`:
   ```javascript
   startBackgroundRefresh(intervalMinutes = 15)
   ```

## Deployment

### Backend Deployment
1. Set production environment variables
2. Build and start the server:
   ```bash
   npm start
   ```

### Frontend Deployment
1. Build the production bundle:
   ```bash
   npm run build
   ```
2. Deploy the `dist` folder to your hosting service

### Environment Variables for Production
```env
# Backend
PORT=5000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/multlang-news-hub
NODE_ENV=production

# Frontend
VITE_API_URL=https://your-api-domain.com/api
```

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check the MONGODB_URI in your .env file
   - Verify network connectivity

2. **RSS Feed Fetch Errors**
   - Some feeds may be temporarily unavailable
   - Check the console for specific error messages
   - Verify feed URLs are accessible

3. **CORS Issues**
   - Ensure the frontend URL is added to CORS origins
   - Check the backend CORS configuration

4. **Rate Limiting**
   - The API has rate limits to prevent abuse
   - Wait before making additional requests

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the ISC License.

## Support

For issues and questions:
- Check the troubleshooting section
- Review the console logs
- Open an issue on GitHub




