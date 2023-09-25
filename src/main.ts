import { create, all, BigNumber, MathJsChain } from 'mathjs';
type NumStr = number | string | bigint;
type BigNumStr = NumStr;

const config = {
  epsilon: 1e-12,
  // matrix: 'Matrix' as '"Matrix" | "Array"', // 函数的默认矩阵输出类型。
  // number: 'BigNumber' as 'BigNumber', // BigNumbers比 JavaScript 的默认数字具有更高的精度
  precision: 64, // BigNumbers 的最大有效数字位数。此设置仅适用于 BigNumber，不适用于数字。
  predictable: false, // 可预测的输出类型函数。当为真时，输出类型仅取决于输入类型。当为 false（默认）时，输出类型可能因输入值而异。
  randomSeed: null, // 设置为null使用随机种子为伪随机数生成器提供种子。
};
const math = create(all, config as any);

interface IParams {
  deci?: number; // 保留n位小数
  fillZero?: boolean; // 不足填补0
}

/**
 * 乘法使用栗子：
 *
 * 一般展示用：
 * bpMul(3, 2) --> 6
 *
 * 如果想带保持3位小数
 * bpMul(3, 2, { deci: 3 }) --> 6.000
 */

/**
 * 基本算法
 * @param funcName 算法名字（加减乘除）
 * @param params
 * @returns
 */
function bpBaseCalc(funcName: string, ...params: [...BigNumStr[], IParams | BigNumStr]): string {
  const resTypeConfig: IParams = params[params.length - 1] as any;

  /**
   * 判断是否写了配置项
   */
  const hasConfig = (): boolean => {
    return (
      isObject(resTypeConfig) &&
      (Object.keys(resTypeConfig).includes('deci') ||
        Object.keys(resTypeConfig).includes('fillZero') ||
        Object.keys(resTypeConfig).includes('pos'))
    );
  };

  let deci = 0;
  let resArr = params as number[];

  if (hasConfig()) {
    // 写了配置项, 把最后一项除掉
    deci = +resTypeConfig.deci ?? deci;
    resArr = params.filter((item, inx) => inx !== params.length - 1) as number[];
  }
  const preci = Math.abs(deci);
  // 映射为bigNumber数组
  const cloneParams = resArr.map((item: any) => {
    // 防止参数是一个ref对象
    const cloneItem = item?.['__v_isRef'] ? item.value : item;
    return _isInvalid(cloneItem) ? 0 : math.bignumber(String(cloneItem));
  });

  let bigNum = math.chain(math[funcName](cloneParams[0], cloneParams[1]));

  // bigNumber累加
  if (cloneParams.length > 2) {
    for (let i = 2, len = cloneParams.length; i < len; i++) {
      bigNum = bigNum[funcName](String(cloneParams[i])) as MathJsChain<0 | BigNumber>;
    }
  }

  let result: string = math.format(bigNum.done(), {
    notation: 'fixed',
    precision: deci > 0 ? preci : 0,
  });

  // 除数为0则返回0
  if (+result === Infinity || math.isNaN(+result)) result = '0';

  // 填写0或者-0的时候取整
  if (Object.is(resTypeConfig?.deci, 0)) {
    result = bpFixed(result, 0, false);
  } else if (Object.is(resTypeConfig?.deci, -0)) {
    result = bpFloor(result, 0, false);
  } else if (deci < 0) {
    // 小数向下约
    result = String(bpFloor(result, preci, true));
  }

  // 不足时候不填0
  if (!resTypeConfig?.fillZero && typeof result === 'string') {
    result = result.replace(/(\.\d*[1-9])0+$|\.0*$/, '$1');
  }
  return result;
}

/**
 * 加法
 * @param params n 个数
 * @param deci 精度(如果是16进制，则为精度，如果是10进制则约为几位小数)
 * 如果 deci 为负数，则表示 小数往下约，否则默认四舍五入
 * @param fillZero 不足位数是否补0，默认是小数最后的0去除
 * @returns
 */
export function bpAdd(...params: [...BigNumStr[], IParams | BigNumStr]): string {
  return bpBaseCalc('add', ...params);
}

interface ISub extends IParams {
  pos?: boolean; // true表示不会小于0
}
/**
 * 减法
 * @param params n 个数
 * @param deci 精度(如果是16进制，则为精度，如果是10进制则约为几位小数)
 * 如果 deci 为负数，则表示 小数往下约，否则默认四舍五入
 * @param fillZero 不足位数是否补0，默认是小数最后的0去除
 * @param pos true表示不会为负数，小于0则为0
 * @returns
 */
export function bpSub(...params: [...BigNumStr[], ISub | BigNumStr]): string {
  let result = bpBaseCalc('subtract', ...params);
  const resTypeConfig: IParams = params[params.length - 1] as any;

  if (
    typeof resTypeConfig === 'object' &&
    Object.keys(resTypeConfig).includes('pos') &&
    !!resTypeConfig['pos']
  ) {
    // 强调不能小于0
    if (bpLt(result, '0')) {
      result = '0';
    }
  }
  return result;
}

