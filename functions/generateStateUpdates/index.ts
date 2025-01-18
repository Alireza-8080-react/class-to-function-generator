import { Identifier, JSCodeshift, Property } from 'jscodeshift';

export const generateStateUpdates = (j: JSCodeshift, properties: (Property & { key: Identifier })[], paramName: string) => {
    return properties.map((prop) => {
        const stateName = prop.key.name;
        const valueExpression = prop.value;

        if (paramName && j(valueExpression).toSource().includes(paramName)) {
            return `set${stateName[0].toUpperCase()}${stateName.slice(1)}(${paramName} => ${j(valueExpression).toSource()})`;
        }
        return `set${stateName[0].toUpperCase()}${stateName.slice(1)}(${j(valueExpression).toSource()})`;
    });
};
