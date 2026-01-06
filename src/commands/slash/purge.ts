import { dim } from 'yoctocolors';
import { createChat, deleteAllChats, listChats } from '../../config/chats.js';
import type { CommandHandler } from './types.js';

export const purge: CommandHandler = async (ctx) => {
  const allChats = listChats();
  if (allChats.length === 0) {
    console.log(dim('no chats to delete\n'));
    return;
  }

  const answer = await ctx.rl.question(
    dim(`delete ${allChats.length} chat(s)? [y/N] `),
  );
  if (answer.toLowerCase() !== 'y') {
    console.log(dim('cancelled\n'));
    return;
  }

  const deleted = deleteAllChats();
  const chat = createChat(ctx.model);
  process.stdout.write('\x1b[2J\x1b[H');
  console.log(dim(`deleted ${deleted} chat(s)\n`));
  return { chat, tokens: 0, cost: 0, clearHistory: true };
};
