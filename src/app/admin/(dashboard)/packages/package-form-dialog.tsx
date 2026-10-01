"use client";

import { useEffect } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowDown, ArrowUp, Plus, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useAutoSlug } from "@/hooks/use-auto-slug";
import { createPackage, updatePackage } from "@/lib/actions/packages";
import type { PackageWithFeatures } from "@/lib/types";
import { packageSchema, type PackageInput } from "@/lib/validations";

function toForm(pkg: PackageWithFeatures | null): PackageInput {
  return {
    name: pkg?.name ?? "",
    slug: pkg?.slug ?? "",
    description: pkg?.description ?? "",
    price: pkg?.price != null ? String(pkg.price) : "",
    currency: pkg?.currency ?? "USD",
    duration: pkg?.duration ?? "",
    cta_label: pkg?.cta_label ?? "",
    is_featured: pkg?.is_featured ?? false,
    is_published: pkg?.is_published ?? false,
    features: pkg?.features.map((f) => ({ value: f.feature })) ?? [],
  };
}

export function PackageFormDialog({
  pkg,
  open,
  onOpenChange,
}: {
  pkg: PackageWithFeatures | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const form = useForm<PackageInput>({
    resolver: zodResolver(packageSchema),
    defaultValues: toForm(pkg),
  });
  const { register, control, handleSubmit, reset, setError, formState } = form;
  const { errors } = formState;
  const features = useFieldArray({ control, name: "features" });
  const { onSlugInput } = useAutoSlug(form, "name", "slug", open && !pkg);

  useEffect(() => {
    if (open) reset(toForm(pkg));
  }, [open, pkg, reset]);

  async function onSubmit(values: PackageInput) {
    const result = pkg ? await updatePackage(pkg.id, values) : await createPackage(values);
    if (result.ok) {
      toast.success(pkg ? "Package updated" : "Package created");
      onOpenChange(false);
      return;
    }
    if (result.error.includes("slug")) setError("slug", { message: result.error });
    else toast.error(result.error);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{pkg ? "Edit package" : "New package"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <FieldGroup>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field data-invalid={Boolean(errors.name)}>
                <FieldLabel htmlFor="pkg-name">Name</FieldLabel>
                <Input id="pkg-name" placeholder="Basic" {...register("name")} />
                <FieldError errors={[errors.name]} />
              </Field>
              <Field data-invalid={Boolean(errors.slug)}>
                <FieldLabel htmlFor="pkg-slug">Slug</FieldLabel>
                <Input id="pkg-slug" {...register("slug", { onChange: onSlugInput })} />
                <FieldError errors={[errors.slug]} />
              </Field>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <Field data-invalid={Boolean(errors.price)}>
                <FieldLabel htmlFor="pkg-price">Price</FieldLabel>
                <Input id="pkg-price" inputMode="decimal" placeholder="300" {...register("price")} />
                <FieldError errors={[errors.price]} />
              </Field>
              <Field data-invalid={Boolean(errors.currency)}>
                <FieldLabel htmlFor="pkg-currency">Currency</FieldLabel>
                <Input
                  id="pkg-currency"
                  maxLength={3}
                  className="uppercase"
                  {...register("currency")}
                />
                <FieldError errors={[errors.currency]} />
              </Field>
              <Field>
                <FieldLabel htmlFor="pkg-duration">Duration</FieldLabel>
                <Input id="pkg-duration" placeholder="4 hours" {...register("duration")} />
              </Field>
            </div>
            <Field>
              <FieldLabel htmlFor="pkg-description">Description</FieldLabel>
              <Textarea id="pkg-description" rows={3} {...register("description")} />
            </Field>

            <FieldSet>
              <FieldLegend variant="label">Features</FieldLegend>
              <FieldDescription>Each line appears as a bullet on the package card.</FieldDescription>
              <div className="space-y-2">
                {features.fields.map((field, i) => (
                  <div key={field.id} className="flex items-center gap-1">
                    <Input
                      aria-label={`Feature ${i + 1}`}
                      placeholder="300 edited photos"
                      aria-invalid={Boolean(errors.features?.[i]?.value)}
                      {...register(`features.${i}.value`)}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Move up"
                      disabled={i === 0}
                      onClick={() => features.move(i, i - 1)}
                    >
                      <ArrowUp />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Move down"
                      disabled={i === features.fields.length - 1}
                      onClick={() => features.move(i, i + 1)}
                    >
                      <ArrowDown />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Remove feature"
                      onClick={() => features.remove(i)}
                    >
                      <X />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => features.append({ value: "" })}
                >
                  <Plus /> Add feature
                </Button>
              </div>
            </FieldSet>

            <Field>
              <FieldLabel htmlFor="pkg-cta">Button label</FieldLabel>
              <Input id="pkg-cta" placeholder="Inquire" {...register("cta_label")} />
            </Field>

            <div className="flex flex-wrap gap-6">
              <Controller
                control={control}
                name="is_published"
                render={({ field }) => (
                  <Field orientation="horizontal" className="w-auto">
                    <Switch id="pkg-published" checked={field.value} onCheckedChange={field.onChange} />
                    <FieldLabel htmlFor="pkg-published">Published</FieldLabel>
                  </Field>
                )}
              />
              <Controller
                control={control}
                name="is_featured"
                render={({ field }) => (
                  <Field orientation="horizontal" className="w-auto">
                    <Switch id="pkg-featured" checked={field.value} onCheckedChange={field.onChange} />
                    <FieldLabel htmlFor="pkg-featured">Featured (highlighted)</FieldLabel>
                  </Field>
                )}
              />
            </div>
          </FieldGroup>
          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={formState.isSubmitting}>
              {formState.isSubmitting ? "Saving…" : pkg ? "Save" : "Create package"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
