import { describe, expect, it } from 'vitest';

import { bpCeil, bpFixed, bpFloor, bpFormat, simpleZero, toThousands } from '../src/main';

describe('rounding and unit formatting', () => {
  it('supports common rounding modes', () => {
    expect(bpFixed('1.235', 2)).toBe('1.24');
    expect(bpFloor('1.239', 2)).toBe('1.23');
    expect(bpCeil('1.231', 2)).toBe('1.24');
    expect(bpFixed('1.2', 3, true)).toBe('1.200');
    expect(bpFloor('-1.231', 2)).toBe('-1.24');
    expect(bpCeil('-1.239', 2)).toBe('-1.23');
  });

  it('formats integer token units without precision loss', () => {
    expect(bpFormat('1000000000000000000', 2, 18)).toBe('1.00');
    expect(bpFormat('1234567890123456789', -4, 18)).toBe('1.2345');
    expect(bpFormat('1e18', 2, 18)).toBe('1.00');
  });
});

describe('display helpers', () => {
  it('adds thousands separators while preserving decimals', () => {
    expect(toThousands(1234567)).toBe('1,234,567');
    expect(toThousands('-1234567.89')).toBe('-1,234,567.89');
    expect(toThousands('not-a-number')).toBe(0);
  });

  it('shortens leading fractional zeros', () => {
    expect(simpleZero('3.000123')).toBe('3.0{3}123');
    expect(simpleZero('3.00123456', 2, 4)).toBe('3.0{2}1234');
    expect(simpleZero('3.0123')).toBe('3.0123');
    expect(simpleZero('3')).toBe('3');
  });
});
