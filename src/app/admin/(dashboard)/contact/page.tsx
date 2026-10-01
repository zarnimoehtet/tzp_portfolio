import type { Metadata } from "next";

import { PageHeader } from "@/components/admin/page-header";
import { getAdminSingletons } from "@/lib/data/admin";
import { ContactSettingsForm } from "./contact-form";

export const metadata: Metadata = { title: "Contact" };

export default async function ContactSettingsPage() {
  const { contact } = await getAdminSingletons();
  return (
    <div className="space-y-6">
      <PageHeader
        title="Contact"
        description="Contact details and social links shown across your website."
      />
      <ContactSettingsForm contact={contact} />
    </div>
  );
}
