# Deployment Guide for Render

## Backend Setup

1. Go to your backend service on Render: https://dashboard.render.com
2. Add these environment variables:
   - `FRONTEND_URL` = `https://christmas-quiz-1.onrender.com`
   - `NODE_ENV` = `production`

## Frontend Setup

1. Go to your frontend service on Render: https://dashboard.render.com
2. Add this environment variable:
   - `REACT_APP_BACKEND_URL` = `https://christmas-quiz.onrender.com`

## Important Notes

- Both services need to be redeployed after setting environment variables
- The backend URL should NOT have a trailing slash
- The frontend URL should NOT have a trailing slash
- Make sure to commit and push your changes to GitHub
- Render will auto-deploy when you push to the main branch

## URLs

- **Backend**: https://christmas-quiz.onrender.com
- **Frontend**: https://christmas-quiz-1.onrender.com
- **Quizmaster**: https://christmas-quiz-1.onrender.com
- **Team URLs**: Will be displayed in backend logs or quizmaster dashboard

## Testing

1. Visit https://christmas-quiz-1.onrender.com
2. Click "Show Team URLs" to get the 10 team links
3. Open team links in different browsers/devices to test
4. Start questions from the quizmaster dashboard

## Troubleshooting

If teams can't connect:
- Check Render logs for errors
- Verify environment variables are set correctly
- Ensure CORS is working (check browser console)
- Backend might be sleeping on free tier - first request may be slow
