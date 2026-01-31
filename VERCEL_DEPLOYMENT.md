# Jammal Perfume - Vercel Deployment Guide

## Prerequisites
- Vercel account (https://vercel.com)
- GitHub repository pushed (✅ Already done)
- PostgreSQL database (we'll use Vercel Postgres or Supabase)

## Step 1: Create Environment Variables

### Local Development (.env.local)
```
# Database
DATABASE_URL="your_database_url"

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_key
CLERK_SECRET_KEY=your_clerk_secret

# Razorpay Payment
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret

# Supabase (for image storage)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
SUPABASE_SERVICE_KEY=your_supabase_service_key
```

## Step 2: Database Setup

### Option A: Vercel Postgres (Recommended for Vercel)
1. Go to your Vercel project dashboard
2. Go to Storage → Create Database → Postgres
3. Copy the `DATABASE_URL` from the connection string

### Option B: Supabase PostgreSQL
1. Create a project at https://supabase.com
2. Go to Project Settings → Database → Connection String
3. Copy the PostgreSQL connection URL

### Option C: Neon (Free PostgreSQL)
1. Visit https://neon.tech
2. Create a project and database
3. Copy the connection string

## Step 3: Update Prisma Schema

The schema.prisma has been updated to support PostgreSQL:
- Changed provider from `sqlite` to `postgresql`
- Updated DATABASE_URL to use PostgreSQL connection string

## Step 4: Deploy to Vercel

### Method 1: Using Vercel Dashboard
1. Push all code to GitHub
2. Go to https://vercel.com/new
3. Import your GitHub repository
4. Configure environment variables:
   - Add all variables from your .env.local
   - Click Deploy

### Method 2: Using Vercel CLI
```bash
npm i -g vercel
vercel env pull          # Pull environment variables
vercel deploy           # Deploy to production
```

## Step 5: Database Migration on Vercel

After deployment, run migrations:

```bash
# Connect to Vercel project
vercel env pull

# Run migrations
npx prisma migrate deploy

# Or seed the database
npx prisma db seed
```

You can also run these commands in Vercel's deployment logs.

## Environment Variables to Add in Vercel Dashboard

1. **DATABASE_URL** - PostgreSQL connection string
2. **NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY** - From Clerk dashboard
3. **CLERK_SECRET_KEY** - From Clerk dashboard
4. **RAZORPAY_KEY_ID** - From Razorpay dashboard
5. **RAZORPAY_KEY_SECRET** - From Razorpay dashboard
6. **NEXT_PUBLIC_SUPABASE_URL** - From Supabase project
7. **NEXT_PUBLIC_SUPABASE_ANON_KEY** - From Supabase project
8. **SUPABASE_SERVICE_KEY** - From Supabase project

## Important Notes

✅ **What's Updated:**
- Prisma schema changed from SQLite to PostgreSQL
- Database migrations support added
- All environment variables documented

⚠️ **Before Deploying:**
1. Ensure all code is committed and pushed to GitHub
2. Update .env.local with actual values (keep sensitive)
3. Test locally with PostgreSQL if possible
4. Create database and run migrations

📱 **Post-Deployment:**
1. Verify all API routes work
2. Test authentication with Clerk
3. Test payments with Razorpay test keys
4. Verify image uploads to Supabase
5. Monitor Vercel logs for any errors

## Troubleshooting

### "Database connection error"
- Check DATABASE_URL in Vercel environment variables
- Ensure database is accessible from Vercel IP
- For Vercel Postgres, add to Allowed IPs

### "Prisma migration failed"
- Run: `npx prisma db push` instead of migrate
- Check schema.prisma for syntax errors
- Verify database credentials

### "Image upload not working"
- Check Supabase environment variables
- Verify Supabase project is active
- Check file size limits (50MB max)

## Production Checklist

- [ ] Database created and migrated
- [ ] All environment variables set in Vercel
- [ ] Clerk authentication configured
- [ ] Razorpay payment keys added
- [ ] Supabase configured for images
- [ ] Prisma migrations applied
- [ ] Initial data seeded
- [ ] Domain configured (custom domain optional)
- [ ] SSL certificate enabled
- [ ] Analytics/monitoring enabled

## Resources

- Vercel Docs: https://vercel.com/docs
- Prisma Docs: https://www.prisma.io/docs
- Clerk Docs: https://clerk.com/docs
- Supabase Docs: https://supabase.com/docs
