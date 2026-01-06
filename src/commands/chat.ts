import { stepCountIs, streamText } from 'ai';
import { gray } from 'yoctocolors';
import { fileTools } from '../tools/index.js';
import { createSpinner } from '../utils/spinner.js';

interface ChatOptions {
  message: string;
  model?: string;
  isPiped: boolean;
  version: string;
}

export async function chatCommand(options: ChatOptions): Promise<void> {
  const {
    message,
    model = 'anthropic/claude-sonnet-4.5',
    isPiped,
    version,
  } = options;

  if (!isPiped) {
    console.log(gray(`ai ${version} [${model}]`));
  }

  const spinner = !isPiped ? createSpinner() : null;
  let hasSeenContent = false;
  let reasoning = '';

  try {
    spinner?.start('thinking...');

    const result = streamText({
      model: model,
      system:
        'You are a helpful CLI assistant. Output plain text only - no markdown formatting, no emojis. Be concise.',
      prompt: message,
      tools: fileTools,
      stopWhen: stepCountIs(5),
      providerOptions: {
        openai: {
          reasoningEffort: 'high',
          reasoningSummary: 'detailed',
        },
      },
      headers: {
        'HTTP-Referer': 'https://www.npmjs.com/package/ai-cli',
        'X-Title': 'ai-cli',
      },
    });

    for await (const part of result.fullStream) {
      if (part.type === 'reasoning-delta' && part.text) {
        reasoning += part.text;
        spinner?.update(reasoning);
      } else if (part.type === 'tool-call') {
        spinner?.update(`${part.toolName}...`);
      } else if (part.type === 'text-delta') {
        if (!hasSeenContent) {
          hasSeenContent = true;
          spinner?.stop();
        }
        process.stdout.write(part.text);
      }
    }

    if (!hasSeenContent) spinner?.stop();

    if (!isPiped) {
      console.log();
    }
  } catch (error) {
    spinner?.stop();
    if (error instanceof Error && error.message.includes('authentication')) {
      console.error('invalid key. run: ai init');
    } else {
      console.error('error');
    }
    process.exit(1);
  }
}
