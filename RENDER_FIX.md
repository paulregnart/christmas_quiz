# Render Configuration Fix for Team URLs

## Problem
Team URLs return 404 because Render doesn't know to serve index.html for all routes.

## Solution - Manual Render Dashboard Configuration

### Frontend Service Settings

Go to your frontend service on Render dashboard and update these settings:

1. **Build Command:**
   ```
   npm install && npm run build
   ```

2. **Publish Directory:**
   ```
   build
   ```

3. **Add Rewrite Rule:**
   - Go to "Redirects/Rewrites" section
   - Add a rewrite rule:
     - **Source:** `/*`
     - **Destination:** `/index.html`
     - **Status:** `200` (Rewrite)

4. **Headers (Optional but recommended):**
   Add under "Headers" section:
   ```
   /*
     Cache-Control: no-cache
   ```

### Alternative: Use render.yaml Blueprint

If the above doesn't work, tell Render to use the `render.yaml` file in your repo:

1. Delete your current frontend service
2. Create a new "Static Site" from the dashboard
3. When creating, select "I already have a render.yaml"
4. Connect your repo

The `render.yaml` in your repo already has the correct configuration with the rewrite rule.

### After Configuration

1. Trigger a manual deploy
2. Wait for deployment to complete
3. Test a team URL: `https://christmas-quiz-1.onrender.com/team/[token]`

### Verify Deployment

Check that:
- The `_redirects` file is in your `build` folder after deployment
- The publish directory is set to `build` (not `frontend/build`)
- Rewrite rules are active

If team URLs still don't work, check Render logs for any build errors.
