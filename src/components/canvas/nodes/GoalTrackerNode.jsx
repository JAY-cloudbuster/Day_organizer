import React from 'react';
import { useCanvasStore } from '../../../store/useCanvasStore';
import { TimeEstimateBadge } from './TimeEstimateBadge';
import { CheckCircle2, Circle, Target } from 'lucide-react';
import clsx from 'clsx';

export const GoalTrackerNode = ({ node }) => {
  const updateNodeContent = useCanvasStore(state => state.updateNodeContent);
  const { title, goals = [] } = node.content;

  const totalGoals = goals.length || 1;
  const completedGoals = goals.filter(g => g.done).length;
  const progress = (completedGoals / totalGoals) * 100;

  const toggleGoal = (index) => {
    const newGoals = [...goals];
    newGoals[index].done = !newGoals[index].done;
    updateNodeContent(node.id, { goals: newGoals });
  };

  const updateGoalText = (index, text) => {
    const newGoals = [...goals];
    newGoals[index].text = text;
    updateNodeContent(node.id, { goals: newGoals });
  };

  const addGoal = () => {
    updateNodeContent(node.id, { goals: [...goals, { text: '', done: false }] });
  };

  const removeGoal = (index) => {
    updateNodeContent(node.id, { goals: goals.filter((_, i) => i !== index) });
  };

  return (
    <div className="card w-[350px] overflow-hidden cursor-grab active:cursor-grabbing border-none flex flex-col bg-transparent" style={{ color: 'var(--text-main)', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}>
      {/* Header & Progress Bar */}
      <div className="bg-gradient-to-r from-blue-600/80 to-purple-600/80 p-4 border-b border-black/10 backdrop-blur-md relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20" style={{ width: `${progress}%`, transition: 'width 0.5s ease-out' }} />
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target size={18} className="text-white" />
            <input 
              value={title}
              placeholder="Main Goal..."
              onChange={(e) => updateNodeContent(node.id, { title: e.target.value })}
              className="text-sm font-bold bg-transparent border-none outline-none text-white placeholder-white/60 pointer-events-auto w-32"
            />
          </div>
          <span className="text-xs font-bold text-white/90">{Math.round(progress)}%</span>
        </div>
      </div>

      {/* Checklist */}
      <div className="p-4 flex-1 flex flex-col gap-2 pointer-events-auto bg-white/5 dark:bg-black/5 backdrop-blur-md">
        {goals.map((goal, i) => (
          <div key={i} className="flex items-center gap-2 group">
            <button onClick={() => toggleGoal(i)} className="shrink-0 transition-transform active:scale-90">
              {goal.done ? <CheckCircle2 size={16} className="text-green-500" /> : <Circle size={16} className="text-gray-400 dark:text-gray-500" />}
            </button>
            <input 
              value={goal.text}
              placeholder="Milestone..."
              onChange={(e) => updateGoalText(i, e.target.value)}
              className={clsx(
                "flex-1 text-sm bg-transparent border-none outline-none transition-all duration-300",
                goal.done && "line-through opacity-50"
              )}
            />
            <button onClick={() => removeGoal(i)} className="text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1">
              &times;
            </button>
          </div>
        ))}
        <button 
          onClick={addGoal}
          className="mt-2 text-xs font-bold uppercase tracking-wider text-left transition-colors hover:text-blue-500"
          style={{ color: 'var(--text-muted)' }}
        >
          + Add Milestone
        </button>
      </div>

      <div style={{ padding: '8px 16px', borderTop: '1px solid var(--ghost-border)', backgroundColor: 'var(--surface-lowest)' }}>
        <TimeEstimateBadge nodeId={node.id} />
      </div>
    </div>
  );
};
