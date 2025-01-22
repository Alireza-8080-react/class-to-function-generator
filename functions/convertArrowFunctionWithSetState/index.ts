import {
  CallExpression,
  ClassDeclaration,
  Collection,
  JSCodeshift,
} from "jscodeshift";

export const convertArrowFunctionsWithSetState = (
  j: JSCodeshift,
  root: Collection<ClassDeclaration>
) => {
  root
    .find(j.ArrowFunctionExpression, {
      body: {
        type: "CallExpression",
        callee: {
          type: "Identifier",
          name: "setState",
        },
      },
    })
    .forEach((path) => {
      const arrowFunction = path.node;
      arrowFunction.body = j.blockStatement([
        j.expressionStatement(arrowFunction.body as CallExpression),
      ]);
    });
};
