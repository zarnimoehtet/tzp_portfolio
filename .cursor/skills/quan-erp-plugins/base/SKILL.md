# Base Plugin API Guide (Frontend)

> [!NOTE]
> This is a specialized skill for the **Base Plugin**. For a general overview of plugin development patterns, see the [Main Plugin Skill](../SKILL.md).

This skill documents the available APIs, hooks, and stores provided by the `base` plugin. These are the core infrastructure components of the Quan ERP ecosystem.

> [!IMPORTANT]
> **Strict Import Rule**: All base APIs, hooks, and components MUST be imported from `@quan-erp/base-frontend`. Never import from internal paths of the base plugin.

```typescript
// CORRECT
import { useBranchQuery, useNavMenuStore } from "@quan-erp/base-frontend";

// INCORRECT
import { useBranchQuery } from "../../../base/frontend/src/api/branch/branch.export";
```

## 1. Master Data Management

> [!NOTE]
> Most query hooks return a `ResponseDto<T>`, where the actual data is located in the `payload` property.

### Branches
- `useBranchQuery(skip: number, limit: number, search?: string)`: List branches. Returns `ResponseDto<BranchDto[]>`.
- `useCreateBranchQuery()`: Mutation to create a branch. Payload: `UpdateBranchDto`.
- `useUpdateBranchQuery()`: Mutation to update a branch. Payload: `{ id: number; branch: UpdateBranchDto }`.

**DTOs:**
```typescript
interface BranchDto {
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

interface UpdateBranchDto {
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

### Partners (Customers & Suppliers)
- `usePartnerQuery(skip: number, limit: number, option?: { search?: string, isSupplier?: boolean, isCustomer?: boolean })`: List partners. Returns `ResponseDto<PartnerDto[]>`.
- `useCreatePartnerQuery()`: Mutation payload is `CreatePartnerDto`.
- `useUpdatePartnerQuery()`: Mutation payload is `{ id: number; customer: CreatePartnerDto }`.

**DTOs:**
```typescript
interface CreatePartnerDto {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  phone2?: string;
  address?: string;
  city?: string;
  country?: string;
  isActive?: boolean;
  isCustomer?: boolean;
  isSupplier?: boolean;
  tags?: number[]; // IDs of tags
}

interface PartnerDto extends CreatePartnerDto {
  id: number;
  tags?: TagDto[];
  shippingAddress: PartnerShippingAddressDto[];
}
```

### Users
- `useUserQuery(skip: number, limit: number, search?: string)`: List users. Returns `ResponseDto<UserDto[]>`.
- `useCreateUserQuery()`: Mutation payload is `CreateUserDto`.
- `useUpdateUserQuery()`: Mutation payload is `{ id: string; user: UpdateUserDto }`.

**DTOs:**
```typescript
interface UserDto {
  id: number;
  name: string;
  username: string;
  role: { id: number; name: string };
}

interface CreateUserDto {
  username: string;
  name: string;
  isOwner: boolean;
  password: string;
  roleId: number;
}
```

### Currency & Exchange Rates
- `useCurrencyQuery(skip: number, limit: number)`: Returns `ResponseDto<CurrencyDto[]>`.
- `useFromCurrencyExchangeRate(fromCurrencyId: number)`: Get exchange rates.
- `useUpdateCurrencyExchangeRate()`: Update exchange rates.

**DTOs:**
```typescript
interface CurrencyDto {
  id: number;
  currency: string;
  symbol: string;
  code: string;
  decimalPlace: number;
}
```

### Units of Measurement (UOM)
- `useUnitMeasurementQuery(skip: number, limit: number)`: Returns `ResponseDto<UnitMeasurementDto[]>`.
- `useCreateUnitMeasurementQuery()`: Mutation payload `CreateUnitMeasurementDto`.
- `useUnitOfConversionQuery(fromUomId: number)`: Get conversion rules.

**DTOs:**
```typescript
interface UnitMeasurementDto {
  id: number;
  name: string;
  symbol: string;
  code: string;
  isBase: boolean;
  categoryId: number;
}

