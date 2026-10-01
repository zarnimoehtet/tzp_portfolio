import type { ContactSettings, SocialLink } from "@/lib/types";

export function formatPrice(price: number | null, currency: string): string | null {
  if (price === null) return null;
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: Number.isInteger(price) ? 0 : 2,
    }).format(price);
  } catch {
    return `${currency} ${price}`;
  }
}

export function slugify(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}

/** Splits free text into paragraphs on blank lines. */
export function paragraphs(text: string | null | undefined): string[] {
  return (text ?? "")
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}

export function formatDate(value: string, options?: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    ...options,
  }).format(new Date(value));
}

/** Social profiles configured in Contact settings, in display order. */
export function getSocialLinks(contact: ContactSettings): SocialLink[] {
  const links: SocialLink[] = [];
  if (contact.instagram) links.push({ label: "Instagram", url: contact.instagram });
  if (contact.facebook) links.push({ label: "Facebook", url: contact.facebook });
  if (contact.tiktok) links.push({ label: "TikTok", url: contact.tiktok });
  if (contact.whatsapp) {
    const digits = contact.whatsapp.replace(/[^\d]/g, "");
    if (digits) links.push({ label: "WhatsApp", url: `https://wa.me/${digits}` });
  }
  return [...links, ...(contact.other_links ?? [])];
}
