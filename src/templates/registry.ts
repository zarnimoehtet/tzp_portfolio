import { DEFAULT_TEMPLATE, type TemplateId } from "./ids";
import { MinimalTemplate } from "./minimal";
import type { SiteTemplate } from "./types";

/**
 * To add a template: create `templates/<name>/` implementing `SiteTemplate`,
 * add its id to `TEMPLATE_OPTIONS` in `./ids.ts`, and register it here.
 */
const templates: Record<TemplateId, SiteTemplate> = {
  minimal: MinimalTemplate,
};

export function getTemplate(id: string | null | undefined): SiteTemplate {
  return templates[id as TemplateId] ?? templates[DEFAULT_TEMPLATE];
}
