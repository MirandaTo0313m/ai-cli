import { dim } from 'yoctocolors';
import type { CommandHandler } from './types.js';

function formatCost(cost: number): string {
  if (cost === 0) return '$0.0000';
  if (cost > 0 && cost < 0.0001) return '<$0.0001';
  return `$${cost.toFixed(4)}`;
}

export const usage: CommandHandler = (ctx) => {
  if (!ctx.chat) {
    console.log(dim('no active chat\n'));
    return undefined;
  }
  const userMsgs = ctx.chat.messages.filter((m) => m.role === 'user').length;
  const aiMsgs = ctx.chat.messages.filter((m) => m.role === 'assistant').length;
  console.log(dim(`\nchat: ${ctx.chat.title}`));
  console.log(dim(`model: ${ctx.model}`));
  console.log(dim(`messages: ${userMsgs} user / ${aiMsgs} assistant`));
  console.log(dim(`tokens: ~${ctx.tokens.toLocaleString()}`));
  console.log(dim(`cost: ${formatCost(ctx.cost)}\n`));
  return undefined;
};
