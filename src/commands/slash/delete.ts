import { dim } from 'yoctocolors';
import { deleteChat } from '../../config/chats.js';
import type { CommandHandler } from './types.js';

export const deleteCmd: CommandHandler = (ctx) => {
  if (!ctx.chat || ctx.chat.messages.length === 0) {
    console.log(dim('nothing to delete\n'));
    return;
  }

  deleteChat(ctx.chat.id);
  process.stdout.write('\x1b[2J\x1b[H');
  console.log(dim('chat deleted\n'));
  return { chat: null, tokens: 0, cost: 0, clearHistory: true };
};
