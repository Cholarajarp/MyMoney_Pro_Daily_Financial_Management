# MyMoney Pro Deployment Guide

## 🚀 Quick Deployment Options

### Option 1: Render (Recommended - Easiest)

1. **Fork this repository** to your GitHub account

2. **Sign up at Render.com** (free tier available)

3. **Deploy using Blueprint:**
   - Click "New" → "Blueprint"
   - Connect your GitHub repository
   - Render will detect `render.yaml` and deploy automatically
   - Both frontend and backend will be deployed together
   - You'll get URLs like:
     - Frontend: `https://mymoney-frontend.onrender.com`
     - Backend: `https://mymoney-backend.onrender.com`

4. **Update frontend environment:**
   - Go to frontend service settings
   - Update `REACT_APP_API_URL` to your backend URL
   - Redeploy frontend

5. **Done!** Your app is live 🎉

### Option 2: Docker Deployment (Any Platform)

Works on: AWS, Google Cloud, Azure, DigitalOcean, Heroku, etc.

```bash
# Build and run with Docker Compose (single combined container)
docker-compose up -d --build

# Or build manually
docker build -t mymoney-app -f Dockerfile .

# Run
docker run -p 5000:5000 -v $(pwd)/instance:/app/instance mymoney-app
```

### Option 3: Manual Deployment

#### Backend (Python/Flask)

1. Choose a platform: Heroku, Railway, Fly.io, etc.
2. Set build command: `pip install -r requirements.txt`
3. Set start command: `gunicorn -w 4 -b 0.0.0.0:$PORT backend.app:app`
4. Set environment variables:
   - `JWT_SECRET`: Random secure string
   - `DATABASE_URL`: PostgreSQL connection string (optional)
   - `FLASK_ENV`: production

#### Frontend (React)

1. Choose a platform: Netlify, Vercel, Cloudflare Pages, etc.
2. Set build command: `npm run build`
3. Set publish directory: `build`
4. Set environment variable:
   - `REACT_APP_API_URL`: Your backend URL

---

## 📝 Detailed Render Deployment

### Prerequisites
- GitHub account
- Render account (free)

### Step-by-Step Instructions

#### 1. Prepare Your Repository

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/MyMoney_Pro_Daily_Financial_Management.git
cd MyMoney_Pro_Daily_Financial_Management

# Ensure all files are committed
git add .
git commit -m "Ready for deployment"
git push origin main
```

#### 2. Deploy Backend

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Configure:
   - **Name:** `mymoney-backend`
   - **Environment:** Python 3
   - **Region:** Choose closest to you
   - **Branch:** main
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `python init_db.py && gunicorn -w 4 -b 0.0.0.0:$PORT --timeout 120 backend.app:app`
5. Add Environment Variables:
   - `JWT_SECRET`: Click "Generate" for random value
   - `FLASK_ENV`: `production`
   - `PYTHON_VERSION`: `3.11.0`
6. Click **"Create Web Service"**
7. Wait for deployment (5-10 minutes)
8. Copy your backend URL (e.g., `https://mymoney-backend.onrender.com`)

#### 3. Deploy Frontend

1. Click **"New +"** → **"Static Site"**
2. Connect same GitHub repository
3. Configure:
   - **Name:** `mymoney-frontend`
   - **Branch:** main
   - **Build Command:** `npm install && npm run build`
   - **Publish Directory:** `build`
4. Add Environment Variable:
   - `REACT_APP_API_URL`: Your backend URL from step 2
   - `NODE_VERSION`: `18.18.0`
5. Click **"Create Static Site"**
6. Wait for deployment (5-10 minutes)
7. Your app is live! 🎉

#### 4. Optional: Add PostgreSQL Database

For production use with more data:

1. Click **"New +"** → **"PostgreSQL"**
2. Configure:
   - **Name:** `mymoney-db`
   - **Database:** `mymoney`
   - **User:** `mymoney_user`
   - **Region:** Same as backend
3. Click **"Create Database"**
4. Copy **Internal Database URL**
5. Go to backend service → Environment
6. Add/Update:
   - `DATABASE_URL`: Paste the Internal Database URL
7. Backend will automatically restart and use PostgreSQL

---

## 🐳 Docker Deployment Guide

### Local Docker Testing

```bash
# Test the build
docker-compose build

# Run in foreground (see logs)
docker-compose up

# Run in background
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Remove volumes (database)
docker-compose down -v
```

### Deploy to Cloud with Docker

#### AWS ECS
1. Push images to ECR
2. Create ECS task definitions
3. Deploy to ECS service

#### Google Cloud Run
```bash
gcloud builds submit --tag gcr.io/PROJECT_ID/mymoney-app
gcloud run deploy --image gcr.io/PROJECT_ID/mymoney-app
```

#### DigitalOcean App Platform
1. Connect GitHub repository
2. Select Dockerfile deployment
3. Configure environment variables
4. Deploy

#### Azure Container Instances
```bash
az container create --resource-group myResourceGroup \
  --name mymoney-app --image myregistry.azurecr.io/mymoney-app
```

---

## 🔧 Environment Variables Reference

