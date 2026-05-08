import { create } from 'zustand';

export const useModalStore = create((set) => ({
  isOpen: false,
  title: '',
  message: '',
  type: 'info', // 'info', 'warning', 'input', 'confirm'
  defaultValue: '',
  placeholder: '',
  onConfirm: null,
  onCancel: null,
  
  openModal: (config) => set({
    isOpen: true,
    title: config.title || '',
    message: config.message || '',
    type: config.type || 'info',
    defaultValue: config.defaultValue || '',
    placeholder: config.placeholder || '',
    onConfirm: config.onConfirm || null,
    onCancel: config.onCancel || null,
  }),
  
  closeModal: () => set({ isOpen: false, onConfirm: null, onCancel: null })
}));
