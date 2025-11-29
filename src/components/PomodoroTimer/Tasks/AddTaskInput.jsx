// src/components/PomodoroTimer/Tasks/AddTaskInput.jsx

import React, { useState } from 'react';
import { Plus } from 'lucide-react';

const AddTaskInput = ({ onAdd, disabled }) => {
  const [text, setText] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (text.trim() && !disabled) {
      onAdd(text);
      setText('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Add a new task..."
        disabled={disabled}
        className="flex-1 px-4 py-2 bg-[var(--color-surface-1)] border border-[var(--color-border-default)] rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] disabled:opacity-50"
      />
      <button
        type="submit"
        disabled={disabled || !text.trim()}
        className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg disabled:opacity-50 transition-colors shadow-lg shadow-red-500/20"
      >
        <Plus size={20} />
      </button>
    </form>
  );
};

export default AddTaskInput;
