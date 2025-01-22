import {
  Collection,
  CallExpression,
  JSCodeshift,
  MemberExpression,
  Identifier,
} from "jscodeshift";

export const removeBindThis = (j: JSCodeshift, root: Collection<any>) => {
  root
    .find(CallExpression, {
      callee: {
        type: "MemberExpression",
        object: {
          type: "MemberExpression",
          object: {
            type: "ThisExpression",
          },
        },
        property: {
          type: "Identifier",
        },
      },
      arguments: [
        {
          type: "ThisExpression", // The last argument should be `this`
        },
      ],
    })
    .forEach((path) => {
      const bindCall = path.node;

      // Get the method name being called
      const typedCallee = bindCall.callee as MemberExpression;
      const typedObject = typedCallee.object as MemberExpression;
      const typedProperty = typedObject.property as Identifier;
      const methodName = typedProperty.name;

      // Create a new method call without the bind and without `this`
      const newMethodCall = j.callExpression(
        j.identifier(methodName), // Use just the method name
        bindCall.arguments.slice(0, -1) // Exclude the last argument (this)
      );

      // Replace the original bind call with the new method call
      j(path).replaceWith(newMethodCall);
    });
};
