# Frontend Localization Standard

Every UI string in a Quan ERP plugin must be localized to support multi-language environments (e.g., English and Burmese and Chinese).

## Core Mechanisms

Localization is handled via the `@quan-erp/shared-frontend-core` library using a specialized hook and translation object.

### 1. Defining a Locale File
Create a locale definition file (usually in `src/lib/` or `src/locale/`). The file should export a constant of type `LocaleType` that contains nested objects for each supported language.

**Structure:**
- **Top-level keys**: Language codes (e.g., `en-US`, `my-MM`, `zh-CN`).
- **Inner-level keys**: Unique translation keys used throughout your plugin.

```typescript
import type { LocaleType } from "@quan-erp/shared-ui";

export const MyPluginLocale: LocaleType = {
    "en-US": {
        "fleet-management": "Fleet Management",
        "save": "Save",
        // ...
    },
    "my-MM": {
         "fleet-management": "ယာဉ်စီမံခန့်ခွဲမှု",
         "save": "သိမ်းဆည်းပါ",
         // ...
    },
    "zh-CN": {
         "fleet-management": "车队管理",
         "save": "保存",
         // ...
    }
};
```

### 2. The `useLocaleTranslation` Hook
This hook initializes the translation system for a specific plugin or module by taking the locale configuration file defined above.

```tsx
import { useLocaleTranslation } from "@quan-erp/shared-ui";
import { MyPluginLocale } from "./locale"; // Path to your locale definition

export default function MyComponent() {
    const translation = useLocaleTranslation(MyPluginLocale);
    // ...
}
```

### 2. The `translation.get` Method
The `translation` object provides a `get` method to retrieve localized strings.

**Signature:**
`translation.get(key: string, defaultValue: string): string`

- **`key`**: The unique identifier for the string in the locale files.
- **`defaultValue`**: The fallback string in English to display if no translation is found.

---

## Usage Example

```tsx
<Page
    navMenu={{
        menuTitle: (
            <PageNavTitle>
                {translation.get("expense-management", "Expense Management")}
            </PageNavTitle>
        ),
    }}
>
    <Button>
        {translation.get("new-expense", "New Expense")}
    </Button>
</Page>
```

---

## Best Practices

1.  **Always Provide Defaults**: Always include a descriptive default value as the second argument to `get()`. This serves as the primary source of truth for English users.
2.  **Contextual Keys**: Use descriptive, kebab-case keys (e.g., `save-button-label`, `error-message-invalid-input`) to make the locale files easier to maintain.
3.  **Standard Formatting**: Avoid hardcoded strings anywhere in the JSX. If a string is visible to the user, it MUST go through `translation.get()`.
4.  **Shared Locales**: For common ERP terms (e.g., "Save", "Cancel", "Date"), check if they are available in `@quan-erp/shared-frontend-core`'s common translation before creating a custom key.
