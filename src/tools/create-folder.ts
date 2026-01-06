import * as fs from 'node:fs';
import * as path from 'node:path';
import { tool } from 'ai';
import { dim } from 'yoctocolors';
import { z } from 'zod';
import { getPermissionMode } from '../config/index.js';
import { confirmAction } from './confirm.js';

const cwd = process.cwd();

function fileLink(fullPath: string, name: string): string {
  return `\x1b]8;;file://${fullPath}\x1b\\${name}\x1b]8;;\x1b\\`;
}

export const createFolder = tool({
  description: 'Create a new folder/directory.',
  inputSchema: z.object({
    folderPath: z.string().describe('Path to the folder to create'),
  }),
  execute: async ({ folderPath }) => {
    try {
      const fullPath = path.resolve(cwd, folderPath);

      if (!fullPath.startsWith(cwd)) {
        return { error: 'Access denied: path outside current directory' };
      }

      if (fs.existsSync(fullPath)) {
        return { error: `Folder already exists: ${folderPath}` };
      }

      if (getPermissionMode() === 'ask') {
        const ok = await confirmAction('create folder');
        if (!ok) return { cancelled: true };
      }

      fs.mkdirSync(fullPath, { recursive: true });
      const link = fileLink(fullPath, folderPath);
      console.log(dim(`done. created ${link}`));

      return { success: true, silent: true };
    } catch (e) {
      return { error: `Failed to create folder: ${(e as Error).message}` };
    }
  },
});

