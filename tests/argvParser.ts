import assert from 'assert';

import argvParser, { splitOnce } from '../src/argvParser';

describe('argvParser', () => {
  describe('splitOnce', () => {
    it('Returns an array with two parts of a string containing the delimiter', () => {
      assert.deepStrictEqual(splitOnce('foo=bar', '='), ['foo', 'bar']);
    });

    it('Returns an array with two parts of a string containing the delimiter more than once', () => {
      assert.deepStrictEqual(splitOnce('foo=bar=zim=gir', '='), ['foo', 'bar=zim=gir']);
    });

    it('Returns an array with an entire not containing the delimiter ', () => {
      assert.deepStrictEqual(splitOnce('foo=bar', ' '), ['foo=bar']);
    });
  });

  describe('argvParser', () => {
    it('Returns empty arguments and options when passed no additional arguments', () => {
      const input = ['command', 'file'];
      assert.deepStrictEqual(argvParser(input), { args: [], options: {}});
    });

    it('Returns arguments as an array', () => {
      const input = ['command', 'file', 'foo', 'bar'];
      assert.deepStrictEqual(argvParser(input), { args: ['foo', 'bar'], options: {}});
    });

    it('Returns options as an object', () => {
      const input = ['command', 'file', '--foo', '--bar=zim'];
      assert.deepStrictEqual(argvParser(input), { args: [], options: { foo: true, bar: 'zim' }});
    });

    it('Returns short options as an object', () => {
      const input = ['command', 'file', '-f', '-b=zim'];
      assert.deepStrictEqual(argvParser(input), { args: [], options: { f: true, b: 'zim' }});
    });

    it('Returns options and arguments in any order/combination', () => {
      const input = ['command', 'file', '-x', 'foo', '--bar=zim', 'gir', '--zig'];
      assert.deepStrictEqual(argvParser(input), { args: ['foo', 'gir'], options: { x: true, bar: 'zim', zig: true }});
    });
  });
});
