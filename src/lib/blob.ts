import { put, del, list } from "@vercel/blob";

const token = process.env.BLOB_READ_WRITE_TOKEN || "";

export async function uploadFile(pathname: string, file: File | Blob, contentType?: string) {
  return put(pathname, file, {
    token,
    access: "public",
    contentType: contentType || (file instanceof File ? file.type : undefined),
  });
}

export async function deleteFile(pathname: string | string[]) {
  return del(pathname, { token });
}

export async function listFiles(prefix?: string) {
  return list({ token, prefix });
}
