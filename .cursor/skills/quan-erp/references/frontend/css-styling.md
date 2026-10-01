# CSS Styling & Isolation

> [!NOTE]
> This document focus on CSS isolation and styling patterns. For a list of available components and their usage, see the [Shared UI Reference](../shared-ui/shared-ui.md).

Quan ERP uses a sophisticated CSS isolation mechanism to ensure that plugin styles (generated via Tailwind CSS) do not leak into the core system or other plugins.

## Isolation Mechanism

During the plugin build process, all Tailwind CSS classes are automatically transformed into scoped selectors using the `[data-plugin]` attribute.

**Example Transformation:**
Original Tailwind class: `.text-xs`
Transformed Selector: 
```css
[data-plugin=loan].text-xs,
[data-plugin=loan] .text-xs {
    font-size: var(--text-xs);
    line-height: var(--tw-leading, var(--text-xs--line-height))
}
```

## Mandatory Implementation Steps

### 1. The `<Page>` Component
Every plugin page **MUST** pass the `pluginName` prop to the `<Page>` component. This ensures the page container is tagged with the correct `data-plugin` attribute.

```tsx
import { Page } from "@quan-erp/shared-ui";
import { metadata } from "../lib/metadata";

export default function MyPage() {
    return (
        <Page pluginName={metadata.name}>
            {/* Page Content */}
        </Page>
    );
}
```

### 2. Handling Portals (Modals, Dialogs, Sheets)
Components like Modals, Dialogs, and Sheets are often "portaled" to the document root (outside the `<Page>` hierarchy). Because the CSS selectors strictly require a `[data-plugin]` parent or self-attribute, styles inside these portals will break by default.

> [!IMPORTANT]
> When using Portals, you **MUST** apply the `data-plugin` attribute to the root element of the portal content.

**Incorrect (Styles will break):**
```tsx
<SheetContent>
    <div className="bg-primary p-4">...</div>
</SheetContent>
```

**Correct (Styles preserved):**
```tsx
<SheetContent data-plugin={metadata.name}>
    <div className="bg-primary p-4">...</div>
</SheetContent>
```

## Best Practices

- **Enforce Shared UI Components**:
    - **ALWAYS** use components from `@quan-erp/shared-ui` instead of raw HTML or custom styled components where possible.
    - These components are pre-configured to work with the design system and many handle internal styling needs (like table borders) automatically.
- **Prefer Utility Classes**: Use Tailwind utility classes directly in your JSX.
- **Avoid Global CSS**: Do not write raw CSS selectors in `index.css` that aren't wrapped in `@layer components` or `@layer utilities`, as the isolation layer targets Tailwind's output.
- **Tailwind Borders**:
    - **NEVER** use the `border` class alone (e.g., `className="border"`).
    - **ALWAYS** include a color class. Use `border-border` for the standard default border color (e.g., `className="border border-border"`).
- **Table Components**:
    - The `<Table>` component from `@quan-erp/shared-ui` is based on Shadcn UI.
    - **DO NOT** wrap it with a `div` if it's not strictly required for layout or scrolling, as the component already handles its internal structure.
- **Check DevTools**: If a style isn't applying, verify that the element (or one of its parents) has the correct `data-plugin` attribute matching your plugin name.
