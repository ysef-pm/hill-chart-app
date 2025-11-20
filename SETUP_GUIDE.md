# Step-by-Step Setup Guide

Follow these instructions carefully to get your Hill Chart app up and running.

## Step 1: Get Firebase Credentials (10 minutes)

### Create a Firebase Project

1. **Go to Firebase Console**
   - Visit: https://console.firebase.google.com/
   - Click "Add project" (or "Create a project")

2. **Configure Your Project**
   - Enter a project name (e.g., "Hill Chart App")
   - Click "Continue"
   - Choose whether to enable Google Analytics (optional)
   - Click "Create project"
   - Wait for the project to be created (takes ~30 seconds)
   - Click "Continue"

3. **Register Your Web App**
   - On the project home page, click the **web icon** `</>`
   - Enter an app nickname: "Hill Chart Web App"
   - **Do NOT** check "Also set up Firebase Hosting"
   - Click "Register app"

4. **Copy Your Firebase Config**
   - You'll see a code snippet with your `firebaseConfig`
   - **IMPORTANT**: Copy these values somewhere safe:
   ```javascript
   const firebaseConfig = {
     apiKey: "AIza...",              // ← Copy this
     authDomain: "your-app.firebaseapp.com",  // ← Copy this
     projectId: "your-app",          // ← Copy this
     storageBucket: "your-app.appspot.com",   // ← Copy this
     messagingSenderId: "123456789",  // ← Copy this
     appId: "1:123456789:web:abc123" // ← Copy this
   };
   ```
   - Click "Continue to console"

### Enable Firestore Database

1. **Navigate to Firestore**
   - In the left sidebar, click **"Build"** (or "Develop")
   - Click **"Firestore Database"**
   - Click **"Create database"**

2. **Configure Security Rules**
   - Choose **"Start in test mode"**
   - **Important**: This allows all reads/writes. We'll secure it later.
   - Click "Next"

3. **Choose a Location**
   - Select a Cloud Firestore location close to your users
   - Example: `us-central` for US, `europe-west` for Europe
   - **Note**: This cannot be changed later!
   - Click "Enable"
   - Wait for database creation (~1 minute)

### Enable Anonymous Authentication

1. **Navigate to Authentication**
   - In the left sidebar, click **"Build"** > **"Authentication"**
   - Click **"Get started"**

2. **Enable Anonymous Sign-In**
   - Click the **"Sign-in method"** tab at the top
   - Find **"Anonymous"** in the list
   - Click on it
   - Toggle **"Enable"** to ON
   - Click **"Save"**

### Summary - You should now have:
- ✅ Firebase project created
- ✅ 6 configuration values copied
- ✅ Firestore Database enabled (in test mode)
- ✅ Anonymous authentication enabled

---

## Step 2: Get Gemini API Key (5 minutes)

1. **Visit Google AI Studio**
   - Go to: https://makersuite.google.com/app/apikey
   - Sign in with your Google account

2. **Create an API Key**
   - Click **"Create API Key"**
   - Choose **"Create API key in new project"** (or select existing project)
   - Click **"Create API key in new project"**

3. **Copy Your API Key**
   - You'll see something like: `AIzaSyC...`
   - Click the copy icon or select and copy the entire key
   - **IMPORTANT**: Save this somewhere safe!

### Summary - You should now have:
- ✅ Gemini API key copied

---

## Step 3: Configure Your Project (3 minutes)

1. **Open the `.env` file**
   - It's in the root of your `hill-chart-app` folder
   - Open it with any text editor

2. **Replace ALL placeholder values**

   **Before:**
   ```env
   VITE_FIREBASE_API_KEY=your_firebase_api_key_here
   VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id_here
   VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id_here
   VITE_FIREBASE_APP_ID=your_app_id_here
   VITE_GEMINI_API_KEY=your_gemini_api_key_here
   ```

   **After (with your actual values):**
   ```env
   VITE_FIREBASE_API_KEY=AIzaSyC_abcd1234567890
   VITE_FIREBASE_AUTH_DOMAIN=hill-chart-12345.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=hill-chart-12345
   VITE_FIREBASE_STORAGE_BUCKET=hill-chart-12345.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=987654321
   VITE_FIREBASE_APP_ID=1:987654321:web:abc123def456
   VITE_GEMINI_API_KEY=AIzaSyB_xyz9876543210
   ```

3. **Save the file**
   - Make sure to save your changes!

### Summary - You should now have:
- ✅ `.env` file filled with your real credentials

---

## Step 4: Run Your App Locally (2 minutes)

1. **Open Terminal/Command Prompt**
   - On Mac: Press `Cmd + Space`, type "Terminal", press Enter
   - On Windows: Press `Win + R`, type "cmd", press Enter

2. **Navigate to your project**
   ```bash
   cd path/to/hill-chart-app
   ```

3. **Install dependencies** (if not already done)
   ```bash
   npm install
   ```
   - This takes ~1-2 minutes
   - You'll see a progress bar

4. **Start the development server**
   ```bash
   npm run dev
   ```
   - You should see:
   ```
   VITE v5.x.x  ready in xxx ms

   ➜  Local:   http://localhost:5173/
   ➜  Network: use --host to expose
   ```

