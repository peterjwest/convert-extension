import { CallExpression, ImportDeclaration } from '@babel/types';
import babelGlobal, { NodePath } from '@babel/core';

export default (babel: typeof babelGlobal) => ({
  visitor: {
    ImportDeclaration: (nodePath: NodePath<ImportDeclaration>) => {
      const node = nodePath.node;
      const arg = node.source;

      if (!arg.value.match(/^\./) || arg.value.match(/\.mjs$/)) {
        return;
      }

      nodePath.replaceWith(
        babel.types.importDeclaration(
          node.specifiers,
          babel.types.stringLiteral(
            arg.value.replace(/.js$|$/, '.mjs'),
          ),
        ),
      );
    },

    CallExpression: (nodePath: NodePath<CallExpression>) => {
      const node = nodePath.node;
      const callee = node.callee;
      const arg = node.arguments[0];

      if (
        callee.type !== 'Identifier' ||
        callee.name !== 'require' ||
        node.arguments.length !== 1 ||
        arg.type !== 'StringLiteral'
      ) {
        return;
      }

      if (!arg.value.match(/^\./) || arg.value.match(/\.cjs$/)) {
        return;
      }

      nodePath.replaceWith(
        babel.types.callExpression(
          callee,
          [babel.types.stringLiteral(arg.value.replace(/.js$|$/, '.cjs'))],
        ),
      );
    },
  },
});
