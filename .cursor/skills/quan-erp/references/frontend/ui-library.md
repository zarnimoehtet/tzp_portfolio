# UI Library Reference

The official UI library for Quan ERP plugin development is **`@quan-erp/shared-ui`**. 

## Core Foundation

This library is built on top of **Shadcn UI**, providing a modern, consistent, and premium interface across all modules.

### Shared UI Integration
- **Shadcn Components**: All standard Shadcn components (Button, Table, Dialog, etc.) are bundled and exported from this library.
- **ERP-Specific Components**: Includes custom components like `ResponsiveDialog` for seamless desktop/mobile support.
- **I18n Hooks**: Provides `useLocaleTranslation` for managing multi-language content.

For a detailed list of components, hooks, and example usage, please refer to the:
**[Shared UI Documentation](../shared-ui/shared-ui.md)**

## Styling & CSS Isolation

Quan ERP uses scoped Tailwind CSS for plugins to prevent style leakage. This requires specific implementation patterns, especially when using portaled components like Dialogs or Sheets.

For detailed instructions on maintaining style isolation, refer to the:
**[CSS Styling & Isolation Reference](./css-styling.md)**

## Best Practices
1. **Always import from `@quan-erp/shared-ui`**: Never install individual UI libraries or Shadcn components directly in your plugin.
2. **Follow the Design System**: Use the provided variants and utility classes to ensure your plugin feels like a native part of the system.

