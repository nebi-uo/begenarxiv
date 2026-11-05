/**
 * Physically-Modeled Procedural Begena Acoustic Synthesizer
 *
 * Simulates the 4 physical acoustic components of Ethiopia's 10-string sacred lyre:
 * 1. Pluck Transient: Fingertip friction and plectrum release noise.
 * 2. Gut String Oscillation: Heavy gut string fundamentals (130Hz - 220Hz) with natural harmonic overtones.
 * 3. The "Birr" (Leather Damper Buzz): Non-linear asymmetric saturation simulating the string buzzing against the leather piece on the bridge.
 * 4. Parchment Box Body Resonance: Dual formant acoustic cavity resonators (190Hz box mode + 480Hz ox-hide mode) and high-frequency parchment dampening.
 */

// Singleton AudioContext with cross-browser support
let sharedAudioContext: AudioContext | null = null;

export function getAudioContext(): AudioContext {
  if (!sharedAudioContext || sharedAudioContext.state === 'closed') {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    sharedAudioContext = new AudioCtx();
  }
  if (sharedAudioContext.state === 'suspended') {
    sharedAudioContext.resume().catch(() => {});
  }
  return sharedAudioContext;
}

// Generate an asymmetric wave-shaping transfer curve modeling string-to-leather bridge impact
function createBirrDistortionCurve(samples = 2048): Float32Array {
  const curve = new Float32Array(samples);
  for (let i = 0; i < samples; ++i) {
    const x = (i * 2) / samples - 1;
    // Asymmetric clipping: string strikes leather damper harder on negative vibration cycle
    if (x < -0.05) {
      curve[i] = -0.3 + 0.15 * Math.sin(x * Math.PI * 4.5);
    } else {
      curve[i] = Math.tanh(x * 1.4);
    }
  }
  return curve;
}

let cachedBirrCurve: Float32Array | null = null;
function getBirrCurve(): Float32Array {
  if (!cachedBirrCurve) {
    cachedBirrCurve = createBirrDistortionCurve();
  }
  return cachedBirrCurve;
}

export interface PluckOptions {
  frequency: number;
  durationMs?: number;
  startTimeOffset?: number;
  velocity?: number; // 0.1 to 1.0
  buzzIntensity?: number; // 0.0 to 1.0 (damper closeness)
}

/**
 * Triggers a physically-modeled Begena string pluck
 */
