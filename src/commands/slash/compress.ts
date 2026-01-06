import { dim } from 'yoctocolors';
import { saveChat } from '../../config/chats.js';
import { summarizeHistory } from '../../utils/context.js';
import type { CommandHandler } from './types.js';

export const compress: CommandHandler = async (ctx) => {
  if (!ctx.chat) {
    console.log(dim('no active chat\n'));
    return undefined;
  }
  if (ctx.history.length < 3) {
    console.log(dim('not enough history to compress\n'));
    return undefined;
  }

  console.log(dim('compressing...'));
  const summary = await summarizeHistory(ctx.history);

  if (!summary) {
    console.log(dim('compression failed\n'));
    return undefined;
  }

  ctx.history.length = 0;

  const estimatedTokens = Math.round(summary.length / 4);

  ctx.chat.summary = summary;
  ctx.chat.messages = [];
  ctx.chat.tokens = estimatedTokens;
  saveChat(ctx.chat);

  console.log(dim(`compressed to ~${estimatedTokens.toLocaleString()} tokens`));
  console.log(dim('type /summary to view\n'));

  return { tokens: estimatedTokens, cost: ctx.cost, summary };
};

