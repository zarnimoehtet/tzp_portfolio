# Frontend Page Standard

To maintain a consistent UI and integration with the system's navigation and layout, every page in a Quan ERP plugin must follow the `<Page>` component standard.

## Standard Structure

Every page component's return value should follow this hierarchy:

```tsx
<Page pluginName={metadata.name} 
    navMenu={{
        menuTitle: <PageNavTitle>Menu Title</PageNavTitle>,
        leadingBackButton: true | false
    }}
    bottomNav={{
        visible: true | false
    }}
    className="w-full h-full overflow-y-auto"
>
    <PageTitle>
        {/* Page label */}
    </PageTitle>
    <PageContent>
        {/* Main Content, Tables, Lists, Forms */}
    </PageContent>
</Page>
```

---

## Component API Reference

### 1. `<Page>`
The root container that handles layout, navigation registration, and theme integration.

**Key Props:**
- **`pluginName`**: (Required) The name of the plugin, usually imported from `module.metadata.json`.
- **`navMenu`**: Configuration for the top navigation bar.
    - `menuTitle`: JSX element for the title (usually wrapped in `<PageNavTitle>`).
- **`bottomNav`**: Configuration for the bottom navigation bar (commonly used in mobile views).
    - `visible`: Set to `false` to hide the bottom navigation.

### 2. `<PageTitle>`
Defines the header area of the page. This area remains visible during scrolling in some layouts.
- Use it to display the page title.
- Place primary action buttons (e.g., "Add New", "Save") here for consistent positioning.

### 3. `<PageContent>`
The main container for the page logic and data display.
- All primary UI elements (Tables, Cards, Forms) should be placed inside this component.

---

## Full Usage Example

This example demonstrates a standard page with a title, a "New" action button, and controlled navigation.

```tsx
import { Page, PageTitle, PageContent, PageNavTitle, useTranslation } from "@quan-erp/shared-frontend-core";
import { Button } from "@/components/ui/button";
import { Plus } from "@icon-park/react";
import metadata from "../../module.metadata.json" with { type: "json" };

export default function MyPluginPage() {
    const translation = useTranslation();

    return (
        <Page
            pluginName={metadata.name}
            navMenu={{
                menuTitle: (
                    <PageNavTitle>
                        {translation.get("management-title", "Management Title")}
                    </PageNavTitle>
                ),
            }}
            bottomNav={{ visible: false }}
        >
            <PageTitle>
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="text-xl font-bold">
                        {translation.get('page-title', 'Overview')}
                    </div>
                    <Button 
                        className="ml-auto" 
                        onClick={() => console.log('Action Clicked')}
                    >
                        <Plus theme="outline" size="24" fill="#fff" />
                        {translation.get('new-action', 'Create New')}
                    </Button>
                </div>
            </PageTitle>

            <PageContent>
                {/* Main page content goes here */}
                <div>Welcome to my custom plugin page!</div>
            </PageContent>
        </Page>
    );
}
```

---

## Best Practices

1.  **Mobile Awareness**: Use the `isMobile` hook or CSS utilities to adjust `<PageTitle>` content for smaller screens.
2.  **Consistent Actions**: Always put your page's primary "CTA" (Call to Action) in the `<PageTitle>` section so users can easily find it on any page.
3.  **Metadata Injection**: Always pass `metadata.name` to the `pluginName` prop to ensure the system correctly associates the page with its parent plugin.
