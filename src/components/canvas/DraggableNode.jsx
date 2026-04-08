import React, { useRef, useState, useEffect } from 'react';
import { useDrag } from '@use-gesture/react';
import { useCanvasStore } from '../../store/useCanvasStore';
import { X, Palette, Move } from 'lucide-react';
import clsx from 'clsx';

export const DraggableNode = ({ node, children }) => {
  const { updateNodePosition, zoom, activeTool, deleteNode, updateNodeColor, connectingFrom, setConnectingFrom, addEdge, nodes, updateNodeDimensions } = useCanvasStore();
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [moveMode, setMoveMode] = useState(false);
  const nodeRef = useRef(null);

  useEffect(() => {
    const el = nodeRef.current;
    if (!el) return;

    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        updateNodeDimensions(node.id, entry.contentRect.width, entry.contentRect.height);
      }
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, [node.id, updateNodeDimensions]);

  const checkCollision = (targetX, targetY, targetW, targetH) => {
    const PADDING = 10;
    return nodes.some(n => {
      if (n.id === node.id || !n.width || !n.height) return false;
      return (
        targetX < n.x + n.width + PADDING &&
        targetX + targetW + PADDING > n.x &&
        targetY < n.y + n.height + PADDING &&
        targetY + targetH + PADDING > n.y
      );
    });
  };

  const bind = useDrag(({ movement: [mx, my], first, memo, dragging, event }) => {
    event.stopPropagation();

    if (first) {
      return { x: node.x, y: node.y };
    }

    let newX = memo.x + (mx / zoom);
    let newY = memo.y + (my / zoom);

    const w = nodeRef.current ? nodeRef.current.offsetWidth : 200;
    const h = nodeRef.current ? nodeRef.current.offsetHeight : 200;

    // Strict Collision Resolution
    if (checkCollision(newX, newY, w, h)) {
      if (!checkCollision(newX, node.y, w, h)) {
        newY = node.y; // allow slide left/right
      } else if (!checkCollision(node.x, newY, w, h)) {
        newX = node.x; // allow slide up/down
      } else {
        newX = node.x; // complete block
        newY = node.y;
      }
    }

    updateNodePosition(node.id, newX, newY);

    return memo;
  }, { filterTaps: true, pointerEvents: true, enabled: moveMode });

  const colors = ['#ffffff', '#f1f4f6', '#d4e5ef', '#e7f5cb', '#cbe7f5', '#2b3437'];

  return (
    <div 
      ref={nodeRef}
      data-nodeid={node.id}
      onDoubleClick={(e) => { e.stopPropagation(); setMoveMode(true); }}
      className={clsx("draggable-wrapper group", activeTool === 'connect' && "cursor-crosshair")}
      style={{ left: node.x, top: node.y, backgroundColor: node.color }}
    >
      <div className="relative">
        <div
          className={clsx(
            "absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold text-gray-400 opacity-0 transition-opacity whitespace-nowrap",
            !moveMode && "group-hover:opacity-100"
          )}
        >
          Double click to move
        </div>

        {moveMode && (
          <div {...bind()} className="absolute inset-0 z-50 bg-black/20 backdrop-blur-sm rounded-xl flex items-center justify-center cursor-move" onDoubleClick={(e) => { e.stopPropagation(); setMoveMode(false); }}>
            <div className="bg-white text-black px-4 py-2 rounded-full font-bold shadow-lg flex items-center gap-2 pointer-events-auto" onClick={(e) => { e.stopPropagation(); setMoveMode(false); }}>
              <Move size={16} /> Double click to move
            </div>
          </div>
        )}

        <button
          onClick={(e) => { e.stopPropagation(); deleteNode(node.id); }}
          className="absolute -top-3 -right-3 w-7 h-7 bg-red-500 rounded-full text-white opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-75 group-hover:scale-100 flex items-center justify-center z-[60] pointer-events-auto shadow-md hover:bg-red-600"
          title="Delete Node"
        >
          <X size={14} strokeWidth={3} />
        </button>

        <button
          onClick={(e) => { e.stopPropagation(); setShowColorPicker(!showColorPicker); }}
          className="absolute -bottom-3 -left-3 w-7 h-7 bg-gray-200 dark:bg-gray-700 rounded-full text-black dark:text-white opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-75 group-hover:scale-100 flex items-center justify-center z-[60] pointer-events-auto shadow-md"
        >
          <Palette size={14} />
        </button>

        {showColorPicker && (
          <div className="absolute -bottom-10 left-0 flex gap-1 bg-white dark:bg-gray-800 p-2 rounded-xl shadow-xl pointer-events-auto z-[60]" onPointerDown={e => e.stopPropagation()}>
            {colors.map(c => (
              <div key={c} onClick={() => { updateNodeColor(node.id, c); setShowColorPicker(false); }}
                className="w-5 h-5 rounded-full cursor-pointer border hover:scale-110 transition-transform"
                style={{ backgroundColor: c, borderColor: 'var(--ghost-border)' }} />
            ))}
          </div>
        )}

        <div style={{ pointerEvents: moveMode ? 'none' : 'auto' }}>
          {children}
        </div>
      </div>
    </div>
  );
};
