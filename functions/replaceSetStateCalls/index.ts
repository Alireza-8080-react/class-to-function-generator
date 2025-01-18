import { ClassDeclaration, Collection, Identifier, JSCodeshift, Property } from 'jscodeshift';
import { generateStateUpdates } from '../generateStateUpdates';

export const replaceSetStateCalls = (j: JSCodeshift, root: Collection<ClassDeclaration>) => {
    root.find(j.CallExpression, {
        callee: {
            type: 'MemberExpression',
            property: { type: 'Identifier', name: 'setState' }
        }
    }).forEach((path) => {
        const callExpression = path.node;
        const argument = callExpression.arguments[0];
        const callbackArg = callExpression.arguments[1];

        // Add a comment for callback setState
        if (callbackArg && callbackArg.type === 'ArrowFunctionExpression') {
            const comment = j.commentLine(` Consideration: callback setState might need to be handled manually`);
            path.node.comments = path.node.comments || [];
            path.node.comments.push(comment);
            return;
        }

        if (argument) {
            if (argument.type === 'ArrowFunctionExpression') {
                const arrowFunction = argument;
                const typedParam = arrowFunction.params[0] as Identifier;
                const paramName = typedParam?.name || '';
                const body = arrowFunction.body;

                if (body.type === 'ObjectExpression') {
                    const properties = body.properties.filter(
                        (prop): prop is Property & { key: Identifier } => prop.type === 'Property' && prop.key.type === 'Identifier'
                    );

                    const stateUpdates = generateStateUpdates(j, properties, paramName);

                    j(path).replaceWith(stateUpdates.join(';\n'));
                } else if (body.type === 'ParenthesizedExpression' && body.expression.type === 'ObjectExpression') {
                    const properties = body.expression.properties.filter(
                        (prop): prop is Property & { key: Identifier } => prop.type === 'Property' && prop.key.type === 'Identifier'
                    );

                    const stateUpdates = generateStateUpdates(j, properties, paramName);

                    j(path).replaceWith(stateUpdates.join(';\n'));
                }
            } else if (argument.type === 'ObjectExpression') {
                const properties = argument.properties.filter(
                    (prop): prop is Property & { key: Identifier } => prop.type === 'Property' && prop.key.type === 'Identifier'
                );

                const stateUpdates = generateStateUpdates(j, properties, '');

                j(path).replaceWith(stateUpdates.join(';\n'));
            }
        }
    });

    return root;
};
