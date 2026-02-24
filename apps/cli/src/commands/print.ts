import type { ModelMessage } from 'ai';
import { type Chat, generateId, saveChat } from '../config/chats.js';
import { streamChat } from '../hooks/chat.js';
import type { StreamCallbacks, TokenUsage } from '../hooks/chat.js';
import { withForceMode } from '../tools/confirm.js';
import { gray } from '../utils/color.js';
import { formatError } from '../utils/errors.js';
import { loadImage, type PendingImage } from '../utils/image.js';
import { getModelCapabilities } from '../utils/models.js';
import { detectPackageManager } from '../utils/package-manager.js';
import { createSpinner } from '../utils/spinner.js';

interface PrintOptions {
  message: string;
  model: string;
  image?: string;
  json?: boolean;
  force?: boolean;
  save?: boolean;
  system?: string;
  plan?: boolean;
  resume?: string;
  timeout?: number;
  version: string;
}

interface HeadlessResult {
  output: string;
  model: string;
  tokens: number;
  cost: number;
  exitCode: number;
  chatId?: string;
  error?: string;
  usage?: TokenUsage;
}

function exit(code: number): void {
  if (process.stdout.writableNeedDrain) {
    process.stdout.once('drain', () => process.exit(code));
  } else {
    process.exit(code);
  }
}

export async function printCommand(options: PrintOptions): Promise<void> {
  const {
    message,
    model,
    image,
    json = false,
    force = false,
    save = true,
    system,
    plan = false,
    resume,
    timeout,
    version,
  } = options;

  if (timeout !== undefined && timeout <= 0) {
    const msg = 'timeout must be a positive number of seconds';
    if (json) {
      const result: HeadlessResult = {
        output: '',
        model,
        tokens: 0,
        cost: 0,
        exitCode: 1,
        error: msg,
      };
      process.stderr.write(`error: ${msg}\n`);
      process.stdout.write(`${JSON.stringify(result)}\n`);
    } else {
      process.stderr.write(`${msg}\n`);
    }
    exit(1);
    return;
  }

  const run = async () => {
    if (!json) {
      process.stderr.write(gray(`ai ${version} [${model}]\n`));
    }

    let pendingImage: PendingImage | null = null;
    if (image) {
      try {
        pendingImage = loadImage(image);
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (json) {
          const result: HeadlessResult = {
            output: '',
            model,
            tokens: 0,
            cost: 0,
            exitCode: 1,
            error: msg,
          };
          process.stderr.write(`error: ${msg}\n`);
          process.stdout.write(`${JSON.stringify(result)}\n`);
        } else {
          process.stderr.write(`${msg}\n`);
        }
        exit(1);
        return;
      }
    }

    const pm = detectPackageManager();
    const capabilities = await getModelCapabilities(model);
    const spinner = !json ? createSpinner(process.stderr) : null;

    let tokens = 0;
    let cost = 0;
    let output = '';
    let stuck = false;
    let usage: TokenUsage | null = null;

    const history: ModelMessage[] = [];
    let existingChat: Chat | null = null;
    let initialTokens = 0;
    let summary = '';

    if (resume) {
      const { loadChat } = await import('../config/chats.js');
      const loaded = loadChat(resume);
      if (!loaded) {
        const msg = `session ${resume} not found`;
        if (json) {
          const result: HeadlessResult = {
            output: '',
            model,
            tokens: 0,
            cost: 0,
            exitCode: 1,
            error: msg,
          };
          process.stderr.write(`error: ${msg}\n`);
          process.stdout.write(`${JSON.stringify(result)}\n`);
        } else {
          process.stderr.write(`${msg}\n`);
        }
        exit(1);
        return;
      }
      existingChat = loaded;
      summary = loaded.summary || '';
      initialTokens = loaded.tokens || 0;
      const { restoreHistory } = await import('./slash/chat.js');
      restoreHistory(
        { chat: loaded },
        history as { role: string; content: unknown }[],
      );
    } else if (!save) {
      existingChat = {
        id: generateId(),
        title: 'New chat',
        messages: [],
        model,
        tokens: 0,
        cost: 0,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
    }

    const abortSignal = timeout
      ? AbortSignal.timeout(timeout * 1000)
      : undefined;

    const trackOutput = (content: string) => {
      if (json) {
        output = content;
      } else if (content.length > output.length) {
        process.stdout.write(content.slice(output.length));
        output = content;
      }
    };

    const callbacks: StreamCallbacks = {
      onStatus: (status) => {
        if (!json && status) spinner?.update(status);
        if (!json && !status) spinner?.stop();
      },
      onPending: (text) => {
        if (!json && text.length > output.length) {
          process.stdout.write(text.slice(output.length));
          output = text;
        }
      },
      onMessage: (type, content) => {
        if (type === 'assistant') {
          trackOutput(content);
        } else if (type === 'info' && content.startsWith('Stopped:')) {
          stuck = true;
          if (!json) process.stderr.write(`${content}\n`);
        } else if (type === 'error') {
          if (!json) process.stderr.write(`${content}\n`);
        } else if (type === 'tool') {
          if (!json) process.stderr.write(`${content}\n`);
        }
      },
      onRecord: (type, content) => {
        if (type === 'assistant') {
          trackOutput(content);
        }
      },
      onReasoning: (text, _durationMs) => {
        if (!json) {
          const short = text.replace(/\s+/g, ' ').trim().slice(-80);
          spinner?.update(short);
        }
      },
      onTokens: (fn) => {
        tokens = fn(tokens);
      },
      onCost: (fn) => {
        cost = fn(cost);
      },
      onUsage: (u: TokenUsage) => {
        usage = u;
      },
      onSummary: () => {},
      onBusy: () => {},
    };

    let chat: Chat | null = null;

    try {
      spinner?.start('thinking...');

      chat = await streamChat({
        model,
        message,
        history,
        chat: existingChat,
        tokens: initialTokens,
        summary,
        pm,
        callbacks,
        image: pendingImage,
        hasTools: capabilities.tools,
        planMode: plan,
        appendSystem: system,
        abortSignal,
        save,
      });

      spinner?.stop();

      if (!json && output) {
        process.stdout.write('\n');
      }

      if (save && chat) {
        saveChat(chat);
      }
    } catch (error) {
      spinner?.stop();
      const isTimeout = error instanceof Error && error.name === 'TimeoutError';
      const errorMsg = isTimeout
        ? `timed out after ${timeout}s`
        : formatError(error);
      if (json) {
        const result: HeadlessResult = {
          output: '',
          model,
          tokens,
          cost,
          exitCode: 1,
          error: errorMsg,
          usage: usage ?? undefined,
        };
        process.stderr.write(`error: ${errorMsg}\n`);
        process.stdout.write(`${JSON.stringify(result)}\n`);
      } else {
        process.stderr.write(`${errorMsg}\n`);
      }
      exit(1);
      return;
    }

    if (json) {
      const result: HeadlessResult = {
        output,
        model,
        tokens,
        cost,
        exitCode: stuck ? 2 : 0,
        chatId: save && chat ? chat.id : undefined,
        usage: usage ?? undefined,
      };
      process.stdout.write(`${JSON.stringify(result)}\n`);
    }

    exit(stuck ? 2 : 0);
  };

  if (force) {
    await withForceMode(run);
  } else {
    await run();
  }
}
