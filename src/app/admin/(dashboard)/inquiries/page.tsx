import type { Metadata } from "next";

import { PageHeader } from "@/components/admin/page-header";
import { getAdminInquiries } from "@/lib/data/admin";
import { InquiriesTable } from "./inquiries-table";

export const metadata: Metadata = { title: "Inquiries" };

export default async function InquiriesPage() {
  const inquiries = await getAdminInquiries();
  return (
    <div className="space-y-6">
      <PageHeader title="Inquiries" description="Messages sent through your contact form." />
      <InquiriesTable inquiries={inquiries} />
    </div>
  );
}
