"use client";

import { useEffect } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useAutoSlug } from "@/hooks/use-auto-slug";
import { createAlbum, updateAlbum } from "@/lib/actions/albums";
import type { Album } from "@/lib/types";
import { albumSchema, type AlbumInput } from "@/lib/validations";

function toForm(album: Album | null): AlbumInput {
  return {
    name: album?.name ?? "",
    slug: album?.slug ?? "",
    category: album?.category ?? "",
    description: album?.description ?? "",
    is_published: album?.is_published ?? false,
  };
}

export function AlbumFormDialog({
  album,
  open,
  onOpenChange,
}: {
  album: Album | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const form = useForm<AlbumInput>({
    resolver: zodResolver(albumSchema),
    defaultValues: toForm(album),
  });
  const { register, control, handleSubmit, reset, setError, formState } = form;
  const { errors } = formState;
  const { onSlugInput } = useAutoSlug(form, "name", "slug", open && !album);
  const slug = useWatch({ control, name: "slug" });

  useEffect(() => {
    if (open) reset(toForm(album));
  }, [open, album, reset]);

  async function onSubmit(values: AlbumInput) {
    const result = album ? await updateAlbum(album.id, values) : await createAlbum(values);
    if (result.ok) {
      toast.success(album ? "Album updated" : "Album created");
      onOpenChange(false);
      return;
    }
    if (result.error.includes("slug")) setError("slug", { message: result.error });
    else toast.error(result.error);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{album ? "Edit album" : "New album"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <FieldGroup>
            <Field data-invalid={Boolean(errors.name)}>
              <FieldLabel htmlFor="album-name">Name</FieldLabel>
              <Input id="album-name" aria-invalid={Boolean(errors.name)} {...register("name")} />
              <FieldError errors={[errors.name]} />
            </Field>
            <Field data-invalid={Boolean(errors.slug)}>
              <FieldLabel htmlFor="album-slug">URL slug</FieldLabel>
              <Input
                id="album-slug"
                aria-invalid={Boolean(errors.slug)}
                {...register("slug", { onChange: onSlugInput })}
              />
              <FieldDescription>/portfolio/{slug || "…"}</FieldDescription>
              <FieldError errors={[errors.slug]} />
            </Field>
            <Field>
              <FieldLabel htmlFor="album-category">Category</FieldLabel>
              <Input
                id="album-category"
                placeholder="Wedding, Portrait, Events…"
                {...register("category")}
              />
              <FieldDescription>Used for the filter tabs on the portfolio page.</FieldDescription>
            </Field>
            <Field>
              <FieldLabel htmlFor="album-description">Description</FieldLabel>
              <Textarea id="album-description" rows={4} {...register("description")} />
            </Field>
            <Controller
              control={control}
              name="is_published"
              render={({ field }) => (
                <Field orientation="horizontal">
                  <Switch id="album-published" checked={field.value} onCheckedChange={field.onChange} />
                  <FieldLabel htmlFor="album-published">Published</FieldLabel>
                </Field>
              )}
            />
          </FieldGroup>
          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={formState.isSubmitting}>
              {formState.isSubmitting ? "Saving…" : album ? "Save" : "Create album"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
