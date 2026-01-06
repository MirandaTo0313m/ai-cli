import { dim } from 'yoctocolors';
import { type Chat, listChats, searchChats } from '../../config/chats.js';
import type { CommandHandler, CommandResult } from './types.js';

export const chat: CommandHandler = (_ctx, args) => {
  const query = args?.trim() || '';
  if (!query) {
    console.log(dim('usage: /chat <number or search>\n'));
    return;
  }

  const num = Number.parseInt(query, 10);
  const allChats = listChats();
  let found: Chat | undefined;

  if (!Number.isNaN(num) && num > 0 && num <= allChats.length) {
    found = allChats[num - 1];
  } else {
    const results = searchChats(query);
    if (results.length > 0) found = results[0];
  }

  if (!found) {
    console.log(dim('chat not found\n'));
    return;
  }

  process.stdout.write('\x1b[2J\x1b[H');

  const result: CommandResult = {
    chat: found,
    model: found.model,
    tokens: found.tokens || 0,
    cost: found.cost || 0,
    clearHistory: true,
  };

  return result;
};

export function restoreHistory(
  ctx: { chat: { messages: { role: string; content: string }[] } },
  history: { role: string; content: unknown }[],
) {
  for (const msg of ctx.chat.messages) {
    if (msg.role === 'user') {
      history.push({ role: 'user', content: msg.content });
      console.log(dim(`› ${msg.content}`));
    } else if (msg.role === 'assistant') {
      history.push({
        role: 'assistant',
        content: [{ type: 'text', text: msg.content }],
      });
      console.log(`${msg.content}\n`);
    }
  }
}
