# Quick Render Setup Instructions

## ✅ Code Updated!

Your code now supports both local and production environments using environment variables.

## 🚀 Next Steps on Render:

### 1. Backend Service (christmas-quiz.onrender.com)

Go to your backend service dashboard and add these **Environment Variables**:

```
FRONTEND_URL=https://christmas-quiz-1.onrender.com
NODE_ENV=production
```

**How to add:**
- Dashboard → Your Service → Environment
- Click "Add Environment Variable"
- Add each variable above
- Click "Save Changes"

### 2. Frontend Service (christmas-quiz-1.onrender.com)

Go to your frontend service dashboard and add this **Environment Variable**:

```
REACT_APP_BACKEND_URL=https://christmas-quiz.onrender.com
```

**How to add:**
- Dashboard → Your Service → Environment  
- Click "Add Environment Variable"
- Add the variable above
- Click "Save Changes"

### 3. Deploy Changes

```bash
git add .
git commit -m "Configure for Render deployment"
git push origin main
```

Render will automatically redeploy both services.

## 🎮 Testing Your Deployment

1. Visit: https://christmas-quiz-1.onrender.com
2. You should see the Quizmaster Dashboard
3. Click "Show Team URLs" to get all 10 team links
4. Share those links with your teams
5. Start playing!

## ⚠️ Important Notes

- **First load may be slow** (30-60 seconds) - Render free tier spins down inactive services
- Keep the tab open during the quiz to prevent backend from sleeping
- Team URLs change each time the backend restarts
- All 10 teams can now play simultaneously

## 🔍 Troubleshooting

**Teams can't connect?**
- Check that environment variables are set correctly
- View backend logs on Render to see team URLs
- Clear browser cache and try again

**Backend logs show errors?**
- Verify FRONTEND_URL doesn't have trailing slash
- Check CORS settings are working

**Need to regenerate team URLs?**
- Just restart the backend service on Render
- New URLs will appear in the logs

---

Your Christmas Quiz is now live! 🎄🎅
