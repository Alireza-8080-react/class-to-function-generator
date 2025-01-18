import { Collection, JSCodeshift } from 'jscodeshift';

export const checkNamedExportKeyword = (j: JSCodeshift, root: Collection<any>, className: string) => {
    return root.find(j.ExportNamedDeclaration, { declaration: { id: { name: className } } }).length > 0;
};
