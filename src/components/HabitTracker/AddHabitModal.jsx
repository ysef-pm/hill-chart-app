// src/components/HabitTracker/AddHabitModal.jsx

import React, { useState } from 'react';
import { X } from 'lucide-react';
import { HABIT_EMOJIS, DAYS_OF_WEEK, DEFAULT_ACTIVE_DAYS } from './constants';

const AddHabitModal = ({ isOpen, onClose, onAdd, initialText = '', sourceRetro = null }) => {
  const [text, setText] = useState(initialText);
  const [emoji, setEmoji] = useState(HABIT_EMOJIS[0]);
  const [activeDays, setActiveDays] = useState(DEFAULT_ACTIVE_DAYS);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    onAdd(text.trim(), emoji, activeDays, sourceRetro);
    setText('');
    setEmoji(HABIT_EMOJIS[0]);
    setActiveDays(DEFAULT_ACTIVE_DAYS);
    onClose();
  };

  const toggleDay = (dayId) => {
    setActiveDays((prev) =>
      prev.includes(dayId) ? prev.filter((d) => d !== dayId) : [...prev, dayId].sort()
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200">
          <h2 className="text-xl font-bold text-slate-900">
            {sourceRetro ? 'Create Habit from Action' : 'Add New Habit'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full">
            <X size={20} className="text-slate-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {sourceRetro && (
            <div className="p-3 bg-sky-50 border border-sky-200 rounded-lg text-sm text-sky-700">
              Importing from retro: {sourceRetro}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Habit Description
            </label>
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="e.g., Post standup by 10:30am"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Emoji
            </label>
            <div className="flex gap-2 flex-wrap">
              {HABIT_EMOJIS.map((e) => (
                <button
                  key={e}
                  type="button"
                  onClick={() => setEmoji(e)}
                  className={`w-10 h-10 text-xl rounded-lg flex items-center justify-center transition-all ${
                    emoji === e
                      ? 'bg-indigo-100 ring-2 ring-indigo-500 scale-110'
                      : 'bg-slate-100 hover:bg-slate-200'
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Track on these days
            </label>
            <div className="flex gap-2">
              {DAYS_OF_WEEK.map((day) => (
                <button
                  key={day.id}
                  type="button"
                  onClick={() => toggleDay(day.id)}
                  className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
                    activeDays.includes(day.id)
                      ? 'bg-indigo-500 text-white'
                      : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                  }`}
                >
                  {day.short}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!text.trim() || activeDays.length === 0}
              className="flex-1 px-4 py-2 bg-indigo-500 text-white rounded-lg font-medium hover:bg-indigo-600 disabled:opacity-50"
            >
              Add Habit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddHabitModal;
