import type { Metadata } from "next";

import { PageHeader } from "@/components/admin/page-header";
import { getAdminSingletons } from "@/lib/data/admin";
import { AboutForm } from "./about-form";

export const metadata: Metadata = { title: "About" };

export default async function AboutPage() {
  const { about } = await getAdminSingletons();
  return (
    <div className="space-y-6">
      <PageHeader title="About" description="Your story, shown on the About page and home page." />
      <AboutForm about={about} />
    </div>
  );
}