### Backend Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `JWT_SECRET` | Yes | - | Secret key for JWT tokens (use random 32+ char string) |
| `DATABASE_URL` | No | SQLite | Database connection string |
| `FLASK_ENV` | No | development | Set to `production` for deployment |
| `PORT` | No | 5000 | Port for backend server |
| `PYTHON_VERSION` | No | 3.11 | Python version (for Render) |

### Frontend Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `REACT_APP_API_URL` | Yes | - | Backend API URL (e.g., https://api.example.com) |
| `NODE_VERSION` | No | 18 | Node.js version (for Render) |
| `PORT` | No | 3000 | Port for development server |

### Example Production .env

```env
# Backend
JWT_SECRET=super-secret-random-key-change-this-in-production-32-chars-minimum
DATABASE_URL=postgresql://user:password@host:5432/mymoney_prod
FLASK_ENV=production

# Frontend
REACT_APP_API_URL=https://mymoney-backend.onrender.com
```

---

## 🗄️ Database Options

### Development: SQLite (Default)
- No setup needed
- File-based: `instance/mymoney.db`
- Good for testing

### Production: PostgreSQL (Recommended)
- Better performance
- Scalable
- Render provides free tier
- Set `DATABASE_URL` environment variable

### Connection String Format
```
PostgreSQL: postgresql://username:password@host:5432/database
MySQL:      mysql://username:password@host:3306/database
SQLite:     sqlite:///path/to/database.db
```

---

## 📊 Monitoring & Maintenance

### Health Checks

Both services include health check endpoints:
- Backend: `GET /api/health`
- Frontend: `GET /` (main page)

### Logs

**Render:**
- Click on service → "Logs" tab
- Real-time log streaming

**Docker:**
```bash
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Backups

**SQLite (Development):**
```bash
cp instance/mymoney.db backups/mymoney_$(date +%Y%m%d).db
```

**PostgreSQL (Render):**
- Go to database → "Backups" tab
- Manual backup or scheduled backups

### Updating

```bash
# Pull latest changes
git pull origin main

# Render: Auto-deploys on git push (if auto-deploy enabled)
# Docker: Rebuild and restart
docker-compose down
docker-compose up -d --build
```

---

## 🚨 Troubleshooting

### Backend won't start
- Check `DATABASE_URL` is correct
- Verify Python version is 3.11+
- Check logs for errors
- Ensure all environment variables are set

### Frontend can't connect to backend
- Verify `REACT_APP_API_URL` is correct
- Check backend is running and accessible
- Ensure CORS is configured correctly
- Check browser console for errors

### Database errors
- For PostgreSQL: Check connection string
- For SQLite: Ensure `instance/` directory exists
- Run `python init_db.py` to initialize

### Docker issues
- Clear cache: `docker-compose down -v`
- Rebuild: `docker-compose up --build`
- Check logs: `docker-compose logs`

---

## 🔐 Security Checklist

Before deploying to production:

- [ ] Change `JWT_SECRET` to random secure string
- [ ] Use PostgreSQL instead of SQLite
- [ ] Enable HTTPS (Render does this automatically)
- [ ] Set `FLASK_ENV=production`
- [ ] Review CORS settings
- [ ] Set up regular database backups
- [ ] Monitor error logs
- [ ] Set up uptime monitoring

---

## 📈 Performance Optimization

### Backend
- Use PostgreSQL for better performance
- Increase Gunicorn workers: `gunicorn -w 8 ...`
- Enable database connection pooling
- Add Redis for caching (optional)

### Frontend
- Nginx handles compression automatically
- Static assets cached for 1 year
- React production build is optimized
- Consider CDN for global performance

---

## 💰 Cost Estimate

### Free Tier (Perfect for personal use)
- **Render:** Free tier includes:
  - 750 hours/month web service (backend)
  - Unlimited static sites (frontend)
  - 90 days PostgreSQL (1GB)
- **Total:** $0/month

### Paid Tier (For production/team use)
- **Render Starter:** $7/month per service
- **PostgreSQL:** $7/month (1GB)
- **Total:** ~$21/month for full production setup

### Alternative: Self-hosted with Docker
- DigitalOcean Droplet: $6/month
- AWS Lightsail: $5/month
- Hetzner: €4/month

---

## 🎯 Next Steps After Deployment

1. **Custom Domain** (Optional)
   - Render: Add custom domain in settings
   - Update CORS in backend
   - SSL certificate (automatic)

2. **Monitoring**
   - Set up uptime monitoring (UptimeRobot, Pingdom)
   - Configure error tracking (Sentry)
   - Set up analytics (optional)

3. **Backups**
   - Schedule daily database backups
   - Export important data regularly

4. **Updates**
   - Enable auto-deploy on Render
   - Or deploy manually when needed

---

## 📞 Need Help?

- **GitHub Issues:** [Report bugs](https://github.com/Cholarajarp/MyMoney_Pro_Daily_Financial_Management/issues)
- **Discussions:** [Ask questions](https://github.com/Cholarajarp/MyMoney_Pro_Daily_Financial_Management/discussions)
- **Render Docs:** [render.com/docs](https://render.com/docs)
- **Docker Docs:** [docs.docker.com](https://docs.docker.com)

---

**Happy Deploying! 🚀**

