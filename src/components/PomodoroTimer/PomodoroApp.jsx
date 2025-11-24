// src/components/PomodoroTimer/PomodoroApp.jsx

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Copy, Check } from 'lucide-react';
import { usePomodoroRoom } from './hooks/usePomodoroRoom';
import { DEFAULT_WORK_DURATION, DEFAULT_BREAK_DURATION, TIMER_MODES } from './constants';
import JoinRoomModal from './JoinRoomModal';
import TimerDisplay from './Timer/TimerDisplay';
import TimerControls from './Timer/TimerControls';
import DurationSliders from './Timer/DurationSliders';
import TaskList from './Tasks/TaskList';
import TomatoGarden from './Garden/TomatoGarden';
import ParticipantsBar from './Team/ParticipantsBar';
import NotificationSettings from './Settings/NotificationSettings';

// Notification sound (simple beep using Web Audio API)
const playNotificationSound = () => {
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    gainNode.gain.value = 0.3;

    oscillator.start();
    setTimeout(() => {
      oscillator.stop();
      audioContext.close();
    }, 200);
  } catch (e) {
    console.warn('Could not play notification sound:', e);
    if (audioContext) audioContext.close();
  }
};

const PomodoroApp = ({ user, onBack }) => {
  const {
    roomCode,
    room,
    participants,
    tasks,
    garden,
    currentUser,
    isHost,
    loading,
    error,
    createRoom,
    joinRoom,
    leaveRoom,
    addTask,
    toggleTask,
    deleteTask,
    startTimer,
    pauseTimer,
    resumeTimer,
    resetTimer,
    completePomodoro,
    setTimerMode,
    updateSettings,
  } = usePomodoroRoom(user);

  const [showJoinModal, setShowJoinModal] = useState(true);
  const [copied, setCopied] = useState(false);
  const [workDuration, setWorkDuration] = useState(DEFAULT_WORK_DURATION);
  const [breakDuration, setBreakDuration] = useState(DEFAULT_BREAK_DURATION);

  // Get current timer based on mode
  const currentTimer = room?.timerMode === TIMER_MODES.TEAM
    ? room?.teamTimer
    : currentUser?.personalTimer;

  // Close modal when room is joined
  useEffect(() => {
    if (roomCode) {
      setShowJoinModal(false);
    }
  }, [roomCode]);

  // Handle timer completion - check every 100ms if timer reached zero
  useEffect(() => {
    if (!currentTimer?.endTime || currentTimer?.isPaused) return;

    const checkCompletion = () => {
      const remaining = currentTimer.endTime - Date.now();
      if (remaining <= 0) {
        // Timer completed - trigger notifications
        if (currentUser?.settings?.soundEnabled) {
          playNotificationSound();
        }

        if (currentUser?.settings?.notificationsEnabled &&
            typeof Notification !== 'undefined' &&
            Notification.permission === 'granted') {
          new Notification('Pomodoro Complete!', {
            body: currentTimer.type === 'work' ? 'Time for a break!' : 'Ready to focus?',
            icon: '/tomato-icon.png',
          });
        }

        if (currentTimer.type === 'work') {
          completePomodoro();
        }

        // Reset timer
        resetTimer();
      }
    };

    const interval = setInterval(checkCompletion, 100);
    return () => clearInterval(interval);
  }, [currentTimer?.endTime, currentTimer?.isPaused, currentTimer?.type, currentUser?.settings, completePomodoro, resetTimer]);

  const handleBack = () => {
    if (roomCode) {
      leaveRoom();
      setShowJoinModal(true);
    } else {
      onBack();
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleStartTimer = (type) => {
    const duration = type === 'work' ? workDuration : breakDuration;
    startTimer(type, duration);
  };

  const handleStartBreak = () => {
    handleStartTimer('break');
  };

  const isTimerRunning = currentTimer && !currentTimer.isPaused && currentTimer.endTime;

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={handleBack}
              className="p-2 hover:bg-slate-100 rounded-full"
            >
              <ArrowLeft size={20} className="text-slate-600" />
            </button>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🍅</span>
              <div>
                <h1 className="font-bold text-slate-900">
                  {room?.name || 'Tomato Task Garden'}
                </h1>
                {roomCode && (
                  <button
                    onClick={handleCopyCode}
                    className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700"
                  >
                    <span className="font-mono">{roomCode}</span>
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      {roomCode ? (
        <main className="max-w-6xl mx-auto p-4">
          {/* Participants bar */}
          <div className="mb-4">
            <ParticipantsBar
              participants={participants}
              timerMode={room?.timerMode || TIMER_MODES.TEAM}
              isHost={isHost}
              onToggleMode={setTimerMode}
              disabled={isTimerRunning}
            />
          </div>

          {/* Two column layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left column - Timer */}
            <div className="space-y-4">
              <div className="bg-white rounded-xl p-6 border border-slate-200">
                <TimerDisplay
                  timer={currentTimer}
                  timerMode={room?.timerMode}
                />

                <div className="mt-6">
                  <TimerControls
                    timer={currentTimer}
                    isHost={isHost}
                    timerMode={room?.timerMode}
                    onStart={handleStartTimer}
                    onPause={pauseTimer}
                    onResume={resumeTimer}
                    onReset={resetTimer}
                    onStartBreak={handleStartBreak}
                    disabled={loading}
                  />
                </div>

                <div className="mt-6">
                  <DurationSliders
                    workDuration={workDuration}
                    breakDuration={breakDuration}
                    onWorkChange={setWorkDuration}
                    onBreakChange={setBreakDuration}
                    disabled={isTimerRunning}
                  />
                </div>

                <div className="mt-4">
                  <NotificationSettings
                    settings={currentUser?.settings}
                    onUpdate={updateSettings}
                    disabled={loading}
                  />
                </div>

                {/* Pomodoro counter */}
                <div className="mt-4 text-center text-sm text-slate-500">
                  <span className="text-lg">🍅</span> {currentUser?.stats?.pomodorosToday || 0} pomodoros today
                </div>
              </div>
            </div>

            {/* Right column - Tasks & Garden */}
            <div className="space-y-4">
              <div className="bg-white rounded-xl p-6 border border-slate-200">
                <TaskList
                  tasks={tasks}
                  onAdd={addTask}
                  onToggle={toggleTask}
                  onDelete={deleteTask}
                />
              </div>

              <TomatoGarden tasks={tasks} garden={garden} />
            </div>
          </div>
        </main>
      ) : (
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <div className="text-center text-slate-500">
            <span className="text-4xl">🍅</span>
            <p className="mt-2">Create or join a room to get started</p>
          </div>
        </div>
      )}

      {/* Join modal */}
      <JoinRoomModal
        isOpen={showJoinModal}
        onClose={() => roomCode ? setShowJoinModal(false) : onBack()}
        onCreateRoom={createRoom}
        onJoinRoom={joinRoom}
        user={user}
        loading={loading}
        error={error}
      />
    </div>
  );
};

export default PomodoroApp;
