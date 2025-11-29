// src/components/PomodoroTimer/Settings/NotificationSettings.jsx

import React from 'react';
import { Volume2, Bell, VolumeX, BellOff } from 'lucide-react';

const NotificationSettings = ({ settings, onUpdate, disabled }) => {
  const requestNotificationPermission = async () => {
    if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        onUpdate({ notificationsEnabled: true });
      }
    } else if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
      onUpdate({ notificationsEnabled: true });
    }
  };

  const handleNotificationToggle = (enabled) => {
    if (enabled) {
      requestNotificationPermission();
    } else {
      onUpdate({ notificationsEnabled: false });
    }
  };

  return (
    <div className="bg-[var(--color-surface-1)] rounded-xl p-4 border border-[var(--color-border-subtle)]">
      <h3 className="font-medium text-[var(--color-text-primary)] mb-3 flex items-center gap-2">
        <span>⚙️</span>
        Notifications
      </h3>

      <div className="space-y-3">
        {/* Sound toggle */}
        <label className="flex items-center justify-between cursor-pointer">
          <div className="flex items-center gap-2">
            {settings?.soundEnabled ? (
              <Volume2 size={18} className="text-[var(--color-text-secondary)]" />
            ) : (
              <VolumeX size={18} className="text-[var(--color-text-muted)]" />
            )}
            <span className="text-sm text-[var(--color-text-secondary)]">Play sound</span>
          </div>
          <input
            type="checkbox"
            checked={settings?.soundEnabled || false}
            onChange={(e) => onUpdate({ soundEnabled: e.target.checked })}
            disabled={disabled}
            className="w-5 h-5 rounded accent-red-500 cursor-pointer disabled:cursor-not-allowed"
          />
        </label>

        {/* Browser notification toggle */}
        <label className="flex items-center justify-between cursor-pointer">
          <div className="flex items-center gap-2">
            {settings?.notificationsEnabled ? (
              <Bell size={18} className="text-[var(--color-text-secondary)]" />
            ) : (
              <BellOff size={18} className="text-[var(--color-text-muted)]" />
            )}
            <span className="text-sm text-[var(--color-text-secondary)]">Browser alerts</span>
          </div>
          <input
            type="checkbox"
            checked={settings?.notificationsEnabled || false}
            onChange={(e) => handleNotificationToggle(e.target.checked)}
            disabled={disabled}
            className="w-5 h-5 rounded accent-red-500 cursor-pointer disabled:cursor-not-allowed"
          />
        </label>
      </div>
    </div>
  );
};

export default NotificationSettings;