5. **Open your browser**
   - Go to: http://localhost:5173
   - You should see your Hill Chart app!

### Summary - You should now have:
- ✅ App running locally on localhost:5173

---

## Step 5: Deploy to GitHub (5 minutes)

1. **Check Git is installed**
   ```bash
   git --version
   ```
   - If you get an error, install Git: https://git-scm.com/downloads

2. **Check if gh CLI is installed**
   ```bash
   gh --version
   ```
   - If not installed, install it: https://cli.github.com/

3. **Login to GitHub via CLI**
   ```bash
   gh auth login
   ```
   - Choose "GitHub.com"
   - Choose "HTTPS"
   - Choose "Login with a web browser"
   - Press Enter and follow the prompts

4. **Initialize Git repository**
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Hill Chart app"
   ```

5. **Create GitHub repository**
   ```bash
   gh repo create hill-chart-app --public --source=. --remote=origin --push
   ```
   - This creates the repo and pushes your code

### Summary - You should now have:
- ✅ Code pushed to GitHub repository

---

## Step 6: Deploy to Vercel (5 minutes)

### Option A: Via Vercel Website (Easiest)

1. **Go to Vercel**
   - Visit: https://vercel.com
   - Click "Sign Up" or "Log In"
   - Choose "Continue with GitHub"

2. **Import Your Repository**
   - Click "Add New..." > "Project"
   - Find your "hill-chart-app" repository
   - Click "Import"

3. **Configure Environment Variables**
   - Scroll down to "Environment Variables"
   - Add each variable from your `.env` file:
     - Name: `VITE_FIREBASE_API_KEY`, Value: `[your value]`
     - Name: `VITE_FIREBASE_AUTH_DOMAIN`, Value: `[your value]`
     - Name: `VITE_FIREBASE_PROJECT_ID`, Value: `[your value]`
     - Name: `VITE_FIREBASE_STORAGE_BUCKET`, Value: `[your value]`
     - Name: `VITE_FIREBASE_MESSAGING_SENDER_ID`, Value: `[your value]`
     - Name: `VITE_FIREBASE_APP_ID`, Value: `[your value]`
     - Name: `VITE_GEMINI_API_KEY`, Value: `[your value]`
   - **Important**: Copy-paste each value exactly!

4. **Deploy**
   - Click "Deploy"
   - Wait ~2-3 minutes for the build
   - You'll get a URL like: `https://hill-chart-app-xyz.vercel.app`

5. **Done!**
   - Click "Visit" to see your live app
   - Share the URL with your team!

### Option B: Via Vercel CLI

```bash
# Install Vercel CLI globally
npm install -g vercel

# Login to Vercel
vercel login

# Deploy to Vercel
vercel

# Follow the prompts:
# - Set up and deploy? Yes
# - Which scope? Your account
# - Link to existing project? No
# - Project name? hill-chart-app
# - Directory? ./
# - Want to override settings? No

# Add environment variables in the Vercel dashboard:
# Visit: https://vercel.com/your-username/hill-chart-app/settings/environment-variables

# Deploy to production
vercel --prod
```

### Summary - You should now have:
- ✅ Live app URL (e.g., `https://hill-chart-app.vercel.app`)
- ✅ App accessible to anyone on the internet

---

## Common Issues & Solutions

### Issue: "Firebase: Error (auth/operation-not-allowed)"
**Solution**: You forgot to enable Anonymous authentication in Firebase Console
- Go to Firebase Console > Authentication > Sign-in method
- Enable "Anonymous"

### Issue: API error 403 from Gemini
**Solution**: Your Gemini API key is invalid or exceeded quota
- Double-check you copied the entire key
- Check quota at: https://makersuite.google.com/app/apikey

### Issue: "Cannot find module 'firebase'"
**Solution**: Dependencies not installed
```bash
npm install
```

### Issue: Blank page / White screen
**Solution**: Check browser console (F12) for errors
- Most likely: Missing environment variables
- Check `.env` file has all values filled in

### Issue: Changes not showing on Vercel
**Solution**: Vercel needs to rebuild
- Go to Vercel dashboard
- Click "Deployments"
- Click "Redeploy" on the latest deployment

---

## Security: Lock Down Your Firebase (Important for Production)

Once your app is working, **immediately** update your Firestore security rules:

1. Go to Firebase Console > Firestore Database > Rules
2. Replace the rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /artifacts/{appId}/public/data/pins/{pinId} {
      // Anyone authenticated can read
      allow read: if request.auth != null;

      // Anyone authenticated can create
      allow create: if request.auth != null;

      // Users can only delete their own pins
      allow delete: if request.auth != null &&
                      resource.data.uid == request.auth.uid;
    }
  }
}
```

3. Click "Publish"

---

## Next Steps

- **Customize**: Change colors, text, or add features
- **Share**: Send your Vercel URL to your team
- **Monitor**: Check Firebase Console > Firestore to see data in real-time
- **Secure**: Set up API key restrictions in Google Cloud Console

---

## Need Help?

- Check the main README.md for troubleshooting
- Check browser console (F12) for error messages
- Verify all environment variables are correct
- Make sure Firebase services are enabled

Congratulations! Your Hill Chart app is now live! 🎉
