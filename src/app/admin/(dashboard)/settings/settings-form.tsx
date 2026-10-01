"use client";

import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { FormSection, SaveBar } from "@/components/admin/form-section";
import { ImageField } from "@/components/admin/image-field";
import { NativeSelect } from "@/components/admin/native-select";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { updateSiteSettings } from "@/lib/actions/content";
import { FONT_PRESETS, isFontPreset } from "@/lib/fonts/presets";
import type { SiteSettings } from "@/lib/types";
import { siteSettingsSchema, type SiteSettingsInput } from "@/lib/validations";
import { DEFAULT_TEMPLATE, TEMPLATE_IDS, TEMPLATE_OPTIONS, type TemplateId } from "@/templates/ids";

function toForm(s: SiteSettings): SiteSettingsInput {
  return {
    photographer_name: s.photographer_name,
    logo: s.logo,
    favicon: s.favicon,
    hero_image: s.hero_image,
    hero_title: s.hero_title,
    hero_subtitle: s.hero_subtitle ?? "",
    primary_color: s.primary_color,
    secondary_color: s.secondary_color,
    font_preset: isFontPreset(s.font_preset) ? s.font_preset : "classic",
    template: (TEMPLATE_IDS as string[]).includes(s.template)
      ? (s.template as TemplateId)
      : DEFAULT_TEMPLATE,
    seo_title: s.seo_title ?? "",
    seo_description: s.seo_description ?? "",
  };
}

