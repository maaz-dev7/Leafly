// Object storage backed by Neon Object Storage (S3-compatible).
//
// Replaces the previous Replit Object Storage implementation, which talked to
// a Replit-only sidecar at http://127.0.0.1:1106 and therefore could not work
// anywhere else. Neon requires path-style addressing and SigV4; credentials,
// endpoint and region come from the standard AWS_* env vars that
// `neon env pull` injects (AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY,
// AWS_ENDPOINT_URL_S3, AWS_REGION).
//
// The public API of this module is unchanged, so routes/storage.ts works as-is.
import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
  HeadObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "crypto";

/** Bucket declared in neon.ts. */
const BUCKET = process.env.NEON_BUCKET || "assets";

/** Keys for user uploads and for assets meant to be world-readable. */
const UPLOAD_PREFIX = "uploads";
const PUBLIC_PREFIX = "public";

/** Path the browser uses to fetch an object back through the API. */
const SERVE_PREFIX = "/api/storage/objects";

export const objectStorageClient: S3Client = new S3Client({
  // Required: Neon Object Storage uses path-style addressing, not virtual-host.
  forcePathStyle: true,
});

export class ObjectNotFoundError extends Error {
  constructor() {
    super("Object not found");
    this.name = "ObjectNotFoundError";
    Object.setPrototypeOf(this, ObjectNotFoundError.prototype);
  }
}

/**
 * A handle to a stored object. Replaces the @google-cloud/storage `File`
 * object the previous implementation passed around.
 */
export interface StoredObject {
  bucket: string;
  key: string;
}

export class ObjectStorageService {
  constructor() {}

  getPublicObjectSearchPaths(): Array<string> {
    const raw = process.env.PUBLIC_OBJECT_SEARCH_PATHS || "";
    const paths = raw
      .split(",")
      .map((p) => p.trim())
      .filter((p) => p.length > 0);
    return paths.length > 0 ? Array.from(new Set(paths)) : [PUBLIC_PREFIX];
  }

  getPrivateObjectDir(): string {
    return process.env.PRIVATE_OBJECT_DIR || UPLOAD_PREFIX;
  }

  /** Look for `filePath` under each configured public prefix. */
  async searchPublicObject(filePath: string): Promise<StoredObject | null> {
    const clean = filePath.replace(/^\/+/, "");
    for (const prefix of this.getPublicObjectSearchPaths()) {
      const key = `${prefix.replace(/^\/+|\/+$/g, "")}/${clean}`;
      if (await this.exists(key)) return { bucket: BUCKET, key };
    }
    return null;
  }

  private async exists(key: string): Promise<boolean> {
    try {
      await objectStorageClient.send(
        new HeadObjectCommand({ Bucket: BUCKET, Key: key }),
      );
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Fetch an object and return it as a web Response, so the route can stream
   * `response.body` straight to the client exactly as before.
   */
  async downloadObject(
    file: StoredObject,
    cacheTtlSec: number = 3600,
  ): Promise<Response> {
    const res = await objectStorageClient.send(
      new GetObjectCommand({ Bucket: file.bucket, Key: file.key }),
    );

    const headers = new Headers();
    headers.set("Content-Type", res.ContentType || "application/octet-stream");
    if (res.ContentLength != null) {
      headers.set("Content-Length", String(res.ContentLength));
    }
    if (res.ETag) headers.set("ETag", res.ETag);
    headers.set("Cache-Control", `public, max-age=${cacheTtlSec}`);

    const body = res.Body as unknown as ReadableStream<Uint8Array> | undefined;
    return new Response(body ?? null, { status: 200, headers });
  }

  /** Presigned PUT URL the browser uploads the file directly to. */
  async getObjectEntityUploadURL(): Promise<string> {
    const key = `${this.getPrivateObjectDir().replace(/^\/+|\/+$/g, "")}/${randomUUID()}`;
    return getSignedUrl(
      objectStorageClient,
      new PutObjectCommand({ Bucket: BUCKET, Key: key }),
      { expiresIn: 900 },
    );
  }

  /** Resolve a stored path (or full URL) back to a bucket object. */
  async getObjectEntityFile(objectPath: string): Promise<StoredObject> {
    const key = objectPathToKey(objectPath);
    if (!key) throw new ObjectNotFoundError();
    if (!(await this.exists(key))) throw new ObjectNotFoundError();
    return { bucket: BUCKET, key };
  }

  /**
   * Turn a presigned upload URL into the stable path stored in Postgres.
   * The result is directly usable as an <img src>, because it points at the
   * API route that streams the object back.
   */
  normalizeObjectEntityPath(rawPath: string): string {
    const key = objectPathToKey(rawPath);
    return key ? `${SERVE_PREFIX}/${key}` : rawPath;
  }

  /**
   * ACLs are not modelled in Neon Object Storage buckets; the bucket itself is
   * private and every read is proxied by this API. Kept for API compatibility.
   */
  async trySetObjectEntityAclPolicy(
    rawPath: string,
    _aclPolicy?: unknown,
  ): Promise<string> {
    return this.normalizeObjectEntityPath(rawPath);
  }

  async canAccessObjectEntity(_args?: unknown): Promise<boolean> {
    return true;
  }
}

/**
 * Accepts any of the forms an object may be referred to by and returns the
 * bucket key:
 *   https://<endpoint>/<bucket>/uploads/abc?X-Amz-...  (presigned URL)
 *   /api/storage/objects/uploads/abc                   (served path)
 *   /objects/uploads/abc                               (legacy path)
 *   uploads/abc                                        (bare key)
 */
function objectPathToKey(input: string): string | null {
  if (!input) return null;
  let path = input;

  if (/^https?:\/\//i.test(input)) {
    try {
      path = new URL(input).pathname;
    } catch {
      return null;
    }
    // Path-style URLs start with the bucket name; drop it.
    const withoutLeading = path.replace(/^\/+/, "");
    const parts = withoutLeading.split("/");
    if (parts[0] === BUCKET) parts.shift();
    return parts.join("/") || null;
  }

  path = path.replace(/^\/+/, "");
  for (const prefix of ["api/storage/objects/", "storage/objects/", "objects/"]) {
    if (path.startsWith(prefix)) {
      path = path.slice(prefix.length);
      break;
    }
  }
  return path || null;
}
