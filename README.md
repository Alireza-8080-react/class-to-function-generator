# Class Component to Functional Component Converter

This JSCodeshift transformer converts React class components into functional components. It aims to streamline your codebase by leveraging modern React features.

## Conversion Accuracy

The converter achieves approximately **80% accuracy** in transforming class components to functional components. While it handles most cases effectively, some scenarios may require manual adjustments.

## Core Features

- **TypeScript Support**: Fully compatible with TypeScript, ensuring type safety during the transformation.
- **State Separation**: Extracts state initializations and manages them effectively.
- **Handles useEffect**: Converts lifecycle methods into `useEffect` hooks, maintaining the component's functionality.

## Drawbacks

1. **Merged useEffects**: The transformer merges all `useEffect hooks with dependencies` into a single hook. You will need to review and adjust these hooks to ensure they function as intended.
2. **Complex Object Handling**: The converter does not fully understand complex objects for state initialization. For example:
   ```ts
   state = {
     x: 1,
     y: 2,
     [this.props.state]: 3,
   };
   ```
   In such cases, you may need to manually adjust the initialization logic.

## Options

Currently, the transformer supports a single option: **classNames**. This option allows you to specify which classes to refactor. If you have multiple classes and only want to refactor specific ones, you can use this option.

### Usage Example

To use the `classNames` option, specify it in the command line as follows:

```bash
jscodeshift -t path/to/transformer.ts --classNames=Calendar,TextFieldWithValidation <path-to-your-files>
```
