import type { Tables } from "@/lib/supabase/database.types";
import type { ImageAsset } from "@/lib/images/types";

export type { ImageAsset } from "@/lib/images/types";
export type { SocialLink, InquiryStatus } from "@/lib/supabase/database.types";

export type Album = Tables<"albums">;
export type Photo = Tables<"photos">;
export type Package = Tables<"packages">;
export type PackageFeature = Tables<"package_features">;
export type Testimonial = Tables<"testimonials">;
export type About = Tables<"about">;
export type ContactSettings = Tables<"contact_settings">;
export type SiteSettings = Tables<"site_settings">;
export type Inquiry = Tables<"inquiries">;

export type PackageWithFeatures = Package & { features: PackageFeature[] };

/** A published album with the image used to represent it publicly. */
export type AlbumWithCover = Album & {
  cover: ImageAsset | null;
  photo_count: number;
};

/** The subset of a photo that public galleries need. */
export type GalleryPhoto = {
  id: string;
  title: string | null;
  description: string | null;
  alt: string;
  image: ImageAsset;
};

export type ActionResult<T = void> =
  | { ok: true; data: T }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> };
