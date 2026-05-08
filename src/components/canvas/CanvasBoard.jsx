import React, { useRef, useState } from 'react';
import { useGesture } from '@use-gesture/react';
import { useCanvasStore } from '../../store/useCanvasStore';
import { useModalStore } from '../../store/useModalStore';
import { useExecutionStore, parseTime } from '../../store/useExecutionStore';
import { getStroke } from 'perfect-freehand';
import { DraggableNode } from './DraggableNode';
import { DrawingToolbar } from './DrawingToolbar';

function getSvgPathFromStroke(stroke) {
  if (!stroke.length) return '';
  const d = stroke.reduce(
    (acc, [x0, y0], i, arr) => {
      const [x1, y1] = arr[(i + 1) % arr.length];
      acc.push(x0, y0, (x0 + x1) / 2, (y0 + y1) / 2);
      return acc;
    },
    ['M', ...stroke[0], 'Q']
  );
  d.push('Z');
  return d.join(' ');
}
import clsx from 'clsx';
// Imported Node Types
import { ToDoNode } from './nodes/ToDoNode';
import { PriorityNode } from './nodes/PriorityNode';
import { ProjectNode } from './nodes/ProjectNode';
import { StickyNode } from './nodes/StickyNode';
import { ImageNode } from './nodes/ImageNode';
import { CodeNode } from './nodes/CodeNode';
import { CommentNode } from './nodes/CommentNode';
import { GoalTrackerNode } from './nodes/GoalTrackerNode';
import { TimerNode } from './nodes/TimerNode';
import { LinkNode } from './nodes/LinkNode';
import { playConnectSound, playDropSound } from '../../utils/haptics';
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
    case 'goaltracker': return <GoalTrackerNode node={node} />;
    case 'timer': return <TimerNode node={node} />;
    case 'link': return <LinkNode node={node} />;
    default: return <div className="card p-4">Unknown Node</div>;
  }
};

