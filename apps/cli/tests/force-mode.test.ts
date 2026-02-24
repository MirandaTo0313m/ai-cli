import { afterAll, beforeEach, describe, expect, test } from 'bun:test';
import {
  confirm,
  setConfirmHandler,
  setForceMode,
} from '../src/tools/confirm.js';

describe('force mode', () => {
  beforeEach(() => {
    setForceMode(false);
    setConfirmHandler(null);
  });

  afterAll(() => {
    setForceMode(false);
    setConfirmHandler(null);
  });

  test('setForceMode(true) bypasses handler', async () => {
    setConfirmHandler(async () => false);
    setForceMode(true);
    expect(await confirm('delete everything')).toBe(true);
  });

  test('setForceMode(false) restores normal behavior', async () => {
    setForceMode(true);
    setForceMode(false);
    setConfirmHandler(async () => false);
    expect(await confirm('delete everything')).toBe(false);
  });

  test('force mode returns true for any action', async () => {
    setForceMode(true);
    expect(await confirm('rm -rf /')).toBe(true);
    expect(await confirm('drop database')).toBe(true);
    expect(await confirm('overwrite file')).toBe(true);
  });
});
