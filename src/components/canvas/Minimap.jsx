import React, { useMemo } from 'react';
import { useCanvasStore } from '../../store/useCanvasStore';

export const Minimap = () => {
  const { nodes, pan, zoom, setPan } = useCanvasStore();

  const { minX, minY, width, height, scaleX, scaleY } = useMemo(() => {
    if (nodes.length === 0) return { minX: 0, minY: 0, width: 1000, height: 1000, scaleX: 1, scaleY: 1 };
    
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    nodes.forEach(n => {
      const w = n.width || 300;
      const h = n.height || 300;
      if (n.x < minX) minX = n.x;
      if (n.y < minY) minY = n.y;
      if (n.x + w > maxX) maxX = n.x + w;
      if (n.y + h > maxY) maxY = n.y + h;
    });
    
    // Add padding
    minX -= 500; minY -= 500;
    maxX += 500; maxY += 500;
    
    const w = maxX - minX;
    const h = maxY - minY;
    
    return { minX, minY, width: w, height: h, scaleX: 160 / w, scaleY: 120 / h };
  }, [nodes]);

  const handleMinimapClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Map click on minimap to canvas coordinates
    const targetCanvasX = minX + (x / scaleX);
    const targetCanvasY = minY + (y / scaleY);
    
    // Warp camera (center it)
    const viewportW = window.innerWidth / zoom;
    const viewportH = window.innerHeight / zoom;
    
    setPan(
      -(targetCanvasX - viewportW / 2) * zoom,
      -(targetCanvasY - viewportH / 2) * zoom
    );
  };

  const viewportBox = {
    x: (-pan.x / zoom - minX) * scaleX,
    y: (-pan.y / zoom - minY) * scaleY,
    w: (window.innerWidth / zoom) * scaleX,
    h: (window.innerHeight / zoom) * scaleY
  };

  return (
    <div 
      className="fixed bottom-4 right-4 z-40 w-[160px] h-[120px] rounded-xl overflow-hidden glass-panel border-none shadow-none transition-all duration-300 opacity-10 hover:opacity-100 hover:scale-105 hover:shadow-2xl group"
      style={{
        transform: 'perspective(1000px) rotateX(15deg) rotateY(-15deg)',
        transformOrigin: 'bottom right',
        backdropFilter: 'none' // Remove default glass blur for faint blueprint look
      }}
    >
      <div 
        className="relative w-full h-full cursor-pointer transition-colors duration-300 bg-black/5 hover:bg-black/20"
        onClick={handleMinimapClick}
      >
        {nodes.map(node => (
          <div
            key={node.id}
            className="absolute rounded-[2px]"
            style={{
              left: (node.x - minX) * scaleX,
              top: (node.y - minY) * scaleY,
              width: Math.max((node.width || 300) * scaleX, 2),
              height: Math.max((node.height || 300) * scaleY, 2),
              backgroundColor: node.color || 'var(--accent-primary)',
              opacity: 0.8
            }}
          />
        ))}
        
        {/* Viewport Box */}
        <div 
          className="absolute border border-white/50 bg-white/10 rounded-[2px] transition-all duration-300 pointer-events-none"
          style={{
            left: viewportBox.x,
            top: viewportBox.y,
            width: viewportBox.w,
            height: viewportBox.h
          }}
        />
      </div>
    </div>
  );
};