function ColorField({
  id,
  label,
  description,
  value,
  onChange,
  error,
}: {
  id: string;
  label: string;
  description: string;
  value: string;
  onChange: (value: string) => void;
  error?: { message?: string };
}) {
  return (
    <Field data-invalid={Boolean(error)}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <div className="flex items-center gap-2">
        <input
          type="color"
          aria-label={`${label} picker`}
          value={/^#[0-9a-f]{6}$/i.test(value) ? value : "#000000"}
          onChange={(e) => onChange(e.target.value)}
          className="h-8 w-10 cursor-pointer rounded border bg-transparent p-0.5"
        />
        <Input id={id} value={value} onChange={(e) => onChange(e.target.value)} className="w-32 font-mono" />
      </div>
      <FieldDescription>{description}</FieldDescription>
      <FieldError errors={[error]} />
    </Field>
  );
}

export function SettingsForm({ settings }: { settings: SiteSettings }) {
  const { register, control, handleSubmit, reset, formState } = useForm<SiteSettingsInput>({
    resolver: zodResolver(siteSettingsSchema),
    defaultValues: toForm(settings),
  });
  const { errors } = formState;
  const [primary, secondary, seoTitle, seoDescription] = useWatch({
    control,
    name: ["primary_color", "secondary_color", "seo_title", "seo_description"],
  });

  async function onSubmit(values: SiteSettingsInput) {
    const result = await updateSiteSettings(values);
    if (result.ok) {
      toast.success("Settings saved — your website is updated");
      reset(values);
    } else {
      toast.error(result.error);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
      <FormSection title="Branding">
        <FieldGroup>
          <Field data-invalid={Boolean(errors.photographer_name)}>
            <FieldLabel htmlFor="photographer_name">Photographer / studio name</FieldLabel>
            <Input id="photographer_name" {...register("photographer_name")} />
            <FieldDescription>
              Used in the header, footer, and page titles. Also updates About → Name.
            </FieldDescription>
            <FieldError errors={[errors.photographer_name]} />
          </Field>
          <div className="grid gap-6 sm:grid-cols-2">
            <Field>
              <FieldLabel>Logo</FieldLabel>
              <Controller
                control={control}
                name="logo"
                render={({ field }) => (
                  <ImageField
                    kind="logo"
                    aspect="aspect-[3/1]"
                    value={field.value}
                    onChange={field.onChange}
                    hint="Optional. Your name is shown when empty."
                  />
                )}
              />
            </Field>
            <Field>
              <FieldLabel>Favicon</FieldLabel>
              <Controller
                control={control}
                name="favicon"
                render={({ field }) => (
                  <ImageField
                    kind="favicon"
                    aspect="aspect-square w-28"
                    value={field.value}
                    onChange={field.onChange}
                    hint="Square image, at least 512×512."
                  />
                )}
              />
            </Field>
          </div>
        </FieldGroup>
      </FormSection>

      <FormSection title="Home page hero" description="The full-screen image and headline visitors see first.">
        <FieldGroup>
          <Controller
            control={control}
            name="hero_image"
            render={({ field }) => (
              <ImageField
                kind="hero"
                aspect="aspect-[16/9]"
                value={field.value}
                onChange={field.onChange}
                hint="Landscape works best. Shown full-screen on every device."
              />
            )}
          />
          <Field data-invalid={Boolean(errors.hero_title)}>
            <FieldLabel htmlFor="hero_title">Hero title</FieldLabel>
            <Textarea id="hero_title" rows={2} {...register("hero_title")} />
            <FieldDescription>Line breaks are kept.</FieldDescription>
            <FieldError errors={[errors.hero_title]} />
          </Field>
          <Field>
            <FieldLabel htmlFor="hero_subtitle">Hero subtitle</FieldLabel>
            <Input id="hero_subtitle" {...register("hero_subtitle")} />
          </Field>
        </FieldGroup>
      </FormSection>

      <FormSection title="Design" description="Fine-tune the look of the public website.">
        <FieldGroup>
          <div className="grid gap-6 sm:grid-cols-2">
            <Controller
              control={control}
              name="primary_color"
              render={({ field }) => (
                <ColorField
                  id="primary_color"
                  label="Primary colour"
                  description="Text, buttons and accents."
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.primary_color}
                />
              )}
            />
            <Controller
              control={control}
              name="secondary_color"
              render={({ field }) => (
                <ColorField
                  id="secondary_color"
                  label="Secondary colour"
                  description="Page background."
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.secondary_color}
                />
              )}
            />
          </div>
          <div
            className="flex items-center gap-4 rounded-lg border p-5"
            style={{ background: secondary, color: primary }}
          >
            <span className="font-serif text-2xl">Aa</span>
            <span className="text-sm">Preview of your text and background colours.</span>
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="font_preset">Fonts</FieldLabel>
              <NativeSelect id="font_preset" {...register("font_preset")}>
                {FONT_PRESETS.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.label}
                  </option>
                ))}
              </NativeSelect>
            </Field>
            <Field>
              <FieldLabel htmlFor="template">Template</FieldLabel>
              <NativeSelect id="template" {...register("template")}>
                {TEMPLATE_OPTIONS.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.label} — {t.description}
                  </option>
                ))}
              </NativeSelect>
              <FieldDescription>More templates can be added by your developer.</FieldDescription>
            </Field>
          </div>
        </FieldGroup>
      </FormSection>

      <FormSection title="Search engines (SEO)" description="How your website appears in Google and when shared.">
        <FieldGroup>
          <Field data-invalid={Boolean(errors.seo_title)}>
            <FieldLabel htmlFor="seo_title">SEO title</FieldLabel>
            <Input id="seo_title" maxLength={70} {...register("seo_title")} />
            <FieldDescription>{seoTitle.length}/70 · Defaults to your name.</FieldDescription>
            <FieldError errors={[errors.seo_title]} />
          </Field>
          <Field data-invalid={Boolean(errors.seo_description)}>
            <FieldLabel htmlFor="seo_description">SEO description</FieldLabel>
            <Textarea id="seo_description" rows={3} maxLength={160} {...register("seo_description")} />
            <FieldDescription>{seoDescription.length}/160</FieldDescription>
            <FieldError errors={[errors.seo_description]} />
          </Field>
        </FieldGroup>
      </FormSection>

      <SaveBar isSubmitting={formState.isSubmitting} isDirty={formState.isDirty} />
    </form>
  );
}
