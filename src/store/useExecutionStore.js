import { create } from 'zustand';
import { useCanvasStore } from './useCanvasStore';

export const parseTime = (timeStr) => {
  if (!timeStr) return 0;
  const str = timeStr.toLowerCase().trim();
  const numMatch = str.match(/[\d.]+/);
  if (!numMatch) return 0;
  const num = parseFloat(numMatch[0]);

  if (str.includes('h')) return num * 3600;
  if (str.includes('s') && !str.includes('m')) return num; // seconds
  return num * 60; // default minutes
};

export const useExecutionStore = create((set, get) => ({
  status: 'idle', // 'idle', 'running', 'paused', 'completed'
  activeElementId: null, // node id or edge id
  timeRemaining: 0,
  completedElements: [], // IDs of nodes and edges that are finished
  timerIntervalId: null,

  start: () => {
    const canvasStore = useCanvasStore.getState();
    const { nodes, edges } = canvasStore;
    
    if (nodes.length === 0) return;

    // Find starting node (node with no incoming edges)
    const nodesWithIncoming = new Set(edges.map(e => e.to));
    let startNode = nodes.find(n => !nodesWithIncoming.has(n.id));
    if (!startNode) startNode = nodes[0]; // fallback to first node

    const timeEstimate = parseTime(startNode.timeEstimate) || 0; // default 0 if unparseable

    set({ 
      status: 'running', 
      activeElementId: startNode.id, 
      timeRemaining: timeEstimate,
      completedElements: []
    });

    get()._startTicker();
  },

  pause: () => {
    const { timerIntervalId } = get();
    if (timerIntervalId) clearInterval(timerIntervalId);
    set({ status: 'paused', timerIntervalId: null });
  },

  resume: () => {
    set({ status: 'running' });
    get()._startTicker();
  },

  stop: () => {
    const { timerIntervalId } = get();
    if (timerIntervalId) clearInterval(timerIntervalId);
    set({ status: 'idle', activeElementId: null, timeRemaining: 0, completedElements: [], timerIntervalId: null });
  },

  // Skip manually advances to the next element immediately
  skip: () => {
    get()._advanceToNext();
  },

  _startTicker: () => {
    const { timerIntervalId } = get();
    if (timerIntervalId) clearInterval(timerIntervalId);

    const interval = setInterval(() => {
      const { timeRemaining } = get();
      if (timeRemaining > 0) {
        set({ timeRemaining: timeRemaining - 1 });
      } else {
        get()._advanceToNext();
      }
    }, 1000);
    set({ timerIntervalId: interval });
  },

  _advanceToNext: () => {
    const { activeElementId, completedElements, timerIntervalId } = get();
    const canvasStore = useCanvasStore.getState();
    const { nodes, edges } = canvasStore;

    // Add current to completed
    const newCompleted = [...completedElements, activeElementId];

    // Are we on a node or an edge?
    const isNode = nodes.some(n => n.id === activeElementId);
    
    if (isNode) {
      // Find outgoing edge
      const outgoingEdges = edges.filter(e => e.from === activeElementId);
      // For simplicity, just pick the first outgoing edge that hasn't been completed
      const nextEdge = outgoingEdges.find(e => !newCompleted.includes(e.id));

      if (nextEdge) {
        const timeEstimate = parseTime(nextEdge.timeEstimate) || 0;
        set({ activeElementId: nextEdge.id, timeRemaining: timeEstimate, completedElements: newCompleted });
      } else {
        // We are at the end
        if (timerIntervalId) clearInterval(timerIntervalId);
        set({ status: 'completed', activeElementId: null, completedElements: newCompleted, timerIntervalId: null });
      }
    } else {
      // We are on an edge (break). Transition to the target node
      const activeEdge = edges.find(e => e.id === activeElementId);
      if (activeEdge) {
        const nextNode = nodes.find(n => n.id === activeEdge.to);
        if (nextNode) {
          const timeEstimate = parseTime(nextNode.timeEstimate) || 0;
          set({ activeElementId: nextNode.id, timeRemaining: timeEstimate, completedElements: newCompleted });
        } else {
          // Dead end
          if (timerIntervalId) clearInterval(timerIntervalId);
          set({ status: 'completed', activeElementId: null, completedElements: newCompleted, timerIntervalId: null });
        }
      } else {
          if (timerIntervalId) clearInterval(timerIntervalId);
          set({ status: 'completed', activeElementId: null, completedElements: newCompleted, timerIntervalId: null });
      }
    }
  }
}));
