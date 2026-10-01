import { NextResponse } from "next/server";
import { z } from "zod";

import { getAdminUser } from "@/lib/auth";
import { IMAGE_KINDS } from "@/lib/images/config";
import { processImage } from "@/lib/images/process";
import { deleteObject, getObjectBuffer } from "@/lib/r2";

export const maxDuration = 60;

const bodySchema = z.object({
  key: z
    .string()
    .regex(
      /^tmp\/[0-9a-f-]{36}\.(jpg|png|webp|avif|tiff|gif|svg)$/,
      "Invalid upload key",
    ),
  kind: z.enum(IMAGE_KINDS),
});

export async function POST(request: Request) {
  if (!(await getAdminUser())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { key, kind } = parsed.data;
  try {
    const original = await getObjectBuffer(key);
    const asset = await processImage(original, kind);
    return NextResponse.json({ asset });
  } catch (error) {
    console.error("Image processing failed", error);
    return NextResponse.json(
      { error: "Could not process this image. Is it a valid photo?" },
      { status: 422 },
    );
  } finally {
    // Originals are never kept; failures are cleaned up by the R2 lifecycle rule.
    await deleteObject(key).catch(() => {});
  }
}
