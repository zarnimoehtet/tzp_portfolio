# Quan ERP Development Skill

This skill provides the knowledge and patterns required to develop, maintain, and extend plugins for the Quan ERP system.

## Overview

Quan ERP is a plugin-based system where each module (Inventory, Accounting, HR, etc.) is a standalone plugin. Plugins follow a strict structure for both backend and frontend.

## Core Reference Documentation

Use these references to ensure consistency with the system's architecture:

### General
- [Folder Structure](./references/plugin-development-folder-structure.md): The standard layout for every plugin.
- [How Plugins Work](./references/how-plugins-work.md): The lifecycle and integration patterns for plugins.
- [Technology Stack](./references/technology-stack.md): The core technologies used in backend and frontend.
- [Plugin Lifecycle & CLI](./references/plugin-lifecycle-cli.md): The build, distribution, and installation process.
- [Package Naming Convention](./references/package-json-naming.md): Standards for `package.json` naming in plugins.

### Backend Development
- [Backend Annotations](./references/backend/annotations.md): Essential decorators for Controllers and Services.
- [AI Tool Registration](./references/backend/add-ai-tools.md): How to expose service methods as AI tools using `@AITool`.
- [Entity Annotations](./references/backend/entity-annotation.md): TypeORM and AI-specific decorators for DB entities.
- [Backend Folder Structure](./references/backend/folder-structure.md): The standard backend layout.
- [Backend Assets](./references/backend/backend-assets.md): How to manage and retrieve plugin-specific backend assets.
- [File & Folder Management](./references/backend/plugin-folder-file-folder.md): How plugins handle runtime-generated data, temporary files, and bundled static assets.
- [Plugin Root Module](./references/backend/plugin-root-module.md): Configures the plugin entry point.
- [Module Metadata](./references/backend/module.metadata.md): Documentation for the `module.metadata.json` configuration.
- [DB Entity Definition](./references/backend/how-to-define-db-entity.md): Guidelines for defining database entities.
- [Cross-Plugin Service Export](./references/backend/how-to-export-service-that-use-in-other-plugins.md): How to export and consume services across plugins.
- [Built-in Entities](./references/backend/builtin-entitites.md): Reference for core ERP entities (Auth, Location, etc.).
- [Built-in Services](./references/backend/builtin-service.md): Reference for core application services.
- [Request & Response DTOs](./references/backend/request-response-dto.md): Mandatory wrapping patterns for API communication.
- [How to Create Middleware](./references/backend/how-to-create-middleware.md): Guidelines for custom decorators and class-based middleware.
- [How to Seed Data](./references/backend/how-to-seed-data.md): Patterns for initializing default data and configurations.

### Frontend Development
- [Frontend Folder Structure](./references/frontend/folder-structure.md): The standard frontend layout.
- [Frontend Routing](./references/frontend/routing.md): How to define and register routes in the frontend.
- [Frontend Page Standard](./references/frontend/page-layout.md): Standard structure using `<Page>`, `<PageTitle>`, and `<PageContent>`.
- [Frontend Localization](./references/frontend/localization.md): How to use `useLocaleTranslation` and `translation.get`.
- [Icon Selection](./references/frontend/icon-pack.md): Recommended icon packages for consistent UI.
- [Plugin Assets](./references/frontend/plugin-assets.md): How to resolve and use static assets in plugins.
- [Cross-Plugin Frontend Usage](./references/frontend/using-other-plugin-lib-or-component.md): How to share and consume components/logic across plugins.
- [UI Library](./references/frontend/ui-library.md): Overview of components based on `@quan-erp/shared-ui`.
- [Call Backend API](./references/frontend/call-backend-api.md): Standards for frontend-to-backend communication.
- [CSS Styling & Isolation](./references/frontend/css-styling.md): Mandatory scoping with `data-plugin` for Tailwind CSS.
- [Bottom Nav Visibility](./references/frontend/bottom-nav-visilibility-management.md): Managing mobile bottom navigation visibility and back buttons.
- [Adding Dashboard Widget](./references/frontend/adding-dashboard-widget.md): How to register and implement widgets for the main dashboard.
- [Adding Home Shortcut](./references/frontend/adding-home-shortcut.md): How to register quick-access shortcuts on the home screen.
- [Adding Sportlight Search](./references/frontend/adding-sportlight-search.md): How to contribute navigation and data search to the global search.
- [Adding Report](./references/frontend/adding-report.md): How to contribute reports to the global report section.
- [Base Frontend Overview](./references/frontend/base-frontend.md): Overview of core platform services and components.
- [Floating Action Button (FAB)](./references/frontend/how-to-add-floating-action-button.md): Implementing single and multi-button FABs for mobile.

### Shared Libraries
- [Shared Types](./references/shared-types/shared-types.md): Fundamental type definitions across the platform.
- [Shared Frontend Core](./references/shared-frontend-core/shared-frontend-core.md): API reference for hardware, sensors, and system services.
- [Shared UI](./references/shared-ui/shared-ui.md): Component and theme reference for the UI library.
- [Web Thermal Printer](./references/web-thermal-printer/web-thermal-printer.md): API reference for ESC/POS web thermal printing (Bluetooth/Serial).
- [External Plugins Skill](../quan-erp-plugins/SKILL.md): Master index and specialized patterns for external plugin development.

## Development Guidelines

1. **Namespace isolation**: Always use the plugin's namespace for database entities, translations, and API routes.
2. **Dependency Awareness**: Before implementing features that rely on other modules, check the `pluginDependencies` in `module.metadata.json`.
3. **Core Library Usage**: Prefer utilities and decorators from `@quan-erp/shared-backend-core` and `@quan-erp/shared-frontend-core` instead of implementing custom logic for common ERP tasks.
4. **Standard Responses**: Always use `ResponseDto` for backend API responses to ensure a consistent experience for the frontend.
