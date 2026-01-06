import * as fs from 'node:fs';
import * as path from 'node:path';
import { tool } from 'ai';
import { dim } from 'yoctocolors';
import { z } from 'zod';
import { getPermissionMode } from '../config/index.js';
import { confirmAction } from './confirm.js';

const cwd = process.cwd();

export const deleteFile = tool({
  description: 'Delete a file in the current directory.',
  inputSchema: z.object({
    filePath: z.string().describe('Path to the file to delete'),
  }),
  execute: async ({ filePath }) => {
    try {
      const fullPath = path.resolve(cwd, filePath);

      if (!fullPath.startsWith(cwd)) {
        return { error: 'Access denied: path outside current directory' };
      }

      if (!fs.existsSync(fullPath)) {
        return { error: `File not found: ${filePath}` };
      }

      if (getPermissionMode() === 'ask') {
        const ok = await confirmAction('delete file');
        if (!ok) return { cancelled: true };
      }

      fs.unlinkSync(fullPath);
      console.log(dim(`done. deleted ${filePath}`));

      return { success: true, silent: true };
    } catch (e) {
      return { error: `Failed to delete: ${(e as Error).message}` };
    }
  },
});

