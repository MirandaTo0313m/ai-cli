import { dim } from 'yoctocolors';
import type { CommandHandler } from './types.js';

export const model: CommandHandler = (ctx) => {
  console.log(dim(`current model: ${ctx.model}\n`));
  return undefined;
};
