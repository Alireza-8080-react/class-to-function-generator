import { Collection, ImportSpecifier, JSCodeshift } from "jscodeshift";

const handleImports = (
  j: JSCodeshift,
  root: Collection<any>,
  needsState: boolean,
  needsEffect: boolean,
  needsRef: boolean
) => {
  const importSpecifiers: ImportSpecifier[] = [];

  // Determine which imports are needed
  if (needsState) {
    importSpecifiers.push(j.importSpecifier(j.identifier("useState")));
  }
  if (needsEffect) {
    importSpecifiers.push(j.importSpecifier(j.identifier("useEffect")));
  }
  if (needsRef) {
    importSpecifiers.push(j.importSpecifier(j.identifier("useRef")));
  }

  // Find the existing 'react' import
  const existingImport = root.find(j.ImportDeclaration, {
    source: { value: "react" },
  });

  // Remove specific imports from 'react'
  existingImport.forEach((path) => {
    path.node.specifiers = path.node.specifiers?.filter((specifier) => {
      const name = specifier.local?.name || "";
      return !["Component", "PureComponent", "createRef"].includes(name);
    });

    // Remove the import declaration if no specifiers left
    if (path.node.specifiers?.length === 0) {
      j(path).remove();
    }
  });

  // Add necessary imports
  if (importSpecifiers.length > 0) {
    if (existingImport.size() > 0) {
      // If 'react' import exists, add new specifiers to it
      existingImport.forEach((path) => {
        path.node.specifiers?.push(...importSpecifiers);
      });
    } else {
      // If 'react' import does not exist, create a new import statement
      const newImport = j.importDeclaration(
        importSpecifiers,
        j.literal("react")
      );
      root.get().node.program.body.unshift(newImport); // Insert at the beginning of the program body
    }
  }
};

export default handleImports;
