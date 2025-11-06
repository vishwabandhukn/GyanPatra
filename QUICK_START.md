# Quick Start Guide

## 🚀 MultiLang News Hub - Quick Start

This guide will help you get the MultiLang News Hub running in just a few minutes.

### Prerequisites
- **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
- **MongoDB** - [Download here](https://www.mongodb.com/try/download/community) or use [MongoDB Atlas](https://www.mongodb.com/atlas) (cloud)

### Option 1: Automated Setup (Recommended)

1. **Run the setup script:**
   ```bash
   node setup.js
   ```

2. **Start MongoDB** (if using local installation):
   ```bash
   # Windows
   mongod
   
   # macOS/Linux
   sudo systemctl start mongod
   # or
   mongod
   ```

3. **Start both servers:**
   ```bash
   # Windows
   start.bat
   
   # macOS/Linux
   ./start.sh
   ```

4. **Open your browser:**
   Navigate to `http://localhost:3000`

### Option 2: Manual Setup

1. **Install dependencies:**
   ```bash
   # Backend
   cd backend
   npm install
   
   # Frontend
   cd ../frontend
   npm install
   ```

2. **Create environment files:**
   
   Create `backend/.env`:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/multlang-news-hub
   NODE_ENV=development
   ```
   
   Create `frontend/.env`:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

3. **Start the servers:**
   
   Terminal 1 (Backend):
   ```bash
   cd backend
   npm run dev
   ```
   
   Terminal 2 (Frontend):
   ```bash
   cd frontend
   npm run dev
   ```

4. **Open your browser:**
   Navigate to `http://localhost:3000`

### What You'll See

1. **Language Selection**: Choose from English, Kannada (ಕನ್ನಡ), or Hindi (हिन्दी)
2. **Newspaper Selection**: Pick from available news sources for your selected language
3. **News Feed**: Browse the latest headlines with automatic updates every 15 minutes

### Troubleshooting

**MongoDB Connection Issues:**
- Ensure MongoDB is running: `mongod`
- Check your `MONGODB_URI` in `backend/.env`
- For MongoDB Atlas, use the connection string from your cluster

**Port Already in Use:**
- Backend runs on port 5000, frontend on port 3000
- Change ports in the respective `.env` files if needed

**RSS Feed Errors:**
- Some feeds may be temporarily unavailable
- Check the browser console and backend logs for specific errors

### Features

✅ **Multi-language Support**: English, Kannada, Hindi  
✅ **Real-time Updates**: Background refresh every 15 minutes  
✅ **Responsive Design**: Works on desktop and mobile  
✅ **Persistent Storage**: Remembers your preferences  
✅ **Rate Limiting**: Built-in API protection  
✅ **Error Handling**: Graceful fallbacks and user feedback  

### Next Steps

- Customize news sources in `backend/constants/sources.js`
- Modify the refresh interval in `backend/server.js`
- Deploy to production using the instructions in `README.md`

### Need Help?

- Check the full `README.md` for detailed documentation
- Review the console logs for error messages
- Ensure all dependencies are installed correctly

---

**Happy News Reading! 📰**




