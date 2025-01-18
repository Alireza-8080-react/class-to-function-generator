import { ClassDeclaration, Collection, JSCodeshift } from 'jscodeshift';

export const ensureCurlyBracesForIfElse = (j: JSCodeshift, root: Collection<ClassDeclaration>) => {
    root.find(j.IfStatement).forEach((path) => {
        const { consequent, alternate } = path.node;
        if (consequent.type !== 'BlockStatement') {
            path.node.consequent = j.blockStatement([consequent]);
        }

        if (alternate) {
            if (alternate.type === 'IfStatement') {
                ensureCurlyBracesForIfElse(j, j(alternate));
            } else if (alternate.type !== 'BlockStatement') {
                path.node.alternate = j.blockStatement([alternate]);
            }
        }
    });

    return root;
};