interface CreateUnitMeasurementDto {
  name: string;
  symbol: string;
  code: string;
  isBase: boolean;
  categoryId: number;
}
```

## 2. System Services

### File & Media Management
- `useMediaFilesQuery(skip: number, limit: number)`: List files. Returns `ResponseDto<MediaFileDto[]>`.
- `useUploadMediaQuery()`: Mutation payload:
  ```typescript
  { 
    file: File; 
    type: 'local' | 's3'; 
    access: 'private' | 'public'; 
    accessRoleIds: string // Comma separated Role IDs
  }
  ```

**DTOs:**
```typescript
interface MediaFileDto {
  id: number;
  filename: string;
  size: number;
  mimeType: string;
  access: 'private' | 'public';
  creator: UserDto;
}
```

### Tags
- `useTagQuery(skip: number, limit: number)`: List all tags. Returns `ResponseDto<TagDto[]>`.
- `useCreateTagQuery()`: Mutation payload `{ name: string }`.
- `useFindTagStartWithQuery(query: string, skip: number, limit: number)`: Search tags. Returns `Promise<TagDto[]>`.

### Change Logs (Audit Trails)
- `useChangeLogQuery(entityName: string, entityId: string)`: Get history.
- `useInfiniteChangeLog(entityName: string, entityId: string)`: Paginated history.

**DTOs:**
```typescript
interface ChangeLogDto {
  id: number;
  message: string;
  createdBy: UserDto;
  pluginName: string;
  createDate: string;
}
```

### Settings
- `useSettingQuery()`: Get all settings as `Record<string, SettingValue>`.
- `useSettingContext()`: React context for updating settings.
- `useSettingStore()`: Zustand store for global access.

**Setting Keys (Enum `SettingKeys`):**
- `LOCALE`, `THEME`, `DATE_FORMAT`, `TIMEZONE`, `BUSINESS_NAME`, etc.

### AI Assistant
- `useAvailableAssistantQuery()`: Returns `AIAssistantDto[]`.

**DTOs:**
```typescript
interface AIAssistantDto {
  shortId: string;
  name: string;
  description: string;
  icon: string;
  model: AIModelDto;
  tools: { pluginName: string, fnName: string }[];
}
```

## 3. UI & State Management (Zustand Stores)

### NavMenu Store (`useNavMenuStore`)
Used to customize the top navigation bar per page.
```typescript
const { label, leading, navMenuItem, navMenuActionItem } = useNavMenuStore();

// Set Page Title
label.set("My Page Title");

// Set Leading Component (e.g., Back Button)
leading.setBackButton();

// Add Custom Actions (Top Right)
navMenuActionItem.set([<Button>Action 1</Button>, <Button>Action 2</Button>]);
```

### BottomNavBar Store (`useBottomNavBarStore`)
```typescript
const { visibility } = useBottomNavBarStore();
visibility.hide(); // Hide bottom nav for specific pages
```

## 4. Notifications (Registry Pattern)

Register callbacks to handle incoming notifications from specific plugins.

```typescript
import { inAppNotificationRegistry } from "@quan-erp/base-frontend";

// Register
const registrationId = inAppNotificationRegistry.register("hr", (notification) => {
  console.log("New HR notification:", notification.title);
});

// Deregister on unmount
inAppNotificationRegistry.deregister(registrationId);
```

**Types:**
- `inAppNotificationRegistry`: For web-socket/polling notifications.
- `firebaseForegroundNotificationRegistry`: For FCM foreground notifications.
- `firebaseBackgroundNotificationRegistry`: For FCM background notifications.

## 5. Common Utilities

- `navigate(path: string)`: Global navigation.
- `queryClient`: Shared TanStack Query client.
- `getViteEnv(key: string)`: Access environment variables.
- `useDashboardContext()`: Shared context for dashboard widgets.
