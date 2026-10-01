"use client";

import { useEffect, useState, useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { MessageSquareQuote, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { ConfirmDialog, useConfirm } from "@/components/admin/confirm-dialog";
import { ImageField } from "@/components/admin/image-field";
import { PageHeader } from "@/components/admin/page-header";
import { DragHandle, SortableList } from "@/components/admin/sortable-list";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  createTestimonial,
  deleteTestimonial,
  reorderTestimonials,
  setTestimonialPublished,
  updateTestimonial,
} from "@/lib/actions/testimonials";
import type { Testimonial } from "@/lib/types";
import { testimonialSchema, type TestimonialInput } from "@/lib/validations";

function toForm(t: Testimonial | null): TestimonialInput {
  return {
    name: t?.name ?? "",
    role: t?.role ?? "",
    content: t?.content ?? "",
    avatar: t?.avatar ?? null,
    is_published: t?.is_published ?? true,
  };
}

function TestimonialFormDialog({
  testimonial,
  open,
  onOpenChange,
}: {
  testimonial: Testimonial | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { register, control, handleSubmit, reset, formState } = useForm<TestimonialInput>({
    resolver: zodResolver(testimonialSchema),
    defaultValues: toForm(testimonial),
  });
  const { errors } = formState;

  useEffect(() => {
    if (open) reset(toForm(testimonial));
  }, [open, testimonial, reset]);

  async function onSubmit(values: TestimonialInput) {
    const result = testimonial
      ? await updateTestimonial(testimonial.id, values)
      : await createTestimonial(values);
    if (result.ok) {
      toast.success(testimonial ? "Testimonial updated" : "Testimonial added");
      onOpenChange(false);
    } else {
      toast.error(result.error);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{testimonial ? "Edit testimonial" : "New testimonial"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <FieldGroup>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field data-invalid={Boolean(errors.name)}>
                <FieldLabel htmlFor="t-name">Name</FieldLabel>
                <Input id="t-name" placeholder="Anna & James" {...register("name")} />
                <FieldError errors={[errors.name]} />
              </Field>
              <Field>
                <FieldLabel htmlFor="t-role">Role / occasion</FieldLabel>
                <Input id="t-role" placeholder="Wedding, Lake Como" {...register("role")} />
              </Field>
            </div>
            <Field data-invalid={Boolean(errors.content)}>
              <FieldLabel htmlFor="t-content">Testimonial</FieldLabel>
              <Textarea id="t-content" rows={5} {...register("content")} />
              <FieldError errors={[errors.content]} />
            </Field>
            <Field>
              <FieldLabel>Photo (optional)</FieldLabel>
              <Controller
                control={control}
                name="avatar"
                render={({ field }) => (
                  <ImageField
                    kind="avatar"
                    aspect="aspect-square w-32"
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
            </Field>
            <Controller
              control={control}
              name="is_published"
              render={({ field }) => (
                <Field orientation="horizontal">
                  <Switch id="t-published" checked={field.value} onCheckedChange={field.onChange} />
                  <FieldLabel htmlFor="t-published">Published</FieldLabel>
                </Field>
              )}
            />
          </FieldGroup>
          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={formState.isSubmitting}>
              {formState.isSubmitting ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function TestimonialManager({ testimonials }: { testimonials: Testimonial[] }) {
  const [editing, setEditing] = useState<Testimonial | "new" | null>(null);
  const [, startTransition] = useTransition();
  const confirm = useConfirm();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Testimonials"
        description="Kind words from clients, shown on the home and about pages."
        actions={
          <Button onClick={() => setEditing("new")}>
            <Plus /> New testimonial
          </Button>
        }
      />

      {testimonials.length === 0 ? (
        <Card className="items-center p-12 text-center text-muted-foreground">
          <MessageSquareQuote className="size-8" />
          <p>No testimonials yet.</p>
        </Card>
      ) : (
        <SortableList
          items={testimonials}
          onReorder={reorderTestimonials}
          className="space-y-2"
          renderItem={(t, handle) => (
            <Card className="flex-row items-start gap-3 p-3">
              <DragHandle {...handle} className="mt-1" />
              <Avatar className="size-10">
                {t.avatar && <AvatarImage src={t.avatar.thumbnail_url} alt="" />}
                <AvatarFallback>{t.name.slice(0, 1)}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="flex flex-wrap items-center gap-2 font-medium">
                  {t.name}
                  {t.role && <span className="text-sm font-normal text-muted-foreground">{t.role}</span>}
                  {!t.is_published && <Badge variant="secondary">Draft</Badge>}
                </p>
                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{t.content}</p>
              </div>
              <Switch
                aria-label="Published"
                checked={t.is_published}
                onCheckedChange={(checked) =>
                  startTransition(async () => {
                    const result = await setTestimonialPublished(t.id, checked);
                    if (!result.ok) toast.error(result.error);
                  })
                }
                className="mt-2"
              />
              <Button variant="ghost" size="icon-sm" aria-label="Edit" onClick={() => setEditing(t)}>
                <Pencil />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Delete"
                onClick={() =>
                  confirm.ask(async () => {
                    const result = await deleteTestimonial(t.id);
                    if (result.ok) toast.success("Testimonial deleted");
                    else toast.error(result.error);
                  })
                }
              >
                <Trash2 />
              </Button>
            </Card>
          )}
        />
      )}

      <TestimonialFormDialog
        testimonial={editing === "new" ? null : editing}
        open={editing !== null}
        onOpenChange={(open) => !open && setEditing(null)}
      />

      <ConfirmDialog
        open={confirm.open}
        onOpenChange={confirm.onOpenChange}
        onConfirm={confirm.onConfirm}
        title="Delete testimonial?"
        description="This testimonial will be permanently removed."
      />
    </div>
  );
}
