import { nodeResolve } from '@rollup/plugin-node-resolve';
import rollupTypescript from 'rollup-plugin-typescript2';
import types from '@rollup/plugin-typescript';
import strip from '@rollup/plugin-strip';
import serve from 'rollup-plugin-serve';
import commonjs from '@rollup/plugin-commonjs';
import babel from '@rollup/plugin-babel';
import path from 'path';
import terser from '@rollup/plugin-terser';

module.exports = {
  input: path.resolve(__dirname, 'src/main.ts'),
  output: [
    {
      file: path.resolve(__dirname, 'build/bundle.js'), // global: 弄个全局变量来接收 // cjs: module.exports // esm: export default // iife: ()() // umd: 兼容 amd + commonjs 不支持es6导入
      format: 'cjs',
      sourcemap: false, // 还有ts中的sourcemap
    },
    {
      file: path.resolve(__dirname, 'build/bundle.esm.js'), // global: 弄个全局变量来接收 // cjs: module.exports // esm: export default // iife: ()() // umd: 兼容 amd + commonjs 不支持es6导入
      format: 'esm',
      sourcemap: false, // 还有ts中的sourcemap
    },
  ],
  plugins: [
    // 这个插件是有执行顺序的
    strip(), // 打包产物清除调试代码
    // 支持基于 CommonJS 模块引入
    commonjs(),
    nodeResolve({
      extensions: ['.js', '.ts'],
    }),
    types({
      outDir: 'build',
      declaration: true,
      declarationDir: 'types',
    }),
    rollupTypescript(),
    // babel 配置
    babel({
      // 编译库使用
      // 只转换源代码，不转换外部依赖
      exclude: 'node_modules/**',
      // babel 默认不支持 ts 需要手动添加
    }),
    terser(),

    /* serve({
      port: 3000,
      contentBase: '', // 表示起的服务是在根目录下
      openPage: '/public/index.html', // 打开的是哪个文件
      open: true, // 默认打开浏览器
    }), */
  ],
  external: ['mathjs'],
};
