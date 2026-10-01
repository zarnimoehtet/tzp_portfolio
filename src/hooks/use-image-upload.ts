"use client";

import { useCallback, useState } from "react";

import {
  ACCEPTED_IMAGE_TYPES,
  MAX_UPLOAD_BYTES,
  type ImageKind,
} from "@/lib/images/config";
import type { ImageAsset } from "@/lib/images/types";

export type UploadStatus = "queued" | "uploading" | "processing" | "done" | "error";

export interface UploadItem {
  id: string;
  file: File;
  previewUrl: string;
  progress: number;
  status: UploadStatus;
  error?: string;
  asset?: ImageAsset;
}

const CONCURRENCY = 3;

function putWithProgress(
  url: string,
  file: File,
  onProgress: (fraction: number) => void,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", url);
    xhr.setRequestHeader("Content-Type", file.type);
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress(event.loaded / event.total);
    };
    xhr.onload = () =>
      xhr.status >= 200 && xhr.status < 300
        ? resolve()
        : reject(new Error(`Upload failed (${xhr.status})`));
    xhr.onerror = () =>
      reject(new Error("Upload failed. Check the R2 bucket CORS settings."));
    xhr.send(file);
  });
}

async function postJson<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error ?? `Request failed (${res.status})`);
  return json as T;
}

export function validateImageFile(file: File): string | null {
  if (!(ACCEPTED_IMAGE_TYPES as readonly string[]).includes(file.type)) {
    return "Unsupported format. Use JPEG, PNG, WebP, AVIF or TIFF.";
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return `File is larger than ${MAX_UPLOAD_BYTES / 1024 / 1024}MB.`;
  }
  return null;
}

/** Uploads a single file: presign → direct PUT to R2 → server-side optimize. */
export async function uploadImage(
  file: File,
  kind: ImageKind,
  onProgress?: (fraction: number, status: UploadStatus) => void,
): Promise<ImageAsset> {
  const invalid = validateImageFile(file);
  if (invalid) throw new Error(invalid);

  onProgress?.(0, "uploading");
  const { key, uploadUrl } = await postJson<{ key: string; uploadUrl: string }>(
    "/api/admin/uploads/presign",
    { contentType: file.type, size: file.size },
  );
  await putWithProgress(uploadUrl, file, (f) => onProgress?.(f, "uploading"));
  onProgress?.(1, "processing");
  const { asset } = await postJson<{ asset: ImageAsset }>(
    "/api/admin/uploads/process",
    { key, kind },
  );
  onProgress?.(1, "done");
  return asset;
}

/** Queue-based multi-file uploader with per-file progress. */
export function useImageUploadQueue(kind: ImageKind) {
  const [items, setItems] = useState<UploadItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const patch = useCallback((id: string, update: Partial<UploadItem>) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...update } : i)));
  }, []);

  const uploadFiles = useCallback(
    async (files: File[]): Promise<{ file: File; asset: ImageAsset }[]> => {
      const queue: UploadItem[] = files.map((file) => ({
        id: crypto.randomUUID(),
        file,
        previewUrl: URL.createObjectURL(file),
        progress: 0,
        status: "queued",
      }));
      setItems((prev) => [...prev, ...queue]);
      setIsUploading(true);

      // Indexed by queue position so results keep the selected file order.
      const results: ({ file: File; asset: ImageAsset } | undefined)[] = [];
      let cursor = 0;

      async function worker() {
        while (cursor < queue.length) {
          const position = cursor++;
          const item = queue[position];
          try {
            const asset = await uploadImage(item.file, kind, (progress, status) =>
              patch(item.id, { progress, status }),
            );
            patch(item.id, { asset, status: "done", progress: 1 });
            results[position] = { file: item.file, asset };
          } catch (error) {
            patch(item.id, {
              status: "error",
              error: error instanceof Error ? error.message : "Upload failed",
            });
          }
        }
      }

      await Promise.all(
        Array.from({ length: Math.min(CONCURRENCY, queue.length) }, worker),
      );
      setIsUploading(false);
      return results.filter((r) => r !== undefined);
    },
    [kind, patch],
  );

  const clearFinished = useCallback(() => {
    setItems((prev) => {
      for (const item of prev) {
        if (item.status === "done") URL.revokeObjectURL(item.previewUrl);
      }
      return prev.filter((i) => i.status !== "done");
    });
  }, []);

  const dismiss = useCallback((id: string) => {
    setItems((prev) => {
      const item = prev.find((i) => i.id === id);
      if (item) URL.revokeObjectURL(item.previewUrl);
      return prev.filter((i) => i.id !== id);
    });
  }, []);

  return { items, isUploading, uploadFiles, clearFinished, dismiss };
}
