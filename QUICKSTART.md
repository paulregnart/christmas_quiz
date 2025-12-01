# 🎄 Quick Start Guide

## Fastest Way to Start

Run this single command from the project root:

```bash
./start.sh
```

This script will:
1. Check if Node.js is installed
2. Install all dependencies (if needed)
3. Start both backend and frontend servers
4. Display team URLs in the console

## Manual Start

If you prefer to start servers manually:

### Terminal 1 - Backend
```bash
cd backend
npm install
npm start
```

### Terminal 2 - Frontend
```bash
cd frontend
npm install
npm start
```

## First Time Setup

1. Make sure Node.js is installed (v14 or higher)
2. Run the startup script or manually install dependencies
3. Backend will run on port 3001
4. Frontend will open automatically on port 3000

## Getting Team URLs

When the backend starts, it will display three unique URLs like:

```
=== TEAM LEADER URLS ===
Team 1: http://localhost:3000/team/abc-123-def
Team 2: http://localhost:3000/team/xyz-456-ghi
Team 3: http://localhost:3000/team/mno-789-pqr
========================
```

You can also click "Show Team URLs" in the Quizmaster dashboard.

## Game Flow

1. **Quizmaster** opens http://localhost:3000
2. Share the three team URLs with your team leaders
3. **Team Leaders** open their unique URLs and enter team names
4. **Quizmaster** starts Question 1
5. **Teams** select and submit answers
6. **Quizmaster** reveals answers and scores
7. Continue through all 20 questions
8. Winner announced! 🏆

## Troubleshooting

**Port already in use:**
```bash
# Kill processes on port 3000 or 3001
lsof -ti:3000 | xargs kill -9
lsof -ti:3001 | xargs kill -9
```

**Dependencies not installing:**
```bash
# Clear npm cache
npm cache clean --force
# Remove node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

## Tips

- Keep the terminal windows open to see logs
- Team URLs are regenerated each time the backend restarts
- Use Chrome or Firefox for best compatibility
- Test with one team first to ensure everything works

---

**Ready? Let's start the Christmas Quiz! 🎅**
