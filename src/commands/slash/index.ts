import { chat, restoreHistory } from './chat.js';
import { chats } from './chats.js';
import { clear } from './clear.js';
import { compress } from './compress.js';
import { context } from './context.js';
import { credits } from './credits.js';
import { deleteCmd } from './delete.js';
import { help } from './help.js';
import { init } from './init.js';
import { list } from './list.js';
import { model } from './model.js';
import { newChat } from './new.js';
import { permission } from './permission.js';
import { purge } from './purge.js';
import { storage } from './storage.js';
import { summary } from './summary.js';
import type { CommandHandler } from './types.js';
import { usage } from './usage.js';

export { restoreHistory };
export type { CommandHandler, CommandResult, Context } from './types.js';

export const commands: Record<string, CommandHandler> = {
  help,
  h: help,
  model,
  m: model,
  list,
  l: list,
  clear,
  c: clear,
  new: newChat,
  chats,
  chat,
  delete: deleteCmd,
  purge,
  storage,
  permission,
  init,
  i: init,
  credits,
  context,
  compress,
  summary,
  usage,
};
