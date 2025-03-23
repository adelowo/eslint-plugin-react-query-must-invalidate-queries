import { AST_NODE_TYPES, ESLintUtils, TSESTree, TSESLint } from "@typescript-eslint/utils";

const MUTATION_HOOK_NAME = "useMutation";
const ON_SUCCESS_PROP = "onSuccess";
const INVALIDATE_QUERIES_NAME = "invalidateQueries";

export const requireMutationInvalidation = ESLintUtils.RuleCreator(
  (name: string) =>
    `https://github.com/adelowo/eslint-plugin-react-query-keys/blob/main/docs/rules/${name}.md`
)({
  name: "require-mutation-invalidation",
  meta: {
    type: "problem",
    docs: {
      description: "Enforce calling invalidateQueries in useMutation onSuccess callbacks",
    },
    messages: {
      missingInvalidation:
        "useMutation onSuccess callback must call invalidateQueries to ensure data consistency",
    },
    schema: [],
  },
  defaultOptions: [],
  create(context: Readonly<TSESLint.RuleContext<"missingInvalidation", never[]>>) {
    return {
      CallExpression(node: TSESTree.CallExpression) {
        // Check if it's a useMutation call
        if (
          node.callee.type === AST_NODE_TYPES.Identifier &&
          node.callee.name === MUTATION_HOOK_NAME
        ) {
          // Look for options object in the arguments
          const options = node.arguments.find(
            (arg: TSESTree.Node): arg is TSESTree.ObjectExpression =>
              arg.type === AST_NODE_TYPES.ObjectExpression
          );

          if (!options) {
            context.report({
              node,
              messageId: "missingInvalidation",
            });
            return;
          }

          // look for the onSuccess property
          const onSuccessProp = options.properties.find(
            (prop: TSESTree.Property | TSESTree.SpreadElement): prop is TSESTree.Property =>
              prop.type === AST_NODE_TYPES.Property &&
              "name" in prop.key &&
              prop.key.type === AST_NODE_TYPES.Identifier &&
              prop.key.name === ON_SUCCESS_PROP
          );

          if (!onSuccessProp) {
            context.report({
              node,
              messageId: "missingInvalidation",
            });
            return;
          }

          // keep a track of all variables that reference invalidateQueries method call
          const invalidateQueriesRefs = new Set<string>();

          // does onSuccess callback contains invalidateQueries calls?
          const hasInvalidateQueries = (node: TSESTree.Node): boolean => {
            if (!node || typeof node !== 'object') {
              return false;
            }

            if (node.type === AST_NODE_TYPES.VariableDeclarator) {
              // regular assignment
              if (node.init?.type === AST_NODE_TYPES.MemberExpression) {
                if (
                  node.init.property.type === AST_NODE_TYPES.Identifier &&
                  node.init.property.name === INVALIDATE_QUERIES_NAME
                ) {
                  if (node.id.type === AST_NODE_TYPES.Identifier) {
                    invalidateQueriesRefs.add(node.id.name);
                  }
                }
              } else if (
                node.init?.type === AST_NODE_TYPES.Identifier &&
                invalidateQueriesRefs.has(node.init.name)
              ) {
                if (node.id.type === AST_NODE_TYPES.Identifier) {
                  invalidateQueriesRefs.add(node.id.name);
                }
              }

              // object destructuring
              if (node.id.type === AST_NODE_TYPES.ObjectPattern) {
                node.id.properties.forEach((prop) => {
                  if (
                    prop.type === AST_NODE_TYPES.Property &&
                    prop.key.type === AST_NODE_TYPES.Identifier &&
                    prop.key.name === INVALIDATE_QUERIES_NAME &&
                    prop.value.type === AST_NODE_TYPES.Identifier
                  ) {
                    invalidateQueriesRefs.add(prop.value.name);
                  }
                });
              }
            }

            if (node.type === AST_NODE_TYPES.CallExpression) {
              // this is a straight foward call to invalidateQueries on any object
              if (
                node.callee.type === AST_NODE_TYPES.MemberExpression &&
                node.callee.property.type === AST_NODE_TYPES.Identifier &&
                node.callee.property.name === INVALIDATE_QUERIES_NAME
              ) {
                return true;
              }

              // a call to a variable that references invalidateQueries methods
              if (
                node.callee.type === AST_NODE_TYPES.Identifier &&
                invalidateQueriesRefs.has(node.callee.name)
              ) {
                return true;
              }
            }

            // Handle awaited expressions
            if (node.type === AST_NODE_TYPES.AwaitExpression) {
              return hasInvalidateQueries(node.argument);
            }

            // go through only specific AST node properties that could contain the invalidateQueries call
            switch (node.type) {
              case AST_NODE_TYPES.BlockStatement:
                return node.body.some(hasInvalidateQueries);
              case AST_NODE_TYPES.ExpressionStatement:
                return hasInvalidateQueries(node.expression);
              case AST_NODE_TYPES.ArrowFunctionExpression:
              case AST_NODE_TYPES.FunctionExpression:
                return hasInvalidateQueries(node.body);
              case AST_NODE_TYPES.CallExpression:
                return hasInvalidateQueries(node.callee) || node.arguments.some(hasInvalidateQueries);
              case AST_NODE_TYPES.MemberExpression:
                return hasInvalidateQueries(node.object) || hasInvalidateQueries(node.property);
              case AST_NODE_TYPES.IfStatement:
                return hasInvalidateQueries(node.consequent) || (node.alternate ? hasInvalidateQueries(node.alternate) : false);
              case AST_NODE_TYPES.TryStatement:
                return hasInvalidateQueries(node.block) || (node.handler ? hasInvalidateQueries(node.handler.body) : false);
              case AST_NODE_TYPES.CatchClause:
                return hasInvalidateQueries(node.body);
              case AST_NODE_TYPES.VariableDeclaration:
                return node.declarations.some(hasInvalidateQueries);
              default:
                return false;
            }
          };

          if (!hasInvalidateQueries(onSuccessProp.value)) {
            context.report({
              node: onSuccessProp,
              messageId: "missingInvalidation",
            });
          }
        }
      },
    };
  },
}); 
