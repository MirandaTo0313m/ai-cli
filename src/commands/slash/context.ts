import { dim } from 'yoctocolors';
import { getContextWindow } from '../../utils/context.js';
import type { CommandHandler } from './types.js';

export const context: CommandHandler = async (ctx) => {
  try {
    const contextWindow = await getContextWindow(ctx.model);
    const pct = Math.round((ctx.tokens / contextWindow) * 100);
    const bar =
      '█'.repeat(Math.floor(pct / 5)) + '░'.repeat(20 - Math.floor(pct / 5));
    console.log(
      dim(
        `\ncontext: ${ctx.tokens.toLocaleString()} / ${contextWindow.toLocaleString()} tokens`,
      ),
    );
    console.log(dim(`[${bar}] ${pct}%`));
    console.log(dim(`messages: ${ctx.history.length}`));
    if (pct >= 75) {
      console.log(dim('auto-compress at 75%'));
    }
    console.log();
  } catch {
    console.log(dim(`tokens used: ~${ctx.tokens.toLocaleString()}\n`));
  }
  return undefined;
};
