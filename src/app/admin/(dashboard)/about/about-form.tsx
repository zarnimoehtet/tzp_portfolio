"use client";

import { Controller, useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, X } from "lucide-react";
import { toast } from "sonner";

import { FormSection, SaveBar } from "@/components/admin/form-section";
import { ImageField } from "@/components/admin/image-field";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { updateAbout } from "@/lib/actions/content";
import type { About } from "@/lib/types";
import { aboutSchema, type AboutInput } from "@/lib/validations";

function toForm(about: About): AboutInput {
  return {
    name: about.name,
    headline: about.headline ?? "",
    introduction: about.introduction ?? "",
    biography: about.biography ?? "",
    experience: about.experience ?? "",
    years_experience: about.years_experience != null ? String(about.years_experience) : "",
    specialties: about.specialties.map((value) => ({ value })),
    personal_message: about.personal_message ?? "",
    profile_image: about.profile_image,
  };
}

export function AboutForm({ about }: { about: About }) {
  const { register, control, handleSubmit, reset, formState } = useForm<AboutInput>({
    resolver: zodResolver(aboutSchema),
    defaultValues: toForm(about),
  });
  const { errors } = formState;
  const specialties = useFieldArray({ control, name: "specialties" });

  async function onSubmit(values: AboutInput) {
    const result = await updateAbout(values);
    if (result.ok) {
      toast.success("About page saved");
      reset(values);
    } else {
      toast.error(result.error);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
      <FormSection title="Profile">
        <div className="grid gap-6 md:grid-cols-[220px_1fr]">
          <Controller
            control={control}
            name="profile_image"
            render={({ field }) => (
              <ImageField
                kind="portrait"
                aspect="aspect-[4/5]"
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />
          <FieldGroup>
            <Field data-invalid={Boolean(errors.name)}>
              <FieldLabel htmlFor="name">Name</FieldLabel>
              <Input id="name" {...register("name")} />
              <FieldDescription>
                Shown on the about page and as your site-wide name (header, footer, titles).
              </FieldDescription>
              <FieldError errors={[errors.name]} />
            </Field>
            <Field>
              <FieldLabel htmlFor="headline">Headline</FieldLabel>
              <Input
                id="headline"
                placeholder="Wedding & portrait photographer based in Lisbon"
                {...register("headline")}
              />
            </Field>
            <Field data-invalid={Boolean(errors.introduction)}>
              <FieldLabel htmlFor="introduction">Short introduction</FieldLabel>
              <Textarea id="introduction" rows={3} {...register("introduction")} />
              <FieldDescription>Shown on the home page next to your portrait.</FieldDescription>
              <FieldError errors={[errors.introduction]} />
            </Field>
          </FieldGroup>
        </div>
      </FormSection>

      <FormSection title="Biography" description="Separate paragraphs with a blank line.">
        <Textarea rows={10} aria-label="Biography" {...register("biography")} />
        <FieldError errors={[errors.biography]} />
      </FormSection>

      <FormSection title="Experience">
        <FieldGroup>
          <Field data-invalid={Boolean(errors.years_experience)} className="max-w-48">
            <FieldLabel htmlFor="years">Years of experience</FieldLabel>
            <Input id="years" inputMode="numeric" {...register("years_experience")} />
            <FieldError errors={[errors.years_experience]} />
          </Field>
          <Field>
            <FieldLabel htmlFor="experience">Experience details</FieldLabel>
            <Textarea
              id="experience"
              rows={5}
              placeholder="Publications, awards, notable clients…"
              {...register("experience")}
            />
          </Field>
        </FieldGroup>
      </FormSection>

      <FormSection title="Specialties">
        <div className="flex flex-wrap gap-2">
          {specialties.fields.map((field, i) => (
            <div key={field.id} className="flex items-center gap-1">
              <Input
                aria-label={`Specialty ${i + 1}`}
                className="w-44"
                {...register(`specialties.${i}.value`)}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label="Remove specialty"
                onClick={() => specialties.remove(i)}
              >
                <X />
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => specialties.append({ value: "" })}
          >
            <Plus /> Add specialty
          </Button>
        </div>
      </FormSection>

      <FormSection title="Personal message" description="A short, personal note shown as a quote.">
        <Textarea rows={4} aria-label="Personal message" {...register("personal_message")} />
      </FormSection>

      <SaveBar isSubmitting={formState.isSubmitting} isDirty={formState.isDirty} />
    </form>
  );
}
