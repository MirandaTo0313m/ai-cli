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

export const writeFile = tool({
  description:
    'Write or create a file with the given content. Use this to help users create or modify files.',
  inputSchema: z.object({
    filePath: z
      .string()
      .describe('Path to the file relative to current directory'),
    content: z.string().describe('Content to write to the file'),
  }),
  execute: async ({ filePath, content }) => {
    try {
      const fullPath = path.resolve(cwd, filePath);
      if (!fullPath.startsWith(cwd)) {
        return { error: 'Access denied: path outside current directory' };
      }

      const exists = fs.existsSync(fullPath);

      if (getPermissionMode() === 'ask') {
        const action = exists ? 'overwrite file' : 'create file';
        const ok = await confirmAction(action);
        if (!ok) return { cancelled: true };
      }

      const dir = path.dirname(fullPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(fullPath, content, 'utf-8');

      const link = fileLink(fullPath, filePath);
      const verb = exists ? 'updated' : 'created';
      console.log(dim(`done. ${verb} ${link}`));

      return { success: true, silent: true };
    } catch (e) {
      return { error: `Failed to write file: ${(e as Error).message}` };
    }
  },
});
