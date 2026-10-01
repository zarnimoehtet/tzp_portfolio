"use client";

import { useState, useTransition } from "react";
import { Package as PackageIcon, Pencil, Plus, Star, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { ConfirmDialog, useConfirm } from "@/components/admin/confirm-dialog";
import { PageHeader } from "@/components/admin/page-header";
import { DragHandle, SortableList } from "@/components/admin/sortable-list";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { deletePackage, reorderPackages, setPackageFlag } from "@/lib/actions/packages";
import { formatPrice } from "@/lib/format";
import type { PackageWithFeatures } from "@/lib/types";
import { PackageFormDialog } from "./package-form-dialog";

export function PackageManager({ packages }: { packages: PackageWithFeatures[] }) {
  const [editing, setEditing] = useState<PackageWithFeatures | "new" | null>(null);
  const [, startTransition] = useTransition();
  const confirm = useConfirm();

  function toggle(id: string, flag: "is_published" | "is_featured", value: boolean) {
    startTransition(async () => {
      const result = await setPackageFlag(id, flag, value);
      if (!result.ok) toast.error(result.error);
    });
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Packages"
        description="Your photography offerings and pricing."
        actions={
          <Button onClick={() => setEditing("new")}>
            <Plus /> New package
          </Button>
        }
      />

      {packages.length === 0 ? (
        <Card className="items-center p-12 text-center text-muted-foreground">
          <PackageIcon className="size-8" />
          <p>No packages yet.</p>
        </Card>
      ) : (
        <SortableList
          items={packages}
          onReorder={reorderPackages}
          className="space-y-2"
          renderItem={(pkg, handle) => (
            <Card className="flex-row items-center gap-3 p-3">
              <DragHandle {...handle} />
              <div className="min-w-0 flex-1">
                <p className="flex flex-wrap items-center gap-2 font-medium">
                  {pkg.name}
                  {pkg.is_featured && <Badge>Featured</Badge>}
                  {!pkg.is_published && <Badge variant="secondary">Draft</Badge>}
                </p>
                <p className="truncate text-sm text-muted-foreground">
                  {[formatPrice(pkg.price, pkg.currency), pkg.duration, `${pkg.features.length} features`]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label={pkg.is_featured ? "Unfeature" : "Feature"}
                onClick={() => toggle(pkg.id, "is_featured", !pkg.is_featured)}
              >
                <Star className={pkg.is_featured ? "fill-current" : undefined} />
              </Button>
              <label className="hidden items-center gap-2 text-sm text-muted-foreground sm:flex">
                <Switch
                  checked={pkg.is_published}
                  onCheckedChange={(checked) => toggle(pkg.id, "is_published", checked)}
                />
                Published
              </label>
              <Button variant="ghost" size="icon-sm" aria-label="Edit" onClick={() => setEditing(pkg)}>
                <Pencil />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Delete"
                onClick={() =>
                  confirm.ask(async () => {
                    const result = await deletePackage(pkg.id);
                    if (result.ok) toast.success("Package deleted");
                    else toast.error(result.error);
                  })
                }
              >
                <Trash2 />
              </Button>
            </Card>
          )}
        />
      )}

      <PackageFormDialog
        pkg={editing === "new" ? null : editing}
        open={editing !== null}
        onOpenChange={(open) => !open && setEditing(null)}
      />

      <ConfirmDialog
        open={confirm.open}
        onOpenChange={confirm.onOpenChange}
        onConfirm={confirm.onConfirm}
        title="Delete package?"
        description="This package and its features will be permanently removed."
      />
    </div>
  );
}
