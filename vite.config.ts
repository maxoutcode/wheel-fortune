import { defineConfig } from 'vite';
import type { UserConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig(({ command }: { command: 'build' | 'serve' }) => {
  const config: UserConfig = {
    plugins:
      command === 'build'
        ? [
            dts({
              outDir: 'dist',
              insertTypesEntry: true,
              entryRoot: 'src',
              rollupTypes: true,
              include: ['src'],
            }),
          ]
        : [],
    build: {
      lib: {
        entry: 'src/index.ts',
        name: 'WheelFortune',
        formats: ['es', 'cjs'],
        fileName: (format) => {
          if (format === 'cjs') return 'index.cjs.js';
          return 'index.es.js';
        },
      },
      emptyOutDir: true,
      sourcemap: true,
      minify: 'esbuild',
      rollupOptions: {
        output: {
          assetFileNames: 'index.[ext]',
          exports: 'named',
        },
      },
    },
  };

  return config;
});