export const CanvasBoard = () => {
  const { pan, zoom, setPan, setZoom, nodes, edges, activeTool, addNode, setActiveTool, addEdge, fontStyle, textSize, arrowStyle, drawings, currentStroke, drawTool, laserStrokes } = useCanvasStore();
  const status = useExecutionStore(state => state.status);
  const activeElementId = useExecutionStore(state => state.activeElementId);
  const completedElements = useExecutionStore(state => state.completedElements);
  const timeRemaining = useExecutionStore(state => state.timeRemaining);
  const containerRef = useRef(null);
  const [ghostEdge, setGhostEdge] = useState(null);

  useGesture(
    {
      onDrag: ({ delta: [dx, dy], event, tap, active, first, last, xy: [clientX, clientY] }) => {
        if (tap) return; 

        if (activeTool === 'draw') {
          // Prevent drawing if starting the stroke on top of an existing node
          if (first && event.target.closest('.draggable-wrapper')) {
            return;
          }

          const rect = containerRef.current.getBoundingClientRect();
          const targetX = (clientX - rect.left - pan.x) / zoom;
          const targetY = (clientY - rect.top - pan.y) / zoom;
          
          const { drawTool, drawColor, addNode, setActiveTool, drawings, removeDrawing, startStroke, updateStroke, endStroke } = useCanvasStore.getState();

          // 1) Text Tool logic
          if (drawTool === 'text' && first) {
            addNode({ type: 'comment', x: targetX, y: targetY, content: { text: '', author: 'Draw Text' }, color: 'transparent' });
            setActiveTool('select');
            return;
          }

          // 2) Eraser Tool logic (Object-level deletion)
          if (drawTool === 'eraser') {
            for (const d of drawings) {
              for (const p of d.points) {
                if (Math.hypot(p[0] - targetX, p[1] - targetY) < 30) { // 30px eraser radius
                  removeDrawing(d.id);
                  break;
                }
              }
            }
            return;
          }

          // 3) Standard Brushes logic
          const pressure = event.pointerType === 'pen' ? event.pressure : 0.5;

          if (first) {
            startStroke([targetX, targetY, pressure], drawColor, drawTool);
          } else if (active) {
            updateStroke([targetX, targetY, pressure]);
          } 
          if (last) {
            endStroke();
          }
          return;
        }

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
              const newEdgeId = addEdge(ghostEdge.fromId, droppedOnNode.id);
              if (newEdgeId) {
                playConnectSound();
              }
              setActiveTool('select'); 
              if (newEdgeId) {
                setTimeout(() => {
                  useModalStore.getState().openModal({
                    type: 'input',
                    title: 'Set Break Time',
                    message: 'How much time do you need to break? (e.g., 5m, 1h)',
                    placeholder: '15m',
                    onConfirm: (timeNeeded) => {
                      if (timeNeeded) {
                        useCanvasStore.getState().updateEdgeTimeEstimate(newEdgeId, timeNeeded);
                      }
                    }
                  });
                }, 100);
              }
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

  // Canvas Virtualization (Windowing)
  const viewportW = window.innerWidth / zoom;
  const viewportH = window.innerHeight / zoom;
  const viewX = -pan.x / zoom;
  const viewY = -pan.y / zoom;

  const visibleNodes = nodes.filter(n => {
    const w = n.width || 400;
    const h = n.height || 400;
    return (
      n.x + w > viewX - 1000 && n.x < viewX + viewportW + 1000 &&
      n.y + h > viewY - 1000 && n.y < viewY + viewportH + 1000
    );
  });

  const fontSizeMap = { small: '0.8rem', medium: '1rem', large: '1.2rem' };

  const getStrokeConfig = (toolId) => {
    switch(toolId) {
      case 'pen': return { size: 2, thinning: 0.5, smoothing: 0.8, streamline: 0.6 };
      case 'highlighter': return { size: 30, thinning: 0, smoothing: 0.2, streamline: 0.2 };
      case 'laser': return { size: 6, thinning: 0.1, smoothing: 0.9, streamline: 0.8 };
      default: return { size: 6, thinning: 0.5, smoothing: 0.5, streamline: 0.5 }; // pencil
    }
  };

  const getStrokeStyle = (toolId, color) => {
    switch(toolId) {
      case 'highlighter': return { fill: color, opacity: 0.4, mixBlendMode: 'multiply' };
      case 'laser': return { fill: color, filter: 'drop-shadow(0 0 8px currentColor)' };
      default: return { fill: color };
    }
  };

  return (
    <div 
      className={`canvas-viewport ${activeTool === 'pan' ? 'cursor-grab' : activeTool === 'comment' ? 'cursor-text' : activeTool === 'draw' ? (drawTool === 'text' ? 'cursor-text' : drawTool === 'eraser' ? 'cursor-pointer' : 'cursor-crosshair') : ''}`} 
      ref={containerRef}
      style={{ fontFamily: fontStyle, fontSize: fontSizeMap[textSize] || '1rem' }}
    >
      <DrawingToolbar />
      <div 
        className="canvas-grid"
        style={{
          backgroundPosition: `${pan.x}px ${pan.y}px`,
          backgroundSize: `${24 * zoom}px ${24 * zoom}px`
        }}
      />
      
      <div 
        className={clsx("canvas-container", (status === 'running' || status === 'paused') && "focus-mode")}
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
            <marker id="arrowhead-red" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill="#ef4444" />
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

            const midX = (cx1 + endX) / 2;
            const midY = (cy1 + endY) / 2;

            const isActive = activeElementId === edge.id;
            const isCompleted = completedElements.includes(edge.id);
            
            const length = Math.sqrt(Math.pow(endX - cx1, 2) + Math.pow(endY - cy1, 2));
            const totalTime = Math.max(0.1, parseTime(edge.timeEstimate));
            const progress = isActive ? Math.max(0, Math.min(1, (totalTime - timeRemaining) / totalTime)) : (isCompleted ? 1 : 0);
            const dashOffset = length * (1 - progress);

            return (
              <g key={edge.id}>
                {/* Base Line */}
                <line 
                  x1={cx1} y1={cy1} x2={endX} y2={endY} 
                  stroke={isCompleted ? '#ef4444' : 'var(--accent-primary)'} strokeWidth="3" markerEnd={isCompleted ? "url(#arrowhead-red)" : "url(#arrowhead)"} 
                  strokeDasharray={arrowStyle === 'dashed' ? '8,8' : 'none'}
                />
                
                {/* Active Progress Overlay */}
                {(isActive || isCompleted) && (
                  <line 
                    x1={cx1} y1={cy1} x2={endX} y2={endY} 
                    stroke="#ef4444" strokeWidth="4" 
                    strokeDasharray={length}
                    strokeDashoffset={dashOffset}
                    style={{ transition: isActive ? 'stroke-dashoffset 1s linear' : 'none', pointerEvents: 'none' }}
                  />
                )}

                {/* Clickable Invisible Interaction Line */}
                <line 
                  x1={cx1} y1={cy1} x2={endX} y2={endY} 
                  stroke="transparent" strokeWidth="20"
                  style={{ cursor: 'pointer', pointerEvents: 'stroke' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    useModalStore.getState().openModal({
                      type: 'input',
                      title: 'Edit Arrow',
                      message: 'Enter time estimate (e.g. 5m, 1h). Type "DELETE" to remove the arrow entirely.',
                      defaultValue: edge.timeEstimate || '',
                      onConfirm: (val) => {
                        if (val === 'DELETE') {
                          useCanvasStore.getState().deleteEdge(edge.id);
                        } else {
                          useCanvasStore.getState().updateEdgeTimeEstimate(edge.id, val);
                        }
                      }
                    });
                  }}
                />

                {edge.timeEstimate && (
                  <g 
                    transform={`translate(${midX}, ${midY})`}
                    style={{ pointerEvents: 'none' }}
                  >
                    <rect 
                      x="-40" y="-14" width="80" height="28" rx="14" 
                      fill="var(--surface-high)" stroke="var(--ghost-border)" strokeWidth="1"
                    />
                    <text 
                      x="0" y="4" 
                      fill="var(--text-main)" 
                      fontSize="10" 
                      fontWeight="bold" 
                      textAnchor="middle"
                    >
                      ⏳ {edge.timeEstimate}
                    </text>
                  </g>
                )}
              </g>
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

        {/* Freehand Drawings */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-10" style={{ overflow: 'visible' }}>
          {/* Permanent Drawings */}
          {drawings.map((drawing) => {
            const config = getStrokeConfig(drawing.tool);
            const style = getStrokeStyle(drawing.tool, drawing.color);
            const pathData = getSvgPathFromStroke(getStroke(drawing.points, config));
            return <path key={drawing.id} d={pathData} {...style} />;
          })}
          
          {/* Laser Drawings (Temporary) */}
          {laserStrokes.map((drawing) => {
            const config = getStrokeConfig(drawing.tool);
            const style = getStrokeStyle(drawing.tool, drawing.color);
            const pathData = getSvgPathFromStroke(getStroke(drawing.points, config));
            // Apply fade out animation class via tailwind or simple inline transition
            return <path key={drawing.id} d={pathData} {...style} className="animate-in fade-in duration-100 opacity-0 transition-opacity" style={{ ...style, transitionDuration: '1s' }} />;
          })}

          {/* Current Stroke in Progress */}
          {currentStroke && (
            <path 
              d={getSvgPathFromStroke(getStroke(currentStroke.points, getStrokeConfig(currentStroke.tool)))} 
              {...getStrokeStyle(currentStroke.tool, currentStroke.color)} 
            />
          )}
        </svg>

        {visibleNodes.map(node => (
          <DraggableNode key={node.id} node={node}>
            <NodeRenderer node={node} />
          </DraggableNode>
        ))}
      </div>
    </div>
  );
};
