import type { ComponentType, ReactNode } from "react";

import type {
  About,
  AlbumWithCover,
  ContactSettings,
  GalleryPhoto,
  PackageWithFeatures,
  SiteSettings,
  SocialLink,
  Testimonial,
} from "@/lib/types";
import type { TemplateId } from "./ids";

/**
 * The contract every public template implements. Routes in `app/(site)`
 * fetch data and pass it in; templates are purely presentational, so a new
 * design never touches data fetching, the dashboard or business logic.
 */

export interface SiteContext {
  settings: SiteSettings;
  contact: ContactSettings;
  about: About;
  socialLinks: SocialLink[];
}

export interface TemplateLayoutProps {
  site: SiteContext;
  children: ReactNode;
}

export interface HomePageProps {
  site: SiteContext;
  featuredAlbums: AlbumWithCover[];
  selectedWork: GalleryPhoto[];
  packages: PackageWithFeatures[];
  testimonials: Testimonial[];
}

export interface PortfolioPageProps {
  site: SiteContext;
  albums: AlbumWithCover[];
}

export interface AlbumPageProps {
  site: SiteContext;
  album: AlbumWithCover;
  photos: GalleryPhoto[];
  hasMore: boolean;
  previous: AlbumWithCover | null;
  next: AlbumWithCover | null;
}

export interface PackagesPageProps {
  site: SiteContext;
  packages: PackageWithFeatures[];
}

export interface AboutPageProps {
  site: SiteContext;
  testimonials: Testimonial[];
}

export interface ContactPageProps {
  site: SiteContext;
  packages: PackageWithFeatures[];
}

export interface NotFoundPageProps {
  site: SiteContext;
}

export interface SiteTemplate {
  id: TemplateId;
  Layout: ComponentType<TemplateLayoutProps>;
  HomePage: ComponentType<HomePageProps>;
  PortfolioPage: ComponentType<PortfolioPageProps>;
  AlbumPage: ComponentType<AlbumPageProps>;
  PackagesPage: ComponentType<PackagesPageProps>;
  AboutPage: ComponentType<AboutPageProps>;
  ContactPage: ComponentType<ContactPageProps>;
  NotFoundPage: ComponentType<NotFoundPageProps>;
}
