import Decimal from 'decimal.js';

import type { BigNumberLike, NumericInput } from './types';

export const BpDecimal = Decimal.clone({
  precision: 64,
  rounding: Decimal.ROUND_HALF_UP,
});

export function isRefLike(value: unknown): value is { __v_isRef: true; value: unknown } {
  return (
    typeof value === 'object' &&
    value !== null &&
    '__v_isRef' in value &&
    value.__v_isRef === true &&
    'value' in value
  );
}

export function unwrapRef<T>(value: T): T | unknown {
  return isRefLike(value) ? value.value : value;
}

function isLegacyBigNumber(value: unknown): value is BigNumberLike {
  return (
    typeof value === 'object' &&
    value !== null &&
    'toString' in value &&
    typeof value.toString === 'function' &&
    (('isBigNumber' in value && value.isBigNumber === true) ||
      ('_isBigNumber' in value && value._isBigNumber === true))
  );
}

export function toDecimal(value: NumericInput | unknown): Decimal {
  const unwrapped = unwrapRef(value);

  if (BpDecimal.isDecimal(unwrapped)) {
    return unwrapped;
  }

  if (typeof unwrapped === 'bigint') {
    return new BpDecimal(unwrapped.toString());
  }

  if (typeof unwrapped === 'number') {
    return Number.isFinite(unwrapped) ? new BpDecimal(unwrapped.toString()) : new BpDecimal(0);
  }

  if (typeof unwrapped === 'string' && unwrapped.trim() !== '') {
    try {
      return new BpDecimal(unwrapped);
    } catch {
      return new BpDecimal(0);
    }
  }

  if (isLegacyBigNumber(unwrapped)) {
    try {
      return new BpDecimal(unwrapped.toString());
    } catch {
      return new BpDecimal(0);
    }
  }

  return new BpDecimal(0);
}

export function normalizeDecimals(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.trunc(Math.abs(value)));
}

export function trimTrailingZeros(value: string): string {
  return value.replace(/(\.\d*?[1-9])0+$|\.0+$/, '$1');
}
