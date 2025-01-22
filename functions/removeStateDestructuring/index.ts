import { ClassDeclaration, Collection, JSCodeshift } from "jscodeshift";

export const removeStateDestructuring = (
  j: JSCodeshift,
  root: Collection<ClassDeclaration>
) => {
  root
    .find(j.VariableDeclaration)
    .filter((path) => {
      return path.node.declarations.some((declaration) => {
        return (
          declaration.type === "VariableDeclarator" &&
          declaration.id.type === "ObjectPattern" &&
          declaration.init?.type === "Identifier" &&
          declaration.init.name === "state"
        );
      });
    })
    .forEach((path) => {
      j(path).remove();
    });
};
