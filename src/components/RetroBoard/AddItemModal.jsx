// src/components/RetroBoard/AddItemModal.jsx

import React, { useState } from 'react';
import { X } from 'lucide-react';

const AddItemModal = ({ isOpen, onClose, onAdd, section, participants, currentUserId }) => {
  const [text, setText] = useState('');
  const [shoutoutTo, setShoutoutTo] = useState('');
  const [isCustomShoutout, setIsCustomShoutout] = useState(false);

  if (!isOpen || !section) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    onAdd(section.id, text.trim(), section.hasShoutout ? shoutoutTo : null);
    setText('');
    setShoutoutTo('');
    setIsCustomShoutout(false);
    onClose();
  };

  // Get list of other participants for shoutout dropdown
  const otherParticipants = Object.entries(participants || {})
    .filter(([id]) => id !== currentUserId)
    .map(([id, p]) => ({ id, name: p.name }));

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="glass-card-elevated max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className={`flex items-center justify-between p-4 ${section.headerBg} border-b border-[var(--color-border-subtle)]`}>
          <div className="flex items-center gap-2">
            <span className="text-2xl">{section.icon}</span>
            <h2 className={`text-lg font-semibold ${section.textColor}`}>{section.title}</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-[var(--color-surface-2)] rounded-lg transition-colors">
            <X size={20} className="text-[var(--color-text-tertiary)]" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {section.hasShoutout && (
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">
                Who are you shouting out?
              </label>
              <select
                value={isCustomShoutout ? '__custom__' : shoutoutTo}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '__custom__') {
                    setIsCustomShoutout(true);
                    setShoutoutTo('');
                  } else {
                    setIsCustomShoutout(false);
                    setShoutoutTo(value);
                  }
                }}
                className="w-full px-4 py-2 bg-[var(--color-surface-1)] border border-[var(--color-border-default)] rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-[var(--color-text-primary)]"
              >
                <option value="" className="bg-[var(--color-surface-1)]">Select a teammate...</option>
                {otherParticipants.map((p) => (
                  <option key={p.id} value={p.name} className="bg-[var(--color-surface-1)]">{p.name}</option>
                ))}
                <option value="__custom__" className="bg-[var(--color-surface-1)]">Someone else...</option>
              </select>
              {isCustomShoutout && (
                <input
                  type="text"
                  placeholder="Enter their name"
                  value={shoutoutTo}
                  onChange={(e) => setShoutoutTo(e.target.value)}
                  className="w-full mt-2 px-4 py-2 bg-[var(--color-surface-1)] border border-[var(--color-border-default)] rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)]"
                />
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">
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
              className="w-full px-4 py-2 bg-[var(--color-surface-1)] border border-[var(--color-border-default)] rounded-lg focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent resize-none text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)]"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-[var(--color-border-default)] text-[var(--color-text-secondary)] rounded-lg hover:bg-[var(--color-surface-2)] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!text.trim() || (section.hasShoutout && !shoutoutTo)}
              className="flex-1 px-4 py-2 text-white rounded-lg font-medium disabled:opacity-50 bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] transition-colors"
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
