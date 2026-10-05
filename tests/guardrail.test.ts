import { describe, it, expect } from '@jest/globals';
import { runOfflineGuardrail } from '../scripts/guard-no-external-calls.js';

describe('Quran API - Offline Guardrail Automated Test', () => {
  it('must pass offline guardrail with ZERO runtime external Quran API calls', () => {
    const isOfflineCompliant = runOfflineGuardrail();
    expect(isOfflineCompliant).toBe(true);
  });
});
