import { Collection, Identifier, JSCodeshift, MemberExpression } from 'jscodeshift';

export const extractCreateRefs = (j: JSCodeshift, classPath: Collection<any>) => {
    const refDeclarations: string[] = [];

    // x = createRef();
    classPath
        .find(j.ClassProperty, {
            value: { callee: { name: 'createRef' } }
        })
        .forEach((refPath) => {
            const refIdentifier = refPath.node.key as Identifier;
            const refName = refIdentifier.name;

            j(refPath).remove();
            refDeclarations.push(refName);
        });

    // this.x = createRef(); (in constructor)
    classPath
        .find(j.AssignmentExpression, {
            right: { callee: { name: 'createRef' } }
        })
        .forEach((assignPath) => {
            const refIdentifier = assignPath.node.left as MemberExpression;
            const refProperty = refIdentifier.property as Identifier;
            const refName = refProperty.name;

            j(assignPath).remove();
            refDeclarations.push(refName);
        });

    return refDeclarations.map((refName) => `const ${refName} = useRef(null);`);
};
