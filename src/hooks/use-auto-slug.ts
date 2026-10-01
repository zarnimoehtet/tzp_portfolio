"use client";

import { useEffect, useRef } from "react";
import {
  useWatch,
  type FieldValues,
  type Path,
  type PathValue,
  type UseFormReturn,
} from "react-hook-form";

import { slugify } from "@/lib/format";

/**
 * Keeps a slug field in sync with a source field until the user edits the
 * slug by hand (or when editing an existing record).
 */
export function useAutoSlug<T extends FieldValues>(
  form: UseFormReturn<T>,
  source: Path<T>,
  target: Path<T>,
  enabled: boolean,
) {
  const touched = useRef(!enabled);
  const value = useWatch({ control: form.control, name: source }) as string;

  useEffect(() => {
    touched.current = !enabled;
  }, [enabled]);

  useEffect(() => {
    if (touched.current) return;
    form.setValue(target, slugify(value ?? "") as PathValue<T, Path<T>>, {
      shouldValidate: form.formState.isSubmitted,
    });
  }, [value, form, target]);

  return {
    onSlugInput: () => {
      touched.current = true;
    },
  };
}
