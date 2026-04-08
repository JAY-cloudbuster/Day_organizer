import React from 'react';
import { useCanvasStore } from '../../../store/useCanvasStore';
import { Star } from 'lucide-react';

export const PriorityNode = ({ node }) => {
  const updateNodeContent = useCanvasStore(state => state.updateNodeContent);
  const { title } = node.content;

  return (
    <div className="relative w-36 h-36 rounded-full flex flex-col items-center justify-center cursor-grab active:cursor-grabbing shadow-lg"
         style={{ backgroundColor: 'rgba(203, 231, 245, 0.4)', border: '2px solid rgba(73, 99, 111, 0.3)' }}>
      {/* Outer animated ring */}
      <div className="absolute inset-0 rounded-full" 
           style={{ border: '4px solid rgba(73, 99, 111, 0.1)', animation: 'pulse 3s infinite alternate' }} />
      
      <Star size={24} fill="var(--accent-secondary)" color="var(--accent-secondary)" className="mb-2" />
      
      <input 
        value={title}
        onChange={(e) => updateNodeContent(node.id, { title: e.target.value })}
        className="bg-transparent border-none outline-none text-center font-bold text-xs uppercase tracking-widest pointer-events-auto"
        style={{ color: 'var(--text-main)', width: '80%' }}
      />
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes pulse {
          0% { transform: scale(1); opacity: 0.5; }
          100% { transform: scale(1.15); opacity: 1; }
        }
      `}} />
    </div>
  );
};
