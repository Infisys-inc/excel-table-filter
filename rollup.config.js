import typescript from '@rollup/plugin-typescript';
import terser from '@rollup/plugin-terser';

export default {
  input: 'src/ExcelTableFilter.ts',
  output: [
    {
      file: 'dist/excel-table-filter-bundle.js',
      format: 'iife',
      sourcemap: true,
      name: 'ExcelTableFilter',
      exports: 'default'
    },
    {
      file: 'dist/excel-table-filter-bundle.min.js',
      format: 'iife',
      sourcemap: true,
      name: 'ExcelTableFilter',
      exports: 'default',
      plugins: [terser()]
    }
  ],
  plugins: [
    typescript()
  ]
};
