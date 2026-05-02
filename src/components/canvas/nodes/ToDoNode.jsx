import React, { useState } from 'react';
import { useCanvasStore } from '../../../store/useCanvasStore';
import { GripHorizontal, Plus, Check } from 'lucide-react';

export const ToDoNode = ({ node }) => {
  const updateNodeContent = useCanvasStore(state => state.updateNodeContent);
  const { title, tasks = [] } = node.content;
  const [newTaskText, setNewTaskText] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const toggleTask = (taskId) => {
    const newTasks = tasks.map(t => t.id === taskId ? { ...t, done: !t.done } : t);
    updateNodeContent(node.id, { tasks: newTasks });
  };

  const addTask = (e) => {
    if (e.key === 'Enter' && newTaskText.trim()) {
      updateNodeContent(node.id, { 
        tasks: [...tasks, { id: Date.now(), text: newTaskText.trim(), done: false }]
      });
      setNewTaskText('');
      setIsAdding(false);
    }
  };

  return (
    <div 
      className="card flex flex-col p-6 cursor-grab active:cursor-grabbing w-80 relative"
      style={{ borderLeft: '3px solid #818cf8' }}
      onPointerDown={(e) => e.stopPropagation()} // Let drag happen on the wrapper, but inputs need focus
    >
      <div className="flex justify-between items-start mb-4">
        <input 
          type="text" 
          value={title}
          onChange={(e) => updateNodeContent(node.id, { title: e.target.value })}
          className="bg-transparent border-none outline-none font-bold text-lg pointer-events-auto"
          style={{ color: 'var(--accent-primary)' }}
        />
        <GripHorizontal size={20} style={{ color: 'var(--text-muted)' }} />
      </div>

      <div className="flex flex-col gap-3 pointer-events-auto">
        {tasks.map(task => (
          <div key={task.id} className="flex items-center gap-3">
            <button 
              onClick={() => toggleTask(task.id)}
              className="w-5 h-5 rounded flex items-center justify-center transition-colors shrink-0"
              style={{ 
                border: `1.5px solid ${task.done ? 'var(--accent-primary)' : 'var(--ghost-border)'}`,
                backgroundColor: task.done ? 'var(--accent-primary)' : 'transparent'
              }}
            >
              {task.done && <Check size={14} color="#fff" />}
            </button>
            <span style={{ 
              fontSize: '0.875rem', 
              color: 'var(--text-muted)',
              textDecoration: task.done ? 'line-through' : 'none',
              opacity: task.done ? 0.6 : 1,
              transition: 'all 0.2s'
            }}>
              {task.text}
            </span>
          </div>
        ))}
        
        {isAdding ? (
          <input 
            autoFocus
            type="text"
            placeholder="Type and press enter..."
            value={newTaskText}
            onChange={e => setNewTaskText(e.target.value)}
            onKeyDown={addTask}
            onBlur={() => setIsAdding(false)}
            className="text-sm bg-transparent border-b border-gray-300 outline-none pb-1 mt-2 text-gray-500"
            style={{ color: 'var(--text-main)', borderBottomColor: 'var(--ghost-border)' }}
          />
        ) : null}
      </div>

      <button 
        onClick={() => setIsAdding(true)}
        className="absolute -bottom-4 -right-4 w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-110 pointer-events-auto z-10"
        style={{ background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-primary-dim))', color: '#fff' }}
      >
        <Plus size={20} />
      </button>
    </div>
  );
};
