let audioCtx = null;

const getAudioContext = () => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
};

// Subtle "pop" for dropping/snapping nodes
export const playDropSound = () => {
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.05);
    
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.05);
  } catch (e) {
    // Ignore if audio isn't supported or allowed yet
  }
};

// Higher pitched "ping" for connecting nodes
export const playConnectSound = () => {
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.1);
    
    gain.gain.setValueAtTime(0.05, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.1);
  } catch (e) {
    // Ignore
  }
};

// Soft "whoosh" for expanding/opening nodes (Bento transitions)
export const playWhooshSound = () => {
  try {
    const ctx = getAudioContext();
    const bufferSize = ctx.sampleRate * 0.2; // 200ms
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1000, ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.2);
    
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.05, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
    
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    
    noise.start();
  } catch (e) {
    // Ignore
  }
};

let noiseNode = null;
let noiseCtx = null;

export const toggleBrownNoise = (enabled) => {
  if (enabled) {
    if (!noiseCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      noiseCtx = new AudioContext();
      const bufferSize = noiseCtx.sampleRate * 2;
      const buffer = noiseCtx.createBuffer(1, bufferSize, noiseCtx.sampleRate);
      const output = buffer.getChannelData(0);
      let lastOut = 0;
      for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          output[i] = (lastOut + (0.02 * white)) / 1.02;
          lastOut = output[i];
          output[i] *= 3.5; 
      }
      noiseNode = noiseCtx.createBufferSource();
      noiseNode.buffer = buffer;
      noiseNode.loop = true;
      
      const filter = noiseCtx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 400; // Deep spatial focus rumble
      
      noiseNode.connect(filter);
      filter.connect(noiseCtx.destination);
      noiseNode.start();
    }
  } else {
    if (noiseNode) {
      noiseNode.stop();
      noiseNode.disconnect();
      noiseNode = null;
    }
    if (noiseCtx) {
      noiseCtx.close();
      noiseCtx = null;
    }
  }
};
