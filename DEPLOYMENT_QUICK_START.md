# Jammal Perfume - Quick Vercel Deployment Checklist

## ✅ Pre-Deployment Steps (Do This First)

### 1. Prepare Your Credentials
Gather these from your dashboard accounts:
- [ ] Clerk Publishable Key (https://dashboard.clerk.com)
- [ ] Clerk Secret Key 
- [ ] Razorpay Key ID (https://dashboard.razorpay.com)
- [ ] Razorpay Key Secret
- [ ] Supabase URL (https://supabase.com)
- [ ] Supabase Anon Key
- [ ] Supabase Service Key

### 2. Create PostgreSQL Database
Choose ONE option:
- [ ] **Option A**: Vercel Postgres (Easiest - integrated with Vercel)
- [ ] **Option B**: Supabase (https://supabase.com)
- [ ] **Option C**: Neon (https://neon.tech)

Copy your PostgreSQL connection string (DATABASE_URL)

### 3. Verify GitHub is Updated
```bash
git status              # Should be clean
git log --oneline -5    # Should see your commits
```

---

## 🚀 Vercel Deployment (5 Minutes)

### Step 1: Connect Repository
1. Go to https://vercel.com/new
2. Click "Import Git Repository"
3. Select your GitHub repository (jamaal-perfume)
4. Click "Import"

### Step 2: Configure Environment Variables
In Vercel dashboard, add these in "Environment Variables":

```
DATABASE_URL = your_postgresql_connection_string
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = your_clerk_key
CLERK_SECRET_KEY = your_clerk_secret
RAZORPAY_KEY_ID = your_razorpay_key
RAZORPAY_KEY_SECRET = your_razorpay_secret
NEXT_PUBLIC_SUPABASE_URL = your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY = your_supabase_anon_key
SUPABASE_SERVICE_KEY = your_supabase_service_key
```

### Step 3: Deploy
- Click "Deploy"
- Wait for deployment (2-5 minutes)
- You'll get a production URL

### Step 4: Initialize Database (IMPORTANT!)
After deployment succeeds:

**Option A: Via Vercel CLI**
```bash
npm i -g vercel          # Install Vercel CLI
vercel env pull          # Pull environment variables locally
npx prisma db push       # Push schema to database
npx prisma db seed       # Seed initial data
```

**Option B: Via GitHub (Automated)**
- Vercel will run build command
- Check deployment logs for any errors
- Database should auto-initialize

---

## ✅ Post-Deployment Testing

### 1. Test Basic Functionality
- [ ] Visit production URL
- [ ] Browse products
- [ ] Test search functionality
- [ ] Add items to cart

### 2. Test Authentication
- [ ] Login with email
- [ ] Logout
- [ ] Access protected pages (/account/profile)
- [ ] Access admin pages (should require ADMIN role)

### 3. Test Payments (Use Razorpay Test Keys!)
- [ ] Go to checkout
- [ ] Use test card: `4111 1111 1111 1111`
- [ ] Verify order is created
- [ ] Check order tracking works

### 4. Test Image Upload
- [ ] Admin → Products → Upload image
- [ ] Verify image appears on product page
- [ ] Check image loads from Supabase CDN

### 5. Monitor Logs
- [ ] Go to Vercel dashboard → Deployments
- [ ] Click production deployment
- [ ] Check "Logs" for any errors
- [ ] Look for database connection messages

---

## 🆘 Common Issues & Solutions

### Issue: "Cannot connect to database"
**Solution:**
- Verify DATABASE_URL in Vercel environment variables
- Check PostgreSQL is accessible from Vercel IPs
- For Vercel Postgres: Check firewall settings
- Run: `vercel env pull` and test locally first

### Issue: "Prisma migration failed"
**Solution:**
- Connect via CLI: `vercel env pull`
- Run: `npx prisma db push` (not migrate)
- Check schema.prisma syntax
- Verify database credentials

### Issue: "Clerk authentication not working"
**Solution:**
- Verify CLERK_PUBLISHABLE_KEY and CLERK_SECRET_KEY
- Add Vercel production URL to Clerk allowed URLs
- Restart deployment after updating Clerk settings

### Issue: "Images not loading"
**Solution:**
- Check SUPABASE_* environment variables
- Verify Supabase project is active
- Check file upload size limits
- Verify image storage bucket permissions

### Issue: "Payment gateway errors"
**Solution:**
- Confirm using test keys (not live keys) for testing
- Check Razorpay key format (should be long strings)
- Verify keys are correctly set in environment
- Check Razorpay dashboard for API access

---

## 📊 Monitoring & Maintenance

### Set Up Alerts
- [ ] Enable error notifications in Vercel
- [ ] Configure Slack/email alerts

### Regular Checks
- [ ] Weekly: Check Vercel analytics
- [ ] Weekly: Check error logs
- [ ] Monthly: Review database usage
- [ ] Monthly: Update dependencies

### Backup Database
- [ ] Set up PostgreSQL automated backups (database provider)
- [ ] Export data monthly

---

## 🔗 Useful Links

- Vercel Dashboard: https://vercel.com/dashboard
- Deployment Logs: https://vercel.com/dashboard/[project]/deployments
- Environment Variables: https://vercel.com/dashboard/[project]/settings/environment-variables
- Vercel Docs: https://vercel.com/docs
- Prisma Docs: https://prisma.io/docs

---

## ❓ Need Help?

1. Check VERCEL_DEPLOYMENT.md for detailed guide
2. Check Vercel deployment logs for specific errors
3. Review error messages in Vercel Analytics
4. Check GitHub Issues for similar problems
5. Contact support via Vercel dashboard

---

## 🎉 Success!
Your Jammal Perfume e-commerce platform is now live on Vercel! 

**Your production URL:** `https://[your-project-name].vercel.app`

Next steps:
- [ ] Set up custom domain (optional)
- [ ] Enable password protection during development
- [ ] Set up monitoring/analytics
- [ ] Configure email notifications
