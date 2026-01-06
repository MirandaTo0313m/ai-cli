import { dim } from 'yoctocolors';
import {
  type PermissionMode,
  getPermissionMode,
  setPermissionMode,
} from '../../config/index.js';
import type { CommandHandler, Context } from './types.js';

const modes: { id: PermissionMode; label: string; desc: string }[] = [
  { id: 'ask', label: 'ask', desc: 'confirm before write/rename/delete' },
  { id: 'yolo', label: 'yolo', desc: 'no confirmations (dangerous)' },
];

async function selectMode(_ctx: Context): Promise<PermissionMode | null> {
  const current = getPermissionMode();
  let selected = modes.findIndex((m) => m.id === current);
  if (selected === -1) selected = 0;

  const totalLines = modes.length + 4;

  process.stdout.write('\x1b[?25l');

  const render = (initial = false) => {
    if (!initial) {
      for (let i = 0; i < totalLines; i++) {
        process.stdout.write('\x1b[A\x1b[2K');
      }
    }

    console.log(dim('↑↓ navigate, enter select, esc cancel'));
    console.log(dim('models can make mistakes. yolo is dangerous.\n'));

    for (let i = 0; i < modes.length; i++) {
      const mode = modes[i];
      const prefix = i === selected ? '› ' : '  ';
      const line =
        i === selected
          ? `${mode.label} - ${mode.desc}`
          : dim(`${mode.label} - ${mode.desc}`);
      console.log(prefix + line);
    }
    console.log();
  };

  render(true);

  return new Promise((resolve) => {
    const stdin = process.stdin;
    stdin.setRawMode?.(true);
    stdin.resume();
    stdin.setEncoding('utf8');

    let done = false;

    const cleanup = (result: PermissionMode | null) => {
      if (done) return;
      done = true;
      stdin.removeListener('data', onKey);
      stdin.setRawMode?.(false);
      process.stdout.write('\x1b[?25h');
      resolve(result);
    };

    const onKey = (key: string) => {
      if (done) return;

      if (key === '\x1b[A' && selected > 0) {
        selected--;
        render();
      } else if (key === '\x1b[B' && selected < modes.length - 1) {
        selected++;
        render();
      } else if (key === '\r' || key === '\n') {
        cleanup(modes[selected].id);
      } else if (key === '\x1b' || key === '\x03') {
        cleanup(null);
      }
    };

    stdin.on('data', onKey);
  });
}

export const permission: CommandHandler = async (ctx) => {
  ctx.rl.close();
  const newMode = await selectMode(ctx);
  const newRl = ctx.createRl();

  if (newMode) {
    setPermissionMode(newMode);
    console.log(dim(`mode: ${newMode}\n`));
    return { rl: newRl };
  }

  return { rl: newRl };
};

