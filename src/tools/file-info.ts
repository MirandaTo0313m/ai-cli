import * as fs from 'node:fs';
import * as path from 'node:path';
import { tool } from 'ai';
import { z } from 'zod';

const cwd = process.cwd();

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

export const fileInfo = tool({
  description: 'Get information about a file or directory (size, modified date, type).',
  inputSchema: z.object({
    filePath: z.string().describe('Path to the file or directory'),
  }),
  execute: async ({ filePath }) => {
    try {
      const fullPath = path.resolve(cwd, filePath);

      if (!fullPath.startsWith(cwd)) {
        return { error: 'Access denied: path outside current directory' };
      }

      if (!fs.existsSync(fullPath)) {
        return { error: `Not found: ${filePath}` };
      }

      const stats = fs.statSync(fullPath);
      const ext = path.extname(filePath).slice(1) || 'none';

      return {
        path: filePath,
        type: stats.isDirectory() ? 'directory' : 'file',
        size: formatSize(stats.size),
        sizeBytes: stats.size,
        extension: stats.isDirectory() ? null : ext,
        modified: stats.mtime.toISOString(),
        created: stats.birthtime.toISOString(),
      };
    } catch (e) {
      return { error: `Failed to get info: ${(e as Error).message}` };
    }
  },
});