/**
 * 乘法
 * @param params n 个数
 * @param deci 精度(如果是16进制，则为精度，如果是10进制则约为几位小数)
 * 如果 deci 为负数，则表示 小数往下约，否则默认四舍五入
 * @param fillZero 不足位数是否补0，默认是小数最后的0去除
 * @returns
 */
export function bpMul(...params: [...BigNumStr[], IParams | BigNumStr]): string {
  return bpBaseCalc('multiply', ...params);
}

/**
 * 除法
 * @param params n 个数
 * @param deci 精度(如果是16进制，则为精度，如果是10进制则约为几位小数)
 * 如果 deci 为负数，则表示 小数往下约，否则默认四舍五入
 * @param fillZero 不足位数是否补0，默认是小数最后的0去除
 * @returns
 */
export function bpDiv(...params: [...BigNumStr[], IParams | BigNumStr]): string {
  return bpBaseCalc('divide', ...params);
}

/**
 * 比较两个数的大小, a 是否小于 b
 */
export function bpLt(a: BigNumStr, b: BigNumStr): boolean {
  const resp = math.compare(String(a), String(b));
  return resp === -1;
}

/**
 * 比较两个数的大小, a 是否小于等于 b
 */
export function bpLte(a: BigNumStr, b: BigNumStr): boolean {
  const resp = math.compare(String(a), String(b));
  return resp === -1 || resp === 0;
}

/**
 * 比较两个数的大小, a 是否大于 b
 */
export function bpGt(a: BigNumStr, b: BigNumStr): boolean {
  const resp = math.compare(String(a), String(b));
  return resp === 1;
}

/**
 * 比较两个数的大小, a 是否大于等于 b
 */
export function bpGte(a: BigNumStr, b: BigNumStr): boolean {
  const resp = math.compare(String(a), String(b));
  return resp === 1 || resp === 0;
}

/**
 * 将ethers的16进制bigNumber转为String
 * @param num 要转的数
 * @param digits 保留n位小数
 * 如果 digits 为负数，则表示 小数往下约，否则默认四舍五入
 * @param dec 精度
 */
export function bpFormat(num, digits: number = 0, dec: number = 18): string {
  let digi = Math.abs(digits);

  // 非法值
  if (_isInvalid(num)) {
    const res = 0;
    return digits ? res.toFixed(digi) : '0';
  }

  let res: string = bpDiv(num, 10 ** dec);

  if (digits < 0) {
    // 小数向下约
    return bpFloor(res, digi, true);
  }

  return bpFixed(res, digi, true);
}

/**
 * 判断是不是对象
 * @param obj
 */
function isObject(obj) {
  return Object.prototype.toString.call(obj) === '[object Object]';
}

/**
 * 判断是否位非法数
 * @returns true: 非法数
 */
function _isInvalid(num: NumStr): boolean {
  // 非数
  if (num === null || num === undefined) {
    return true;
  }
  if (!['object', 'string', 'number', 'bigint'].includes(typeof num)) {
    // 这里包含了对象是因为有可能传进来的是一个 bigNumber
    return true;
  }
  if (typeof num === 'bigint') {
    // bigint例外，直接合法
    return false;
  }
  if (isObject(num) && !num['_isBigNumber']) {
    // 如果是对象大类，并且不是 bigNumber 的，都是非法数
    return true;
  }
  if (isNaN(+num)) {
    return true;
  }
  if (!num) {
    return true;
  }

  return false;
}

/**
 * 将整数和小数分隔开
 */
interface IDiviDotRes {
  iNum: string; // 整数部分
  dNum: string; // 小数部分
}
function _diviDot(num: string): IDiviDotRes {
  const regDot = /\./g;
  const dotInx = regDot.exec(num)?.index;
  const iNum = num.slice(0, dotInx);
  let dNum = num.slice(dotInx);

  return {
    iNum,
    dNum: dotInx ? dNum : '',
  };
}

/**
 * 将数字进行四舍五入
 * @param num 要约的数 (只能是10进制的字符串或者数字)
 * @param dec 要约的精度（小数点后几位）
 * @param isFill 不足是否填充0
 * @returns
 */
export function bpFixed(num: NumStr, dec: number = 0, isFill: boolean = false): string {
  return baseFixed(num, dec, isFill, EType.fixed);
}

/**
 * 向下约n位
 * @param num 要约的数
 * @param dec 约几位
 * @param isFill 不足时是否填充0
 * @returns
 */
export function bpFloor(num: NumStr, dec: number = 0, isFill: boolean = false): string {
  return baseFixed(num, dec, isFill, EType.floor);
}

/**
 * 向上约n位
 * @param num 要约的数
 * @param dec 约几位
 * @param isFill 不足时是否填充0
 * @returns
 */
export function bpCeil(num: NumStr, dec: number = 0, isFill: boolean = false): string {
  return baseFixed(num, dec, isFill, EType.ceil);
}

/**
 * 向上约、向下约、四舍五入、基础方法
 */
enum EType {
  ceil = 'ceil',
  floor = 'floor',
  fixed = 'fixed',
}

