import assert from 'assert';
import assertStub from 'sinon-assert-stub';
import sinonTest from 'sinon-mocha-test';

import convertExtensionCommand, { commandHelp, dependencies } from '../src/convertExtensionCommand';

describe('convertExtensionCommand', () => {
  it('Logs the help message if given the --help option', sinonTest(async (sinon) => {
    const convertExtension = sinon.stub(dependencies, 'convertExtension').resolves();
    const consoleLog = sinon.stub(dependencies.console, 'log');

    await convertExtensionCommand(['node', 'file.js', '--help']);

    assertStub.calledOnceWith(consoleLog, [commandHelp]);
    assertStub.notCalled(convertExtension);
  }));

  it('Throws an error if no extension is supplied', sinonTest(async (sinon) => {
    const convertExtension = sinon.stub(dependencies, 'convertExtension').resolves();
    const consoleLog = sinon.stub(dependencies.console, 'log');

    await assert.rejects(convertExtensionCommand(['node', 'file.js']), new Error('<extension> must be supplied'));

    assertStub.notCalled(consoleLog);
    assertStub.notCalled(convertExtension);
  }));

  it('Throws an error if no path is supplied', sinonTest(async (sinon) => {
    const convertExtension = sinon.stub(dependencies, 'convertExtension').resolves();
    const consoleLog = sinon.stub(dependencies.console, 'log');

    await assert.rejects(convertExtensionCommand(['node', 'file.js', 'mjs']), new Error('<path> must be supplied'));

    assertStub.notCalled(consoleLog);
    assertStub.notCalled(convertExtension);
  }));

  it('Throws if input-extension option is not supplied a value', sinonTest(async (sinon) => {
    const convertExtension = sinon.stub(dependencies, 'convertExtension').resolves();
    const consoleLog = sinon.stub(dependencies.console, 'log');

    await assert.rejects(convertExtensionCommand(['node', 'file.js', 'mjs', '--input-extension', 'src/']), new Error('--input-extension must have a value'));

    assertStub.notCalled(consoleLog);
    assertStub.notCalled(convertExtension);
  }));

  it('Runs convertExtension if arguments supplied', sinonTest(async (sinon) => {
    const convertExtension = sinon.stub(dependencies, 'convertExtension').resolves();
    const consoleLog = sinon.stub(dependencies.console, 'log');

    await convertExtensionCommand(['node', 'file.js', 'mjs', 'src/']);

    assertStub.notCalled(consoleLog);
    assertStub.calledOnceWith(convertExtension, ['src/', 'js', 'mjs']);
  }));

  it('Runs convertExtension with a custom input extension', sinonTest(async (sinon) => {
    const convertExtension = sinon.stub(dependencies, 'convertExtension').resolves();
    const consoleLog = sinon.stub(dependencies.console, 'log');

    await convertExtensionCommand(['node', 'file.js', 'mjs', '--input-extension=xyz', 'src/']);

    assertStub.notCalled(consoleLog);
    assertStub.calledOnceWith(convertExtension, ['src/', 'xyz', 'mjs']);
  }));
});
