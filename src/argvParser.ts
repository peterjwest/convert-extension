/** Command line options */
export interface Options {
  [name: string]: string | boolean;
}

/** Splits a string by the first instance of a delimiter */
export function splitOnce(value: string, delimiter: string | RegExp) {
  const match = value.match(delimiter);
  /* istanbul ignore next */
  return match ? [value.slice(0, match.index), value.slice((match.index || 0) + 1)] : [value];
}

/** Parses command line arguments and options from process.argv */
export default function argvParser(argv: string[]) {
  const results: { options: Options, args: string[] } = { options: {}, args: [] };
  argv.slice(2).forEach((argument) => {
    if (argument.match(/^-/)) {
      const option = argument.replace(/^-+/, '');
      const [name, value] = splitOnce(option, '=');
      results.options[name] = value || true;
    }
    else {
      results.args.push(argument);
    }
  });

  return results;
}
