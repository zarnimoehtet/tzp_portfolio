"use client";

import { useRef, useState } from "react";
import { ImageUp, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { uploadImage } from "@/hooks/use-image-upload";
import type { ImageKind } from "@/lib/images/config";
import type { ImageAsset } from "@/lib/images/types";
import { cn } from "@/lib/utils";

interface ImageFieldProps {
  value: ImageAsset | null;
  onChange: (asset: ImageAsset | null) => void;
  kind: ImageKind;
  /** Tailwind aspect class for the preview box. */
  aspect?: string;
  className?: string;
  hint?: string;
}

/**
 * Single-image picker. Uploads and optimizes immediately; the returned asset
 * is saved with the surrounding form. Replaced images are cleaned up on save.
 */
export function ImageField({
  value,
  onChange,
  kind,
  aspect = "aspect-video",
  className,
  hint,
}: ImageFieldProps) {
  const input = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [processing, setProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const busy = progress !== null;

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setProgress(0);
    try {
      const asset = await uploadImage(file, kind, (p, status) => {
        setProgress(p);
        setProcessing(status === "processing");
      });
      onChange(asset);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setProgress(null);
      setProcessing(false);
      if (input.current) input.current.value = "";
    }
  }

  return (
    <div className={cn("space-y-2", className)}>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          void handleFile(e.dataTransfer.files[0]);
        }}
        className={cn(
          "relative flex w-full items-center justify-center overflow-hidden rounded-lg border border-dashed bg-muted/40 transition-colors",
          aspect,
          isDragging && "border-primary bg-muted",
        )}
      >
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={value.medium_url}
            alt=""
            className={cn(
              "absolute inset-0 size-full",
              value.kind === "logo" || value.kind === "favicon"
                ? "object-contain p-4"
                : "object-cover",
            )}
          />
        ) : (
          <button
            type="button"
            onClick={() => input.current?.click()}
            className="flex flex-col items-center gap-2 p-6 text-sm text-muted-foreground"
            disabled={busy}
          >
            <ImageUp className="size-6" />
            <span>Drop an image or click to upload</span>
          </button>
        )}

        {busy && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-background/80 text-sm">
            <Loader2 className="size-5 animate-spin" />
            {processing ? "Optimizing…" : `Uploading ${Math.round((progress ?? 0) * 100)}%`}
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => input.current?.click()}
          disabled={busy}
        >
          <ImageUp />
          {value ? "Replace" : "Upload"}
        </Button>
        {value && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onChange(null)}
            disabled={busy}
          >
            <Trash2 />
            Remove
          </Button>
        )}
        {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      </div>

      <input
        ref={input}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => void handleFile(e.target.files?.[0])}
      />
    </div>
  );
}
