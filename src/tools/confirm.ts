import { dim } from 'yoctocolors';
import { pauseSpinner } from '../utils/spinner.js';

type ConfirmHandler = (prompt: string) => Promise<boolean>;
let globalConfirmHandler: ConfirmHandler | null = null;

export function setConfirmHandler(handler: ConfirmHandler | null) {
  globalConfirmHandler = handler;
}

export async function confirmAction(action: string): Promise<boolean> {
  pauseSpinner();

  if (globalConfirmHandler) {
    return globalConfirmHandler(dim(`${action}? [y/N] `));
  }

  return true;
}

