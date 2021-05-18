import assert from 'assert';
// import { Stats } from 'fs';
// import assertStub from 'sinon-assert-stub';
import sinonTest from 'sinon-mocha-test';
import * as babelGlobal from '@babel/core';
import {
  program, callExpression, identifier, importDeclaration, stringLiteral,
  CallExpression, ImportDeclaration,
} from '@babel/types';
import { NodePath, Hub } from '@babel/traverse';

import plugin from '../src/plugin';

describe('plugin', () => {
  describe('ImportDeclaration', () => {
    it('Adds the extension to a relative import declaration', sinonTest(async (sinon) => {
      const { visitor } = plugin(babelGlobal, { outputExtension: 'mjs', inputExtension: 'js' });
      const programNode = program([]);
      const nodePath = new NodePath<ImportDeclaration>(new Hub(), programNode);
      nodePath.node = importDeclaration([], stringLiteral('./imported'));
      nodePath.container = programNode;
      visitor.ImportDeclaration(nodePath);
      assert.strictEqual(nodePath.node.source.value, './imported.mjs');
    }));

    it('Changes the extension of a relative import declaration', sinonTest(async (sinon) => {
      const { visitor } = plugin(babelGlobal, { outputExtension: 'banana.js', inputExtension: 'js' });
      const programNode = program([]);
      const nodePath = new NodePath<ImportDeclaration>(new Hub(), programNode);
      nodePath.node = importDeclaration([], stringLiteral('./imported.js'));
      nodePath.container = programNode;
      visitor.ImportDeclaration(nodePath);
      assert.strictEqual(nodePath.node.source.value, './imported.banana.js');
    }));

    it('Does not change the extension of an absolute import', sinonTest(async (sinon) => {
      const { visitor } = plugin(babelGlobal, { outputExtension: 'cjs', inputExtension: 'js' });
      const programNode = program([]);
      const nodePath = new NodePath<ImportDeclaration>(new Hub(), programNode);
      nodePath.node = importDeclaration([], stringLiteral('example-package'));
      nodePath.container = programNode;
      visitor.ImportDeclaration(nodePath);
      assert.strictEqual(nodePath.node.source.value, 'example-package');
    }));
  });

  describe('CallExpression', () => {
    it('Adds the extension to a relative require statement', sinonTest(async (sinon) => {
      const { visitor } = plugin(babelGlobal, { outputExtension: 'cjs', inputExtension: 'js' });
      const programNode = program([]);
      const nodePath = new NodePath<CallExpression>(new Hub(), programNode);
      nodePath.node = callExpression(identifier('require'), [stringLiteral('./imported')]);
      nodePath.container = programNode;
      visitor.CallExpression(nodePath);
      // assert() needed here for Typescript to understand the type narrowing
      assert(nodePath.node.arguments[0].type === 'StringLiteral');
      assert.strictEqual(nodePath.node.arguments[0].value, './imported.cjs');
    }));

    it('Changes the extension of a relative require statement', sinonTest(async (sinon) => {
      const { visitor } = plugin(babelGlobal, { outputExtension: 'cjs', inputExtension: 'js' });
      const programNode = program([]);
      const nodePath = new NodePath<CallExpression>(new Hub(), programNode);
      nodePath.node = callExpression(identifier('require'), [stringLiteral('./imported.js')]);
      nodePath.container = programNode;
      visitor.CallExpression(nodePath);
      // assert() needed here for Typescript to understand the type narrowing
      assert(nodePath.node.arguments[0].type === 'StringLiteral');
      assert.strictEqual(nodePath.node.arguments[0].value, './imported.cjs');
    }));

    it('Does not change the extension of an absolute require statement', sinonTest(async (sinon) => {
      const { visitor } = plugin(babelGlobal, { outputExtension: 'mjs', inputExtension: 'js' });
      const programNode = program([]);
      const nodePath = new NodePath<CallExpression>(new Hub(), programNode);
      nodePath.node = callExpression(identifier('require'), [stringLiteral('example-package')]);
      nodePath.container = programNode;
      visitor.CallExpression(nodePath);
      // assert() needed here for Typescript to understand the type narrowing
      assert(nodePath.node.arguments[0].type === 'StringLiteral');
      assert.strictEqual(nodePath.node.arguments[0].value, 'example-package');
    }));

    it('Does not change the extension if the require is not a string literal', sinonTest(async (sinon) => {
      const { visitor } = plugin(babelGlobal, { outputExtension: 'mjs', inputExtension: 'js' });
      const programNode = program([]);
      const nodePath = new NodePath<CallExpression>(new Hub(), programNode);
      nodePath.node = callExpression(identifier('require'), [callExpression(identifier('getPackageName'), [])]);
      nodePath.container = programNode;
      visitor.CallExpression(nodePath);
      // assert() needed here for Typescript to understand the type narrowing
      assert(nodePath.node.arguments[0].type === 'CallExpression');
      assert.deepStrictEqual(nodePath.node.arguments[0].arguments, []);
    }));
  });
});