export function playBegenaString({
  frequency,
  durationMs = 600,
  startTimeOffset = 0,
  velocity = 0.85,
  buzzIntensity = 0.75,
}: PluckOptions): void {
  try {
    const ctx = getAudioContext();
    const startTime = ctx.currentTime + Math.max(0, startTimeOffset);
    const durationSec = Math.max(durationMs / 1000, 0.4);

    // Master string output gain
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.0001, startTime);
    masterGain.gain.linearRampToValueAtTime(0.35 * velocity, startTime + 0.004);
    masterGain.gain.exponentialRampToValueAtTime(0.0001, startTime + durationSec);

    // ==========================================
    // 1. PLUCK TRANSIENT (Fingertip on gut string)
    // ==========================================
    const bufferSize = ctx.sampleRate * 0.035; // 35ms burst
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const pluckNoise = ctx.createBufferSource();
    pluckNoise.buffer = noiseBuffer;

    const pluckFilter = ctx.createBiquadFilter();
    pluckFilter.type = 'bandpass';
    pluckFilter.frequency.setValueAtTime(Math.min(frequency * 5, 1400), startTime);
    pluckFilter.Q.setValueAtTime(2.5, startTime);

    const pluckGain = ctx.createGain();
    pluckGain.gain.setValueAtTime(0.18 * velocity, startTime);
    pluckGain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.03);

    pluckNoise.connect(pluckFilter);
    pluckFilter.connect(pluckGain);
    pluckGain.connect(masterGain);

    // ==========================================
    // 2. GUT STRING OSCILLATORS
    // ==========================================
    // Fundamental: Sawtooth filtered down to simulate gut string tension
    const fundamentalOsc = ctx.createOscillator();
    fundamentalOsc.type = 'sawtooth';
    fundamentalOsc.frequency.setValueAtTime(frequency, startTime);

    // Octave body tone: triangle wave for warmth
    const bodyOsc = ctx.createOscillator();
    bodyOsc.type = 'triangle';
    bodyOsc.frequency.setValueAtTime(frequency, startTime);

    // String lowpass to remove harsh electronic edges
    const stringFilter = ctx.createBiquadFilter();
    stringFilter.type = 'lowpass';
    stringFilter.frequency.setValueAtTime(frequency * 6, startTime);
    stringFilter.frequency.exponentialRampToValueAtTime(frequency * 2.2, startTime + durationSec * 0.7);

    // ==========================================
    // 3. THE "BIRR" LEATHER DAMPER BUZZ GENERATOR
    // ==========================================
    const waveShaper = ctx.createWaveShaper();
    waveShaper.curve = getBirrCurve() as unknown as Float32Array<ArrayBuffer>;
    waveShaper.oversample = '2x';

    // Buzz envelope: the buzz is loud on attack, then decays faster than the string fundamental
    const buzzGain = ctx.createGain();
    buzzGain.gain.setValueAtTime(0.4 * buzzIntensity * velocity, startTime);
    buzzGain.gain.exponentialRampToValueAtTime(0.05, startTime + durationSec * 0.35);
    buzzGain.gain.exponentialRampToValueAtTime(0.0001, startTime + durationSec * 0.85);

    const buzzBandpass = ctx.createBiquadFilter();
    buzzBandpass.type = 'bandpass';
    buzzBandpass.frequency.setValueAtTime(frequency * 4.2, startTime);
    buzzBandpass.Q.setValueAtTime(1.8, startTime);

    // Route fundamental to both pure string and buzzing damper
    fundamentalOsc.connect(stringFilter);
    bodyOsc.connect(stringFilter);

    // Branch A: Direct string body
    stringFilter.connect(masterGain);

    // Branch B: Through leather damper distortion
    stringFilter.connect(waveShaper);
    waveShaper.connect(buzzBandpass);
    buzzBandpass.connect(buzzGain);
    buzzGain.connect(masterGain);

    // ==========================================
    // 4. PARCHMENT BOX BODY RESONATORS
    // ==========================================
    // Cavity resonance: 195Hz box mode
    const boxResonator = ctx.createBiquadFilter();
    boxResonator.type = 'peaking';
    boxResonator.frequency.setValueAtTime(195, startTime);
    boxResonator.Q.setValueAtTime(2.0, startTime);
    boxResonator.gain.setValueAtTime(4.5, startTime);

    // Hide/skin resonance: 480Hz
    const hideResonator = ctx.createBiquadFilter();
    hideResonator.type = 'peaking';
    hideResonator.frequency.setValueAtTime(480, startTime);
    hideResonator.Q.setValueAtTime(1.5, startTime);
    hideResonator.gain.setValueAtTime(3.0, startTime);

    // High frequency dampening of parchment box
    const highDamp = ctx.createBiquadFilter();
    highDamp.type = 'lowpass';
    highDamp.frequency.setValueAtTime(3600, startTime);

    masterGain.connect(boxResonator);
    boxResonator.connect(hideResonator);
    hideResonator.connect(highDamp);
    highDamp.connect(ctx.destination);

    // Start nodes
    pluckNoise.start(startTime);
    pluckNoise.stop(startTime + 0.04);
    fundamentalOsc.start(startTime);
    bodyOsc.start(startTime);
    fundamentalOsc.stop(startTime + durationSec);
    bodyOsc.stop(startTime + durationSec);
  } catch (err) {
    console.warn('Begena synth error:', err);
  }
}
