import multiline from 'multiline-ts';

import convertExtension from './index';
import argvParser from './argvParser';

export const dependencies = {
  console,
  convertExtension,
};

export const commandHelp = multiline`
  Convert JS source file extensions

  Usage: npx convert-extension [--help] <extension> <path>
  Description:
    TODO

  Arguments:
    <extension>
      Extension to rename to e.g. "mjs", "cjs"

    <path>
      Directory containing files to rename

  Options:
    --help
      Display this message
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

  const extension = args[0];
  const path = args[1];

  await dependencies.convertExtension(path, extension);
}
