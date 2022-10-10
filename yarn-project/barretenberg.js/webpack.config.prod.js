/**
 * Builds the web version of the worker, and outputs it to the dest directory.
 */
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import ResolveTypeScriptPlugin from 'resolve-typescript-plugin';
import CopyWebpackPlugin from 'copy-webpack-plugin';
import webpack from 'webpack';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

export default {
  target: 'web',
  mode: 'production',
  entry: './src/wasm/web_worker.ts',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: [{ loader: 'ts-loader', options: { transpileOnly: true, onlyCompileBundledFiles: true } }],
      },
    ],
  },
  output: {
    path: resolve(dirname(fileURLToPath(import.meta.url)), './dest'),
    filename: 'wasm/web_worker.js',
  },
  plugins: [
    new webpack.DefinePlugin({ 'process.env.NODE_DEBUG': false }),
    new webpack.ProvidePlugin({ Buffer: ['buffer', 'Buffer'] }),
    new CopyWebpackPlugin({
      patterns: [
        {
          // Point directly to the built file, not the symlink, else copy-on-change doesn't work...
          from: `../../barretenberg/build-wasm/bin/barretenberg.wasm`,
          to: 'wasm/barretenberg.wasm',
        },
        {
          from: `./src/environment/init/data`,
          to: 'environment/init/data',
        },
      ],
    }),
  ],
  resolve: {
    alias: {
      './node_worker_factory.js': false,
      './node/index.js': false,
    },
    fallback: {
      crypto: false,
      fs: false,
      path: false,
      url: false,
      buffer: require.resolve('buffer/'),
    },
    plugins: [new ResolveTypeScriptPlugin()],
  },
};
