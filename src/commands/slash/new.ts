import { createChat } from '../../config/chats.js';
import type { CommandHandler } from './types.js';

export const newChat: CommandHandler = (ctx) => {
  const chat = createChat(ctx.model);
  process.stdout.write('\x1b[2J\x1b[H');
  return { chat, tokens: 0, cost: 0, clearHistory: true };
};
