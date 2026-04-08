import React, { useRef, useState } from 'react';
import { useGesture } from '@use-gesture/react';
import { useCanvasStore } from '../../store/useCanvasStore';
import { DraggableNode } from './DraggableNode';
// Imported Node Types
import { ToDoNode } from './nodes/ToDoNode';
import { PriorityNode } from './nodes/PriorityNode';
import { ProjectNode } from './nodes/ProjectNode';
import { StickyNode } from './nodes/StickyNode';
import { ImageNode } from './nodes/ImageNode';
import { CodeNode } from './nodes/CodeNode';
import { CommentNode } from './nodes/CommentNode';
import '../../styles/canvas.css';

const NodeRenderer = ({ node }) => {
  switch (node.type) {
    case 'todo': return <ToDoNode node={node} />;
    case 'priority': return <PriorityNode node={node} />;
    case 'project': return <ProjectNode node={node} />;
    case 'sticky': return <StickyNode node={node} />;
    case 'image': return <ImageNode node={node} />;
    case 'code': return <CodeNode node={node} />;
    case 'comment': return <CommentNode node={node} />;
    default: return <div className="card p-4">Unknown Node</div>;
  }
};

export const CanvasBoard = () => {
  const { pan, zoom, setPan, setZoom, nodes, edges, activeTool, addNode, setActiveTool, addEdge } = useCanvasStore();
  const containerRef = useRef(null);
  const [ghostEdge, setGhostEdge] = useState(null);

  useGesture(
    {
      onDrag: ({ delta: [dx, dy], event, tap, active, first, xy: [clientX, clientY] }) => {
        if (tap) return; 

        // Connection Flow Logic
        if (activeTool === 'connect') {
          const rect = containerRef.current.getBoundingClientRect();
          const targetX = (clientX - rect.left - pan.x) / zoom;
          const targetY = (clientY - rect.top - pan.y) / zoom;

          if (first) {
            const nodeEl = event.target.closest('[data-nodeid]');
            if (nodeEl) {
              const fromId = nodeEl.getAttribute('data-nodeid');
              setGhostEdge({ fromId, x: targetX, y: targetY });
            }
            return;
          }

          if (active && ghostEdge) {
            setGhostEdge(prev => ({ ...prev, x: targetX, y: targetY }));
          } 
          else if (!active && ghostEdge) {
            // Geometric Drop Collision Logic (bypasses browser DOM masking issues entirely)
            const droppedOnNode = nodes.find(n => {
              if (n.id === ghostEdge.fromId) return false;
              const w = n.width || 300;
              const h = n.height || 200;
              return targetX >= n.x && targetX <= n.x + w &&
                     targetY >= n.y && targetY <= n.y + h;
            });
            
            if (droppedOnNode) {
              addEdge(ghostEdge.fromId, droppedOnNode.id);
              setActiveTool('select'); 
            }
            setGhostEdge(null);
          }
          return;
        }

        // Panning Logic
        if (activeTool === 'pan' || !(event.target).closest('.draggable-wrapper')) {
          setPan(pan.x + dx, pan.y + dy);
        }
      },
      onWheel: ({ event, delta: [, dy], ctrlKey }) => {
        event.preventDefault();
        if (ctrlKey || event.metaKey) {
          const zoomMultiplier = dy > 0 ? 0.95 : 1.05;
          setZoom(zoom * zoomMultiplier);
        } else {
          setPan(pan.x - event.deltaX, pan.y - event.deltaY);
        }
      },
      onClick: ({ event }) => {
        // If comment tool is active, place a comment precisely at click location
        if (activeTool === 'comment' && !(event.target).closest('.draggable-wrapper')) {
          const rect = containerRef.current.getBoundingClientRect();
          const targetX = (event.clientX - rect.left - pan.x) / zoom;
          const targetY = (event.clientY - rect.top - pan.y) / zoom;
          
          addNode({ type: 'comment', x: targetX, y: targetY, content: { text: '', author: 'Me' } });
          setActiveTool('select'); // revert tool
        }
      }
    },
    { 
      target: containerRef, 
      eventOptions: { passive: false },
      drag: { filterTaps: true }
    }
  );

  return (
    <div className={`canvas-viewport ${activeTool === 'pan' ? 'cursor-grab' : activeTool === 'comment' ? 'cursor-text' : ''}`} ref={containerRef}>
      <div 
        className="canvas-grid"
        style={{
          backgroundPosition: `${pan.x}px ${pan.y}px`,
          backgroundSize: `${24 * zoom}px ${24 * zoom}px`
        }}
      />
      
      <div 
        style={{ 
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: '0 0',
          width: '100%',
          height: '100%',
          position: 'absolute',
          pointerEvents: 'none'
        }}
      >
        <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', overflow: 'visible', zIndex: 0 }}>
          <defs>
            <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill="var(--accent-primary)" />
            </marker>
          </defs>
          
          {edges.map(edge => {
            const fromNode = nodes.find(n => n.id === edge.from);
            const toNode = nodes.find(n => n.id === edge.to);
            if (!fromNode || !toNode) return null;
            
            const w1 = fromNode.width || 300; const h1 = fromNode.height || 200;
            const w2 = toNode.width || 300; const h2 = toNode.height || 200;
            
            const cx1 = fromNode.x + w1 / 2; 
            const cy1 = fromNode.y + h1 / 2;
            const cx2 = toNode.x + w2 / 2; 
            const cy2 = toNode.y + h2 / 2;

            // Advanced AABB Border intersection mathematical clipping
            const dx = cx2 - cx1;
            const dy = cy2 - cy1;
            // The 15px pad ensures arrowheads sit visibly completely outside the destination node edge regardless of geometry
            const hw2 = w2 / 2 + 15; 
            const hh2 = h2 / 2 + 15;

            let tX = -Infinity, tY = -Infinity;
            // Time to hit the X vertical walls of the target
            if (dx !== 0) tX = (cx2 - Math.sign(dx) * hw2 - cx1) / dx;
            // Time to hit the Y horizontal walls of the target
            if (dy !== 0) tY = (cy2 - Math.sign(dy) * hh2 - cy1) / dy;
            
            // The intersection point into a bounding box is exactly the MAXIMUM of the slab entry times
            const t = Math.max(0, Math.min(1, Math.max(tX, tY)));
            const endX = cx1 + dx * t;
            const endY = cy1 + dy * t;

            return (
              <line 
                key={edge.id} x1={cx1} y1={cy1} x2={endX} y2={endY} 
                stroke="var(--accent-primary)" strokeWidth="3" markerEnd="url(#arrowhead)" 
              />
            );
          })}

          {ghostEdge && (() => {
            const fromNode = nodes.find(n => n.id === ghostEdge.fromId);
            if (!fromNode) return null;
            const w1 = fromNode.width || 300; const h1 = fromNode.height || 200;
            const cx1 = fromNode.x + w1 / 2; 
            const cy1 = fromNode.y + h1 / 2;
            return <line 
              x1={cx1} y1={cy1} x2={ghostEdge.x} y2={ghostEdge.y} 
              stroke="var(--accent-primary)" strokeWidth="3" strokeDasharray="5,5" markerEnd="url(#arrowhead)" 
            />;
          })()}
        </svg>

        {nodes.map(node => (
          <DraggableNode key={node.id} node={node}>
            <NodeRenderer node={node} />
          </DraggableNode>
        ))}
      </div>
    </div>
  );
};
