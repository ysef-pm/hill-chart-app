// src/components/PomodoroTimer/Tasks/TaskItem.jsx

import React from 'react';
import { Trash2, Check } from 'lucide-react';

const TaskItem = ({ task, onToggle, onDelete }) => {
  return (
    <div className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
      task.completed ? 'bg-green-500/10 border border-green-500/30' : 'bg-[var(--color-surface-1)] border border-[var(--color-border-subtle)]'
    }`}>
      {/* Checkbox */}
      <button
        onClick={onToggle}
        aria-label={task.completed ? 'Mark task as incomplete' : 'Mark task as complete'}
        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
          task.completed
            ? 'bg-green-500 border-green-500'
            : 'border-[var(--color-border-default)] hover:border-green-400'
        }`}
      >
        {task.completed && <Check size={14} className="text-white" />}
      </button>

      {/* Task text */}
      <span className={`flex-1 text-sm ${
        task.completed ? 'text-green-400 line-through' : 'text-[var(--color-text-primary)]'
      }`}>
        {task.text}
      </span>

      {/* Author */}
      <span className="text-xs text-[var(--color-text-muted)]">
        {task.authorName}
      </span>

      {/* Delete button */}
      <button
        onClick={onDelete}
        className="p-1 text-[var(--color-text-muted)] hover:text-red-400 transition-colors"
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
};

export default TaskItem;
