let audioContext = null

// Created lazily: browsers only allow audio to start after a user gesture.
function context() {
  audioContext ??= new (window.AudioContext || window.webkitAudioContext)()
  return audioContext
}

export function setSoundEnabled(enabled) {
  return enabled ? context().resume() : audioContext?.suspend()
}

export function playTone(frequency, duration = 1.0, waveform = 'sine') {
  if (audioContext?.state !== 'running') {
    return
  }

  const gainNode = audioContext.createGain()

  gainNode.gain.value = 0.1 // 10%
  gainNode.connect(audioContext.destination)

  const oscillator = audioContext.createOscillator()

  oscillator.frequency.value = frequency // Hz
  oscillator.type = waveform
  oscillator.connect(gainNode)
  oscillator.start()
  oscillator.stop(audioContext.currentTime + duration) // seconds
}
