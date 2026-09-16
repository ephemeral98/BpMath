import { bpDiv } from './calc';
import { BpDecimal, normalizeDecimals, toDecimal, trimTrailingZeros, unwrapRef } from './internal';
import type { NumericInput } from './types';

type RoundingMode = 'ceil' | 'floor' | 'fixed';

function round(value: NumericInput, decimals: number, fill: boolean, mode: RoundingMode): string {
  const precision = normalizeDecimals(decimals);
  const number = toDecimal(unwrapRef(value));
  const result =
    mode === 'ceil'
      ? number.toFixed(precision, BpDecimal.ROUND_CEIL)
      : mode === 'floor'
        ? number.toFixed(precision, BpDecimal.ROUND_FLOOR)
        : number.toFixed(precision);

  return fill ? result : trimTrailingZeros(result);
}

export function bpFixed(num: NumericInput, dec = 0, isFill = false): string {
  return round(num, dec, isFill, 'fixed');
}

export function bpFloor(num: NumericInput, dec = 0, isFill = false): string {
  return round(num, dec, isFill, 'floor');
}

export function bpCeil(num: NumericInput, dec = 0, isFill = false): string {
  return round(num, dec, isFill, 'ceil');
}

export function bpFormat(num: NumericInput, digits = 0, dec = 18): string {
  const decimalPlaces = normalizeDecimals(dec);
  const divisor = `1${'0'.repeat(decimalPlaces)}`;
  const result = bpDiv(num, divisor);
  const precision = normalizeDecimals(digits);

  return digits < 0 ? bpFloor(result, precision, true) : bpFixed(result, precision, true);
}

export function toThousands(num: number | string): string | 0 {
  if (num === '' || Number.isNaN(Number(num))) return 0;

  const [integer = '', decimal] = String(num).split('.');
  const formatted = integer.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return decimal === undefined ? formatted : `${formatted}.${decimal}`;
}

export function simpleZero(str: string, startLen = 2, lens = 4): string {
  const dotIndex = str.indexOf('.');
  if (dotIndex === -1) return str;

  const integer = str.slice(0, dotIndex);
  const decimal = str.slice(dotIndex + 1);
  const firstNonZero = decimal.search(/[1-9]/);

  if (firstNonZero >= startLen) {
    return `${integer}.0{${firstNonZero}}${decimal.slice(firstNonZero, firstNonZero + lens)}`;
  }

  return str;
}
