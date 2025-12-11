# Railway Deployment Guide for YGI Backend

## Prerequisites
- Railway account (sign up at https://railway.app)
- GitHub repository with your code
- Stripe account with API keys

## Step 1: Prepare Your Repository

1. **Make sure your code is committed and pushed to GitHub**
   ```bash
   git add .
   git commit -m "Prepare for Railway deployment"
   git push origin main
   ```

## Step 2: Create New Railway Project

1. Go to [Railway Dashboard](https://railway.app/dashboard)
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Choose your repository: `YGIholidayhomes`
5. Railway will auto-detect it's a Node.js project

## Step 3: Configure the Service

1. **Set Root Directory:**
   - In Railway dashboard, go to your service
   - Click on **Settings** tab
   - Under **Source**, set **Root Directory** to: `backend`
   - This tells Railway to deploy from the `backend` folder

2. **Configure Build Settings:**
   - Railway will auto-detect Node.js
   - Build command: `npm install` (automatic)
   - Start command: `npm start` (from package.json)

## Step 4: Set Environment Variables

In Railway dashboard, go to **Variables** tab and add:

### Required Variables:
```
STRIPE_SECRET_KEY=sk_live_YOUR_ACTUAL_STRIPE_KEY_HERE
FRONTEND_URL=https://ygiholidayhomes.com
NODE_ENV=production
```

### Optional Variables:
```
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET_HERE
PORT=5000
```

**Note:** Railway automatically sets `PORT` - you don't need to set it manually, but it won't hurt if you do.

## Step 5: Deploy

1. Railway will automatically deploy when you:
   - Push to your main branch, OR
   - Click **"Deploy"** button in the dashboard

2. **Watch the logs:**
   - Go to **Deployments** tab
   - Click on the latest deployment
   - Check **Logs** to see if deployment is successful

3. **Look for these success messages:**
   ```
   🚀 YGI Backend server running on port [PORT]
   📊 Health check: http://localhost:[PORT]/health
   💳 Stripe integration ready
   ```

## Step 6: Get Your Railway URL

1. In Railway dashboard, go to **Settings** tab
2. Under **Networking**, you'll see your **Public Domain**
3. It will look like: `your-project-name.up.railway.app`
4. Copy this URL - this is your backend API URL

## Step 7: Test Your Deployment

1. **Test Health Endpoint:**
   ```
   https://your-project-name.up.railway.app/health
   ```
   Should return:
   ```json
   {
     "status": "OK",
     "message": "YGI Backend API is running",
     "timestamp": "...",
     "uptime": ...
   }
   ```

2. **Test Root Endpoint:**
   ```
   https://your-project-name.up.railway.app/
   ```

## Step 8: Update Frontend Configuration

Update your frontend to use the Railway URL:

1. In your frontend code, update the backend URL to:
   ```javascript
   const BACKEND_URL = 'https://your-project-name.up.railway.app';
   ```

2. **Update CORS in backend** (if needed):
   - The backend already includes Railway URLs in CORS
   - If you get CORS errors, add your Railway URL to `allowedOrigins` in `server.js`

## Step 9: Configure Custom Domain (Optional)

1. In Railway dashboard → **Settings** → **Networking**
2. Click **"Generate Domain"** or **"Custom Domain"**
3. Add your custom domain (e.g., `api.ygiholidayhomes.com`)
4. Update DNS records as instructed by Railway

## Troubleshooting

### 502 Bad Gateway Error
- ✅ **FIXED:** Server now binds to `0.0.0.0` which allows Railway's reverse proxy to connect
- Check Railway logs for any errors
- Verify environment variables are set correctly

### CORS Errors
- Make sure `FRONTEND_URL` environment variable includes your frontend domain
- Check that Railway URL is in `allowedOrigins` in `server.js`

### Port Issues
- Railway automatically sets `PORT` - don't override it
- The server uses `process.env.PORT || 5000` which works with Railway

### Environment Variables Not Loading
- Make sure variables are set in Railway dashboard → **Variables** tab
- Redeploy after adding new variables
- Check variable names match exactly (case-sensitive)

### Build Fails
- Check Railway logs for specific error
- Verify `package.json` has correct `start` script
- Make sure `node_modules` is in `.gitignore` (it is)

## Monitoring

- **Logs:** Railway dashboard → **Deployments** → **Logs**
- **Metrics:** Railway dashboard → **Metrics** tab
- **Health Checks:** Use `/health` endpoint for monitoring

## Continuous Deployment

Railway automatically deploys when you push to your main branch. To disable:
- Go to **Settings** → **Source** → Disable auto-deploy

## Support

- Railway Docs: https://docs.railway.app
- Railway Discord: https://discord.gg/railway

