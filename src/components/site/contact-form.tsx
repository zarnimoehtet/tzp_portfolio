"use client";

import { useEffect, useId, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { submitInquiry } from "@/lib/actions/inquiries";
import { cn } from "@/lib/utils";
import { inquirySchema, type InquiryInput } from "@/lib/validations";

const EVENT_TYPES = ["Wedding", "Pre-wedding", "Portrait", "Event", "Fashion", "Other"];

interface ContactFormProps {
  packageNames?: string[];
  className?: string;
}

const fieldClass =
  "w-full border-0 border-b border-line bg-transparent px-0 py-3 text-base text-ink placeholder:text-muted-ink/70 focus:border-ink focus:ring-0 focus:outline-none transition-colors";

function Field({
  label,
  error,
  children,
  htmlFor,
  className,
}: {
  label: string;
  error?: string;
  htmlFor: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className="eyebrow block text-muted-ink">
        {label}
      </label>
      {children}
      {error && (
        <p role="alert" className="mt-2 text-sm text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}

export function ContactForm({ packageNames = [], className }: ContactFormProps) {
  const id = useId();
  const [status, setStatus] = useState<"idle" | "sent">("idle");
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<InquiryInput>({
    resolver: zodResolver(inquirySchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      event_type: "",
      event_date: "",
      package_name: "",
      message: "",
      website: "",
    },
  });

  // Pre-select a package when arriving from a package "Inquire" link.
  useEffect(() => {
    const pkg = new URLSearchParams(window.location.search).get("package");
    if (pkg) setValue("package_name", pkg.slice(0, 120));
  }, [setValue]);

  async function onSubmit(values: InquiryInput) {
    setServerError(null);
    const result = await submitInquiry(values);
    if (result.ok) {
      setStatus("sent");
      reset();
    } else {
      setServerError(result.error);
    }
  }

  if (status === "sent") {
    return (
      <div className={cn("py-16", className)} role="status">
        <p className="eyebrow text-muted-ink">Message received</p>
        <p className="display mt-6 text-4xl md:text-5xl">Thank you.</p>
        <p className="mt-6 max-w-md text-muted-ink">
          I&apos;ll be in touch within two working days. I can&apos;t wait to hear more
          about your story.
        </p>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="eyebrow link-rule mt-10"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className={cn("grid gap-x-8 gap-y-10 sm:grid-cols-2", className)}
    >
      <Field label="Name *" htmlFor={`${id}-name`} error={errors.name?.message}>
        <input
          id={`${id}-name`}
          autoComplete="name"
          className={fieldClass}
          aria-invalid={Boolean(errors.name)}
          {...register("name")}
        />
      </Field>
      <Field label="Email *" htmlFor={`${id}-email`} error={errors.email?.message}>
        <input
          id={`${id}-email`}
          type="email"
          autoComplete="email"
          className={fieldClass}
          aria-invalid={Boolean(errors.email)}
          {...register("email")}
        />
      </Field>
      <Field label="Phone" htmlFor={`${id}-phone`} error={errors.phone?.message}>
        <input
          id={`${id}-phone`}
          type="tel"
          autoComplete="tel"
          className={fieldClass}
          {...register("phone")}
        />
      </Field>
      <Field label="Date" htmlFor={`${id}-date`} error={errors.event_date?.message}>
        <input
          id={`${id}-date`}
          type="date"
          className={fieldClass}
          {...register("event_date")}
        />
      </Field>
      <Field label="Occasion" htmlFor={`${id}-type`}>
        <select id={`${id}-type`} className={fieldClass} {...register("event_type")}>
          <option value="">Select…</option>
          {EVENT_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Package" htmlFor={`${id}-package`}>
        <select id={`${id}-package`} className={fieldClass} {...register("package_name")}>
          <option value="">Not sure yet</option>
          {packageNames.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
      </Field>
      <Field
        label="Tell me about your story *"
        htmlFor={`${id}-message`}
        error={errors.message?.message}
        className="sm:col-span-2"
      >
        <textarea
          id={`${id}-message`}
          rows={5}
          className={cn(fieldClass, "resize-y")}
          aria-invalid={Boolean(errors.message)}
          {...register("message")}
        />
      </Field>

      {/* Honeypot: hidden from people, irresistible to bots. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label htmlFor={`${id}-website`}>Website</label>
        <input id={`${id}-website`} tabIndex={-1} autoComplete="off" {...register("website")} />
      </div>

      <div className="flex flex-col items-start gap-4 sm:col-span-2">
        {serverError && (
          <p role="alert" className="text-sm text-red-700">
            {serverError}
          </p>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="pill-btn disabled:opacity-50"
        >
          {isSubmitting ? "Sending…" : "Send inquiry"}
        </button>
      </div>
    </form>
  );
}
