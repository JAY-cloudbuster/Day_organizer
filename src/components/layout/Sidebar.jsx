import React, { useState } from 'react';
import { useCanvasStore } from '../../store/useCanvasStore';
import { Square, Circle, FileText, Layers, Settings, Library, StickyNote, Image, Code, ArrowRight } from 'lucide-react';

export const Sidebar = () => {
  const addNode = useCanvasStore(state => state.addNode);
  const pan = useCanvasStore(state => state.pan);
  const zoom = useCanvasStore(state => state.zoom);
  const [activeTab, setActiveTab] = useState('components');
  const [defaultColor, setDefaultColor] = useState('var(--surface-lowest)');

  const insertNode = (type) => {
    const state = useCanvasStore.getState();
    const { nodes, setPan } = state;

    // Get current raw pan tracking, resolving immediately from state
    const currentPanX = state.pan.x;
    const currentPanY = state.pan.y;

    const viewportCenterX = (window.innerWidth / 2 - currentPanX) / zoom;
    const viewportCenterY = (window.innerHeight / 2 - currentPanY) / zoom;
    
    let targetX = viewportCenterX - 150;
    let targetY = viewportCenterY - 100;
    
    const PAD = 20;

    const isOverlap = (x, y) => {
       return nodes.some(n => {
           const nw = n.width || 300;
           const nh = n.height || 200;
           return (
               x < n.x + nw + PAD &&
               x + 350 > n.x &&
               y < n.y + nh + PAD &&
               y + 250 > n.y
           );
       });
    };

    let attempts = 0;
    let radius = 1;
    let stepSize = 150;

    // Spiral outward to systematically find the nearest non-overlapping open location
    while (isOverlap(targetX, targetY) && attempts < 100) {
        attempts++;
        let found = false;
        
        for (let dx = -radius; dx <= radius; dx++) {
            for (let dy = -radius; dy <= radius; dy++) {
               if (Math.abs(dx) === radius || Math.abs(dy) === radius) {
                   const checkX = viewportCenterX - 150 + (dx * stepSize);
                   const checkY = viewportCenterY - 100 + (dy * stepSize);
                   
                   if (!isOverlap(checkX, checkY)) {
                       targetX = checkX;
                       targetY = checkY;
                       found = true;
                       break;
                   }
               }
            }
            if (found) break;
        }
        if (!found) radius++;
    }

    // Now check if target is outside safe viewing bounds, and pan the camera directly to it instead of zooming out
    const screenX = targetX * zoom + currentPanX;
    const screenY = targetY * zoom + currentPanY;
    const elementW = 350 * zoom; 
    const elementH = 250 * zoom;

    let panDiffX = 0;
    let panDiffY = 0;

    // The left sidebar occupies ~280px, floating toolbar occupies bottom.
    if (screenX < 300) panDiffX = 350 - screenX; 
    else if (screenX + elementW > window.innerWidth - 50) panDiffX = (window.innerWidth - 50) - (screenX + elementW);

    if (screenY < 100) panDiffY = 150 - screenY; 
    else if (screenY + elementH > window.innerHeight - 150) panDiffY = (window.innerHeight - 150) - (screenY + elementH);

    if (panDiffX !== 0 || panDiffY !== 0) {
        setPan(currentPanX + panDiffX, currentPanY + panDiffY);
    }

    let content = {};
    if (type === 'todo') content = { title: 'New List', tasks: [] };
    else if (type === 'priority') content = { title: 'Focus' };
    else if (type === 'project') content = { title: 'New Project', desc: 'Add description...', status: 'Ideas' };
    else if (type === 'sticky') content = { title: 'Note', text: '' };
    else if (type === 'image') content = { url: '', caption: 'New Image' };
    else if (type === 'code') content = { code: '', language: 'js' };

    addNode({ type, x: targetX, y: targetY, content, color: defaultColor });
  };

  const colors = ['var(--surface-lowest)', 'rgba(212, 229, 239, 0.4)', 'rgba(255, 139, 154, 0.4)', 'rgba(203, 231, 245, 0.4)', 'rgba(248, 249, 250, 0.8)'];

  return (
    <aside className="glass-panel fixed top-24 left-4 w-64 bottom-4 flex flex-col z-40 overflow-hidden">
      <div className="flex border-b" style={{ borderColor: 'var(--ghost-border)' }}>
        <TabButton icon={<Layers size={18} />} title="Components" active={activeTab === 'components'} onClick={() => setActiveTab('components')} />
        <TabButton icon={<Library size={18} />} title="Library" active={activeTab === 'library'} onClick={() => setActiveTab('library')} />
        <TabButton icon={<Settings size={18} />} title="Settings" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
        {activeTab === 'components' && (
          <>
            <div className="flex items-center justify-between mb-2">
               <div className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Default Spawn Color</div>
               <div className="flex gap-1">
                 {colors.map(c => (
                   <button key={c} onClick={() => setDefaultColor(c)} className={`w-4 h-4 rounded-full border ${defaultColor === c ? 'scale-125 shadow-md' : 'scale-100'} transition-transform`} style={{ backgroundColor: c, borderColor: 'var(--ghost-border)' }} />
                 ))}
               </div>
            </div>
            
            <ComponentDraggable name="To-Do List" desc="Checklist tracker" icon={<FileText />} onClick={() => insertNode('todo')} />
            <ComponentDraggable name="Priority Node" desc="Focal point" icon={<Circle />} onClick={() => insertNode('priority')} />
            <ComponentDraggable name="Project Card" desc="Detailed overview" icon={<Square />} onClick={() => insertNode('project')} />
            
            <div className="w-full h-px my-2 opacity-20" style={{ backgroundColor: 'var(--ghost-border)' }} />
            
            <ComponentDraggable name="Sticky Note" desc="Fast text blocks" icon={<StickyNote />} onClick={() => insertNode('sticky')} />
            <ComponentDraggable name="Moodboard Image" desc="Visual references" icon={<Image />} onClick={() => insertNode('image')} />
            <ComponentDraggable name="Code Snippet" desc="Syntax formatted blocks" icon={<Code />} onClick={() => insertNode('code')} />
            
            <div className="w-full h-px my-2 opacity-20" style={{ backgroundColor: 'var(--ghost-border)' }} />
            
            <ComponentDraggable name="Flow Arrow" desc="Link nodes together" icon={<ArrowRight />} onClick={() => useCanvasStore.getState().setActiveTool('connect')} />
          </>
        )}
        
        {activeTab === 'library' && (
          <div className="text-center mt-10 text-sm" style={{ color: 'var(--text-muted)' }}>Library empty.<br/>Save templates here.</div>
        )}

        {activeTab === 'settings' && (
          <div className="flex flex-col mt-4 text-sm" style={{ color: 'var(--text-muted)' }}>
            <span className="font-bold text-xs uppercase mb-2">Workspace Info</span>
            <span>Local DB connected.</span>
            <span>Security: Active</span>
          </div>
        )}
      </div>
    </aside>
  );
};

const TabButton = ({ icon, active, onClick }) => (
  <button 
    onClick={onClick}
    className="flex-1 py-3 flex justify-center items-center relative transition-colors"
    style={{ color: active ? 'var(--accent-primary)' : 'var(--text-muted)', backgroundColor: active ? 'rgba(0,0,0,0.02)' : 'transparent' }}
  >
    {icon}
    {active && <div className="absolute bottom-0 left-0 right-0 h-0.5" style={{ backgroundColor: 'var(--accent-primary)' }} />}
  </button>
);

const ComponentDraggable = ({ name, desc, icon, onClick }) => (
  <div 
    onClick={onClick}
    className="p-3 rounded-xl border cursor-pointer hover:shadow-md transition-all active:scale-95 group"
    style={{ backgroundColor: 'var(--surface-lowest)', borderColor: 'var(--ghost-border)' }}
  >
    <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-2 transition-colors"
         style={{ backgroundColor: 'var(--surface-high)', color: 'var(--accent-primary)' }}>
      {icon}
    </div>
    <div className="font-semibold text-sm" style={{ color: 'var(--text-main)' }}>{name}</div>
    <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{desc}</div>
  </div>
);
