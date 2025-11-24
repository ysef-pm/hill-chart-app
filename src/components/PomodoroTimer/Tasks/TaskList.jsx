// src/components/PomodoroTimer/Tasks/TaskList.jsx

import React from 'react';
import TaskItem from './TaskItem';
import AddTaskInput from './AddTaskInput';

const TaskList = ({ tasks, onAdd, onToggle, onDelete }) => {
  const taskArray = Object.entries(tasks || {}).map(([id, task]) => ({ id, ...task }));
  const incompleteTasks = taskArray.filter(t => !t.completed);
  const completedTasks = taskArray.filter(t => t.completed);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <span className="text-xl">📝</span>
        <h3 className="font-bold text-slate-900">Task Garden</h3>
      </div>

      {/* Add task input */}
      <AddTaskInput onAdd={onAdd} />

      {/* Incomplete tasks */}
      <div className="space-y-2">
        {incompleteTasks.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-4">
            No tasks yet. Add a task to get started!
          </p>
        ) : (
          incompleteTasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onToggle={() => onToggle(task.id)}
              onDelete={() => onDelete(task.id)}
            />
          ))
        )}
      </div>

      {/* Completed tasks count */}
      {completedTasks.length > 0 && (
        <div className="pt-2 border-t border-slate-200">
          <p className="text-sm text-green-600 font-medium">
            ✓ {completedTasks.length} task{completedTasks.length !== 1 ? 's' : ''} completed
          </p>
        </div>
      )}
    </div>
  );
};

export default TaskList;
