import React from 'react';
import { useCanvasStore } from '../../../store/useCanvasStore';
import { TimeEstimateBadge } from './TimeEstimateBadge';

export const CodeNode = ({ node }) => {
  const updateNodeContent = useCanvasStore(state => state.updateNodeContent);
  const { code, language } = node.content;

  const languages = ['js', 'py', 'java', 'cpp', 'html', 'css', 'ts', 'go', 'rust'];

  return (
    <div className="card w-[400px] overflow-hidden cursor-grab active:cursor-grabbing border-none bg-transparent" style={{ color: 'var(--text-main)', boxShadow: '0 20px 40px rgba(0,0,0,0.5)', borderLeft: '3px solid #10b981' }}>
      <div className="flex items-center px-4 py-2 border-b border-black/20 pointer-events-auto bg-black/10 dark:bg-white/10">
        <div className="flex gap-1.5 mr-4">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <div className="w-3 h-3 rounded-full bg-yellow-500" />
          <div className="w-3 h-3 rounded-full bg-green-500" />
        </div>
        <select 
          value={language || 'js'}
          onChange={(e) => updateNodeContent(node.id, { language: e.target.value })}
          className="text-xs bg-transparent border-none outline-none font-mono cursor-pointer"
          style={{ color: 'var(--text-main)' }}
        >
          {languages.map(lang => (
            <option key={lang} value={lang} className="bg-gray-800 text-white">{lang.toUpperCase()}</option>
          ))}
        </select>
      </div>
      <textarea 
        value={code}
        placeholder="// Write logic here"
        onChange={(e) => updateNodeContent(node.id, { code: e.target.value })}
        className="text-sm p-4 bg-transparent border-none outline-none w-full resize-none pointer-events-auto leading-relaxed font-mono"
        style={{ minHeight: '120px' }}
      />
      <div style={{ padding: '0 16px 8px' }}>
        <TimeEstimateBadge nodeId={node.id} />
      </div>
    </div>
  );
};
