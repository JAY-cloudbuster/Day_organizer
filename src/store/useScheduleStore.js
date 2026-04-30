import { create } from 'zustand';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export function getHourLabel(hour) {
  const fmt = (h) => {
    const w = h % 24;
    if (w === 0) return '12:00 AM';
    if (w === 12) return '12:00 PM';
    return w < 12 ? `${w}:00 AM` : `${w - 12}:00 PM`;
  };
  return `${fmt(hour)} – ${fmt(hour + 1)}`;
}

export function getSpanLabel(startHour, spanHours) {
  const fmt = (h) => {
    const w = h % 24;
    if (w === 0) return '12:00 AM';
    if (w === 12) return '12:00 PM';
    return w < 12 ? `${w}:00 AM` : `${w - 12}:00 PM`;
  };
  return `${fmt(startHour)} – ${fmt(startHour + spanHours)}`;
}

function generateDefaultBlocks() {
  const COLS = 4, BLOCK_W = 300, BLOCK_H = 150, GAP = 24, OX = 40, OY = 40;
  const blocks = [];
  for (let i = 0; i < 24; i++) {
    blocks.push({
      id: `block-${i}`, hour: i, label: getHourLabel(i),
      text: '', color: '', spanHours: 1, hidden: false,
      x: OX + (i % COLS) * (BLOCK_W + GAP),
      y: OY + Math.floor(i / COLS) * (BLOCK_H + GAP),
    });
  }
  return blocks;
}

// ─── Templates ───
function tpl(ranges) {
  return ranges.flatMap(([s, e, text, color]) =>
    Array.from({ length: e - s }, (_, i) => ({ hour: s + i, text, color }))
  );
}

export const SCHEDULE_TEMPLATES = [
  { id: 'student', name: '📚 Student Grind', desc: 'Classes, study & gym',
    data: tpl([[0,7,'Sleep 💤','rgba(167,139,250,0.18)'],[7,8,'Morning Routine ☀️','rgba(251,191,36,0.18)'],[8,12,'Classes 📚','rgba(56,189,248,0.18)'],[12,13,'Lunch 🍕','rgba(52,211,153,0.18)'],[13,16,'Study Session 📖','rgba(56,189,248,0.18)'],[16,17,'Gym 💪','rgba(251,113,133,0.18)'],[17,18,'Free Time 🎮','rgba(52,211,153,0.18)'],[18,19,'Dinner 🍽️','rgba(251,191,36,0.18)'],[19,22,'Projects 💻','rgba(56,189,248,0.18)'],[22,23,'Wind Down 📱','rgba(232,121,249,0.18)'],[23,24,'Sleep 💤','rgba(167,139,250,0.18)']]) },
  { id: 'work', name: '💼 9-to-5 Work', desc: 'Professional workday',
    data: tpl([[0,6,'Sleep 💤','rgba(167,139,250,0.18)'],[6,7,'Exercise 💪','rgba(251,113,133,0.18)'],[7,8,'Get Ready ☀️','rgba(251,191,36,0.18)'],[8,9,'Commute 🚗','rgba(163,230,53,0.18)'],[9,12,'Deep Work 🔥','rgba(251,146,60,0.18)'],[12,13,'Lunch 🍕','rgba(52,211,153,0.18)'],[13,17,'Work 💼','rgba(56,189,248,0.18)'],[17,18,'Commute 🚗','rgba(163,230,53,0.18)'],[18,19,'Dinner 🍽️','rgba(251,191,36,0.18)'],[19,21,'Personal Time 🎮','rgba(52,211,153,0.18)'],[21,22,'Reading 📖','rgba(56,189,248,0.18)'],[22,24,'Sleep 💤','rgba(167,139,250,0.18)']]) },
  { id: 'weekend', name: '🌴 Weekend Vibes', desc: 'Relaxed weekend flow',
    data: tpl([[0,9,'Sleep In 😴','rgba(167,139,250,0.18)'],[9,10,'Brunch 🥐','rgba(251,191,36,0.18)'],[10,12,'Chill ☕','rgba(52,211,153,0.18)'],[12,14,'Friends 👥','rgba(232,121,249,0.18)'],[14,17,'Hobby Time 🎨','rgba(34,211,238,0.18)'],[17,19,'Outdoors 🌳','rgba(163,230,53,0.18)'],[19,21,'Dinner & Movie 🎬','rgba(251,146,60,0.18)'],[21,24,'Night Out 🌙','rgba(167,139,250,0.18)']]) },
  { id: 'exam', name: '🧠 Exam Mode', desc: 'Heavy study with breaks',
    data: tpl([[0,7,'Sleep 💤','rgba(167,139,250,0.18)'],[7,8,'Morning Routine ☀️','rgba(251,191,36,0.18)'],[8,10,'Study Block 1 📚','rgba(56,189,248,0.18)'],[10,11,'Break ☕','rgba(52,211,153,0.18)'],[11,13,'Study Block 2 📚','rgba(56,189,248,0.18)'],[13,14,'Lunch 🍕','rgba(251,191,36,0.18)'],[14,16,'Study Block 3 📚','rgba(56,189,248,0.18)'],[16,17,'Break & Walk 🚶','rgba(52,211,153,0.18)'],[17,19,'Study Block 4 📚','rgba(56,189,248,0.18)'],[19,20,'Exercise 💪','rgba(251,113,133,0.18)'],[20,21,'Dinner 🍽️','rgba(251,191,36,0.18)'],[21,23,'Flashcards 📝','rgba(251,146,60,0.18)'],[23,24,'Sleep 💤','rgba(167,139,250,0.18)']]) },
];

