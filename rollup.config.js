import svelte from 'rollup-plugin-svelte';
import resolve from '@rollup/plugin-node-resolve';
import pkg from './package.json';
import sveltePreprocess from 'svelte-preprocess';
import livereload from 'rollup-plugin-livereload';
import typescript from 'rollup-plugin-typescript2';
import css from 'rollup-plugin-css-only';
import { writeFileSync, existsSync, mkdirSync } from 'fs';

const demo = !!process.env.ROLLUP_WATCH;


function serve() {
  let server;

  function toExit() {
    if (server) server.kill(0);
  }

  return {
    writeBundle() {
      if (server) return;
      server = require('child_process').spawn('npm', ['run', 'start', '--', '--dev'], {
        stdio: ['ignore', 'inherit', 'inherit'],
        shell: true
      });

      process.on('SIGTERM', toExit);
      process.on('exit', toExit);
    }
  };
}

const name = pkg.name
  .replace(/^(@\S+\/)?(svelte-)?(\S+)/, '$3')
  .replace(/^\w/, m => m.toUpperCase())
  .replace(/-\w/g, m => m[1].toUpperCase());

export default {
  input: 'src/index.ts',
  output: [
    { file: pkg.module, 'format': 'es' },
    { file: pkg.main, 'format': 'umd', name }].concat(demo ? [
      {
        sourcemap: demo,
        format: 'es',
        name,
        dest: 'public/build/',
        file: 'public/build/bundle.mjs'
      }
    ] : []),
  plugins: [
    svelte({
      compilerOptions: {
        // enable run-time checks when in demo
        dev: demo
      },
      preprocess: sveltePreprocess({ sourceMap: demo })
    }),
    css({
      output: (styles, styleNodes) => {
        existsSync('./dist/') && mkdirSync('./dist/', { recursive: true });
        console.log("Writing CSS...");
        writeFileSync('./dist/bundle.css', styles);
        existsSync('./public/build/') && mkdirSync('./public/build/', { recursive: true });
        demo && writeFileSync('./public/build/bundle.css', styles);
      }
    }),
    resolve(),
    typescript({
      sourceMap: demo,
      inlineSources: demo,
      declaration: true,
      declarationDir: "./dist",
      outDir: "./dist"
    }),
    demo && serve(),
    demo && livereload('public'),
  ]
};
