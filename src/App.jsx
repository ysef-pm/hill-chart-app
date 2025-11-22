import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import Login from './components/Login';
import Launcher from './components/Launcher';
import HillChartApp from './components/HillChartApp';
import { FeelingsWheelApp } from './components/FeelingsWheel';
import { RetroBoardApp } from './components/RetroBoard';

export default function App() {
  const [user, setUser] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [currentApp, setCurrentApp] = useState(null); // null = Launcher, 'hill-chart' = HillChartApp

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoadingAuth(false);
      // Reset to launcher on logout
      if (!currentUser) {
        setCurrentApp(null);
      }
    });
    return () => unsubscribe();
  }, []);

  if (loadingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <Loader2 size={48} className="text-blue-600 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  if (currentApp === 'hill-chart') {
    return <HillChartApp user={user} onBack={() => setCurrentApp(null)} />;
  }

  if (currentApp === 'feelings-wheel') {
    return <FeelingsWheelApp user={user} onBack={() => setCurrentApp(null)} />;
  }

  if (currentApp === 'retro-board') {
    return <RetroBoardApp user={user} onBack={() => setCurrentApp(null)} />;
  }

  return <Launcher user={user} onSelectApp={setCurrentApp} />;
}