export const useScheduleStore = create((set, get) => ({
  schedulesList: [],
  currentScheduleId: null,
  currentScheduleTitle: '',
  blocks: [],
  saveStatus: 'saved',
  activeTimerBlockId: null,
  comparisonBlocks: [],
  comparisonTitle: '',
  showComparison: false,

  loadAllSchedules: async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/api/schedules`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.schedules) set({ schedulesList: data.schedules });
    } catch (e) { console.error(e); }
  },

  createSchedule: async (title, nav) => {
    const token = localStorage.getItem('token');
    if (!token) return;
    const stateData = JSON.stringify({ blocks: generateDefaultBlocks() });
    try {
      const res = await fetch(`${API_URL}/api/schedules`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ title: title || 'My Schedule', stateData }),
      });
      const data = await res.json();
      get().loadAllSchedules();
      if (nav) nav(`/schedule/${data.id}`);
    } catch (e) { console.error(e); }
  },

  loadSchedule: async (id) => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/api/schedules/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.schedule) {
        const parsed = JSON.parse(data.schedule.schedule_state);
        const blocks = (parsed.blocks || generateDefaultBlocks()).map(b => ({
          ...b, spanHours: b.spanHours || 1, hidden: b.hidden || false,
        }));
        set({ currentScheduleId: id, currentScheduleTitle: data.schedule.title, blocks });
      }
    } catch (e) { console.error(e); }
  },

  deleteSchedule: async (id) => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      await fetch(`${API_URL}/api/schedules/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      get().loadAllSchedules();
    } catch (e) { console.error(e); }
  },

  updateBlockText: (id, text) => {
    set(s => ({ blocks: s.blocks.map(b => b.id === id ? { ...b, text } : b), saveStatus: 'saving' }));
    get().triggerAutoSave();
  },
  updateBlockColor: (id, color) => {
    set(s => ({ blocks: s.blocks.map(b => b.id === id ? { ...b, color } : b), saveStatus: 'saving' }));
    get().triggerAutoSave();
  },
  updateBlockPosition: (id, x, y) => {
    set(s => ({ blocks: s.blocks.map(b => b.id === id ? { ...b, x, y } : b), saveStatus: 'saving' }));
    get().triggerAutoSave();
  },
  updateTitle: (title) => { set({ currentScheduleTitle: title, saveStatus: 'saving' }); get().triggerAutoSave(); },

  // ─── Block Merging ───
  mergeBlockForward: (blockId) => {
    const blocks = get().blocks;
    const block = blocks.find(b => b.id === blockId);
    if (!block) return;
    const nextHour = block.hour + (block.spanHours || 1);
    if (nextHour >= 24) return;
    const nextBlock = blocks.find(b => b.hour === nextHour && !b.hidden);
    if (!nextBlock) return;
    set(s => ({
      blocks: s.blocks.map(b => {
        if (b.id === blockId) {
          const newSpan = (b.spanHours || 1) + (nextBlock.spanHours || 1);
          return { ...b, spanHours: newSpan, label: getSpanLabel(b.hour, newSpan) };
        }
        if (b.id === nextBlock.id) return { ...b, hidden: true };
        return b;
      }),
      saveStatus: 'saving',
    }));
    get().triggerAutoSave();
  },

  splitBlock: (blockId) => {
    const blocks = get().blocks;
    const block = blocks.find(b => b.id === blockId);
    if (!block || (block.spanHours || 1) <= 1) return;
    const lastHour = block.hour + block.spanHours - 1;
    const hiddenBlock = blocks.find(b => b.hour === lastHour && b.hidden);
    if (!hiddenBlock) return;
    const newSpan = block.spanHours - 1;
    set(s => ({
      blocks: s.blocks.map(b => {
        if (b.id === blockId) return { ...b, spanHours: newSpan, label: newSpan === 1 ? getHourLabel(b.hour) : getSpanLabel(b.hour, newSpan) };
        if (b.id === hiddenBlock.id) return { ...b, hidden: false, spanHours: 1, label: getHourLabel(b.hour) };
        return b;
      }),
      saveStatus: 'saving',
    }));
    get().triggerAutoSave();
  },

  // ─── Templates ───
  applyTemplate: (templateData) => {
    set(s => ({
      blocks: s.blocks.map(b => {
        const td = templateData.find(t => t.hour === b.hour);
        if (b.hidden) return { ...b, hidden: false, spanHours: 1, label: getHourLabel(b.hour), text: td ? td.text : '', color: td ? td.color : '' };
        return { ...b, text: td ? td.text : b.text, color: td ? td.color : b.color, spanHours: 1, label: getHourLabel(b.hour) };
      }),
      saveStatus: 'saving',
    }));
    get().triggerAutoSave();
  },

  // ─── Focus Timer ───
  setActiveTimer: (blockId) => set({ activeTimerBlockId: blockId }),
  clearTimer: () => set({ activeTimerBlockId: null }),

  // ─── Comparison ───
  loadComparisonSchedule: async (id) => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/api/schedules/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.schedule) {
        const parsed = JSON.parse(data.schedule.schedule_state);
        set({ comparisonBlocks: parsed.blocks || [], comparisonTitle: data.schedule.title, showComparison: true });
      }
    } catch (e) { console.error(e); }
  },
  closeComparison: () => set({ showComparison: false, comparisonBlocks: [], comparisonTitle: '' }),

  // ─── Auto-Save ───
  _timeoutId: null,
  triggerAutoSave: () => {
    const state = get();
    if (!state.currentScheduleId) return;
    if (state._timeoutId) clearTimeout(state._timeoutId);
    set({ saveStatus: 'saving' });
    const t = setTimeout(async () => {
      const c = get();
      const token = localStorage.getItem('token');
      if (!token) return;
      try {
        await fetch(`${API_URL}/api/schedules/${c.currentScheduleId}`, {
          method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ stateData: JSON.stringify({ blocks: c.blocks }), title: c.currentScheduleTitle }),
        });
      } catch (e) { console.error(e); }
      set({ saveStatus: 'saved' });
    }, 1500);
    set({ _timeoutId: t });
  },

  resetSchedule: () => set({ currentScheduleId: null, currentScheduleTitle: '', blocks: [], saveStatus: 'saved', activeTimerBlockId: null, showComparison: false, comparisonBlocks: [], comparisonTitle: '' }),
}));
