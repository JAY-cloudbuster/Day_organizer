import React from 'react';
import { useCanvasStore } from '../../../store/useCanvasStore';
import { MoreHorizontal } from 'lucide-react';

export const ProjectNode = ({ node }) => {
  const updateNodeContent = useCanvasStore(state => state.updateNodeContent);
  const { title, desc, status } = node.content;

  return (
    <div className="card w-96 overflow-hidden cursor-grab active:cursor-grabbing hover:shadow-2xl transition-shadow"
         onPointerDown={e => e.stopPropagation()}>
      <div className="h-2 w-full" style={{ backgroundColor: 'var(--accent-primary)' }} />
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <input 
            value={status}
            onChange={e => updateNodeContent(node.id, { status: e.target.value })}
            className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-tighter outline-none pointer-events-auto"
            style={{ backgroundColor: 'var(--accent-secondary)', color: 'var(--surface-lowest)', width: '100px' }}
          />
          <MoreHorizontal size={20} style={{ color: 'var(--text-muted)' }} />
        </div>
        
        <input 
          value={title}
          onChange={e => updateNodeContent(node.id, { title: e.target.value })}
          className="text-xl font-bold bg-transparent border-none outline-none mb-2 w-full pointer-events-auto"
          style={{ color: 'var(--text-main)' }}
        />
        
        <textarea 
          value={desc}
          onChange={e => updateNodeContent(node.id, { desc: e.target.value })}
          className="text-sm bg-transparent border-none outline-none mb-6 w-full resize-none pointer-events-auto leading-relaxed"
          style={{ color: 'var(--text-muted)', minHeight: '60px' }}
        />
        
        <div className="flex items-center -space-x-3 pointer-events-auto">
          <img className="w-8 h-8 rounded-full border-2 object-cover relative z-20" style={{ borderColor: 'var(--surface-lowest)' }} src="https://lh3.googleusercontent.com/aida-public/AB6AXuBXscwqin8hZ0eh5aCHiMe0atES0bFEwNO9lYXwGtWb95sRvJAgtU8OnIfhe5milvqbLyUygA-t0d6bLyMGOGV-vsSpCNThUCkMBYS0sIS6JLfzg_hZayVORMibKXz5TDhcwCaoALEvIdoU2pvGgNtL7pwaK7JWfsVwEkClegiXBUdK2uzpOEArfxVa4FSEufUYWoHS7evVcEy2pOGYHbO7xoBOCIXZWLfUvxbYgYyjpbyXvGw02Twm5fk4KZNNQ9mnwpsX_Zza_KA" alt="Team 1" />
          <img className="w-8 h-8 rounded-full border-2 object-cover relative z-10" style={{ borderColor: 'var(--surface-lowest)' }} src="https://lh3.googleusercontent.com/aida-public/AB6AXuB79NNglMMV2myTr0RMnWz4ObOmPXwkvjsqTw3vDQpX8M6GyJiNv4xufnOE1BdTeb01HzZkYlFbRWlm2GPuiVF74r-yFDMiZsX9apMLfZ3Dekkr1tFu9ZDZpLIeXWS1LUpaX2C5mIeLoIiaYx24h2cP9OpdrUw0ID_VlQV_glQokqKRo6oLGuhbzW94rIrGFJBuWamxje7mmqpqrlhfsfIe9aSk-aC5GL3faxE5hAzT8WgvAifzRDa3Ygtc5qgra3QBoHkVzQfu8Uw" alt="Team 2" />
          <div className="w-8 h-8 rounded-full border-2 flex items-center justify-center text-[10px] font-bold relative z-0" 
               style={{ borderColor: 'var(--surface-lowest)', backgroundColor: 'var(--surface-high)', color: 'var(--text-muted)' }}>
            +2
          </div>
        </div>
      </div>
    </div>
  );
};
