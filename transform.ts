import { API, ClassDeclaration, Collection, FileInfo, JSCodeshift, Options } from 'jscodeshift';
import { ensureCurlyBracesForIfElse } from './functions/ensureCurlyBracesForIfElse';
import { replaceSetStateCalls } from './functions/replaceSetStateCalls';
import { extractStateInitializations } from './functions/extractStateInitializations';
import { removeStateDestructuring } from './functions/removeStateDestructuring';
import { convertArrowFunctionsWithSetState } from './functions/convertArrowFunctionWithSetState';
import { removeBindThis } from './functions/removeBindThis';
import handleImports from './functions/handleImports';
import { extractCreateRefs } from './functions/extractCreateRefs';
import { extractLifecycleHooks } from './functions/extractLifecycleHooks';
import { removeThisState } from './functions/removeThisState';
import { extractRenderBody } from './functions/extractRenderBody';
import { removeThis } from './functions/removeThis';
import { extractOtherDeclarations } from './functions/extractOtherDeclarations';
import { checkNamedExportKeyword } from './functions/checkNamedExportKeyword';

// classNames like Calendar,TextFieldWithValiadtion. if you have multiple classes & only want to refactor some of them you can use this option.
// options: {classNames: string}
const transformer = (file: FileInfo, api: API, options: Options) => {
    const j = api.jscodeshift.withParser('babel-ts');
    const root = j(file.source);

    const classDeclarationRoot = root.find(j.ClassDeclaration);
    if (classDeclarationRoot.length === 0) {
        return root.toSource();
    }

    classDeclarationRoot.forEach((classPath) => {
        const classPathRoot = j(classPath);
        const className = classPath.node.id?.name || '';

        if (options.classNames && !options.classNames.split(',').some((name: string) => name === className)) {
            return classPathRoot.toSource();
        }

        ensureCurlyBracesForIfElse(j, classPathRoot);
        removeStateDestructuring(j, classPathRoot);
        convertArrowFunctionsWithSetState(j, classPathRoot);
        removeThisState(j, classPathRoot);
        const stateInitializations = extractStateInitializations(j, classPathRoot);
        const refDeclarations = extractCreateRefs(j, classPathRoot);
        replaceSetStateCalls(j, classPathRoot);
        removeBindThis(j, classPathRoot);
        removeThis(j, classPathRoot);
        const useEffectHooks = extractLifecycleHooks(j, classPathRoot);
        handleImports(j, root, stateInitializations.length > 0, useEffectHooks.length > 0, refDeclarations.length > 0);
        const renderBody = extractRenderBody(j, classPathRoot);
        const otherDeclarations = extractOtherDeclarations(j, classPathRoot);
        const hasExportKeyword = checkNamedExportKeyword(j, root, className);

        const functionalComponent = `
        ${hasExportKeyword ? 'export' : ''} const ${className} = (props) => {
        ${stateInitializations.join('\n ')}
        ${refDeclarations.join('\n ')}
        ${useEffectHooks.join('\n ')}
        ${otherDeclarations.join('\n ')}
        ${renderBody}
        }
        `;

        classPathRoot.replaceWith(functionalComponent);
    });

    return root.toSource();
};

export default transformer;
