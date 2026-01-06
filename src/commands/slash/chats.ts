import { dim } from 'yoctocolors';
import { listChats } from '../../config/chats.js';
import type { CommandHandler } from './types.js';

const PAGE_SIZE = 10;

export const chats: CommandHandler = (ctx, args) => {
  const allChats = listChats();
  if (allChats.length === 0) {
    console.log(dim('no saved chats\n'));
    return undefined;
  }

  const page = Math.max(1, Number.parseInt(args || '1', 10) || 1);
  const totalPages = Math.ceil(allChats.length / PAGE_SIZE);
  const start = (page - 1) * PAGE_SIZE;
  const end = Math.min(start + PAGE_SIZE, allChats.length);
  const pageChats = allChats.slice(start, end);

  console.log(dim(`saved chats (page ${page}/${totalPages}):\n`));
  for (let i = 0; i < pageChats.length; i++) {
    const c = pageChats[i];
    const date = new Date(c.updatedAt).toLocaleDateString();
    const num = start + i + 1;
    const prefix = ctx.chat && c.id === ctx.chat.id ? '› ' : '  ';
    console.log(dim(`${prefix}${num}. ${c.title} (${date})`));
  }

  if (totalPages > 1) {
    console.log(dim(`\n/chats <page> for more, /chat <number> to load\n`));
  } else {
    console.log(dim('\n/chat <number> to load\n'));
  }
  return undefined;
};
