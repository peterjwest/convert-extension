import path from 'path';
import fs from 'fs';
import babelDefault, * as babel from '@babel/core';
import glob from 'glob';
import { promisify } from 'util';
import mkdirp from 'mkdirp';

import plugin from './plugin';

const { chmod, stat, writeFile, unlink } = fs.promises;

export const dependencies = {
  transformFile: (babelDefault || babel).transformFileAsync,
  glob: promisify(glob),
  chmod,
  console,
  mkdirp,
  stat,
  writeFile,
  unlink,
};

export const components = {
  saveFile,
  convertFileExtension,
};

/** Returns a source map annotation line */
export function sourceMapUrl(filename: string): string {
  return `\n//# sourceMappingURL=${path.basename(filename)}\n`;
}

/** Saves a file, creating its directory if needed */
export async function saveFile(filePath: string, data: string | Buffer) {
  await dependencies.mkdirp(path.dirname(filePath));
  await dependencies.writeFile(filePath, data);
}

/** Awaits a promise, ignoring missing file errors  */
export async function ignoreMissingFile(promise: Promise<void>) {
  try {
    await promise;
  } catch (error) {
    if (error.code !== 'ENOENT') {
      throw error;
    }
  }
}

/** Converts a file with its imports and source map to a new extension */
export async function convertFileExtension(
  inputFilename: string, inputExtension: string, outputExtension: string, options: babel.TransformOptions,
) {
  const outputFilename = inputFilename.replace(/\..+$/, `.${outputExtension}`);
  const result = await dependencies.transformFile(
    inputFilename, {
      ...options,
      caller: { name: '@babel/cli' },
      plugins: [[plugin, { outputExtension, inputExtension }]],
      sourceMaps: true,
    },
  );

  if (!result) {
    throw new Error(`Could not compile file ${inputFilename}`);
  }

  let code = String(result.code);

  if (result.map) {
    const outputMapFilename = outputFilename + '.map';
    code = code + sourceMapUrl(outputMapFilename);
    result.map.file = path.basename(outputFilename);
    await components.saveFile(outputMapFilename, JSON.stringify(result.map));
  }

  await components.saveFile(outputFilename, code);
  await dependencies.chmod(outputFilename, (await dependencies.stat(inputFilename)).mode);
  const inputMapFilename = inputFilename + '.map';
  await dependencies.unlink(inputFilename);
  await ignoreMissingFile(dependencies.unlink(inputMapFilename));
}


/** Converts a directory of files to a new extension */
export default async function convertExtension(
  directory: string,
  inputExtension: string,
  outputExtension: string,
  options: babel.TransformOptions = {},
) {
  const filenames = await dependencies.glob(path.join(directory, `**/*.${inputExtension}`));
  for (const filename of filenames) {
    await components.convertFileExtension(filename, inputExtension, outputExtension, options);
  }
}
