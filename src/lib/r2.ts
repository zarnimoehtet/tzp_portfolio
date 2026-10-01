import "server-only";

import {
  DeleteObjectCommand,
  DeleteObjectsCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

interface R2Config {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucket: string;
  publicUrl: string;
}

function readConfig(): R2Config | null {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const bucket = process.env.R2_BUCKET_NAME;
  const publicUrl = process.env.R2_PUBLIC_URL;
  if (!accountId || !accessKeyId || !secretAccessKey || !bucket || !publicUrl) {
    return null;
  }
  return {
    accountId,
    accessKeyId,
    secretAccessKey,
    bucket,
    publicUrl: publicUrl.replace(/\/$/, ""),
  };
}

export const isR2Configured = () => readConfig() !== null;

let client: S3Client | null = null;

function getR2(): { s3: S3Client; config: R2Config } {
  const config = readConfig();
  if (!config) {
    throw new Error(
      "Cloudflare R2 is not configured. Set the R2_* environment variables.",
    );
  }
  client ??= new S3Client({
    region: "auto",
    endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
  });
  return { s3: client, config };
}

export function publicUrlFor(key: string): string {
  return `${getR2().config.publicUrl}/${key}`;
}

/** True when a URL points at this project's public R2 bucket. */
export function isOwnR2Url(url: string): boolean {
  const config = readConfig();
  return Boolean(config && url.startsWith(`${config.publicUrl}/`));
}

/** Short-lived URL that lets the browser PUT one object directly to R2. */
export async function createPresignedUpload(
  key: string,
  contentType: string,
  expiresIn = 600,
): Promise<string> {
  const { s3, config } = getR2();
  return getSignedUrl(
    s3,
    new PutObjectCommand({
      Bucket: config.bucket,
      Key: key,
      ContentType: contentType,
    }),
    { expiresIn },
  );
}

export async function getObjectBuffer(key: string): Promise<Buffer> {
  const { s3, config } = getR2();
  const result = await s3.send(
    new GetObjectCommand({ Bucket: config.bucket, Key: key }),
  );
  if (!result.Body) throw new Error(`Object ${key} has no body`);
  const bytes = await result.Body.transformToByteArray();
  return Buffer.from(bytes);
}

export async function putObject(
  key: string,
  body: Buffer,
  contentType: string,
): Promise<string> {
  const { s3, config } = getR2();
  await s3.send(
    new PutObjectCommand({
      Bucket: config.bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
      // Keys are unique per upload, so variants can be cached forever.
      CacheControl: "public, max-age=31536000, immutable",
    }),
  );
  return publicUrlFor(key);
}

export async function deleteObject(key: string): Promise<void> {
  const { s3, config } = getR2();
  await s3.send(new DeleteObjectCommand({ Bucket: config.bucket, Key: key }));
}

/** Deletes every object under a prefix, e.g. all variants of one image. */
export async function deletePrefix(prefix: string): Promise<void> {
  if (!prefix || !prefix.endsWith("/")) {
    throw new Error("Refusing to delete an unscoped R2 prefix");
  }
  const { s3, config } = getR2();
  let token: string | undefined;
  do {
    const list = await s3.send(
      new ListObjectsV2Command({
        Bucket: config.bucket,
        Prefix: prefix,
        ContinuationToken: token,
      }),
    );
    const objects = (list.Contents ?? [])
      .map((o) => o.Key)
      .filter((k): k is string => Boolean(k))
      .map((Key) => ({ Key }));
    if (objects.length > 0) {
      await s3.send(
        new DeleteObjectsCommand({
          Bucket: config.bucket,
          Delete: { Objects: objects, Quiet: true },
        }),
      );
    }
    token = list.IsTruncated ? list.NextContinuationToken : undefined;
  } while (token);
}
