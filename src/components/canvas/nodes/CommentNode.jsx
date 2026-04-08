import React from 'react';
import { useCanvasStore } from '../../../store/useCanvasStore';
import { MessageSquare } from 'lucide-react';

export const CommentNode = ({ node }) => {
  const updateNodeContent = useCanvasStore(state => state.updateNodeContent);
  const { text, author } = node.content;

  return (
    <div className="relative pointer-events-auto">
      {/* Visual Tail */}
      <div className="absolute -bottom-2 -left-2 w-4 h-4 rounded-full bg-yellow-400 z-0" />
      <div className="card w-48 p-3 shadow-xl border-none z-10 relative cursor-grab active:cursor-grabbing" style={{ backgroundColor: '#fef08a' }}>
        <div className="flex items-center gap-2 mb-2 font-bold text-yellow-900 border-b border-yellow-500/20 pb-1">
          <MessageSquare size={14} />
          <input 
            value={author}
            placeholder="Me"
            onChange={(e) => updateNodeContent(node.id, { author: e.target.value })}
            className="text-xs bg-transparent border-none outline-none"
          />
        </div>
        <textarea 
          autoFocus
          value={text}
          placeholder="Add comment..."
          onChange={(e) => updateNodeContent(node.id, { text: e.target.value })}
          className="text-xs bg-transparent border-none outline-none w-full resize-none leading-relaxed text-yellow-900 font-medium"
          style={{ minHeight: '40px' }}
        />
      </div>
    </div>
  );
};
