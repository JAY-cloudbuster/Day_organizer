import { create } from 'zustand';
import { useModalStore } from './useModalStore';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const useCanvasStore = create((set, get) => ({
  nodes: [],
  edges: [], // For arrow connections: { id, from: nodeId, to: nodeId }
  pan: { x: 0, y: 0 },
  zoom: 1,
  drawings: [], // Stores freehand strokes
  drawHistory: [], // History stack for undo/redo
  historyIndex: -1,
  currentStroke: null, // Active stroke being drawn
  laserStrokes: [], // Temporary strokes
  saveStatus: 'saved',
  theme: localStorage.getItem('app_theme') || 'dark',
  activeTool: 'select', // 'select', 'pan', 'comment', 'connect', 'draw'
  drawTool: 'pencil', // 'pencil', 'pen', 'highlighter', 'eraser', 'laser', 'text'
  drawColor: '#000000',
  connectingFrom: null, // Holds the node id when a connection line is started
  isIsolated: false, // Zen Mode toggle

  // Visual Settings
  fontStyle: 'sans-serif',
  textSize: 'medium', // 'small', 'medium', 'large'
  arrowStyle: 'solid', // 'solid', 'dashed'

  currentProjectId: null,
  currentProjectTitle: '',
  projectsList: [],

  authToken: localStorage.getItem('token') || null,

  setAuthToken: (token) => {
    localStorage.setItem('token', token);
    set({ authToken: token });
    get().loadAllProjects();
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ authToken: null, nodes: [] });
  },

  toggleTheme: () => set((state) => {
    const newTheme = state.theme === 'light' ? 'dark' : 'light';
    localStorage.setItem('app_theme', newTheme);
    return { theme: newTheme };
  }),
  setIsIsolated: (val) => set({ isIsolated: val }),
  setActiveTool: (tool) => set({ activeTool: tool, connectingFrom: null }),
  setDrawTool: (tool) => set({ drawTool: tool }),
  setDrawColor: (color) => set({ drawColor: color }),
  setConnectingFrom: (id) => set({ connectingFrom: id }),
  updateSettings: (settings) => set(settings),

  addNode: (node) => {
    const id = node.id || crypto.randomUUID();
    // Default color provided if not specified
    const finalNode = { ...node, id, color: node.color || 'var(--surface-lowest)' };
    set((state) => ({ 
      nodes: [...state.nodes, finalNode],
      saveStatus: 'saving'
    }));
    get().triggerAutoSave();
    return id;
  },
  
  deleteNode: (id) => {
    set((state) => ({
      nodes: state.nodes.filter(n => n.id !== id),
      edges: state.edges.filter(e => e.from !== id && e.to !== id),
      saveStatus: 'saving'
    }));
    get().triggerAutoSave();
  },

  clearCanvas: () => {
    useModalStore.getState().openModal({
      title: 'Clear Canvas',
      message: 'Are you sure you want to clear the entire canvas? This action cannot be undone.',
      type: 'confirm',
      onConfirm: () => {
        set({ nodes: [], edges: [], drawings: [], saveStatus: 'saving' });
        get().triggerAutoSave();
      }
    });
  },

  startStroke: (point, color = 'var(--text-main)', tool = 'pencil') => set({ currentStroke: { points: [point], color, tool } }),
  updateStroke: (point) => set((state) => {
    if (!state.currentStroke) return state;
    return { currentStroke: { ...state.currentStroke, points: [...state.currentStroke.points, point] } };
  }),
  endStroke: () => {
    set((state) => {
      if (!state.currentStroke || state.currentStroke.points.length < 2) return { currentStroke: null };
      
      const newDrawing = { id: crypto.randomUUID(), ...state.currentStroke };
      
      // Handle Laser Pseudo Pencil (Doesn't save to history or backend)
      if (state.currentStroke.tool === 'laser') {
        const strokeId = newDrawing.id;
        setTimeout(() => {
          get().removeLaserStroke(strokeId);
        }, 1000); // Wait 1s, then trigger fade out
        return { laserStrokes: [...state.laserStrokes, newDrawing], currentStroke: null };
      }

      // Handle normal drawing history
      const newDrawings = [...state.drawings, newDrawing];
      const newHistory = state.drawHistory.slice(0, state.historyIndex + 1);
      newHistory.push(newDrawings);

      return { 
        drawings: newDrawings, 
        drawHistory: newHistory,
        historyIndex: newHistory.length - 1,
        currentStroke: null, 
        saveStatus: 'saving' 
      };
    });
    get().triggerAutoSave();
  },
  
  undo: () => set((state) => {
    if (state.historyIndex <= 0) {
      // If at start, just clear drawings
      if (state.historyIndex === 0) {
        return { drawings: [], historyIndex: -1, saveStatus: 'saving' };
      }
      return state;
    }
    const newIndex = state.historyIndex - 1;
    return { drawings: state.drawHistory[newIndex], historyIndex: newIndex, saveStatus: 'saving' };
  }),

  redo: () => set((state) => {
    if (state.historyIndex >= state.drawHistory.length - 1) return state;
    const newIndex = state.historyIndex + 1;
    return { drawings: state.drawHistory[newIndex], historyIndex: newIndex, saveStatus: 'saving' };
  }),

  removeDrawing: (id) => {
    set((state) => {
      const newDrawings = state.drawings.filter(d => d.id !== id);
      const newHistory = state.drawHistory.slice(0, state.historyIndex + 1);
      newHistory.push(newDrawings);
      return { 
        drawings: newDrawings, 
        drawHistory: newHistory,
        historyIndex: newHistory.length - 1,
        saveStatus: 'saving' 
      };
    });
    get().triggerAutoSave();
  },

  removeLaserStroke: (id) => set((state) => ({ laserStrokes: state.laserStrokes.filter(d => d.id !== id) })),

  clearDrawings: () => {
    set((state) => {
      const newHistory = state.drawHistory.slice(0, state.historyIndex + 1);
      newHistory.push([]);
      return { drawings: [], drawHistory: newHistory, historyIndex: newHistory.length - 1, saveStatus: 'saving' };
    });
    get().triggerAutoSave();
  },

  updateNodePosition: (id, x, y) => {
    set((state) => ({
      nodes: state.nodes.map(n => n.id === id ? { ...n, x, y } : n),
      saveStatus: 'saving'
    }));
    get().triggerAutoSave();
  },
  
  updateNodeTimeEstimate: (id, timeEstimate) => {
    set((state) => ({
      nodes: state.nodes.map(n => n.id === id ? { ...n, timeEstimate } : n),
      saveStatus: 'saving'
    }));
    get().triggerAutoSave();
  },
  
  updateNodeContent: (id, contentUpdate) => {
    set((state) => ({
      nodes: state.nodes.map(n => n.id === id ? { ...n, content: { ...n.content, ...contentUpdate } } : n),
      saveStatus: 'saving'
    }));
    get().triggerAutoSave();
  },

  updateNodeDimensions: (id, width, height) => {
    set((state) => ({
      nodes: state.nodes.map(n => n.id === id ? { ...n, width, height } : n)
    }));
  },

  updateNodeColor: (id, color) => {
    set((state) => ({
      nodes: state.nodes.map(n => n.id === id ? { ...n, color } : n),
      saveStatus: 'saving'
    }));
    get().triggerAutoSave();
  },

  addEdge: (from, to) => {
    if (from === to) return null;
    const exists = get().edges.find(e => e.from === from && e.to === to);
    if (!exists) {
      const id = crypto.randomUUID();
      set((state) => ({ 
        edges: [...state.edges, { id, from, to }],
        connectingFrom: null,
        activeTool: 'select',
        saveStatus: 'saving' 
      }));
      get().triggerAutoSave();
      return id;
    }
    return exists.id;
  },

  updateEdgeTimeEstimate: (id, timeEstimate) => {
    set((state) => ({
      edges: state.edges.map(e => e.id === id ? { ...e, timeEstimate } : e),
      saveStatus: 'saving'
    }));
    get().triggerAutoSave();
  },

  deleteEdge: (id) => {
    set((state) => ({
      edges: state.edges.filter(e => e.id !== id),
      saveStatus: 'saving'
    }));
    get().triggerAutoSave();
  },

  setPan: (x, y) => set({ pan: { x, y } }),
  setZoom: (zoom) => set({ zoom: Math.min(Math.max(zoom, 0.1), 3) }),

  organizeChaos: () => {
    const { nodes } = get();
    const grouped = {};
    nodes.forEach(n => {
      if (!grouped[n.type]) grouped[n.type] = [];
      grouped[n.type].push(n);
    });

    const newNodes = [...nodes];
    let startX = 100;
    
    Object.keys(grouped).forEach((type) => {
      let startY = 100;
      grouped[type].forEach((node) => {
        const index = newNodes.findIndex(n => n.id === node.id);
        if (index !== -1) {
          newNodes[index] = { ...node, x: startX, y: startY };
          startY += (node.height || 400) + 100;
        }
      });
      startX += 500;
    });

    set({ nodes: newNodes, saveStatus: 'saving' });
    get().triggerAutoSave();
  },

  // BACKEND LOGIC
  loadAllProjects: async () => {
    const token = get().authToken;
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/api/projects?t=${Date.now()}`, { headers: { 'Authorization': `Bearer ${token}` }});
      const data = await res.json();
      if (data.projects) set({ projectsList: data.projects });
    } catch(e) { console.error("Failed loading projects list", e); }
  },

  createProject: async (title, navigateCallback) => {
    const token = get().authToken;
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/api/projects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ title: title || 'New Canvas' })
      });
      if (!res.ok) throw new Error("Database rejected creation");
      const data = await res.json();
      set(state => ({ 
        projectsList: [{ id: data.id, title: data.title, updated_at: new Date().toISOString() }, ...state.projectsList] 
      }));
      get().loadAllProjects();
      if (navigateCallback) navigateCallback(`/canvas/${data.id}`);
    } catch(e) { 
      console.error(e); 
      useModalStore.getState().openModal({
        title: 'Creation Failed',
        message: 'Could not create canvas. If using OneDrive, please ensure your database file is not locked or syncing.',
        type: 'warning'
      });
    }
  },

  loadProject: async (id) => {
    const token = get().authToken;
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/api/projects/${id}`, { headers: { 'Authorization': `Bearer ${token}` }});
      const data = await res.json();
      if (data.project) {
        const parsed = JSON.parse(data.project.canvas_state);
        set({ 
          currentProjectId: id, 
          currentProjectTitle: data.project.title,
          nodes: parsed.nodes || [], 
          edges: parsed.edges || [], 
          drawings: parsed.drawings || [],
          pan: parsed.pan || {x: 0, y: 0}, 
          zoom: parsed.zoom || 1 
        });
      }
    } catch(e) { console.error("Failed to load project ID", e); }
  },

  deleteProject: async (id) => {
    const token = get().authToken;
    if (!token) return;
    
    // Store previous state to revert if backend fails
    const prevProjects = get().projectsList;
    set(state => ({ projectsList: state.projectsList.filter(p => p.id !== id) }));
    
    try {
      const res = await fetch(`${API_URL}/api/projects/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Database rejected deletion");
      get().loadAllProjects();
    } catch(e) { 
      console.error("Failed to delete project", e);
      set({ projectsList: prevProjects }); // Revert optimistic update
      useModalStore.getState().openModal({
        title: 'Deletion Failed',
        message: 'Could not delete canvas. Database might be locked or busy.',
        type: 'warning'
      });
    }
  },

  _timeoutId: null,
  triggerAutoSave: () => {
    const state = get();
    if (!state.currentProjectId || !state.authToken) return;
    if (state._timeoutId) clearTimeout(state._timeoutId);
    
    set({ saveStatus: 'saving' });

    const newTimeout = setTimeout(async () => {
      const currentState = get();
      try {
        const payload = JSON.stringify({ 
          nodes: currentState.nodes, 
          edges: currentState.edges, 
          drawings: currentState.drawings,
          pan: currentState.pan, 
          zoom: currentState.zoom 
        });
        await fetch(`${API_URL}/api/projects/${currentState.currentProjectId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${currentState.authToken}` },
          body: JSON.stringify({ stateData: payload })
        });
      } catch(e) { console.error("Auto-save failed to backend"); }
      set({ saveStatus: 'saved' });
    }, 1500);
    
    set({ _timeoutId: newTimeout });
  }
}));
