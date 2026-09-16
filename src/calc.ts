import type Decimal from 'decimal.js';

import { BpDecimal, normalizeDecimals, toDecimal, trimTrailingZeros } from './internal';
import type { CalcOptions, NumericInput, SubtractOptions } from './types';

type Operation = 'add' | 'subtract' | 'multiply' | 'divide';

function isOptions(value: unknown): value is SubtractOptions {
  if (typeof value !== 'object' || value === null || BpDecimal.isDecimal(value)) return false;
  return 'deci' in value || 'fillZero' in value || 'pos' in value;
}

function calculate(operation: Operation, values: readonly Decimal[]): Decimal {
  if (values.length === 0) return new BpDecimal(0);

  return values.slice(1).reduce((result, value) => {
    switch (operation) {
      case 'add':
        return result.plus(value);
      case 'subtract':
        return result.minus(value);
      case 'multiply':
        return result.times(value);
      case 'divide':
        return result.dividedBy(value);
    }
  }, values[0] as Decimal);
}

function baseCalc(
  operation: Operation,
  params: readonly (NumericInput | SubtractOptions)[],
): string {
  const last = params[params.length - 1];
  const options = isOptions(last) ? last : undefined;
  const inputs = options ? params.slice(0, -1) : params;
  const decimals = normalizeDecimals(options?.deci ?? 0);

  let result: string;
  try {
    const calculated = calculate(operation, inputs.map(toDecimal));
    if (Object.is(options?.deci, -0) || (options?.deci ?? 0) < 0) {
      result = calculated.toFixed(decimals, BpDecimal.ROUND_FLOOR);
    } else if (options?.deci !== undefined) {
      result = calculated.toFixed(decimals);
    } else {
      result = calculated.toFixed();
    }
  } catch {
    result = '0';
  }

  if (!Number.isFinite(Number(result))) result = '0';

  return options?.fillZero ? result : trimTrailingZeros(result);
}

export function bpAdd(...params: [...NumericInput[], CalcOptions | NumericInput]): string {
  return baseCalc('add', params);
}

export function bpSub(...params: [...NumericInput[], SubtractOptions | NumericInput]): string {
  const last = params[params.length - 1];
  const options = isOptions(last) ? last : undefined;
  const result = baseCalc('subtract', params);
  return options?.pos && bpLt(result, '0') ? '0' : result;
}

export function bpMul(...params: [...NumericInput[], CalcOptions | NumericInput]): string {
  return baseCalc('multiply', params);
}

export function bpDiv(...params: [...NumericInput[], CalcOptions | NumericInput]): string {
  return baseCalc('divide', params);
}

export function bpLt(a: NumericInput, b: NumericInput): boolean {
  return toDecimal(a).cmp(toDecimal(b)) === -1;
}

export function bpLte(a: NumericInput, b: NumericInput): boolean {
  return toDecimal(a).cmp(toDecimal(b)) !== 1;
}

export function bpGt(a: NumericInput, b: NumericInput): boolean {
  return toDecimal(a).cmp(toDecimal(b)) === 1;
}

export function bpGte(a: NumericInput, b: NumericInput): boolean {
  return toDecimal(a).cmp(toDecimal(b)) !== -1;
}
