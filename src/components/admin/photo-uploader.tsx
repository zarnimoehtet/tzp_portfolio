"use client";

import { useRef, useState } from "react";
import { AlertCircle, CheckCircle2, ImageUp, Loader2, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/admin/progress";
import { useImageUploadQueue } from "@/hooks/use-image-upload";
import { createPhotos } from "@/lib/actions/photos";
import { cn } from "@/lib/utils";

interface PhotoUploaderProps {
  albumId: string | null;
  albumName?: string;
}

/**
 * Multi-file drag-and-drop uploader. Each file goes browser → R2 → optimizer;
 * the resulting web/thumbnail variants are then saved as photo records.
 */
export function PhotoUploader({ albumId, albumName }: PhotoUploaderProps) {
  const input = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const { items, isUploading, uploadFiles, clearFinished, dismiss } =
    useImageUploadQueue("photo");

  async function handleFiles(fileList: FileList | null) {
    const files = Array.from(fileList ?? []).filter((f) => f.type.startsWith("image/"));
    if (files.length === 0) return;

    const uploaded = await uploadFiles(files);
    if (input.current) input.current.value = "";
    if (uploaded.length === 0) {
      toast.error("No photos were uploaded.");
      return;
    }

    const result = await createPhotos({
      albumId,
      items: uploaded.map(({ asset, file }) => ({ asset, filename: file.name })),
    });
    if (result.ok) {
      toast.success(
        `${uploaded.length} photo${uploaded.length === 1 ? "" : "s"} added${albumName ? ` to ${albumName}` : ""}.`,
      );
      clearFinished();
    } else {
      toast.error(result.error);
    }
  }

  return (
    <div className="space-y-3">
      <div
        role="button"
        tabIndex={0}
        onClick={() => input.current?.click()}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && input.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          void handleFiles(e.dataTransfer.files);
        }}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed p-8 text-center transition-colors hover:bg-muted/40",
          isDragging && "border-primary bg-muted",
        )}
      >
        <ImageUp className="size-7 text-muted-foreground" />
        <p className="font-medium">Drop photos here, or click to browse</p>
        <p className="text-sm text-muted-foreground">
          JPEG, PNG, WebP, AVIF or TIFF up to 80MB. Originals are optimized to web
          sizes and then discarded.
          {albumName && <> Uploading to <strong>{albumName}</strong>.</>}
        </p>
        <input
          ref={input}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => void handleFiles(e.target.files)}
        />
      </div>

      {items.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {isUploading ? "Uploading…" : "Uploads"}
            </p>
            {!isUploading && (
              <Button variant="ghost" size="sm" onClick={clearFinished}>
                Clear finished
              </Button>
            )}
          </div>
          <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <li key={item.id} className="flex items-center gap-3 rounded-lg border p-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.previewUrl}
                  alt=""
                  className="size-12 shrink-0 rounded object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm">{item.file.name}</p>
                  {item.status === "error" ? (
                    <p className="truncate text-xs text-destructive">{item.error}</p>
                  ) : item.status === "processing" ? (
                    <p className="text-xs text-muted-foreground">Optimizing…</p>
                  ) : item.status === "done" ? (
                    <p className="text-xs text-muted-foreground">Ready</p>
                  ) : (
                    <Progress value={item.progress * 100} className="mt-1.5" />
                  )}
                </div>
                {item.status === "done" && <CheckCircle2 className="size-4 text-emerald-600" />}
                {item.status === "processing" && <Loader2 className="size-4 animate-spin" />}
                {item.status === "error" && (
                  <>
                    <AlertCircle className="size-4 text-destructive" />
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      aria-label="Dismiss"
                      onClick={() => dismiss(item.id)}
                    >
                      <X />
                    </Button>
                  </>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
