# Class Component to Functional Component Converter

This JSCodeshift transformer converts React class components into functional components. It aims to streamline your codebase by leveraging modern React features.

## Conversion Accuracy

The converter achieves approximately **80% accuracy** in transforming class components to functional components. While it handles most cases effectively, some scenarios may require manual adjustments.

## Simple Case Usage

For a straightforward conversion of all class components in a specified
directory, you can run the following command:

```bash
npx class-to-function-generator <path-to-your-files>
```

## Core Features

- **TypeScript Support**: Fully compatible with TypeScript, ensuring type safety during the transformation.
- **State Separation**: Extracts state initializations and manages them effectively.
- **Handles useEffect**: Converts lifecycle methods into `useEffect` hooks, maintaining the component's functionality.

## Drawbacks

1. **Merged useEffects**: The transformer merges all `useEffect` hooks with dependencies into a single hook. You will need to review and adjust these hooks to ensure they function as intended.
2. **Complex Object Handling**: The converter does not fully understand complex objects for state initialization. For example:

   ```typescript
   state = {
     x: 1,
     y: 2,
     [this.props.state]: 3,
   };
   ```

   In such cases, you may need to manually adjust the initialization logic.

## Important Note

It's essential to understand that class components and functional components serve different purposes in React. Converting one to another may not always be practical, as the underlying logic and structure can differ significantly. After conversion, you must refactor the code to ensure it meets your application's requirements. However, this generator will make the initial transformation easier for you.

## Options

Currently, the transformer supports a single option: **classNames**. This option allows you to specify which classes to refactor. If you have multiple classes and only want to refactor specific ones, you can use this option.

### Usage Example

To use the `classNames` option, specify it in the command line as follows:

```bash
npx class-to-function-generator --classNames=Calendar,TextFieldWithValidation <path-to-your-files>
```
