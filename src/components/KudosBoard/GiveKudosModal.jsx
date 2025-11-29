// src/components/KudosBoard/GiveKudosModal.jsx

import React, { useState } from 'react';
import { X, Loader2, Check, Plus } from 'lucide-react';
import { KUDOS_CATEGORIES, MESSAGE_MIN_LENGTH, MESSAGE_MAX_LENGTH } from './constants';

const GiveKudosModal = ({ isOpen, onClose, members, currentUserId, onSubmit, loading }) => {
  const [selectedRecipients, setSelectedRecipients] = useState([]);
  const [customRecipients, setCustomRecipients] = useState([]);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customName, setCustomName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [message, setMessage] = useState('');

  const memberList = Object.values(members).filter((m) => m.uid !== currentUserId && !m.leftAt);
  const hasRecipients = selectedRecipients.length > 0 || customRecipients.length > 0;
  const isValid = hasRecipients && selectedCategory && message.length >= MESSAGE_MIN_LENGTH;

  const handleSubmit = async () => {
    if (!isValid) return;

    const success = await onSubmit({
      category: selectedCategory,
      message,
      recipientIds: selectedRecipients,
      customRecipientNames: customRecipients,
    });

    if (success) {
      setSelectedRecipients([]);
      setCustomRecipients([]);
      setShowCustomInput(false);
      setCustomName('');
      setSelectedCategory(null);
      setMessage('');
      onClose();
    }
  };

  const addCustomRecipient = () => {
    if (customName.trim() && !customRecipients.includes(customName.trim())) {
      setCustomRecipients((prev) => [...prev, customName.trim()]);
      setCustomName('');
      setShowCustomInput(false);
    }
  };

  const removeCustomRecipient = (name) => {
    setCustomRecipients((prev) => prev.filter((n) => n !== name));
  };

  const toggleRecipient = (uid) => {
    setSelectedRecipients((prev) =>
      prev.includes(uid) ? prev.filter((id) => id !== uid) : [...prev, uid]
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="glass-card-elevated w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[var(--color-border-subtle)] sticky top-0 bg-[var(--color-surface-1)]">
          <h2 className="text-xl font-bold text-[var(--color-text-primary)]">Give Kudos</h2>
          <button onClick={onClose} className="p-2 hover:bg-[var(--color-surface-2)] rounded-full">
            <X size={20} className="text-[var(--color-text-tertiary)]" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Step 1: Select Recipients */}
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
              Who deserves kudos?
            </label>
            <div className="flex flex-wrap gap-2">
              {/* Team members */}
              {memberList.map((member) => {
                const isSelected = selectedRecipients.includes(member.uid);
                return (
                  <button
                    key={member.uid}
                    onClick={() => toggleRecipient(member.uid)}
                    className={`
                      px-3 py-1.5 rounded-full text-sm font-medium transition-colors flex items-center gap-1.5
                      ${isSelected
                        ? 'bg-rose-500/20 text-rose-400 border-2 border-rose-500/50'
                        : 'bg-[var(--color-surface-2)] text-[var(--color-text-secondary)] border-2 border-transparent hover:bg-[var(--color-surface-3)]'
                      }
                    `}
                  >
                    {isSelected && <Check size={14} />}
                    {member.displayName}
                  </button>
                );
              })}
              {/* Custom recipients */}
              {customRecipients.map((name) => (
                <button
                  key={name}
                  onClick={() => removeCustomRecipient(name)}
                  className="px-3 py-1.5 rounded-full text-sm font-medium bg-rose-500/20 text-rose-400 border-2 border-rose-500/50 flex items-center gap-1.5"
                >
                  <Check size={14} />
                  {name}
                  <X size={14} className="ml-1" />
                </button>
              ))}
              {/* Someone else button/input */}
              {showCustomInput ? (
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    placeholder="Enter name..."
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addCustomRecipient()}
                    className="px-3 py-1.5 border border-[var(--color-border-default)] bg-[var(--color-surface-1)] rounded-full text-sm w-32 focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)]"
                    autoFocus
                  />
                  <button
                    onClick={addCustomRecipient}
                    disabled={!customName.trim()}
                    className="p-1.5 bg-rose-500 text-white rounded-full hover:bg-rose-600 disabled:opacity-50"
                  >
                    <Plus size={14} />
                  </button>
                  <button
                    onClick={() => { setShowCustomInput(false); setCustomName(''); }}
                    className="p-1.5 hover:bg-[var(--color-surface-2)] rounded-full"
                  >
                    <X size={14} className="text-[var(--color-text-muted)]" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowCustomInput(true)}
                  className="px-3 py-1.5 rounded-full text-sm font-medium bg-[var(--color-surface-2)] text-[var(--color-text-secondary)] border-2 border-dashed border-[var(--color-border-default)] hover:bg-[var(--color-surface-3)] flex items-center gap-1.5"
                >
                  <Plus size={14} />
                  Someone else...
                </button>
              )}
            </div>
          </div>

          {/* Step 2: Pick Category */}
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
              What kind of kudos?
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {Object.entries(KUDOS_CATEGORIES).map(([key, cat]) => (
                <button
                  key={key}
                  onClick={() => setSelectedCategory(key)}
                  className={`
                    p-3 rounded-xl text-left transition-all
                    ${selectedCategory === key
                      ? 'bg-rose-500/10 border-2 border-rose-500/50'
                      : 'bg-[var(--color-surface-1)] border-2 border-transparent hover:bg-[var(--color-surface-2)]'
                    }
                  `}
                >
                  <div className="text-xl mb-1">{cat.icon}</div>
                  <div className={`text-sm font-medium ${selectedCategory === key ? 'text-rose-400' : 'text-[var(--color-text-secondary)]'}`}>
                    {cat.label}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Step 3: Write Message */}
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
              Your message
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value.slice(0, MESSAGE_MAX_LENGTH))}
              placeholder="Tell them why they're awesome..."
              rows={4}
              className="w-full px-4 py-3 border border-[var(--color-border-default)] bg-[var(--color-surface-1)] rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none resize-none text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)]"
            />
            <div className="flex justify-between text-xs text-[var(--color-text-muted)] mt-1">
              <span>{message.length < MESSAGE_MIN_LENGTH ? `At least ${MESSAGE_MIN_LENGTH} characters` : ''}</span>
              <span>{message.length}/{MESSAGE_MAX_LENGTH}</span>
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
              className="flex-1 px-4 py-3 bg-rose-500 text-white rounded-lg hover:bg-rose-600 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-rose-500/20"
            >
              {loading && <Loader2 size={18} className="animate-spin" />}
              Send Kudos
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GiveKudosModal;
