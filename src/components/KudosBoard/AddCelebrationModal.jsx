// src/components/KudosBoard/AddCelebrationModal.jsx

import React, { useState } from 'react';
import { X, Loader2, Check, Sparkles } from 'lucide-react';
import { TITLE_MAX_LENGTH, MESSAGE_MAX_LENGTH } from './constants';

const AddCelebrationModal = ({ isOpen, onClose, members, onSubmit, loading }) => {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [taggedUsers, setTaggedUsers] = useState([]);

  const memberList = Object.values(members).filter((m) => !m.leftAt);
  const isValid = title.trim().length > 0 && message.trim().length > 0;

  const handleSubmit = async () => {
    if (!isValid) return;

    const success = await onSubmit({
      title,
      message,
      taggedUserIds: taggedUsers,
    });

    if (success) {
      setTitle('');
      setMessage('');
      setTaggedUsers([]);
      onClose();
    }
  };

  const toggleTagged = (uid) => {
    setTaggedUsers((prev) =>
      prev.includes(uid) ? prev.filter((id) => id !== uid) : [...prev, uid]
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="glass-card-elevated w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[var(--color-border-subtle)] sticky top-0 bg-[var(--color-surface-1)]">
          <div className="flex items-center gap-2">
            <Sparkles size={24} className="text-amber-400" />
            <h2 className="text-xl font-bold text-[var(--color-text-primary)]">Add Celebration</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-[var(--color-surface-2)] rounded-full">
            <X size={20} className="text-[var(--color-text-tertiary)]" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
              Celebration Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value.slice(0, TITLE_MAX_LENGTH))}
              placeholder='e.g., "v2.0 Launch! 🎉"'
              className="w-full px-4 py-3 border border-[var(--color-border-default)] bg-[var(--color-surface-1)] rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)]"
            />
            <div className="text-xs text-[var(--color-text-muted)] text-right mt-1">
              {title.length}/{TITLE_MAX_LENGTH}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
              Description
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value.slice(0, MESSAGE_MAX_LENGTH))}
              placeholder="Tell everyone about this win..."
              rows={4}
              className="w-full px-4 py-3 border border-[var(--color-border-default)] bg-[var(--color-surface-1)] rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none resize-none text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)]"
            />
            <div className="text-xs text-[var(--color-text-muted)] text-right mt-1">
              {message.length}/{MESSAGE_MAX_LENGTH}
            </div>
          </div>

          {/* Tag People (Optional) */}
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
              Tag people (optional)
            </label>
            <div className="flex flex-wrap gap-2">
              {memberList.map((member) => {
                const isTagged = taggedUsers.includes(member.uid);
                return (
                  <button
                    key={member.uid}
                    onClick={() => toggleTagged(member.uid)}
                    className={`
                      px-3 py-1.5 rounded-full text-sm font-medium transition-colors flex items-center gap-1.5
                      ${isTagged
                        ? 'bg-amber-500/20 text-amber-400 border-2 border-amber-500/50'
                        : 'bg-[var(--color-surface-2)] text-[var(--color-text-secondary)] border-2 border-transparent hover:bg-[var(--color-surface-3)]'
                      }
                    `}
                  >
                    {isTagged && <Check size={14} />}
                    {member.displayName}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-[var(--color-border-subtle)] sticky bottom-0 bg-[var(--color-surface-1)]">
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-[var(--color-border-default)] text-[var(--color-text-secondary)] rounded-lg hover:bg-[var(--color-surface-2)] font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!isValid || loading}
              className="flex-1 px-4 py-3 bg-amber-500 text-white rounded-lg hover:bg-amber-600 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20"
            >
              {loading && <Loader2 size={18} className="animate-spin" />}
              Celebrate!
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddCelebrationModal;
