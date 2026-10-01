# Base Frontend Reference

This document lists the core APIs, components, stores, and DTOs available in the `base` frontend that can be used by plugins via the `useAppRegistry` or direct imports from `@quan-erp/base-frontend`.

## APINames

The `APINames` enum defines the keys for accessing shared services and hooks through the registry.

| Name | Key | Description |
|------|-----|-------------|
| `useAppRegistry` | `useAppRegistry` | Hook to access the app registry |
| `queryClient` | `queryClient` | The global TanStack Query client |
| `navigate` | `navigate` | Navigation function |
| `inAppNotificationRegistry` | `inAppNotificationRegistry` | Registry for in-app notifications |
| `firebaseForegroundNotificationRegistry` | `firebaseForegroundNotificationRegistry` | Registry for Firebase foreground notifications |
| `firebaseBackgroundNotificationRegistry` | `firebaseBackgroundNotificationRegistry` | Registry for Firebase background notifications |
| `useNavMenuStore` | `useNavMenuStore` | Store for navigation menu management |
| `useBottomNavBarStore` | `useBottomNavBarStore` | Store for bottom navigation bar |
| `useRootComponentStore` | `useRootComponentStore` | Store for root component state |
| `useHomeShortcutStore` | `useHomeShortcutStore` | Store for home screen shortcuts |
| `ShortcutItem` | `ShortcutItem` | Component/Type for shortcut items |
| `useSettingQuery` | `useSettingQuery` | Query for application settings |
| `useUpdateSettingQuery` | `useUpdateSettingQuery` | Mutation for updating settings |
| `useSettingStore` | `useSettingStore` | Store for application settings |
| `useSettingContext` | `useSettingContext` | Context for application settings |
| `useIsContainInBottomNavBar` | `useIsContainInBottomNavBar` | Utility hook for bottom nav bar presence |
| `AllowedAPIPermissions` | `allowed-api-permission` | Constant for API permissions |
| `usePerimssionTemplateStore` | `usePerimssionTemplateStore` | Store for permission templates |
| `useBranchQuery` | `useBranchQuery` | Query for branch data |
| `useCreateBranchQuery` | `useCreateBranchQuery` | Mutation for creating branches |
| `useUpdateBranchQuery` | `useUpdateBranchQuery` | Mutation for updating branches |
| `usePartnerQuery` | `usePartnerQuery` | Query for partner data |
| `useCreatePartnerQuery` | `useCreatePartnerQuery` | Mutation for creating partners |
| `useUpdatePartnerQuery` | `useUpdatePartnerQuery` | Mutation for updating partners |
| `useCreateParnterShippingAddressQuery` | `useCreateParnterShippingAddressQuery` | Mutation for partner shipping addresses |
| `useUpdateParnterShippingAddressQuery` | `useUpdateParnterShippingAddressQuery` | Mutation for partner shipping addresses |
| `useDeleteParnterShippingAddressQuery` | `useDeleteParnterShippingAddressQuery` | Mutation for partner shipping addresses |
| `useCurrencyQuery` | `useCurrencyQuery` | Query for currency data |
| `useCreateCurrencyQuery` | `useCreateCurrencyQuery` | Mutation for creating currencies |
| `useUpdateCurrencyQuery` | `useUpdateCurrencyQuery` | Mutation for updating currencies |
| `useFromCurrencyExchangeRate` | `useFromCurrencyExchangeRate` | Query for exchange rates |
| `useFromCurrencyExchangeRateWithTo` | `useFromCurrencyExchangeRateWithTo` | Query for exchange rates |
| `useUpdateCurrencyExchangeRate` | `useUpdateCurrencyExchangeRate` | Mutation for exchange rates |
| `useMediaFilesQuery` | `useMediaFilesQuery` | Query for media files |
| `useUploadMediaQuery` | `useUploadMediaQuery` | Mutation for media upload |
| `useUnitMeasurementQuery` | `useUnitMeasurementQuery` | Query for Unit of Measurement |
| `useUpdateUnitMeasurementQuery` | `useUpdateUnitMeasurementQuery` | Mutation for UoM |
| `useCreateUnitMeasurementQuery` | `useCreateUnitMeasurementQuery` | Mutation for UoM |
| `useUnitMeasurementByCategoryQuery` | `useUnitMeasurementByCategoryQuery` | Query for UoM by category |
| `useUnitOfConversionQuery` | `useUnitOfConversionQuery` | Query for Unit of Conversion |
| `useUnitOfConversionToQuery` | `useUnitOfConversionToQuery` | Query for Unit of Conversion |
| `useUserQuery" | `useUserQuery` | Query for user data |
| `useUpdateUserQuery` | `useUpdateUserQuery` | Mutation for updating users |
| `useCreateUserQuery` | `useCreateUserQuery` | Mutation for creating users |
| `getViteEnv` | `getViteEnv` | Utility to get Vite environment variables |
| `useCreateTagQuery` | `useCreateTagQuery` | Mutation for creating tags |
| `useTagQuery` | `useTagQuery` | Query for tags |
| `NewTagDialog` | `NewTagDialog` | Dialog component for new tags |
| `useFindTagStartWithQuery` | `useFindTagStartWithQuery` | Query for tag autocompletion |
| `useDashboardContext` | `useDashboardContext` | Context for dashboard state |
| `ChangeLog` | `ChangeLog` | Component for displaying change logs |
| `useChangeLogQuery` | `useChangeLogQuery` | Query for change logs |
| `useInfiniteChangeLog` | `useInfiniteChangeLog` | Infinite query for change logs |
| `useReactChangeLogQuery` | `useReactChangeLogQuery` | Mutation to react to change logs |
| `useRemoveReactChangeLogQuery` | `useRemoveReactChangeLogQuery` | Mutation to remove reaction from change logs |
| `SportlightSearchCallback` | `SportlightSearchCallback` | Callback for spotlight search |
| `SportligthSearchStore` | `SportligthSearchStore` | Store for spotlight search |
| `useAvailableAssistantQuery` | `useAvailableAssistantQuery` | Query for available AI assistants |

## Exported Features

The base frontend exports various modules that can be imported and used within plugins.

### API & Data Fetching
- **Settings**: `setting.export`
- **Permissions**: `permission.export`
- **Currency & Exchange**: `currency-exchange.export`, `currency.export`
- **Branches**: `branch.export`
- **Partners**: `partner.export`, `partner-shipping-adderss.export`
- **Files & Media**: `file.export`
- **Units (UoM/UoC)**: `uom.export`, `uoc.export`
- **Users**: `user.export`
- **Notifications**: `notification.export`
- **Tags**: `tag.export`
- **Change Log**: `change-log.export`
- **Firebase**: `firebase.export`
- **AI Assistant**: `ai-assistant.export`

### Components
- **Tagging**: `NewTagDialog`
- **Change Log**: `ChangeLog` component
- **Home Shortcuts**: `HomeShortcutItem`
- **Search**: `SportlightSearch`

### Stores
- **Navigation**: `useNavMenuStore`, `useBottomNavBarStore`
- **Home Screen**: `useHomeShortcutStore`
- **Root State**: `useRootComponentStore`
- **Permissions**: `usePerimssionTemplateStore`

### Localization
- **Locale**: `locale.export` provides translation utilities and resources.

## Common Data Types & DTOs

### Core
```typescript
interface BaseDto {
    createDate: Date;
    updateDate: Date;
    deleteDate: Date;
}
```

### Settings
```typescript
type SettingDataType = "string" | "number" | "boolean" | "json" | "date" | 'string-array';
type SettingValue = { value: any, datatype: SettingDataType, isPublic: boolean, userId?: number };
type SettingMapValue = Record<string, SettingValue>;
```

### Branch
```typescript
class BranchDto extends BaseDto {
    id: number;
    name: string;
    address?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
    phone?: string;
    email?: string;
    isActive: boolean;
}
```

### User & Roles
```typescript
interface UserDto {
    id: number;
    name: string;
    username: string;
    role: {
        id: number;
        name: string;
    }
}

