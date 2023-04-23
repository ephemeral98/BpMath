import { BigNumber as ethBigNumber } from 'ethers';
declare type NumStr = number | string;
declare type BigNumStr = NumStr | ethBigNumber;
export interface IResType {
    hex?: boolean;
    digits?: number;
}
interface IParams {
    hex?: boolean;
    deci?: number | '0' | '-0';
    fillZero?: boolean;
}
/**
 * 加法
 * @param params n 个数
 * @param hex 是否转为16进制的bigNumber(一般是带精度入参数用)
 * @param deci 精度(如果是16进制，则为ethers的精度，如果是10进制则约为几位小数)
 * 如果 deci 为负数，则表示 小数往下约，否则默认四舍五入
 * @returns
 */
export declare function bpAdd(...params: [...BigNumStr[], IParams | BigNumStr]): string | ethBigNumber;
/**
 * 减法
 * @param params n 个数
 * @param hex 是否转为16进制的bigNumber(一般是带精度入参数用)
 * @param deci 精度(如果是16进制，则为ethers的精度，如果是10进制则约为几位小数)
 * 如果 deci 为负数，则表示 小数往下约，否则默认四舍五入
 * @returns
 */
export declare function bpSub(...params: [...BigNumStr[], IParams | BigNumStr]): string | ethBigNumber;
/**
 * 乘法
 * @param params n 个数
 * @param hex 是否转为16进制的bigNumber(一般是带精度入参数用)
 * @param deci 精度(如果是16进制，则为ethers的精度，如果是10进制则约为几位小数)
 * 如果 deci 为负数，则表示 小数往下约，否则默认四舍五入
 * @returns
 */
export declare function bpMul(...params: [...BigNumStr[], IParams | BigNumStr]): string | ethBigNumber;
/**
 * 除法
 * @param params n 个数
 * @param hex 是否转为16进制的bigNumber(一般是带精度入参数用)
 * @param deci 精度(如果是16进制，则为ethers的精度，如果是10进制则约为几位小数)
 * 如果 deci 为负数，则表示 小数往下约，否则默认四舍五入
 * @returns
 */
export declare function bpDiv(...params: [...BigNumStr[], IParams | BigNumStr]): string | ethBigNumber;
/**
 * 比较两个数的大小, a 是否小于 b
 */
export declare function bpLt(a: BigNumStr, b: BigNumStr): boolean;
/**
 * 比较两个数的大小, a 是否小于等于 b
 */
export declare function bpLte(a: BigNumStr, b: BigNumStr): boolean;
/**
 * 比较两个数的大小, a 是否大于 b
 */
export declare function bpGt(a: BigNumStr, b: BigNumStr): boolean;
/**
 * 比较两个数的大小, a 是否大于等于 b
 */
export declare function bpGte(a: BigNumStr, b: BigNumStr): boolean;
/**
 * 将普通字符串转为16进制的bigNumber
 * @param num 要转的数
 * @param dec 精度
 */
export declare function bpEthHex(num: any, dec?: number): import("@ethersproject/bignumber").BigNumber;
/**
 * 将ethers的16进制bigNumber转为String
 * @param num 要转的数
 * @param digits 保留n位小数
 * 如果 digits 为负数，则表示 小数往下约，否则默认四舍五入
 * @param dec 精度
 */
export declare function bpFormat(num: any, digits?: number, dec?: number): string;
/**
 * 将数字进行四舍五入
 * @param num 要约的数 (只能是10进制的字符串或者数字)
 * @param dec 要约的精度（小数点后几位）
 * @param isFill 不足是否填充0
 * @returns
 */
export declare function bpFixed(num: string | number | ethBigNumber, dec?: number, isFill?: boolean): string;
/**
 * 向下约n位
 * @param num 要约的数
 * @param dec 约几位
 * @param isFill 不足时是否填充0
 * @returns
 */
export declare function bpFloor(num: string | number | ethBigNumber, dec?: number, isFill?: boolean): string;
/**
 * 向上约n位
 * @param num 要约的数
 * @param dec 约几位
 * @param isFill 不足时是否填充0
 * @returns
 */
export declare function bpCeil(num: string | number | ethBigNumber, dec?: number, isFill?: boolean): string;
/**
 * 将数字转换为千分位表示
 * @param num 数字
 * @returns 123,456,78
 */
export declare function toThousands(num: any): any;
export {};
