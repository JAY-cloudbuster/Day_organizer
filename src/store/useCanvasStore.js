import { create } from 'zustand';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const useCanvasStore = create((set, get) => ({
  nodes: [],
  edges: [], // For arrow connections: { id, from: nodeId, to: nodeId }
  pan: { x: 0, y: 0 },
  zoom: 1,
  saveStatus: 'saved',
  theme: localStorage.getItem('app_theme') || 'dark',
  activeTool: 'select', // 'select', 'pan', 'comment', 'connect'
  connectingFrom: null, // Holds the node id when a connection line is started

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
  setActiveTool: (tool) => set({ activeTool: tool, connectingFrom: null }),
  setConnectingFrom: (id) => set({ connectingFrom: id }),

  addNode: (node) => {
    const id = crypto.randomUUID();
    // Default color provided if not specified
    const finalNode = { ...node, id, color: node.color || 'var(--surface-lowest)' };
    set((state) => ({ 
      nodes: [...state.nodes, finalNode],
      saveStatus: 'saving'
    }));
    get().triggerAutoSave();
  },
  
  deleteNode: (id) => {
    set((state) => ({
      nodes: state.nodes.filter(n => n.id !== id),
      edges: state.edges.filter(e => e.from !== id && e.to !== id),
      saveStatus: 'saving'
    }));
    get().triggerAutoSave();
  },

  updateNodePosition: (id, x, y) => {
    set((state) => ({
      nodes: state.nodes.map(n => n.id === id ? { ...n, x, y } : n),
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
    if (from === to) return;
    const exists = get().edges.find(e => e.from === from && e.to === to);
    if (!exists) {
      set((state) => ({ 
        edges: [...state.edges, { id: crypto.randomUUID(), from, to }],
        connectingFrom: null,
        activeTool: 'select',
        saveStatus: 'saving' 
      }));
      get().triggerAutoSave();
    }
  },

  setPan: (x, y) => set({ pan: { x, y } }),
  setZoom: (zoom) => set({ zoom: Math.min(Math.max(zoom, 0.1), 3) }),

  // BACKEND LOGIC
  loadAllProjects: async () => {
    const token = get().authToken;
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/api/projects`, { headers: { 'Authorization': `Bearer ${token}` }});
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
      const data = await res.json();
      get().loadAllProjects();
      if (navigateCallback) navigateCallback(`/canvas/${data.id}`);
    } catch(e) { console.error(e); }
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
          pan: parsed.pan || {x: 0, y: 0}, 
          zoom: parsed.zoom || 1 
        });
      }
    } catch(e) { console.error("Failed to load project ID", e); }
  },

  deleteProject: async (id) => {
    const token = get().authToken;
    if (!token) return;
    try {
      await fetch(`${API_URL}/api/projects/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      get().loadAllProjects();
    } catch(e) { console.error("Failed to delete project", e); }
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
