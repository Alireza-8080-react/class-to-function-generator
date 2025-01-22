import { Collection, JSCodeshift } from "jscodeshift";

export const removeThis = (j: JSCodeshift, root: Collection<any>) => {
  root
    .find(j.MemberExpression, { object: { type: "ThisExpression" } })
    .forEach((path) => {
      const property = path.node.property;
      j(path).replaceWith(property);
    });
};
