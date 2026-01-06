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

export const copyFile = tool({
  description: 'Copy a file to a new location.',
  inputSchema: z.object({
    sourcePath: z.string().describe('Path to the source file'),
    destPath: z.string().describe('Path to the destination'),
  }),
  execute: async ({ sourcePath, destPath }) => {
    try {
      const fullSourcePath = path.resolve(cwd, sourcePath);
      const fullDestPath = path.resolve(cwd, destPath);

      if (!fullSourcePath.startsWith(cwd) || !fullDestPath.startsWith(cwd)) {
        return { error: 'Access denied: path outside current directory' };
      }

      if (!fs.existsSync(fullSourcePath)) {
        return { error: `Source file not found: ${sourcePath}` };
      }

      if (getPermissionMode() === 'ask') {
        const ok = await confirmAction('copy file');
        if (!ok) return { cancelled: true };
      }

      const destDir = path.dirname(fullDestPath);
      if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
      }

      fs.copyFileSync(fullSourcePath, fullDestPath);
      const link = fileLink(fullDestPath, destPath);
      console.log(dim(`done. copied to ${link}`));

      return { success: true, silent: true };
    } catch (e) {
      return { error: `Failed to copy: ${(e as Error).message}` };
    }
  },
});

