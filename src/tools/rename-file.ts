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

export const renameFile = tool({
  description: 'Rename or move a file within the current directory.',
  inputSchema: z.object({
    oldPath: z.string().describe('Current path of the file'),
    newPath: z.string().describe('New path/name for the file'),
  }),
  execute: async ({ oldPath, newPath }) => {
    try {
      const fullOldPath = path.resolve(cwd, oldPath);
      const fullNewPath = path.resolve(cwd, newPath);

      if (!fullOldPath.startsWith(cwd) || !fullNewPath.startsWith(cwd)) {
        return { error: 'Access denied: path outside current directory' };
      }

      if (!fs.existsSync(fullOldPath)) {
        return { error: `File not found: ${oldPath}` };
      }

      if (getPermissionMode() === 'ask') {
        const ok = await confirmAction('rename file');
        if (!ok) return { cancelled: true };
      }

      const newDir = path.dirname(fullNewPath);
      if (!fs.existsSync(newDir)) {
        fs.mkdirSync(newDir, { recursive: true });
      }

      fs.renameSync(fullOldPath, fullNewPath);
      const link = fileLink(fullNewPath, newPath);
      console.log(dim(`done. renamed to ${link}`));

      return { success: true, silent: true };
    } catch (e) {
      return { error: `Failed to rename: ${(e as Error).message}` };
    }
  },
});

