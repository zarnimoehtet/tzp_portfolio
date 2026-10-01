import "server-only";

import { requireAdmin } from "@/lib/auth";
import type { Album, Inquiry, PackageWithFeatures, Photo, Testimonial } from "@/lib/types";
import { DEFAULT_ABOUT, DEFAULT_CONTACT, DEFAULT_SITE_SETTINGS } from "./defaults";

/** Uncached reads for the dashboard. Every call re-checks admin access. */

export type AdminAlbum = Album & {
  photo_count: number;
  cover_thumbnail: string | null;
};

export async function getDashboardStats() {
  const { supabase } = await requireAdmin();
  const count = (table: "photos" | "albums" | "packages") =>
    supabase.from(table).select("id", { count: "exact", head: true });

  const [photos, albums, packages, newInquiries, recentInquiries, recentPhotos] =
    await Promise.all([
      count("photos"),
      count("albums"),
      count("packages"),
      supabase
        .from("inquiries")
        .select("id", { count: "exact", head: true })
        .eq("status", "new"),
      supabase
        .from("inquiries")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(6),
      supabase
        .from("photos")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(12),
    ]);

  return {
    totals: {
      photos: photos.count ?? 0,
      albums: albums.count ?? 0,
      packages: packages.count ?? 0,
      newInquiries: newInquiries.count ?? 0,
    },
    recentInquiries: (recentInquiries.data ?? []) as Inquiry[],
    recentPhotos: (recentPhotos.data ?? []) as Photo[],
  };
}

export async function getAdminAlbums(): Promise<AdminAlbum[]> {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase
    .from("albums")
    .select(
      `*, cover:photos!albums_cover_photo_id_fkey(thumbnail_url),
       photo_count:photos!photos_album_id_fkey(count)`,
    )
    .order("sort_order")
    .order("created_at", { ascending: false })
    .overrideTypes<
      (Album & {
        cover: { thumbnail_url: string } | null;
        photo_count: { count: number }[];
      })[],
      { merge: false }
    >();
  if (error) throw error;
  return data.map(({ cover, photo_count, ...album }) => ({
    ...album,
    cover_thumbnail: cover?.thumbnail_url ?? null,
    photo_count: photo_count[0]?.count ?? 0,
  }));
}

export type PhotoFilter = { albumId?: string | "unassigned" };

export async function getAdminPhotos({ albumId }: PhotoFilter = {}): Promise<Photo[]> {
  const { supabase } = await requireAdmin();
  let query = supabase.from("photos").select("*");
  if (albumId === "unassigned") query = query.is("album_id", null);
  else if (albumId) query = query.eq("album_id", albumId);
  const { data, error } = await query
    .order("sort_order")
    .order("created_at", { ascending: false })
    .limit(1000);
  if (error) throw error;
  return data;
}

export async function getAdminPackages(): Promise<PackageWithFeatures[]> {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase
    .from("packages")
    .select("*, package_features(*)")
    .order("sort_order")
    .order("created_at");
  if (error) throw error;
  return data.map(({ package_features, ...pkg }) => ({
    ...pkg,
    features: [...package_features].sort((a, b) => a.sort_order - b.sort_order),
  }));
}

export async function getAdminTestimonials(): Promise<Testimonial[]> {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase
    .from("testimonials")
    .select("*")
    .order("sort_order")
    .order("created_at");
  if (error) throw error;
  return data;
}

export async function getAdminInquiries(status?: Inquiry["status"]): Promise<Inquiry[]> {
  const { supabase } = await requireAdmin();
  let query = supabase.from("inquiries").select("*");
  if (status) query = query.eq("status", status);
  const { data, error } = await query
    .order("created_at", { ascending: false })
    .limit(500);
  if (error) throw error;
  return data;
}

export async function getAdminSingletons() {
  const { supabase } = await requireAdmin();
  const [about, contact, settings] = await Promise.all([
    supabase.from("about").select("*").maybeSingle(),
    supabase.from("contact_settings").select("*").maybeSingle(),
    supabase.from("site_settings").select("*").maybeSingle(),
  ]);
  return {
    about: about.data ?? DEFAULT_ABOUT,
    contact: contact.data ?? DEFAULT_CONTACT,
    settings: settings.data ?? DEFAULT_SITE_SETTINGS,
  };
}
