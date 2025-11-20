# Quick Start Guide

Your Hill Chart app is ready to deploy! Follow these steps:

## 🎯 What You Need To Do

### 1. Get Your API Keys (15 minutes)

You need two sets of credentials:

#### A. Firebase Setup
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable **Firestore Database** (test mode)
4. Enable **Anonymous Authentication**
5. Copy your Firebase config values

#### B. Gemini API Setup
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create an API key
3. Copy the key

**Detailed instructions**: See `SETUP_GUIDE.md` for step-by-step screenshots and explanations.

### 2. Configure Your App (2 minutes)

1. Open the `.env` file in this directory
2. Replace ALL the placeholder values with your real credentials
3. Save the file

```env
VITE_FIREBASE_API_KEY=your_actual_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_actual_domain_here
# ... and so on
```

### 3. Test Locally (1 minute)

```bash
npm install
npm run dev
```

Open http://localhost:5173 - you should see your app!

### 4. Deploy to Vercel (5 minutes)

**Option A: Via Website (Easiest)**
1. Go to [vercel.com](https://vercel.com)
2. Click "Import Project"
3. Connect to your GitHub repo: `https://github.com/ysef-pm/hill-chart-app`
4. Add all environment variables from your `.env` file
5. Click "Deploy"

**Option B: Via CLI**
```bash
npm install -g vercel
vercel login
vercel
# Add environment variables in Vercel dashboard
vercel --prod
```

## 📁 Your Repository

Your code is now on GitHub:
**https://github.com/ysef-pm/hill-chart-app**

## 📚 Full Documentation

- **SETUP_GUIDE.md** - Detailed step-by-step instructions with troubleshooting
- **README.md** - Complete project documentation and deployment options

## 🆘 Common Issues

**Problem**: White screen after deploying
**Solution**: Check that ALL environment variables are added to Vercel

**Problem**: Firebase errors
**Solution**: Make sure you enabled Firestore and Anonymous Auth in Firebase Console

**Problem**: Gemini API errors
**Solution**: Verify your API key is correct and hasn't exceeded quota

## 🎉 That's It!

Once deployed, share your URL with your team and start tracking projects on your Hill Chart!
