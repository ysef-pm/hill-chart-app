// src/components/KudosBoard/GiveKudosModal.jsx

import React, { useState } from 'react';
import { X, Loader2, Check } from 'lucide-react';
import { KUDOS_CATEGORIES, MESSAGE_MIN_LENGTH, MESSAGE_MAX_LENGTH } from './constants';

const GiveKudosModal = ({ isOpen, onClose, members, currentUserId, onSubmit, loading }) => {
  const [selectedRecipients, setSelectedRecipients] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [message, setMessage] = useState('');

  const memberList = Object.values(members).filter((m) => m.uid !== currentUserId && !m.leftAt);
  const isValid = selectedRecipients.length > 0 && selectedCategory && message.length >= MESSAGE_MIN_LENGTH;

  const handleSubmit = async () => {
    if (!isValid) return;

    const success = await onSubmit({
      category: selectedCategory,
      message,
      recipientIds: selectedRecipients,
    });

    if (success) {
      setSelectedRecipients([]);
      setSelectedCategory(null);
      setMessage('');
      onClose();
    }
  };

  const toggleRecipient = (uid) => {
    setSelectedRecipients((prev) =>
      prev.includes(uid) ? prev.filter((id) => id !== uid) : [...prev, uid]
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 sticky top-0 bg-white">
          <h2 className="text-xl font-bold text-slate-900">Give Kudos</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full">
            <X size={20} className="text-slate-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Step 1: Select Recipients */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Who deserves kudos?
            </label>
            <div className="flex flex-wrap gap-2">
              {memberList.map((member) => {
                const isSelected = selectedRecipients.includes(member.uid);
                return (
                  <button
                    key={member.uid}
                    onClick={() => toggleRecipient(member.uid)}
                    className={`
                      px-3 py-1.5 rounded-full text-sm font-medium transition-colors flex items-center gap-1.5
                      ${isSelected
                        ? 'bg-rose-100 text-rose-700 border-2 border-rose-300'
                        : 'bg-slate-100 text-slate-600 border-2 border-transparent hover:bg-slate-200'
                      }
                    `}
                  >
                    {isSelected && <Check size={14} />}
                    {member.displayName}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 2: Pick Category */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
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
                      ? `${cat.bgClass} ${cat.borderClass} border-2`
                      : 'bg-slate-50 border-2 border-transparent hover:bg-slate-100'
                    }
                  `}
                >
                  <div className="text-xl mb-1">{cat.icon}</div>
                  <div className={`text-sm font-medium ${selectedCategory === key ? cat.textClass : 'text-slate-700'}`}>
                    {cat.label}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Step 3: Write Message */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Your message
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value.slice(0, MESSAGE_MAX_LENGTH))}
              placeholder="Tell them why they're awesome..."
              rows={4}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none resize-none"
            />
            <div className="flex justify-between text-xs text-slate-500 mt-1">
              <span>{message.length < MESSAGE_MIN_LENGTH ? `At least ${MESSAGE_MIN_LENGTH} characters` : ''}</span>
              <span>{message.length}/{MESSAGE_MAX_LENGTH}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-200 sticky bottom-0 bg-white">
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-slate-300 rounded-lg hover:bg-slate-50 font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!isValid || loading}
              className="flex-1 px-4 py-3 bg-rose-600 text-white rounded-lg hover:bg-rose-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
