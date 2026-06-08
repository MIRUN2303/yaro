# Supabase Setup Guide

## 1. Create a Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click **New Project**
3. Fill in:
   - **Name:** `yaro`
   - **Database Password:** Generate a strong password, save it in `.env`
   - **Region:** Choose closest to you
4. Click **Create new project** (takes ~2 minutes)

## 2. Get API Keys

1. In the Supabase Dashboard, go to **Project Settings → API**
2. Copy these into your `.env`:
   - `SUPABASE_URL` = **Project URL** (e.g. `https://abc123.supabase.co`)
   - `SUPABASE_SERVICE_KEY` = **service_role key** (NOT the anon key)

## 3. Run the Migration

### Option A: SQL Editor (recommended)

1. In Supabase Dashboard, go to **SQL Editor**
2. Click **New Query**
3. Open `backend/src/migrations/001_initial.sql`, copy the entire contents
4. Paste into the SQL Editor
5. Click **Run**
6. Verify all tables were created: go to **Table Editor** — you should see 8 tables

### Option B: Local CLI

```bash
psql "$SUPABASE_DB_CONNECTION" -f backend/src/migrations/001_initial.sql
```

## 4. Configure Authentication

1. In Supabase Dashboard, go to **Authentication → Settings**
2. Under **Email Auth**, ensure email/password signup is **enabled**
3. (Optional) Disable **Confirm email** if you want immediate sign-in without email verification:
   - Go to **Authentication → Providers → Email**
   - Turn off **Confirm email**

## 5. Configure Storage (for images)

1. Go to **Storage**
2. Click **New Bucket**
3. **Name:** `products`
4. **Public bucket:** ✅ Enabled
5. Click **Create bucket**
6. Go to **Storage → products → Policies**
7. Click **New Policy → For full customization**
8. Run this SQL:
   ```sql
   CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'products');
   CREATE POLICY "Admin Upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'products' AND auth.role() = 'service_role');
   ```

## 6. Configure Email (Resend)

1. Go to [resend.com](https://resend.com) and sign up
2. Verify your domain
3. Go to **API Keys** and create a key
4. Copy into `.env`:
   - `RESEND_API_KEY` = the API key
   - `RESEND_FROM` = email address you verified (e.g. `noreply@yourdomain.com`)

## 7. Configure Payments (Razorpay)

1. Go to [razorpay.com](https://razorpay.com) and sign up
2. Go to **Settings → API Keys**
3. Generate a key pair
4. Copy into `.env`:
   - `RAZORPAY_KEY_ID` = Key ID
   - `RAZORPAY_KEY_SECRET` = Key Secret
5. For webhooks:
   - Go to **Settings → Webhooks**
   - Add webhook URL: `https://yourdomain.com/api/payments/webhook`
   - Events: `payment.captured`

## 8. Set Admin Credentials

In `.env`, set:
```
ADMIN_EMAIL=you@example.com
ADMIN_PASSWORD=your-strong-password
ADMIN_PATH=a-random-secret-path
```

The admin dashboard will be available at `/api/admin/<ADMIN_PATH>` — NOT at `/admin`.

## 9. Start the Backend

```bash
cd backend
npm install
node src/index.js
```

The server starts at `http://localhost:3001`.

## 10. Update api.js Frontend Config

In `api.js`, the `API_BASE` is set to `http://localhost:3001`. Change this to your production URL when deploying.
