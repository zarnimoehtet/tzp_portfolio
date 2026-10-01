import type { SiteTemplate } from "@/templates/types";
import { MinimalAboutPage } from "./about";
import { MinimalAlbumPage } from "./album";
import { MinimalContactPage } from "./contact";
import { MinimalHomePage } from "./home";
import { MinimalLayout } from "./layout";
import { MinimalNotFoundPage } from "./not-found";
import { MinimalPackagesPage } from "./packages";
import { MinimalPortfolioPage } from "./portfolio";

export const MinimalTemplate: SiteTemplate = {
  id: "minimal",
  Layout: MinimalLayout,
  HomePage: MinimalHomePage,
  PortfolioPage: MinimalPortfolioPage,
  AlbumPage: MinimalAlbumPage,
  PackagesPage: MinimalPackagesPage,
  AboutPage: MinimalAboutPage,
  ContactPage: MinimalContactPage,
  NotFoundPage: MinimalNotFoundPage,
};
