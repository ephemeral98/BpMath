import { describe, expect, it } from 'vitest';
import Decimal from 'decimal.js';

import { bpAdd, bpDiv, bpGt, bpGte, bpLt, bpLte, bpMul, bpSub } from '../src/main';

describe('high-precision calculations', () => {
  it('avoids floating-point precision loss', () => {
    expect(bpAdd('0.1', '0.2')).toBe('0.3');
    expect(bpSub('0.3', '0.1')).toBe('0.2');
    expect(bpMul('9007199254740993', '2')).toBe('18014398509481986');
    expect(bpDiv('1', '8')).toBe('0.125');
  });

  it('rounds, fills zeros, and floors with calculation options', () => {
    expect(bpAdd('1.235', '2', { deci: 2 })).toBe('3.24');
    expect(bpAdd('1.2', '2.3', { deci: 2, fillZero: true })).toBe('3.50');
    expect(bpAdd('1.239', '0', { deci: -2 })).toBe('1.23');
  });

  it('supports Vue-style refs and invalid values', () => {
    const ref = { __v_isRef: true as const, value: '1.25' };
    expect(bpAdd(ref, '0.75')).toBe('2');
    expect(bpDiv('1', '0')).toBe('0');
  });

  it('supports Decimal and legacy BigNumber-like inputs', () => {
    const decimal = new Decimal('1.25');
    const mathjsLike = { isBigNumber: true, toString: () => '2.5' };
    const ethersLike = { _isBigNumber: true, toString: () => '3.75' };

    expect(bpAdd(decimal, mathjsLike, ethersLike)).toBe('7.5');
  });

  it('keeps decimal.js global configuration isolated', () => {
    const precision = Decimal.precision;
    bpDiv('1', '3');
    expect(Decimal.precision).toBe(precision);
  });

  it('can clamp subtraction results to zero', () => {
    expect(bpSub('1', '2', { pos: true })).toBe('0');
    expect(bpSub('2', '1', { pos: true })).toBe('1');
  });
});

describe('comparisons', () => {
  it('compares values without converting them to native numbers', () => {
    expect(bpLt('9007199254740992', '9007199254740993')).toBe(true);
    expect(bpLte('2', 2)).toBe(true);
    expect(bpGt('3', 2)).toBe(true);
    expect(bpGte('3', 3n)).toBe(true);
  });
  it('distinguishes adjacent integers beyond Number.MAX_SAFE_INTEGER', () => {
    expect(bpGt('9007199254740993', '9007199254740992')).toBe(true);
  });
});
