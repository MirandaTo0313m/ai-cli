import { dim } from 'yoctocolors';

const frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];

let activeSpinner: ReturnType<typeof createSpinner> | null = null;

export function pauseSpinner() {
  if (activeSpinner) {
    activeSpinner.pause();
  }
}

export function resumeSpinner() {
  if (activeSpinner) {
    activeSpinner.resume();
  }
}

export function createSpinner() {
  let frame = 0;
  let text = '';
  let interval: ReturnType<typeof setInterval> | null = null;
  let stopped = false;
  let paused = false;

  const render = () => {
    if (stopped || paused) return;
    const termWidth = process.stdout.columns || 80;
    const maxWidth = termWidth - 4;
    const display = text.length > maxWidth ? text.slice(-maxWidth) : text;
    process.stdout.write(`\r${dim(frames[frame])} ${dim(display)}\x1b[K`);
    frame = (frame + 1) % frames.length;
  };

  const spinner = {
    start(initialText = '') {
      text = initialText;
      stopped = false;
      paused = false;
      activeSpinner = spinner;
      render();
      interval = setInterval(render, 80);
    },
    update(newText: string) {
      text = newText.replace(/\s+/g, ' ').trim();
    },
    pause() {
      paused = true;
      process.stdout.write('\r\x1b[K');
    },
    resume() {
      paused = false;
    },
    stop() {
      if (stopped) return;
      stopped = true;
      paused = false;
      if (interval) {
        clearInterval(interval);
        interval = null;
      }
      process.stdout.write('\r\x1b[K');
      if (activeSpinner === spinner) {
        activeSpinner = null;
      }
    },
  };

  return spinner;
}
