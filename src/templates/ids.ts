/**
 * Template identifiers, kept free of React imports so they can be used in
 * validation schemas and client components. Register implementations in
 * `./registry.ts`.
 */
export const TEMPLATE_OPTIONS = [
  {
    id: "minimal",
    label: "Minimal",
    description: "Off-white, editorial typography, photography-first.",
  },
] as const;

export type TemplateId = (typeof TEMPLATE_OPTIONS)[number]["id"];

export const TEMPLATE_IDS = TEMPLATE_OPTIONS.map((t) => t.id) as [
  TemplateId,
  ...TemplateId[],
];

export const DEFAULT_TEMPLATE: TemplateId = "minimal";
