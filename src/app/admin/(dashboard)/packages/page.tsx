import type { Metadata } from "next";

import { getAdminPackages } from "@/lib/data/admin";
import { PackageManager } from "./package-manager";

export const metadata: Metadata = { title: "Packages" };

export default async function PackagesPage() {
  const packages = await getAdminPackages();
  return <PackageManager packages={packages} />;
}
