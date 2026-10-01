# Adding Dashboard Widgets

This guide explains how to add and register widgets to the dashboard in the Quan ERP frontend.

## 1. Widget Registration

Dashboard widgets must be registered within the `register` method of your plugin's entry file (usually `index.tsx`). This method is part of the `PluginModule` interface, and the `AppRegistry` object passed to it is of type `AppRegistryState`. Both `PluginModule` and `AppRegistryState` are imported from `@quan-erp/shared-types`.

```tsx
// frontend/src/index.tsx
import type { AppRegistryState, PluginModule } from "@quan-erp/shared-types";

const Plugin: PluginModule = {
    register(AppRegistry: AppRegistryState) {
        AppRegistry.dashboard.add({
            id: 'unique-widget-id', // Must be unique across all plugins
            pluginName: metadata.name,
            element: (
                <YourDashboardWidget />
            )
        })
    }
}

export default Plugin;
```

## 2. Widget Implementation

Every dashboard widget component MUST be wrapped with the `DashboardItem` component.

### Critical Rules

- **Use `DashboardItem`**: The root of your widget component must be a `DashboardItem`.
- **Unique ID**: The `id` prop of `DashboardItem` must be a unique identifier.
- **ID Consistency**: The `id` used in `AppRegistry.dashboard.add` MUST be exactly the same as the `id` prop passed to `DashboardItem`.

```tsx
// frontend/src/page/dashboard.tsx
import { DashboardItem } from "@quan-erp/shared-ui";
import { useDashboardContext } from "@quan-erp/base-frontend";

export function YourDashboardWidget() {
    const { startDate, endDate } = useDashboardContext();

    return (
        <DashboardItem 
            id="unique-widget-id" // Must match the registration ID
            colSpan={2}           // Number of columns the widget occupies
        >
            <div className="flex flex-col w-full h-[10rem] whitespace-nowrap gap-2">
                <h3>Widget Title</h3>
                <span>Start date {startDate.toLocaleDateString()}</span>
                <span>End date {endDate.toLocaleDateString()}</span>
            </div>
        </DashboardItem>
    );
}
```

## 3. Dashboard Context

Widgets have access to the dashboard's global range (e.g., date filters) via the `useDashboardContext` hook.

> [!IMPORTANT]
> Always ensure the `id` in your registry call and the `id` in your `DashboardItem` are identical. Failure to do so will break the dashboard's layout persistence and identification.
