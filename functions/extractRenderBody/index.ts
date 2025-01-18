import { BlockStatement, Collection, JSCodeshift } from 'jscodeshift';

export const extractRenderBody = (j: JSCodeshift, root: Collection<any>) => {
    const renderBody: string[] = [];
    root.find(j.MethodDefinition, {
        key: { type: 'Identifier', name: 'render' }
    }).forEach((path) => {
        const body = path.node.value.body as BlockStatement;
        body.body.forEach((statement) => {
            renderBody.push(j(statement).toSource());
        });
    });
    return renderBody.join('\n');
};
