import React from 'react';
import { useCanvasStore } from '../../../store/useCanvasStore';
import { Image as ImageIcon } from 'lucide-react';

export const ImageNode = ({ node }) => {
  const updateNodeContent = useCanvasStore(state => state.updateNodeContent);
  const { url, caption } = node.content;

  return (
    <div className="card w-72 p-2 cursor-grab active:cursor-grabbing overflow-hidden" style={{ backgroundColor: node.color, borderLeft: '3px solid #ec4899' }}>
      <div className="w-full h-40 bg-gray-100 flex items-center justify-center rounded-lg overflow-hidden relative pointer-events-auto group">
        {url ? (
          <img src={url} alt="User placed" className="w-full h-full object-cover" />
        ) : (
          <div className="flex flex-col items-center opacity-50"><ImageIcon size={32} /></div>
        )}
        <input 
            type="text" 
            placeholder="Paste Image URL..." 
            value={url}
            onChange={(e) => updateNodeContent(node.id, { url: e.target.value })}
            className="absolute top-2 w-[90%] left-1/2 -translate-x-1/2 p-2 rounded-md text-xs opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 text-white outline-none"
        />
      </div>
      <input 
        value={caption}
        placeholder="Image caption..."
        onChange={(e) => updateNodeContent(node.id, { caption: e.target.value })}
        className="text-sm font-medium text-center bg-transparent border-none outline-none mt-2 w-full pointer-events-auto"
        style={{ color: 'var(--text-muted)' }}
      />
    </div>
  );
};
