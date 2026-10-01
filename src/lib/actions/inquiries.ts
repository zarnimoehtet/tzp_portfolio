"use server";

import { z } from "zod";

import { requireAdmin } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/env";
import { createPublicClient } from "@/lib/supabase/server";
import type { ActionResult, InquiryStatus } from "@/lib/types";
import { inquirySchema, type InquiryInput } from "@/lib/validations";
import { invalidate, nullIfEmpty, parseInput, runAction } from "./utils";

/** Public contact form submission. Inserts via the anon role (RLS: insert only). */
export async function submitInquiry(input: InquiryInput): Promise<ActionResult> {
  const parsed = parseInput(inquirySchema, input);
  if (!parsed.ok) return parsed.result;

  // Bots fill hidden fields; pretend success so they don't retry.
  if (parsed.data.website) return { ok: true, data: undefined };

  if (!isSupabaseConfigured) {
    return { ok: false, error: "The contact form is not available yet." };
  }

  const v = parsed.data;
  const { error } = await createPublicClient()
    .from("inquiries")
    .insert({
      name: v.name,
      email: v.email,
      phone: nullIfEmpty(v.phone),
      event_type: nullIfEmpty(v.event_type),
      event_date: nullIfEmpty(v.event_date),
      package_name: nullIfEmpty(v.package_name),
      message: v.message,
    });

  if (error) {
    console.error("[inquiry]", error);
    return { ok: false, error: "Sorry, your message could not be sent. Please try again." };
  }
  return { ok: true, data: undefined };
}

export async function setInquiryStatus(
  id: string,
  status: InquiryStatus,
): Promise<ActionResult> {
  return runAction(async () => {
    const { supabase } = await requireAdmin();
    const { error } = await supabase
      .from("inquiries")
      .update({ status: z.enum(["new", "read", "archived"]).parse(status) })
      .eq("id", z.uuid().parse(id));
    if (error) throw error;
    invalidate();
  });
}

export async function deleteInquiry(id: string): Promise<ActionResult> {
  return runAction(async () => {
    const { supabase } = await requireAdmin();
    const { error } = await supabase.from("inquiries").delete().eq("id", z.uuid().parse(id));
    if (error) throw error;
    invalidate();
  });
}
