import { dim } from 'yoctocolors';
import type { CommandHandler, Context } from './types.js';

export const summary: CommandHandler = (ctx: Context) => {
  const s = ctx.chat?.summary;

  if (!s) {
    console.log(dim('no summary. use /compress first\n'));
    return undefined;
  }

  console.log(dim('\n--- session summary ---'));
  console.log(dim(s));
  console.log(dim('--- end summary ---\n'));

  return undefined;
};

