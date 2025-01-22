import {
  ClassDeclaration,
  Collection,
  Identifier,
  JSCodeshift,
  ObjectExpression,
  ObjectProperty,
} from "jscodeshift";

export const extractStateInitializations = (
  j: JSCodeshift,
  classPath: Collection<ClassDeclaration>
) => {
  const stateInitializations: { key: string; value: any }[] = [];

  // Find state initialization in the constructor
  classPath
    .find(j.MethodDefinition, { kind: "constructor" })
    .forEach((constructorPath) => {
      j(constructorPath)
        .find(j.AssignmentExpression, {
          left: {
            type: "Identifier",
            name: "state",
          },
        })
        .forEach((stateAssignmentPath) => {
          const typedStateAssignmentRight = stateAssignmentPath.node
            .right as ObjectExpression;
          typedStateAssignmentRight.properties.forEach((property) => {
            const typedProperty = property as ObjectProperty;
            const typedKey = typedProperty.key as Identifier;
            stateInitializations.push({
              key: typedKey.name,
              value: typedProperty.value,
            });
          });
          j(stateAssignmentPath).remove();
        });
    });

  // Handle state initialization as a class property
  classPath
    .find(j.ClassProperty, {
      key: { name: "state" },
    })
    .forEach((statePropertyPath) => {
      const typedStateValue = statePropertyPath.node.value as ObjectExpression;
      typedStateValue.properties.forEach((property) => {
        const typedProperty = property as ObjectProperty;
        if (typedProperty.key.type === "Identifier") {
          stateInitializations.push({
            key: typedProperty.key.name,
            value: typedProperty.value,
          });
        }
      });

      j(statePropertyPath).remove();
    });

  return stateInitializations.map(
    ({ key, value }) =>
      `const [${key}, set${
        key.charAt(0).toUpperCase() + key.slice(1)
      }] = useState(${j(value).toSource()});`
  );
};
