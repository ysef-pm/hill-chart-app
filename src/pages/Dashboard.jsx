import React, { useState } from 'react';
import Launcher from '../components/Launcher';
import HillChartApp from '../components/HillChartApp';
import { FeelingsWheelApp } from '../components/FeelingsWheel';
import { RetroBoardApp } from '../components/RetroBoard';
import { HabitTrackerApp } from '../components/HabitTracker';

export default function Dashboard({ user }) {
    const [currentApp, setCurrentApp] = useState(null); // null = Launcher

    if (currentApp === 'hill-chart') {
        return <HillChartApp user={user} onBack={() => setCurrentApp(null)} />;
    }

    if (currentApp === 'feelings-wheel') {
        return <FeelingsWheelApp user={user} onBack={() => setCurrentApp(null)} />;
    }

    if (currentApp === 'retro-board') {
        return <RetroBoardApp user={user} onBack={() => setCurrentApp(null)} />;
    }

    if (currentApp === 'habit-tracker') {
        return <HabitTrackerApp user={user} onBack={() => setCurrentApp(null)} />;
    }

    return <Launcher user={user} onSelectApp={setCurrentApp} />;
}
