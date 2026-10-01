"use client";

import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { NativeSelect } from "@/components/admin/native-select";
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
import { updatePhoto } from "@/lib/actions/photos";
import type { Photo } from "@/lib/types";
import { photoUpdateSchema, type PhotoUpdateInput } from "@/lib/validations";
import type { AlbumOption } from "./photo-manager";

function toForm(photo: Photo | null): PhotoUpdateInput {
  return {
    title: photo?.title ?? "",
    description: photo?.description ?? "",
    alt_text: photo?.alt_text ?? "",
    album_id: photo?.album_id ?? null,
    is_published: photo?.is_published ?? true,
    is_featured: photo?.is_featured ?? false,
  };
}

export function PhotoEditDialog({
  photo,
  albums,
  onOpenChange,
}: {
  photo: Photo | null;
  albums: AlbumOption[];
  onOpenChange: (open: boolean) => void;
}) {
  const form = useForm<PhotoUpdateInput>({
    resolver: zodResolver(photoUpdateSchema),
    defaultValues: toForm(photo),
  });
  const { register, control, handleSubmit, reset, formState } = form;

  useEffect(() => reset(toForm(photo)), [photo, reset]);

  async function onSubmit(values: PhotoUpdateInput) {
    if (!photo) return;
    const result = await updatePhoto(photo.id, values);
    if (result.ok) {
      toast.success("Photo updated");
      onOpenChange(false);
    } else {
      toast.error(result.error);
    }
  }

  return (
    <Dialog open={photo !== null} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit photo</DialogTitle>
        </DialogHeader>
        {photo && (
          <form onSubmit={handleSubmit(onSubmit)} className="grid gap-6 sm:grid-cols-5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photo.medium_url}
              alt=""
              className="w-full rounded-lg bg-muted object-contain sm:col-span-2"
            />
            <FieldGroup className="sm:col-span-3">
              <Field>
                <FieldLabel htmlFor="title">Title</FieldLabel>
                <Input id="title" {...register("title")} />
                <FieldError errors={[formState.errors.title]} />
              </Field>
              <Field>
                <FieldLabel htmlFor="alt_text">Alt text</FieldLabel>
                <Input id="alt_text" {...register("alt_text")} />
                <FieldDescription>
                  Describe the image for screen readers and search engines.
                </FieldDescription>
                <FieldError errors={[formState.errors.alt_text]} />
              </Field>
              <Field>
                <FieldLabel htmlFor="description">Caption</FieldLabel>
                <Textarea id="description" rows={3} {...register("description")} />
              </Field>
              <Field>
                <FieldLabel htmlFor="album_id">Album</FieldLabel>
                <Controller
                  control={control}
                  name="album_id"
                  render={({ field }) => (
                    <NativeSelect
                      id="album_id"
                      value={field.value ?? ""}
                      onChange={(e) => field.onChange(e.target.value || null)}
                    >
                      <option value="">No album</option>
                      {albums.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.name}
                        </option>
                      ))}
                    </NativeSelect>
                  )}
                />
              </Field>
              <Controller
                control={control}
                name="is_published"
                render={({ field }) => (
                  <Field orientation="horizontal">
                    <Switch id="is_published" checked={field.value} onCheckedChange={field.onChange} />
                    <FieldLabel htmlFor="is_published">Published</FieldLabel>
                  </Field>
                )}
              />
              <Controller
                control={control}
                name="is_featured"
                render={({ field }) => (
                  <Field orientation="horizontal">
                    <Switch id="is_featured" checked={field.value} onCheckedChange={field.onChange} />
                    <FieldLabel htmlFor="is_featured">Featured in home page slider (first 10)</FieldLabel>
                  </Field>
                )}
              />
            </FieldGroup>
            <DialogFooter className="sm:col-span-5">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={formState.isSubmitting}>
                {formState.isSubmitting ? "Saving…" : "Save"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
