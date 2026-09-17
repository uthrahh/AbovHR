import { mkdir, writeFile, unlink, readFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

const UPLOAD_ROOT = path.resolve(process.cwd(), process.env.UPLOAD_DIR ?? "./uploads");

export const ALLOWED_RESUME_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

export const MAX_UPLOAD_BYTES = Number(process.env.MAX_UPLOAD_BYTES ?? 5 * 1024 * 1024);

const EXTENSION_BY_TYPE: Record<string, string> = {
  "application/pdf": ".pdf",
  "application/msword": ".doc",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": ".docx",
};

/** Saves a validated file under uploads/<subdir>/ with a random, non-guessable name. Returns the relative storage key. */
export async function saveUploadedFile(subdir: string, file: File): Promise<{ storageKey: string; sizeBytes: number }> {
  const dir = path.join(UPLOAD_ROOT, subdir);
  await mkdir(dir, { recursive: true });

  const ext = EXTENSION_BY_TYPE[file.type] ?? "";
  const filename = `${randomUUID()}${ext}`;
  const storageKey = path.join(subdir, filename);
  const fullPath = path.join(UPLOAD_ROOT, storageKey);

  const bytes = Buffer.from(await file.arrayBuffer());
  await writeFile(fullPath, bytes);

  return { storageKey: storageKey.split(path.sep).join("/"), sizeBytes: bytes.byteLength };
}

export async function readStoredFile(storageKey: string): Promise<Buffer> {
  const fullPath = resolveSafePath(storageKey);
  return readFile(fullPath);
}

export async function deleteStoredFile(storageKey: string): Promise<void> {
  const fullPath = resolveSafePath(storageKey);
  await unlink(fullPath).catch(() => undefined);
}

function resolveSafePath(storageKey: string): string {
  const fullPath = path.resolve(UPLOAD_ROOT, storageKey);
  if (!fullPath.startsWith(UPLOAD_ROOT)) {
    throw new Error("Invalid storage key.");
  }
  return fullPath;
}
