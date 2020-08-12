import { CallExpression, ImportDeclaration } from '@babel/types';
import babelGlobal, { NodePath } from '@babel/core';
import escapeRegex from 'escape-string-regexp';

/** Options for the plugin */
export interface PluginOptions {
  outputExtension: string;
  inputExtension: string;
}

export default (babel: typeof babelGlobal, options: PluginOptions) => ({
  visitor: {
    ImportDeclaration: (nodePath: NodePath<ImportDeclaration>) => {
      const node = nodePath.node;
      const arg = node.source;

      // Ignore absolute imports and already converted extensions
      if (!arg.value.match(/^\./) || arg.value.match(new RegExp(`\.${escapeRegex(options.outputExtension)}$`))) {
        return;
      }

      nodePath.replaceWith(
        babel.types.importDeclaration(
          node.specifiers,
          babel.types.stringLiteral(
            arg.value.replace(
              new RegExp(`\.${escapeRegex(options.inputExtension)}$|$`),
              `.${options.outputExtension}`,
            ),
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

      // Ignore absolute imports and already converted extensions
      if (!arg.value.match(/^\./) || arg.value.match(new RegExp(`\.${escapeRegex(options.outputExtension)}$`))) {
        return;
      }

      nodePath.replaceWith(
        babel.types.callExpression(
          callee,
          [babel.types.stringLiteral(
            arg.value.replace(new RegExp(`\.${escapeRegex(options.inputExtension)}$|$`),
            `.${options.outputExtension}`,
          ))],
        ),
      );
    },
  },
});