interface RoleDto {
    id: number;
    name: string;
    permissions: string[];
}
```

### Partner & Shipping
```typescript
interface PartnerDto {
    id: number;
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
    address?: string;
    city?: string;
    country?: string;
    isActive?: boolean;
    isCustomer: boolean;
    isSupplier: boolean;
    tags?: TagDto[];
    shippingAddress: PartnerShippingAddressDto[];
}

type PartnerShippingAddressDto = {
    id: number;
    address?: string;
    city?: string;
    country?: string;
    postalCode?: string;
}
```

### Currency & Exchange
```typescript
interface CurrencyDto extends BaseDto {
    id: number;
    currency: string;
    symbol: string;
    code: string;
    decimalPlace: number;
}

interface FromCurrencyExchangeRateDto {
    id: number;
    fromCurrencyId: number;
    fromCurrencyCode: string;
    toCurrencyId: number;
    toCurrencyCode: string;
    rate: number;
}
```

### Files & Media
```typescript
interface MediaFileDto {
    id: number,
    createDate: Date;
    filename: string;
    size: number;
    mimeType: string;
    access: 'private' | 'public';
}
```

### Units of Measurement (UoM/UoC)
```typescript
interface UnitCategoryDto {
    id?: number;
    name: string;
}

interface UnitMeasurementDto {
    id: number;
    name: string;
    symbol: string;
    code: string;
    isBase: boolean;
    category: UnitCategoryDto;
}

type UnitOfConversionDto = {
    fromUnitId: number;
    toUnitId: number;
    conversionFactor: number;
}
```

### Notifications
```typescript
type NotificationDto = {
    id: number;
    icon?: MediaFileDto;
    title?: string;
    body?: string;
    topic: string;
    url?: string;
    isRead: boolean;
    createDate: string;
    pluginName: string;
}
```

### Change Log
```typescript
interface GetChangeLogDto {
    id: number;
    message: string;
    createdBy: UserDto;
    isCreatedBySystem: boolean;
    pluginName: string;
    referencePrefix: string;
    referenceNumber: string;
    createDate: string;
    reactions: ChangeLogReaction[];
}

interface ChangeLogReaction {
    id: number;
    reaction: string;
    reactBy: UserDto;
}
```

### AI Assistant
```typescript
interface AIAssistantDto {
    shortId: string;
    name: string;
    description: string;
    icon: string;
    model: AIModelDto;
    tools: { pluginName: string, fnName: string }[];
    allowedRoles: RoleDto[];
}

interface AIModelDto {
    id: number;
    name: string;
    sdkType: string;
    model: string;
    isActive: boolean;
}
```

### Tag
```typescript
type TagDto = {
    id: number;
    name: string;
}
```

## Usage in Plugins

When developing a plugin, you can access these features by registering them or using the registry hook:

```typescript
import { useAppRegistry, APINames } from "@quan-erp/shared-frontend-core";

const registry = useAppRegistry();
const queryClient = registry.get(APINames.queryClient);
const navigate = registry.get(APINames.navigate);
```
