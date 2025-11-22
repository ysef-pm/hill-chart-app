// src/components/RetroBoard/AddItemModal.jsx

import React, { useState } from 'react';
import { X } from 'lucide-react';

const AddItemModal = ({ isOpen, onClose, onAdd, section, participants, currentUserId }) => {
  const [text, setText] = useState('');
  const [shoutoutTo, setShoutoutTo] = useState('');

  if (!isOpen || !section) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    onAdd(section.id, text.trim(), section.hasShoutout ? shoutoutTo : null);
    setText('');
    setShoutoutTo('');
    onClose();
  };

  // Get list of other participants for shoutout dropdown
  const otherParticipants = Object.entries(participants || {})
    .filter(([id]) => id !== currentUserId)
    .map(([id, p]) => ({ id, name: p.name }));

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className={`flex items-center justify-between p-4 ${section.bgColor}`}>
          <div className="flex items-center gap-2">
            <span className="text-2xl">{section.icon}</span>
            <h2 className={`text-lg font-bold ${section.textColor}`}>{section.title}</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/50 rounded-full">
            <X size={20} className="text-slate-600" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {section.hasShoutout && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Who are you shouting out?
              </label>
              <select
                value={shoutoutTo}
                onChange={(e) => setShoutoutTo(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              >
                <option value="">Select a teammate...</option>
                {otherParticipants.map((p) => (
                  <option key={p.id} value={p.name}>{p.name}</option>
                ))}
                <option value="__custom__">Someone else...</option>
              </select>
              {shoutoutTo === '__custom__' && (
                <input
                  type="text"
                  placeholder="Enter their name"
                  onChange={(e) => setShoutoutTo(e.target.value)}
                  className="w-full mt-2 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                />
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              {section.hasShoutout ? 'What did they do?' : section.subtitle}
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={
                section.hasShoutout
                  ? "Describe what they did that was awesome..."
                  : `Add your ${section.title.toLowerCase()}...`
              }
              rows={3}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 resize-none"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!text.trim() || (section.hasShoutout && !shoutoutTo)}
              className={`flex-1 px-4 py-2 text-white rounded-lg font-medium disabled:opacity-50 bg-slate-800 hover:bg-slate-900`}
            >
              Add Item
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddItemModal;
