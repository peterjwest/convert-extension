import multiline from 'multiline-ts';

import convertExtension from './index';
import argvParser from './argvParser';

export const dependencies = {
  console,
  convertExtension,
};

export const commandHelp = multiline`
  Convert JS source file extensions

  Usage: npx convert-extension [--help] <extension> <path> [--input-extension=<value>]
  Description:
    Converts any files in <path> with the specified input extension (default "js") and their relative imports to <extension>.
    Will also convert source maps, if they exist.

  Arguments:
    <extension>
      Extension to rename to e.g. "mjs", "cjs"

    <path>
      Directory containing files to rename

  Options:
    --help
      Display this message

    --input-extension=<value>
      Extension of files to process, default "js"
`;

/** Tests snippets as a command */
export default async function convertExtensionCommand(argv: string[]) {
  const { args, options } = argvParser(argv);

  if (options.help) {
    dependencies.console.log(commandHelp);
    return;
  }

  if (args.length < 1) {
    throw new Error('<extension> must be supplied');
  }

  if (args.length < 2) {
    throw new Error('<path> must be supplied');
  }

  if (options['input-extension'] === true) {
    throw new Error('--input-extension must have a value');
  }

  const outputExtension = args[0];
  const path = args[1];
  const inputExtension = options['input-extension'] || 'js';

  await dependencies.convertExtension(path, inputExtension, outputExtension);
}
