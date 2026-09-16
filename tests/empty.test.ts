import { describe, expect, it } from 'vitest';

import { bpEmpty } from '../src/main';

describe('bpEmpty', () => {
  it('recognizes primitive empty values', () => {
    expect(bpEmpty('')).toBe(true);
    expect(bpEmpty(0)).toBe(true);
    expect(bpEmpty(null)).toBe(true);
    expect(bpEmpty('value')).toBe(false);
  });

  it('checks nested arrays, objects, and refs', () => {
    expect(bpEmpty({ name: 'Barry', amount: '' })).toBe(true);
    expect(bpEmpty({ name: 'Barry', amount: 1 })).toBe(false);
    expect(bpEmpty({ __v_isRef: true, value: ['ok', null] })).toBe(true);
    expect(bpEmpty([])).toBe(true);
    expect(bpEmpty({})).toBe(true);
  });

  it('allows selected empty values to be ignored', () => {
    expect(bpEmpty({ amount: 0 }, [0])).toBe(false);
    expect(bpEmpty({ enabled: false }, [false])).toBe(false);
  });

  it('does not recurse forever for cyclic objects', () => {
    const value: { name: string; self?: unknown } = { name: 'ok' };
    value.self = value;
    expect(bpEmpty(value)).toBe(false);
  });
});
