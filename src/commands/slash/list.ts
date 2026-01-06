import { dim } from 'yoctocolors';
import { setModel } from '../../config/index.js';
import { fetchModels, scoreMatch } from '../../utils/models.js';
import { createSpinner } from '../../utils/spinner.js';
import type { CommandHandler } from './types.js';

interface Model {
  id: string;
  type: string;
}

async function selectModel(currentModel: string): Promise<string | null> {
  const spinner = createSpinner();
  spinner.start('fetching models...');

  let allModels: Model[];
  try {
    allModels = await fetchModels();
  } catch {
    spinner.stop();
    console.log(dim('failed to fetch models'));
    return null;
  }
  spinner.stop();

  let search = '';
  let filtered = allModels;
  let selected = 0;
  const pageSize = 10;
  let scrollOffset = 0;
  const totalLines = pageSize + 3;

  const updateFilter = () => {
    if (search) {
      const scored = allModels
        .map((m) => ({ model: m, score: scoreMatch(m.id, search) }))
        .filter((x) => x.score > 0)
        .sort((a, b) => b.score - a.score);
      filtered = scored.map((x) => x.model);
    } else {
      filtered = allModels;
    }
    selected = 0;
    scrollOffset = 0;
    if (!search) {
      const currentIdx = filtered.findIndex((m) => m.id === currentModel);
      if (currentIdx !== -1) {
        selected = currentIdx;
        scrollOffset = Math.max(0, selected - Math.floor(pageSize / 2));
      }
    }
  };

  updateFilter();
  process.stdout.write('\x1b[?25l');

  const render = (initial = false) => {
    if (!initial) {
      for (let i = 0; i < totalLines; i++) {
        process.stdout.write('\x1b[A\x1b[2K');
      }
    }

    const searchDisplay = search ? search : dim('type to search...');
    console.log(searchDisplay);
    console.log(dim('↑↓ navigate, enter select, esc cancel'));

    for (let i = 0; i < pageSize; i++) {
      const model = filtered[scrollOffset + i];
      if (model) {
        const globalIndex = scrollOffset + i;
        const prefix = globalIndex === selected ? '› ' : '  ';
        const line = globalIndex === selected ? model.id : dim(model.id);
        console.log(prefix + line);
      } else {
        console.log();
      }
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

    const cleanup = (result: string | null) => {
      if (done) return;
      done = true;
      stdin.removeListener('data', onKey);
      stdin.setRawMode?.(false);
      process.stdout.write('\x1b[?25h');
      resolve(result);
    };

    const onKey = (key: string) => {
      if (done) return;

      if (key === '\x1b[A') {
        if (selected > 0) {
          selected--;
          if (selected < scrollOffset) scrollOffset = selected;
          render();
        }
      } else if (key === '\x1b[B') {
        if (selected < filtered.length - 1) {
          selected++;
          if (selected >= scrollOffset + pageSize)
            scrollOffset = selected - pageSize + 1;
          render();
        }
      } else if (key === '\r' || key === '\n') {
        if (filtered.length > 0) {
          cleanup(filtered[selected].id);
        }
      } else if (key === '\x1b' || key === '\x03') {
        cleanup(null);
      } else if (key === '\x7f' || key === '\b') {
        if (search.length > 0) {
          search = search.slice(0, -1);
          updateFilter();
          render();
        }
      } else if (key.length === 1 && key >= ' ' && key <= '~') {
        search += key;
        updateFilter();
        render();
      }
    };

    stdin.on('data', onKey);
  });
}

export const list: CommandHandler = async (ctx) => {
  ctx.rl.close();
  const newModel = await selectModel(ctx.model);
  const rl = ctx.createRl();

  if (newModel) {
    setModel(newModel);
    console.log(dim(`switched to ${newModel}\n`));
    return { model: newModel, rl };
  }

  return { rl };
};
