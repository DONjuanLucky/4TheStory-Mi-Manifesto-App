
export function pcm16ToFloat32(int16Data: Int16Array): Float32Array {
  const float32Data = new Float32Array(int16Data.length);
  const scale = 1.0 / 32768.0;
  for (let i = 0; i < int16Data.length; i++) {
    float32Data[i] = int16Data[i] * scale;
  }
  return float32Data;
}

export class AudioStreamer {
  public audioContext: AudioContext;
  private isPlaying: boolean = false;
  private nextStartTime: number = 0;
  private sources: Set<AudioBufferSourceNode> = new Set();
  
  constructor() {
    // We do not enforce sampleRate in the constructor to avoid hardware mismatch errors.
    // The AudioContext will run at the system default (usually 44.1k or 48k).
    // We handle the 24k source content by specifying it in createBuffer.
    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }

  async play(base64Data: string) {
    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }

    const binaryString = atob(base64Data);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    // Convert PCM (16-bit little endian) to AudioBuffer
    const int16Data = new Int16Array(bytes.buffer);
    const float32Data = pcm16ToFloat32(int16Data);

    // Create a buffer at the SOURCE sample rate (24000 for Gemini)
    // The AudioContext will automatically resample this to the hardware rate during playback.
    const buffer = this.audioContext.createBuffer(1, float32Data.length, 24000);
    buffer.getChannelData(0).set(float32Data);

    const source = this.audioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(this.audioContext.destination);

    const currentTime = this.audioContext.currentTime;
    // Schedule next chunk to play immediately after previous one, or now if we've fallen behind
    // We add a tiny buffer (0.05s) if starting fresh to prevent glitching
    const startTime = Math.max(currentTime, this.nextStartTime);
    
    source.start(startTime);
    this.nextStartTime = startTime + buffer.duration;
    
    this.sources.add(source);
    source.onended = () => {
      this.sources.delete(source);
      if (this.sources.size === 0) {
        this.isPlaying = false;
        // Do not reset nextStartTime here; we want to keep the timeline continuous
        // unless explicitly stopped.
      }
    };
    this.isPlaying = true;
  }

  stop() {
    this.sources.forEach(source => {
      try {
        source.stop();
      } catch (e) { /* ignore */ }
    });
    this.sources.clear();
    this.nextStartTime = 0;
    this.isPlaying = false;
  }
}

export class AudioRecorder {
  private stream: MediaStream | null = null;
  private audioContext: AudioContext | null = null;
  private processor: ScriptProcessorNode | null = null;
  private source: MediaStreamAudioSourceNode | null = null;

  async start(onData: (base64: string) => void) {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // We try to use 16k to match the model's preference, but some browsers might ignore this.
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      
      this.source = this.audioContext.createMediaStreamSource(this.stream);
      
      // Use ScriptProcessor for raw PCM access
      // REDUCED BUFFER SIZE: 2048 (approx 128ms latency) to improve interruption responsiveness
      this.processor = this.audioContext.createScriptProcessor(2048, 1, 1);
      
      this.processor.onaudioprocess = (e) => {
        const inputData = e.inputBuffer.getChannelData(0);
        
        // Downsample or simply convert Float32 to Int16 PCM
        const int16Data = new Int16Array(inputData.length);
        for (let i = 0; i < inputData.length; i++) {
          // Clamp and scale
          const s = Math.max(-1, Math.min(1, inputData[i]));
          int16Data[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
        }

        // Convert to base64
        let binary = '';
        const bytes = new Uint8Array(int16Data.buffer);
        const len = bytes.byteLength;
        for (let i = 0; i < len; i++) {
          binary += String.fromCharCode(bytes[i]);
        }
        const base64 = btoa(binary);
        
        onData(base64);
      };

      this.source.connect(this.processor);
      this.processor.connect(this.audioContext.destination);
    } catch (err) {
      console.error("Error starting audio recorder:", err);
      throw err;
    }
  }

  stop() {
    if (this.processor) {
      this.processor.disconnect();
      this.processor.onaudioprocess = null;
    }
    if (this.source) {
      this.source.disconnect();
    }
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
    }
    if (this.audioContext) {
      this.audioContext.close();
    }
    this.stream = null;
    this.audioContext = null;
    this.processor = null;
    this.source = null;
  }
}
