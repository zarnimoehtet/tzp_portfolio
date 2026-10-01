"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Camera, ExternalLink, ImageIcon, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { ConfirmDialog, useConfirm } from "@/components/admin/confirm-dialog";
import { PageHeader } from "@/components/admin/page-header";
import { DragHandle, SortableList } from "@/components/admin/sortable-list";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { deleteAlbum, reorderAlbums, setAlbumPublished } from "@/lib/actions/albums";
import type { AdminAlbum } from "@/lib/data/admin";
import { AlbumFormDialog } from "./album-form-dialog";

export function AlbumManager({ albums }: { albums: AdminAlbum[] }) {
  const [editing, setEditing] = useState<AdminAlbum | "new" | null>(null);
  const [, startTransition] = useTransition();
  const confirm = useConfirm();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Albums"
        description="Group photos into stories. Drag to change the order on your portfolio."
        actions={
          <Button onClick={() => setEditing("new")}>
            <Plus /> New album
          </Button>
        }
      />

      {albums.length === 0 ? (
        <Card className="items-center p-12 text-center text-muted-foreground">
          <ImageIcon className="size-8" />
          <p>No albums yet. Create your first story.</p>
        </Card>
      ) : (
        <SortableList
          items={albums}
          onReorder={reorderAlbums}
          className="space-y-2"
          renderItem={(album, handle) => (
            <Card className="flex-row items-center gap-3 p-3">
              <DragHandle {...handle} />
              <div className="size-14 shrink-0 overflow-hidden rounded-md bg-muted">
                {album.cover_thumbnail && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={album.cover_thumbnail} alt="" className="size-full object-cover" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="flex flex-wrap items-center gap-2 font-medium">
                  {album.name}
                  {album.category && <Badge variant="outline">{album.category}</Badge>}
                  {!album.is_published && <Badge variant="secondary">Draft</Badge>}
                </p>
                <p className="truncate text-sm text-muted-foreground">
                  /portfolio/{album.slug} · {album.photo_count} photo
                  {album.photo_count === 1 ? "" : "s"}
                </p>
              </div>
              <label className="hidden items-center gap-2 text-sm text-muted-foreground sm:flex">
                <Switch
                  checked={album.is_published}
                  onCheckedChange={(checked) =>
                    startTransition(async () => {
                      const result = await setAlbumPublished(album.id, checked);
                      if (!result.ok) toast.error(result.error);
                    })
                  }
                />
                Published
              </label>
              <div className="flex shrink-0 gap-1">
                <Link
                  href={`/admin/photos?album=${album.id}`}
                  className={buttonVariants({ variant: "ghost", size: "icon-sm" })}
                  aria-label="Manage photos"
                  title="Manage photos & cover"
                >
                  <Camera />
                </Link>
                {album.is_published && (
                  <a
                    href={`/portfolio/${album.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={buttonVariants({ variant: "ghost", size: "icon-sm" })}
                    aria-label="View on website"
                  >
                    <ExternalLink />
                  </a>
                )}
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Edit album"
                  onClick={() => setEditing(album)}
                >
                  <Pencil />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Delete album"
                  onClick={() =>
                    confirm.ask(async () => {
                      const result = await deleteAlbum(album.id);
                      if (result.ok) toast.success("Album deleted");
                      else toast.error(result.error);
                    })
                  }
                >
                  <Trash2 />
                </Button>
              </div>
            </Card>
          )}
        />
      )}

      <AlbumFormDialog
        album={editing === "new" ? null : editing}
        open={editing !== null}
        onOpenChange={(open) => !open && setEditing(null)}
      />

      <ConfirmDialog
        open={confirm.open}
        onOpenChange={confirm.onOpenChange}
        onConfirm={confirm.onConfirm}
        title="Delete album?"
        description="The album will be removed. Its photos are kept and become unassigned."
      />
    </div>
  );
}
