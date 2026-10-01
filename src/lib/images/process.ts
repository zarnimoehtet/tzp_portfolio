import "server-only";

import { randomUUID } from "node:crypto";
import sharp, { type Sharp } from "sharp";

import { putObject } from "@/lib/r2";
import { IMAGE_SPECS, type ImageKind, type VariantSpec } from "./config";
import type { ImageAsset } from "./types";

type OutputFormat = "webp" | "avif";

/** WebP by default (fast to encode, universally supported); AVIF opt-in. */
function outputFormat(kind: ImageKind): OutputFormat | "png" {
  if (kind === "favicon") return "png";
  return process.env.IMAGE_FORMAT === "avif" ? "avif" : "webp";
}

const CONTENT_TYPES = {
  webp: "image/webp",
  avif: "image/avif",
  png: "image/png",
} as const;

function encode(
  pipeline: Sharp,
  format: OutputFormat | "png",
  spec: VariantSpec,
  preserveAlpha: boolean,
): Sharp {
  switch (format) {
    case "png":
      return pipeline.png({ compressionLevel: 9 });
    case "avif":
      return pipeline.avif({
        quality: Math.max(50, spec.quality - 20),
        effort: 4,
        chromaSubsampling: preserveAlpha ? "4:4:4" : "4:2:0",
      });
    case "webp":
      return pipeline.webp({
        quality: spec.quality,
        alphaQuality: preserveAlpha ? 100 : 90,
        effort: 5,
        smartSubsample: true,
      });
  }
}

function basePipeline(input: Buffer): Sharp {
  return (
    sharp(input, {
      failOn: "none",
      // ~100MP guard against decompression bombs.
      limitInputPixels: 100_000_000,
      density: 300,
    })
      // Apply EXIF orientation before stripping metadata.
      .autoOrient()
  );
}

async function renderVariant(
  input: Buffer,
  kind: ImageKind,
  spec: VariantSpec,
) {
  const kindSpec = IMAGE_SPECS[kind];
  const format = outputFormat(kind);
  let pipeline = basePipeline(input).resize({
    width: spec.width,
    height: kindSpec.square ? spec.width : undefined,
    fit: kindSpec.square ? (kindSpec.preserveAlpha ? "contain" : "cover") : "inside",
    background: { r: 0, g: 0, b: 0, alpha: 0 },
    withoutEnlargement: !kindSpec.square,
  });
  if (!kindSpec.preserveAlpha) pipeline = pipeline.flatten({ background: "#ffffff" });
  // Convert to sRGB and tag it so colours render consistently in browsers.
  pipeline = pipeline.withIccProfile("srgb");

  const { data, info } = await encode(
    pipeline,
    format,
    spec,
    Boolean(kindSpec.preserveAlpha),
  ).toBuffer({ resolveWithObject: true });

  return { data, width: info.width, height: info.height, format };
}

async function blurPlaceholder(input: Buffer): Promise<string> {
  const data = await basePipeline(input)
    .resize({ width: 16, fit: "inside" })
    .flatten({ background: "#ffffff" })
    .webp({ quality: 40 })
    .toBuffer();
  return `data:image/webp;base64,${data.toString("base64")}`;
}

/**
 * Original → optimized large / medium / thumbnail variants (+ blur preview),
 * uploaded to R2 under a unique prefix. The original is never kept.
 */
export async function processImage(
  input: Buffer,
  kind: ImageKind,
): Promise<ImageAsset> {
  const spec = IMAGE_SPECS[kind];
  const prefix = `${kind}s/${randomUUID()}/`;

  const [large, medium, thumbnail, blur] = await Promise.all([
    renderVariant(input, kind, spec.large),
    renderVariant(input, kind, spec.medium),
    renderVariant(input, kind, spec.thumbnail),
    spec.preserveAlpha ? Promise.resolve(null) : blurPlaceholder(input),
  ]);

  const upload = (name: string, variant: typeof large) =>
    putObject(
      `${prefix}${name}.${variant.format}`,
      variant.data,
      CONTENT_TYPES[variant.format],
    );

  const [url, mediumUrl, thumbnailUrl] = await Promise.all([
    upload("large", large),
    upload("medium", medium),
    upload("thumb", thumbnail),
  ]);

  return {
    kind,
    key: prefix,
    url,
    medium_url: mediumUrl,
    thumbnail_url: thumbnailUrl,
    width: large.width,
    height: large.height,
    medium_width: medium.width,
    thumbnail_width: thumbnail.width,
    blur_data_url: blur,
  };
}
