# Frontend Folder Structure

This document describes the standard folder structure for the frontend of a Quan ERP plugin.

## Directory Layout

The frontend code is located in `plugins/<plugin-name>/frontend/`.

```text
frontend/
├── public/                # Static assets (images, icons, etc.)
├── src/
│   ├── components/        # Shared components within the plugin
│   ├── lib/               # Utilities, global state, and core client setup
│   │   ├── axios.ts       # Axios client instance (initialized on register)
│   │   ├── global-store.ts # Global registry access (initialized on register)
│   │   └── metadata.ts    # Plugin metadata helper (from module.metadata.json)
│   ├── page/              # Feature modules containing UI and logic
│   │   ├── <feature-1>/
│   │   │   ├── components/     # Specialized sub-components
│   │   │   ├── <feature-1>.api.ts      # API call definitions
│   │   │   ├── <feature-1>.queries.ts  # React Query hooks (GET)
│   │   │   ├── <feature-1>.mutations.ts # React Query hooks (POST/PUT/DELETE)
│   │   │   ├── <feature-1>.table.tsx   # Main entry component (e.g., a table)
│   │   │   ├── <feature-1>.types.ts    # TypeScript interfaces
│   │   │   └── <feature-1>.constants.ts # Constants (query keys, etc.)
│   │   └── index.tsx      # Main plugin registration (Routes, Menus)
│   ├── export.ts          # Exports for other plugins
│   ├── index.css          # Plugin styles
│   └── index.tsx          # Main entry and registration point
├── vite.config.ts         # Build configuration
├── tailwind.config.js     # Styling configuration
├── tsconfig.json          # TypeScript configuration
└── package.json           # Dependencies and scripts
```

## Description of Key Directories

### `public/`
Contains static assets that are served directly by the browser, such as icons, images, or configuration files that don't need to be bundled by Vite.

### `src/page/`
UI logic is organized by feature. Each feature folder follows a standardized pattern to separate logic from UI:
- **`*.api.ts`**: Bare Axios calls to the backend.
- **`*.queries.ts` / `*.mutations.ts`**: React Query wrappers for the API calls.
- **`*.types.ts`**: Types shared between the API and UI components.
- **`index.tsx`**: Often used as the entry point for that specific page module.

### `src/lib/`
Contains the "glue" that connects the plugin to the base application. These files are typically boilerplate and should be present in every plugin:
- **`axios.ts`**: Manages the local Axios instance. It is initialized during the plugin's `register` call with the client provided by the host application's `AppRegistry`.
- **`global-store.ts`**: Holds a reference to the `AppRegistryState`. This allows components and utilities inside the plugin to access global application state without prop-drilling.
- **`metadata.ts`**: A typed wrapper for the `module.metadata.json` file, allowing easy access to plugin version, name, and dependencies within the code.

### `src/index.tsx`
This is the most important file in the frontend. It uses the `register` method to inject:
- **Routes**: Mapping URLs to page components.
- **Menu Items**: Adding links to the sidebar.
- **Home Shortcuts**: Adding icons to the dashboard.
- (See [Frontend Routing](./routing.md) for details).

## Best Practices
1. **Separation of Concerns**: Don't put API logic directly inside UI components (`.tsx`). Use the `.api.ts` and React Query files.
2. **Feature Encapsulation**: Keep everything related to a feature (types, api, components) within its own folder under `src/page/`.
3. **Consistent Naming**: Use kebab-case for directories and predictable suffixes (`.table.tsx`, `.api.ts`) for files.
