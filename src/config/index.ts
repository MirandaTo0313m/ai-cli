import { readUser, updateUser } from 'rc9';

export type PermissionMode = 'ask' | 'yolo';

export interface Config {
  AI_GATEWAY_API_KEY?: string;
  model?: string;
  permissionMode?: PermissionMode;
}

export function getConfig(): Config {
  return readUser('.airc');
}

export function setConfig(config: Partial<Config>): void {
  updateUser(config, '.airc');
}

export function getApiKey(): string | null {
  const config = getConfig();
  return process.env.AI_GATEWAY_API_KEY || config.AI_GATEWAY_API_KEY || null;
}

export function setApiKey(apiKey: string): void {
  setConfig({ AI_GATEWAY_API_KEY: apiKey });
}

export function getModel(): string | null {
  const config = getConfig();
  return config.model || null;
}

export function setModel(model: string): void {
  setConfig({ model });
}

export function getPermissionMode(): PermissionMode {
  const config = getConfig();
  return config.permissionMode || 'ask';
}

export function setPermissionMode(mode: PermissionMode): void {
  setConfig({ permissionMode: mode });
}
