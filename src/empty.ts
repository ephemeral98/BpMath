import { isRefLike } from './internal';

const EMPTY_VALUES: readonly unknown[] = [
  0,
  '0',
  undefined,
  'undefined',
  null,
  'null',
  false,
  'false',
  '',
];

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Object.prototype.toString.call(value) === '[object Object]';
}

/**
 * 判断目标或其嵌套成员中是否存在空值。
 * `ignoreType` 中的值不会被当作空值。
 */
export function bpEmpty(target: unknown, ignoreType: readonly unknown[] = []): boolean {
  const visited = new WeakSet<object>();

  const containsEmpty = (value: unknown): boolean => {
    if (isRefLike(value)) return containsEmpty(value.value);

    if (Array.isArray(value)) {
      if (value.length === 0) return true;
      if (visited.has(value)) return false;
      visited.add(value);
      return value.some(containsEmpty);
    }

    if (isPlainObject(value)) {
      if (visited.has(value)) return false;
      visited.add(value);
      const values = Object.values(value);
      return values.length === 0 || values.some(containsEmpty);
    }

    return EMPTY_VALUES.some(
      (emptyValue) =>
        Object.is(value, emptyValue) && !ignoreType.some((item) => Object.is(item, emptyValue)),
    );
  };

  return containsEmpty(target);
}
