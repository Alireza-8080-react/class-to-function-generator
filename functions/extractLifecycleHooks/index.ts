import { JSCodeshift, Collection, ASTPath, BlockStatement, Identifier, ArrowFunctionExpression, IfStatement } from 'jscodeshift';

export const extractLifecycleHooks = (j: JSCodeshift, root: Collection<any>) => {
    const lifecycleMethods = {
        componentDidMount: new Set<string>(),
        componentDidUpdate: new Set<string>(),
        componentWillUnmount: new Set<string>()
    };

    ['componentDidMount', 'componentDidUpdate', 'componentWillUnmount'].forEach((methodName) => {
        // Find and process methods
        root.find(j.MethodDefinition, { key: { name: methodName } }).forEach((method) => {
            const block = method.node.value.body as BlockStatement;
            block.body.forEach((statement) => {
                lifecycleMethods[methodName].add(j(statement).toSource());
            });
        });

        // Find and process arrow functions
        root.find(j.ClassProperty, {
            key: { name: methodName },
            value: { type: 'ArrowFunctionExpression' }
        }).forEach((arrowFunction) => {
            const expression = arrowFunction.node.value as ArrowFunctionExpression;
            const block = expression.body as BlockStatement;
            block.body.forEach((statement) => {
                lifecycleMethods[methodName].add(j(statement).toSource());
            });
        });
    });

    const useEffectHooks: string[] = [];

    // Handle componentDidMount
    if (lifecycleMethods.componentDidMount.size > 0) {
        const mountStatements = Array.from(lifecycleMethods.componentDidMount).join('\n    ');
        useEffectHooks.push(`
        useEffect(() => {
            ${mountStatements}
        }, []);`);
    }

    // Handle componentWillUnmount
    if (lifecycleMethods.componentWillUnmount.size > 0) {
        const unmountStatements = Array.from(lifecycleMethods.componentWillUnmount).join('\n    ');
        useEffectHooks.push(`
        useEffect(() => {
            return () => {
                ${unmountStatements}
            };
        }, []);`);
    }

    // Handle componentDidUpdate
    if (lifecycleMethods.componentDidUpdate.size > 0) {
        const updateStatements = Array.from(lifecycleMethods.componentDidUpdate);
        const dependencyProps = new Set<string>();

        // Find the componentDidUpdate method definition and get the first argument
        root.find(j.MethodDefinition, { key: { name: 'componentDidUpdate' } }).forEach((method) => {
            const params = method.node.value.params as Identifier[];
            if (params.length > 0) {
                const firstArgName = params[0].name;

                // Remove if statements and collect the statements inside their blocks
                const cleanedUpdateStatements = updateStatements.map((statement) => {
                    const astNode = j(statement);
                    const ifStatements = astNode.find(IfStatement);

                    ifStatements.forEach((ifStatement) => {
                        const consequent = ifStatement.node.consequent as BlockStatement;
                        const blockBody = consequent.body;
                        blockBody.forEach((bodyStatement) => {
                            lifecycleMethods.componentDidUpdate.add(j(bodyStatement).toSource());
                        });
                        j(ifStatement).replaceWith(blockBody.map((bodyStatement) => j(bodyStatement).toSource()));
                    });

                    return astNode.toSource();
                });

                updateStatements.forEach((stmt) => {
                    const propMatches = stmt.match(new RegExp(`${firstArgName}\\.(\\w+)`, 'g'));
                    propMatches &&
                        propMatches.forEach((match) => {
                            const prop = match.split('.')[1];
                            dependencyProps.add(`props.${prop}`);
                        });
                });

                const updateEffect = `
                // check this useEffect because it may have side-effects. also separate it into multiple useEffects if necessary.
                useEffect(() => {
                    ${cleanedUpdateStatements.join('\n    ')}
                }, [${[...dependencyProps].join(', ')}]);`;
                useEffectHooks.push(updateEffect);
            }
        });
    }

    return useEffectHooks;
};
