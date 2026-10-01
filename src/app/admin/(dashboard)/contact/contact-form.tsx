"use client";

import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, X } from "lucide-react";
import { toast } from "sonner";

import { FormSection, SaveBar } from "@/components/admin/form-section";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { updateContactSettings } from "@/lib/actions/content";
import type { ContactSettings } from "@/lib/types";
import { contactSettingsSchema, type ContactSettingsInput } from "@/lib/validations";

function toForm(c: ContactSettings): ContactSettingsInput {
  return {
    email: c.email ?? "",
    phone: c.phone ?? "",
    location: c.location ?? "",
    availability: c.availability ?? "",
    instagram: c.instagram ?? "",
    facebook: c.facebook ?? "",
    tiktok: c.tiktok ?? "",
    whatsapp: c.whatsapp ?? "",
    other_links: c.other_links ?? [],
  };
}

const SOCIALS = [
  { name: "instagram", label: "Instagram", placeholder: "https://instagram.com/yourname" },
  { name: "facebook", label: "Facebook", placeholder: "https://facebook.com/yourpage" },
  { name: "tiktok", label: "TikTok", placeholder: "https://tiktok.com/@yourname" },
] as const;

export function ContactSettingsForm({ contact }: { contact: ContactSettings }) {
  const { register, control, handleSubmit, reset, formState } = useForm<ContactSettingsInput>({
    resolver: zodResolver(contactSettingsSchema),
    defaultValues: toForm(contact),
  });
  const { errors } = formState;
  const links = useFieldArray({ control, name: "other_links" });

  async function onSubmit(values: ContactSettingsInput) {
    const result = await updateContactSettings(values);
    if (result.ok) {
      toast.success("Contact details saved");
      reset(values);
    } else {
      toast.error(result.error);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
      <FormSection title="Contact details">
        <FieldGroup>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field data-invalid={Boolean(errors.email)}>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input id="email" type="email" {...register("email")} />
              <FieldError errors={[errors.email]} />
            </Field>
            <Field>
              <FieldLabel htmlFor="phone">Phone</FieldLabel>
              <Input id="phone" type="tel" {...register("phone")} />
            </Field>
          </div>
          <Field>
            <FieldLabel htmlFor="location">Location</FieldLabel>
            <Input id="location" placeholder="Lisbon, Portugal · Available worldwide" {...register("location")} />
          </Field>
          <Field>
            <FieldLabel htmlFor="availability">Availability message</FieldLabel>
            <Input
              id="availability"
              placeholder="Now booking 2027 weddings."
              {...register("availability")}
            />
            <FieldDescription>Shown at the top of the Contact page.</FieldDescription>
          </Field>
        </FieldGroup>
      </FormSection>

      <FormSection title="Social media">
        <FieldGroup>
          {SOCIALS.map((s) => (
            <Field key={s.name} data-invalid={Boolean(errors[s.name])}>
              <FieldLabel htmlFor={s.name}>{s.label}</FieldLabel>
              <Input id={s.name} type="url" placeholder={s.placeholder} {...register(s.name)} />
              <FieldError errors={[errors[s.name]]} />
            </Field>
          ))}
          <Field>
            <FieldLabel htmlFor="whatsapp">WhatsApp number</FieldLabel>
            <Input id="whatsapp" placeholder="+351 912 345 678" {...register("whatsapp")} />
            <FieldDescription>Include the country code. Visitors get a wa.me chat link.</FieldDescription>
          </Field>
        </FieldGroup>
      </FormSection>

      <FormSection title="Other links" description="Pinterest, Behance, YouTube, a blog…">
        <div className="space-y-2">
          {links.fields.map((field, i) => (
            <div key={field.id} className="flex items-start gap-2">
              <Input
                aria-label="Label"
                placeholder="Pinterest"
                className="w-40"
                aria-invalid={Boolean(errors.other_links?.[i]?.label)}
                {...register(`other_links.${i}.label`)}
              />
              <div className="flex-1">
                <Input
                  aria-label="URL"
                  type="url"
                  placeholder="https://"
                  aria-invalid={Boolean(errors.other_links?.[i]?.url)}
                  {...register(`other_links.${i}.url`)}
                />
                <FieldError errors={[errors.other_links?.[i]?.url, errors.other_links?.[i]?.label]} />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label="Remove link"
                onClick={() => links.remove(i)}
              >
                <X />
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => links.append({ label: "", url: "" })}
          >
            <Plus /> Add link
          </Button>
        </div>
      </FormSection>

      <SaveBar isSubmitting={formState.isSubmitting} isDirty={formState.isDirty} />
    </form>
  );
}
