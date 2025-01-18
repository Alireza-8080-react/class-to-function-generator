import { JSCodeshift, Collection, Identifier, BlockStatement } from 'jscodeshift';

export const extractOtherDeclarations = (j: JSCodeshift, root: Collection<any>) => {
    const otherDeclarations: string[] = [];

    root.find(j.ClassProperty)
        .filter((path) => {
            const typedKey = path.node.key as Identifier;
            return !['render', 'componentDidMount', 'componentDidUpdate', 'componentWillUnmount', 'constructor'].includes(typedKey.name);
        })
        .forEach((path) => {
            const newPropertyTemplate = `const ${j(path.node).toSource()}`;
            otherDeclarations.push(newPropertyTemplate);
        });

    root.find(j.MethodDefinition)
        .filter((path) => {
            const typedKey = path.node.key as Identifier;

            return !['render', 'componentDidMount', 'componentDidUpdate', 'componentWillUnmount', 'constructor'].includes(typedKey.name);
        })
        .forEach((path) => {
            const methodBlock = path.node.value.body as BlockStatement;
            const params = path.node.value.params;

            const typedKey = path.node.key as Identifier;
            const newMethodTemplate = `const ${typedKey.name} = (${params.map((param) => j(param).toSource()).join(', ')}) => ${j(methodBlock).toSource()}`;
            otherDeclarations.push(newMethodTemplate);
        });

    return otherDeclarations;
};
