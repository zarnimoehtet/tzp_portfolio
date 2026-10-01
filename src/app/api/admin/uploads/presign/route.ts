import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";

import { getAdminUser } from "@/lib/auth";
import { ACCEPTED_IMAGE_TYPES, MAX_UPLOAD_BYTES } from "@/lib/images/config";
import { createPresignedUpload, isR2Configured } from "@/lib/r2";

const bodySchema = z.object({
  contentType: z.enum(ACCEPTED_IMAGE_TYPES),
  size: z.number().int().positive().max(MAX_UPLOAD_BYTES),
});

const EXTENSIONS: Record<(typeof ACCEPTED_IMAGE_TYPES)[number], string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
  "image/tiff": "tiff",
  "image/gif": "gif",
  "image/svg+xml": "svg",
};

export async function POST(request: Request) {
  if (!(await getAdminUser())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isR2Configured()) {
    return NextResponse.json(
      { error: "Image storage (Cloudflare R2) is not configured." },
      { status: 500 },
    );
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Unsupported file type or file too large." },
      { status: 400 },
    );
  }

  const { contentType } = parsed.data;
  const key = `tmp/${randomUUID()}.${EXTENSIONS[contentType]}`;
  const uploadUrl = await createPresignedUpload(key, contentType);

  return NextResponse.json({ key, uploadUrl });
}
