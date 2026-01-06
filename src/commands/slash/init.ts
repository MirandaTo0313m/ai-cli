import { initCommand } from '../init.js';
import type { CommandHandler } from './types.js';

export const init: CommandHandler = async (ctx) => {
  ctx.rl.close();
  await initCommand();
  return { rl: ctx.createRl() };
};
