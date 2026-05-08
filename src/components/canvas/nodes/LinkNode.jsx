import React from 'react';
import { useCanvasStore } from '../../../store/useCanvasStore';
import { ExternalLink, Globe, Link2 } from 'lucide-react';
import { TimeEstimateBadge } from './TimeEstimateBadge';

export const LinkNode = ({ node }) => {
  const updateNodeContent = useCanvasStore(state => state.updateNodeContent);
  const { title, url, description } = node.content;

  const handleOpen = () => {
    let finalUrl = url;
    if (url && !url.startsWith('http://') && !url.startsWith('https://')) {
      finalUrl = 'https://' + url;
    }
    if (finalUrl) {
      window.open(finalUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="card w-[320px] overflow-hidden cursor-grab active:cursor-grabbing border-none flex flex-col bg-transparent backdrop-blur-xl" style={{ color: 'var(--text-main)', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}>
      <div className="p-4 flex items-start gap-3 pointer-events-auto" style={{ backgroundColor: 'var(--surface-high)' }}>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-blue-500/10 text-blue-500">
          <Globe size={20} />
        </div>
        <div className="flex-1 flex flex-col">
          <input 
            value={title}
            placeholder="Resource Title..."
            onChange={(e) => updateNodeContent(node.id, { title: e.target.value })}
            className="text-sm font-bold bg-transparent border-none outline-none w-full"
          />
          <input 
            value={description}
            placeholder="Short description..."
            onChange={(e) => updateNodeContent(node.id, { description: e.target.value })}
            className="text-xs bg-transparent border-none outline-none w-full mt-1"
            style={{ color: 'var(--text-muted)' }}
          />
        </div>
      </div>

      <div className="px-4 py-3 border-y flex items-center gap-2 pointer-events-auto group" style={{ borderColor: 'var(--ghost-border)', backgroundColor: 'var(--surface-main)' }}>
        <Link2 size={14} style={{ color: 'var(--text-muted)' }} />
        <input 
          value={url}
          placeholder="www.example.com"
          onChange={(e) => updateNodeContent(node.id, { url: e.target.value })}
          className="flex-1 text-xs bg-transparent border-none outline-none text-blue-500 hover:underline"
        />
        <button 
          onClick={handleOpen}
          disabled={!url}
          className="p-1.5 rounded bg-blue-500 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-600 transition-colors shadow-sm"
          title="Open Link"
        >
          <ExternalLink size={14} />
        </button>
      </div>

      <div style={{ padding: '8px 16px', backgroundColor: 'var(--surface-lowest)' }}>
        <TimeEstimateBadge nodeId={node.id} />
      </div>
    </div>
  );
};