function baseFixed(v: NumStr, dec: number = 0, isFill: boolean = false, type: EType): string {
  // 克隆要约的数，变成字符串
  const num = v['__v_isRef']?.value || v;
  const cloneNum: string = _isInvalid(num) ? '0' : String(num);

  let result: string = '0';
  if (type === EType.ceil) {
    result = math.bignumber(cloneNum).toFixed(dec, 2);
  } else if (type === EType.floor) {
    result = math.bignumber(cloneNum).toFixed(dec, 3);
  } else if (type === EType.fixed) {
    result = math.bignumber(cloneNum).toFixed(dec);
  }

  if (isFill) {
    // 填充0
    return result;
  }

  // 不填充0
  const { iNum, dNum } = _diviDot(result);

  if (!dNum || /^.0+$/.test(dNum)) {
    // 没有小数, 或者小数部分都为0
    return iNum;
  }

  // 将小数后面的0去掉
  const resDNum = dNum.replace(/\.?0+$/, '');
  // 整数和小数拼接
  return iNum + resDNum;
}

/**
 * 将数字转换为千分位表示
 * @param num 数字
 * @returns 123,456,78
 */
export function toThousands(num) {
  //处理非数字
  if (isNaN(num)) {
    return 0;
  }

  var res = num.toString().replace(/\d+/, function (n) {
    // 先提取整数部分
    return n.replace(/(\d)(?=(\d{3})+$)/g, function ($1) {
      return $1 + ',';
    });
  });
  return res;
}

/**
 * 是否为空数据
 * @param target
 * @returns true:是空 false:有值
 */
export const bpEmpty = (target): boolean => {
  const markObj = { mark: true }; // 标记

  /**
   * 判断基本数据类型
   * @param base 数据
   * @param markObj 标记
   */
  const isEmptyBase = (base, markObj) => {
    if (base === '0' || base === 'undefined' || base === 'null' || base === 'false') {
      markObj.mark = true;
    } else if (typeof base === 'string' && base.startsWith('0x')) {
      // 一般是地址（16进制）
      if (+base) {
        markObj.mark = false;
      }
    } else if (base) {
      markObj.mark = false;
    }
  };

  /**
   * 判断数组
   * @param base 数据
   * @param markObj 标记
   */
  const isEmptyArr = (arr, markObj) => {
    for (let i = 0, len = arr.length; i < len; i++) {
      const item = arr[i];
      if (Array.isArray(item)) {
        isEmptyArr(item, markObj);
      } else if (isObject(item)) {
        if (item['__v_isRef']) {
          // 是一个vue ref
          if (Array.isArray(item.value)) {
            isEmptyArr(item.value, markObj);
          } else if (isObject(item.value)) {
            isEmptyObj(item.value, markObj);
          } else {
            isEmptyBase(item.value, markObj);
          }
        } else {
          isEmptyObj(item, markObj);
        }
      } else {
        isEmptyBase(item, markObj);
      }
    }
  };

  /**
   * 判断对象
   * @param base 数据
   * @param markObj 标记
   */
  const isEmptyObj = (obj, markObj) => {
    for (const key in obj) {
      if (Object.hasOwnProperty.call(obj, key)) {
        const item = obj[key];

        if (Array.isArray(item)) {
          isEmptyArr(item, markObj);
        } else if (isObject(item)) {
          if (item['__v_isRef']) {
            // 是一个vue ref
            if (Array.isArray(item.value)) {
              isEmptyArr(item.value, markObj);
            } else if (isObject(item.value)) {
              isEmptyObj(item.value, markObj);
            } else {
              isEmptyBase(item.value, markObj);
            }
          } else {
            isEmptyObj(item, markObj);
          }
        } else {
          isEmptyBase(item, markObj);
        }
      }
    }
  };

  if (Array.isArray(target)) {
    isEmptyArr(target, markObj);
  } else if (isObject(target)) {
    if (target['__v_isRef']) {
      // 是一个vue ref
      if (Array.isArray(target.value)) {
        isEmptyArr(target.value, markObj);
      } else if (isObject(target.value)) {
        isEmptyObj(target.value, markObj);
      } else {
        isEmptyBase(target.value, markObj);
      }
    } else {
      isEmptyObj(target, markObj);
    }
  } else {
    isEmptyBase(target, markObj);
  }

  return markObj.mark;
};

/**
 * 简写0
 * @param str 要转换的字符串
 * @param startLen 开始的0数量长度,默认当前面的0超过2个的时候才会处理
 * @param lens 截取长度（防止转换后小数依旧过长）
 * 只有满足 startLen 数量长度0 的小数才会被处理
 * 比如：3.000123, 这里小数开始有超过2位0数量，会被简写为：3.0{3}123
 */
export const simpleZero = (str: string, startLen: number = 2, lens: number = 4) => {
  const { iNum, dNum } = _diviDot(str);
  const pureDNum = dNum.replace(/^.?/, '');

  const reg = /[1-9]/g;

  const matchStr = reg.exec(pureDNum);
  const inx = matchStr?.index ?? 0;

  if (matchStr && inx >= startLen) {
    // 匹配到
    const notZero = matchStr.input.slice(inx, inx + lens);

    return `${iNum}.0{${String(inx)}}${notZero}`;
  }

  return str;
};
