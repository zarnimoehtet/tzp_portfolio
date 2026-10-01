"use client";

import { useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Eye,
  EyeOff,
  ImageIcon,
  MoreHorizontal,
  Pencil,
  Star,
  StarOff,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import { ConfirmDialog, useConfirm } from "@/components/admin/confirm-dialog";
import { NativeSelect } from "@/components/admin/native-select";
import { DragHandle, SortableList } from "@/components/admin/sortable-list";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  deletePhotos,
  movePhotos,
  reorderPhotos,
  setAlbumCover,
  setPhotosFlag,
} from "@/lib/actions/photos";
import type { ActionResult, Photo } from "@/lib/types";
import { cn } from "@/lib/utils";
import { PhotoEditDialog } from "./photo-edit-dialog";

export interface AlbumOption {
  id: string;
  name: string;
  cover_photo_id: string | null;
}

interface PhotoManagerProps {
  photos: Photo[];
  albums: AlbumOption[];
  filter: string;
}

export function PhotoManager({ photos, albums, filter }: PhotoManagerProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [editing, setEditing] = useState<Photo | null>(null);
  const [isPending, startTransition] = useTransition();
  const confirm = useConfirm();
  const canReorder = filter !== "all";
  const albumName = (id: string | null) => albums.find((a) => a.id === id)?.name;

  function run(action: () => Promise<ActionResult>, success?: string) {
    startTransition(async () => {
      const result = await action();
      if (result.ok) {
        if (success) toast.success(success);
        setSelected(new Set());
      } else {
        toast.error(result.error);
      }
    });
  }

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const ids = [...selected];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <NativeSelect
          aria-label="Filter by album"
          value={filter}
          onChange={(e) => {
            const value = e.target.value;
            router.push(value === "all" ? pathname : `${pathname}?album=${value}`);
          }}
          className="w-56"
        >
          <option value="all">All photos</option>
          <option value="unassigned">Not in an album</option>
          {albums.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </NativeSelect>
        <p className="text-sm text-muted-foreground">
          {photos.length} photo{photos.length === 1 ? "" : "s"}
          {!canReorder && photos.length > 1 && " · choose an album to reorder"}
        </p>
        {photos.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              setSelected(selected.size === photos.length ? new Set() : new Set(photos.map((p) => p.id)))
            }
          >
            {selected.size === photos.length ? "Clear selection" : "Select all"}
          </Button>
        )}
      </div>

      {selected.size > 0 && (
        <div className="sticky top-16 z-10 flex flex-wrap items-center gap-2 rounded-lg border bg-background p-2 shadow-sm">
          <span className="px-2 text-sm font-medium">{selected.size} selected</span>
          <Button size="sm" variant="outline" disabled={isPending} onClick={() => run(() => setPhotosFlag(ids, "is_published", true), "Published")}>
            <Eye /> Publish
          </Button>
          <Button size="sm" variant="outline" disabled={isPending} onClick={() => run(() => setPhotosFlag(ids, "is_published", false), "Unpublished")}>
            <EyeOff /> Unpublish
          </Button>
          <Button size="sm" variant="outline" disabled={isPending} onClick={() => run(() => setPhotosFlag(ids, "is_featured", true), "Marked as featured")}>
            <Star /> Feature
          </Button>
          <NativeSelect
            aria-label="Move to album"
            value=""
            disabled={isPending}
            onChange={(e) => {
              const value = e.target.value;
              if (!value) return;
              run(() => movePhotos(ids, value === "none" ? null : value), "Photos moved");
            }}
            className="w-44"
          >
            <option value="">Move to album…</option>
            <option value="none">Remove from album</option>
            {albums.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </NativeSelect>
          <Button
            size="sm"
            variant="destructive"
            disabled={isPending}
            onClick={() => confirm.ask(() => run(() => deletePhotos(ids), "Photos deleted"))}
          >
            <Trash2 /> Delete
          </Button>
        </div>
      )}

      {photos.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-xl border p-12 text-center text-muted-foreground">
          <ImageIcon className="size-8" />
          <p>No photos here yet. Upload some above.</p>
        </div>
      ) : (
        <SortableList
          items={photos}
          layout="grid"
          disabled={!canReorder}
          onReorder={reorderPhotos}
          className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
          renderItem={(photo, handle) => {
            const album = albums.find((a) => a.id === photo.album_id);
            const isCover = album?.cover_photo_id === photo.id;
            const isSelected = selected.has(photo.id);
            return (
              <div
                className={cn(
                  "group overflow-hidden rounded-lg border bg-card",
                  isSelected && "ring-2 ring-primary",
                )}
              >
                <div className="relative aspect-square bg-muted">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photo.thumbnail_url}
                    alt={photo.alt_text ?? photo.title ?? ""}
                    loading="lazy"
                    className={cn("size-full object-cover", !photo.is_published && "opacity-50")}
                  />
                  <div className="absolute inset-x-0 top-0 flex items-start justify-between p-2">
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => toggle(photo.id)}
                      aria-label="Select photo"
                      className="bg-background/90"
                    />
                    {canReorder && (
                      <DragHandle {...handle} className="bg-background/90" />
                    )}
                  </div>
                  <div className="absolute bottom-2 left-2 flex flex-wrap gap-1">
                    {!photo.is_published && <Badge variant="secondary">Draft</Badge>}
                    {photo.is_featured && <Badge>Featured</Badge>}
                    {isCover && <Badge variant="outline" className="bg-background/90">Cover</Badge>}
                  </div>
                </div>
                <div className="flex items-center gap-1 p-2">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{photo.title || "Untitled"}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {albumName(photo.album_id) ?? "No album"}
                    </p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={<Button variant="ghost" size="icon-sm" aria-label="Photo actions" />}
                    >
                      <MoreHorizontal />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem onClick={() => setEditing(photo)}>
                        <Pencil /> Edit details
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => run(() => setPhotosFlag([photo.id], "is_published", !photo.is_published))}
                      >
                        {photo.is_published ? <EyeOff /> : <Eye />}
                        {photo.is_published ? "Unpublish" : "Publish"}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => run(() => setPhotosFlag([photo.id], "is_featured", !photo.is_featured))}
                      >
                        {photo.is_featured ? <StarOff /> : <Star />}
                        {photo.is_featured ? "Remove from featured" : "Mark as featured"}
                      </DropdownMenuItem>
                      {album && !isCover && (
                        <DropdownMenuItem
                          onClick={() => run(() => setAlbumCover(album.id, photo.id), "Album cover updated")}
                        >
                          <ImageIcon /> Set as album cover
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        variant="destructive"
                        onClick={() => confirm.ask(() => run(() => deletePhotos([photo.id]), "Photo deleted"))}
                      >
                        <Trash2 /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            );
          }}
        />
      )}

      <PhotoEditDialog
        photo={editing}
        albums={albums}
        onOpenChange={(open) => !open && setEditing(null)}
      />

      <ConfirmDialog
        open={confirm.open}
        onOpenChange={confirm.onOpenChange}
        onConfirm={confirm.onConfirm}
        title="Delete photos?"
        description="The photos and their optimized files will be permanently removed."
      />
    </div>
  );
}
