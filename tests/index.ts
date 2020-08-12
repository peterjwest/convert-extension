import assert from 'assert';
import { Stats } from 'fs';
import assertStub from 'sinon-assert-stub';
import sinonTest from 'sinon-mocha-test';
import { BabelFileResult } from '@babel/core';

import convertExtension, {
  sourceMapUrl,
  saveFile,
  ignoreMissingFile,
  convertFileExtension,
  components,
  dependencies,
} from '../src/index';

describe('convertExtension', () => {
  describe('sourceMapUrl', () => {
    it('Returns a source map URL', () => {
      assert.strictEqual(sourceMapUrl('filename.js'), '\n//# sourceMappingURL=filename.js\n');
    });
  });

  describe('saveFile', () => {
    it('Writes a file', sinonTest(async (sinon) => {
      const mkdirp = sinon.stub(dependencies, 'mkdirp').resolves();
      const writeFile = sinon.stub(dependencies, 'writeFile').resolves();
      await saveFile('dir/', 'file/ncontent/n');
      assertStub.calledOnceWith(mkdirp, ['.']);
      assertStub.calledOnceWith(writeFile, ['dir/', 'file/ncontent/n']);
    }));
  });

  describe('ignoreMissingFile', () => {
    it('Resolves when the passed promise resolves', sinonTest(async (sinon) => {
      await ignoreMissingFile(sinon.stub().resolves()());
    }));

    it('Resolves when the passed promise throws a file not found exception', sinonTest(async (sinon) => {
      const error = Object.assign(new Error('File not found'), { code: 'ENOENT' });
      await ignoreMissingFile(sinon.stub().rejects(error)());
    }));

    it('Rejects when the passed promise throws another exception', sinonTest(async (sinon) => {
      const error = new Error('Some error');
      await assert.rejects(ignoreMissingFile(sinon.stub().rejects(error)()), error);
    }));
  });

  describe('convertFileExtension', () => {
    it('Rejects if transformFile resolves with nothing', sinonTest(async (sinon) => {
      sinon.stub(dependencies, 'transformFile').resolves(null);
      const saveFile = sinon.stub(components, 'saveFile').resolves();
      const chmod = sinon.stub(dependencies, 'chmod').resolves();
      const stat = sinon.stub(dependencies, 'stat').resolves();
      const unlink = sinon.stub(dependencies, 'unlink').resolves();

      await assert.rejects(
        convertFileExtension('test.js', 'js', 'mjs', {}),
        new Error('Could not compile file test.js'),
      );
      assertStub.notCalled(saveFile);
      assertStub.notCalled(chmod);
      assertStub.notCalled(stat);
      assertStub.notCalled(unlink);
    }));

    it('Successfully converts the file', sinonTest(async (sinon) => {
      const fileResult: BabelFileResult = { code: 'console.log("Hello world");' };
      sinon.stub(dependencies, 'transformFile').resolves(fileResult);
      const saveFile = sinon.stub(components, 'saveFile').resolves();
      const chmod = sinon.stub(dependencies, 'chmod').resolves();
      const stats = { mode: 33188 };
      const stat = sinon.stub(dependencies, 'stat').resolves(stats as Stats);
      const unlink = sinon.stub(dependencies, 'unlink');
      const notFoundError = Object.assign(new Error('File not found'), { code: 'ENOENT' });
      unlink.onCall(0).resolves();
      unlink.onCall(1).rejects(notFoundError);

      await convertFileExtension('test.js', 'js', 'mjs', {});

      assertStub.calledOnceWith(saveFile, ['test.mjs', 'console.log("Hello world");']);
      assertStub.calledOnceWith(stat, ['test.js']);
      assertStub.calledOnceWith(chmod, ['test.mjs', 33188]);
      assertStub.calledWith(unlink, [['test.js'], ['test.js.map']]);
    }));

    it('Converts the source map if available', sinonTest(async (sinon) => {
      const fileResult: BabelFileResult = {
        code: 'console.log("Hello world");',
        map: {
          version: 1,
          sources: [],
          names: [],
          mappings: 'mappings',
          file: 'test.js.map',
        },
      };
      sinon.stub(dependencies, 'transformFile').resolves(fileResult);
      const saveFile = sinon.stub(components, 'saveFile').resolves();
      const chmod = sinon.stub(dependencies, 'chmod').resolves();
      const stats = { mode: 33188 };
      const stat = sinon.stub(dependencies, 'stat').resolves(stats as Stats);
      const unlink = sinon.stub(dependencies, 'unlink').resolves();

      await convertFileExtension('test.js', 'js', 'mjs', {});

      assertStub.calledWith(saveFile, [
        ['test.mjs.map', '{"version":1,"sources":[],"names":[],"mappings":"mappings","file":"test.mjs"}'],
        ['test.mjs', 'console.log("Hello world");\n//# sourceMappingURL=test.mjs.map\n'],
      ]);
      assertStub.calledOnceWith(stat, ['test.js']);
      assertStub.calledOnceWith(chmod, ['test.mjs', 33188]);
      assertStub.calledWith(unlink, [['test.js'], ['test.js.map']]);
    }));
  });

  describe('convertExtension', () => {
    it('Converts all files in a directory', sinonTest(async (sinon) => {
      const glob = sinon.stub(dependencies, 'glob').resolves(['test1.js', 'test2.js']);
      const convertFileExtension = sinon.stub(components, 'convertFileExtension').resolves();

      await convertExtension('example/dir/', 'js', 'mjs', { cwd: 'babel/dir/' });

      assertStub.calledOnceWith(glob, ['example/dir/**/*.js']);
      assertStub.calledWith(convertFileExtension, [
        ['test1.js', 'js', 'mjs', { cwd: 'babel/dir/' }],
        ['test2.js', 'js', 'mjs', { cwd: 'babel/dir/' }],
      ]);
    }));

    it('Converts all files in a directory with default config', sinonTest(async (sinon) => {
      const glob = sinon.stub(dependencies, 'glob').resolves(['test1.js', 'test2.js']);
      const convertFileExtension = sinon.stub(components, 'convertFileExtension').resolves();

      await convertExtension('example/dir/', 'js', 'mjs');

      assertStub.calledOnceWith(glob, ['example/dir/**/*.js']);
      assertStub.calledWith(convertFileExtension, [
        ['test1.js', 'js', 'mjs', {}],
        ['test2.js', 'js', 'mjs', {}],
      ]);
    }));
  });
});
