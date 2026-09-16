import type Decimal from 'decimal.js';

export type NumericPrimitive = number | string | bigint;

export interface RefLike<T> {
  readonly __v_isRef: true;
  readonly value: T;
}

/** 兼容 mathjs/ethers 等旧版调用方传入的 BigNumber 对象。 */
export interface BigNumberLike {
  readonly isBigNumber?: boolean;
  readonly _isBigNumber?: boolean;
  toString(): string;
}

export type NumericValue = NumericPrimitive | Decimal | BigNumberLike;
export type NumericInput = NumericValue | RefLike<NumericValue>;

export interface CalcOptions {
  /** 保留的小数位数；负数表示向下截取。 */
  deci?: number;
  /** 小数位不足时是否补 0。 */
  fillZero?: boolean;
}

export interface SubtractOptions extends CalcOptions {
  /** 当结果小于 0 时返回 0。 */
  pos?: boolean;
}
