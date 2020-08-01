#!/usr/bin/env node

import convertExtensionCommand from './convertExtensionCommand';

convertExtensionCommand(process.argv).catch((error) => {
  // tslint:disable-next-line:no-console
  console.error(error);
  process.exit(1);
});
