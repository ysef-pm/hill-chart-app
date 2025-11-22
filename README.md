# Project Hill Chart

A beautiful, real-time project tracking tool using the Hill Chart methodology. Track your project's progress from uncertainty (figuring it out) to execution (getting it done) with AI-powered insights.

## Features

- **Interactive Hill Chart**: Visual representation of project progress
- **Real-time Collaboration**: Updates sync instantly across all users via Firebase
- **AI-Powered Suggestions**: Get actionable next steps powered by Google's Gemini AI
- **Status Reports**: Generate comprehensive project status reports automatically
- **Emoji Status Indicators**: Express how you're feeling about each task
- **Responsive Design**: Beautiful UI that works on all devices

## Prerequisites

Before you begin, you'll need:

1. **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
2. **Firebase Account** - Free tier works great
3. **Google AI Studio Account** - For Gemini API access

## Setup Instructions

### 1. Clone or Download This Repository

```bash
cd hill-chart-app
npm install
```

### 2. Get Your Firebase Credentials

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or select an existing project
3. Click the web icon (</>) to create a web app
4. Register your app with a nickname (e.g., "Hill Chart App")
5. Copy the firebaseConfig object - you'll need these values:
   - `apiKey`
   - `authDomain`
   - `projectId`
   - `storageBucket`
   - `messagingSenderId`
   - `appId`

### 3. Enable Firebase Services

#### Enable Firestore Database:
1. In Firebase Console, go to **Build** > **Firestore Database**
2. Click "Create database"
3. Start in **Test mode** (you can secure it later)
4. Choose a location close to your users
5. Click "Enable"

#### Enable Anonymous Authentication:
1. Go to **Build** > **Authentication**
2. Click "Get started"
3. Go to **Sign-in method** tab
4. Enable **Anonymous** authentication
5. Click "Save"

### 4. Get Your Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy your API key

### 5. Configure Environment Variables

1. Open the `.env` file in the project root
2. Replace the placeholder values with your actual credentials:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id_here
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id_here
VITE_FIREBASE_APP_ID=your_app_id_here

# Gemini API Key
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

**Important**: Never commit your `.env` file to GitHub! It's already in `.gitignore`.

### 6. Run Locally

```bash
npm run dev
```

Your app will be available at `http://localhost:5173`

## Deployment to Vercel (Recommended)

Vercel offers the easiest deployment experience:

### Option 1: Deploy via Vercel Dashboard

1. Go to [vercel.com](https://vercel.com) and sign up/login
2. Click "Add New Project"
3. Import your GitHub repository
4. Add your environment variables in the Vercel dashboard:
   - Go to **Settings** > **Environment Variables**
   - Add each `VITE_*` variable from your `.env` file
5. Click "Deploy"

### Option 2: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Add environment variables when prompted or add them in the dashboard
# Then deploy to production
vercel --prod
```

## Deployment to Netlify

1. Build your project:
   ```bash
   npm run build
   ```

2. Go to [netlify.com](https://netlify.com) and sign up/login

3. Drag and drop the `dist` folder to the deploy area

4. Add environment variables:
   - Go to **Site settings** > **Build & deploy** > **Environment**
   - Add each `VITE_*` variable from your `.env` file

5. Trigger a new deploy

## Deployment to GitHub Pages

1. Install the gh-pages package:
   ```bash
   npm install -D gh-pages
   ```

2. Add these scripts to your `package.json`:
   ```json
   {
     "scripts": {
       "predeploy": "npm run build",
       "deploy": "gh-pages -d dist"
     }
   }
   ```

3. Update `vite.config.js` to set the base URL:
   ```javascript
   export default defineConfig({
     base: '/hill-chart-app/',
     // ... rest of config
   })
   ```

4. Deploy:
   ```bash
   npm run deploy
   ```

**Note**: GitHub Pages doesn't support environment variables securely. For production, use Vercel or Netlify instead.

## Project Structure

```
hill-chart-app/
├── src/
│   ├── App.jsx          # Main application component
│   ├── index.css        # Tailwind CSS imports
│   └── main.jsx         # React entry point
├── public/              # Static assets
├── .env                 # Environment variables (not committed)
├── .env.example         # Example environment file
├── package.json         # Dependencies
├── vite.config.js       # Vite configuration
└── README.md           # This file
```

## How to Use

1. **Add a Pin**: Click anywhere on the hill to place a pin
2. **Choose Your Feeling**: Select an emoji that represents your mood
3. **Describe Your Status**: Write what you're working on or what's blocking you
4. **Get AI Suggestions**: Click "Suggest Next Steps" for AI-powered recommendations
5. **Generate Reports**: Click "Generate Status Report" for a comprehensive project summary
6. **Delete Pins**: Hover over a pin and click the delete button

## Security Considerations

### Firestore Security Rules

Before going to production, update your Firestore security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /artifacts/{appId}/public/data/pins/{pinId} {
      // Users can only read their own pins
      allow read: if request.auth != null &&
                    resource.data.uid == request.auth.uid;

      // Users can create pins (uid must match their auth)
      allow create: if request.auth != null &&
                      request.resource.data.uid == request.auth.uid;

      // Users can only update/delete their own pins
      allow update, delete: if request.auth != null &&
                              resource.data.uid == request.auth.uid;
    }
  }
}
```

### API Key Protection

- Never expose your API keys in client-side code without restrictions
- Set up API key restrictions in Google Cloud Console and Firebase Console
- Consider using Firebase Cloud Functions for sensitive operations

## Troubleshooting

### "Firebase: Error (auth/operation-not-allowed)"
- Make sure Anonymous authentication is enabled in Firebase Console

### "API Error: 403" from Gemini
- Check that your Gemini API key is correct
- Verify your API key has not exceeded its quota

### Styles not loading
- Make sure Tailwind CSS is installed: `npm install -D tailwindcss postcss autoprefixer`
- Check that `tailwind.config.js` exists

### Build errors
- Clear your node_modules and reinstall: `rm -rf node_modules package-lock.json && npm install`
- Make sure all environment variables are set

## Technologies Used

- **React** - UI library
- **Vite** - Build tool
- **Firebase** - Real-time database and authentication
- **Firestore** - NoSQL database
- **Gemini AI** - AI-powered suggestions
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Icon library

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Support

If you encounter any issues:

1. Check the console for error messages
2. Verify all environment variables are set correctly
3. Ensure Firebase services are properly enabled
4. Check that your API keys have the necessary permissions

## Contributing

Contributions are welcome! Feel free to submit issues or pull requests.
