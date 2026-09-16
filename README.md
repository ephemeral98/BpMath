# bp-math

基于 `decimal.js` 的轻量高精度数学工具库，适合金额、Token 数量和大数场景。

## 安装

```bash
pnpm add bp-math
```

## 使用

```ts
import { bpAdd, bpDiv, bpFixed, bpFormat, bpSub } from 'bp-math';

bpAdd('0.1', '0.2'); // '0.3'
bpSub('7,199,254,740,993', '7,199,254,740,992'); // '1'
bpDiv('1', '8'); // '0.125'
bpFixed('1.235', 2); // '1.24'
bpFormat('1000000000000000000', 2, 18); // '1.00'
```

### 计算

- `bpAdd` / `bpSub` / `bpMul` / `bpDiv`：高精度加减乘除。
- 字符串输入支持标准千分位格式（如 `'1,234.56'`）；number 输入请写成 `1234.56`
- `bpLt` / `bpLte` / `bpGt` / `bpGte`：高精度比较。
- 最后一个参数可传 `{ deci, fillZero }`；`bpSub` 还支持 `{ pos: true }` 把负数限制为 `0`。
- `deci` 为负数时向下截取，绝对值表示小数位数。

### 格式化

- `bpFixed` / `bpFloor` / `bpCeil`：四舍五入、向下和向上取位。
- `bpFormat`：将最小单位整数按指定精度转为小数字符串。
- `toThousands`：添加千分位分隔符。
- `simpleZero`：缩写小数部分连续的前导零。
- `bpEmpty`：检查普通值或嵌套数据中是否存在空值。

## 开发

```bash
pnpm install
pnpm dev       # Vitest 监听模式
pnpm test      # 单次运行测试
pnpm check     # 格式、Lint、类型、测试和构建全量检查
```

发布产物位于 `build/`，同时提供 ESM、CommonJS 和 TypeScript 类型声明。
