import React from 'react';
import { useCanvasStore } from '../../../store/useCanvasStore';

export const StickyNode = ({ node }) => {
  const updateNodeContent = useCanvasStore(state => state.updateNodeContent);
  const { title, text } = node.content;

  return (
    <div className="card w-64 p-4 cursor-grab active:cursor-grabbing hover:shadow-xl transition-shadow"
         style={{ backgroundColor: node.color }}>
      <input 
        value={title}
        onChange={(e) => updateNodeContent(node.id, { title: e.target.value })}
        className="font-bold bg-transparent border-none outline-none mb-2 w-full pointer-events-auto"
        style={{ color: 'var(--text-main)', borderBottom: '1px solid var(--ghost-border)' }}
      />
      <textarea 
        value={text}
        onChange={(e) => updateNodeContent(node.id, { text: e.target.value })}
        className="text-sm bg-transparent border-none outline-none w-full resize-none pointer-events-auto leading-relaxed"
        style={{ color: 'var(--text-muted)', minHeight: '100px' }}
      />
    </div>
  );
};
