import { JSCodeshift, Collection, Identifier } from "jscodeshift";

export const removeThisState = (j: JSCodeshift, root: Collection<any>) => {
  root
    .find(j.MemberExpression, {
      object: { type: "MemberExpression", property: { name: "state" } },
    })
    .forEach((path) => {
      const property = path.node.property as Identifier;
      j(path).replaceWith(property.name);
    });
};
