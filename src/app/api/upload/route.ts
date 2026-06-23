import { NextRequest, NextResponse } from "next/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import crypto from "crypto";
import path from "path";
import { auth } from "@/auth";
import {
  r2,
  R2_BUCKET,
  IMAGE_MIME_TYPES,
  FILE_MIME_TYPES,
  IMAGE_MAX_BYTES,
  FILE_MAX_BYTES,
} from "@/lib/r2";

export async function POST(req: NextRequest) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const mimeType = file.type;
  const isImage = IMAGE_MIME_TYPES.has(mimeType);
  const isFile = FILE_MIME_TYPES.has(mimeType);

  if (!isImage && !isFile) {
    return NextResponse.json({ error: "Unsupported file type" }, { status: 400 });
  }

  const maxBytes = isImage ? IMAGE_MAX_BYTES : FILE_MAX_BYTES;
  if (file.size > maxBytes) {
    const limitMB = maxBytes / (1024 * 1024);
    return NextResponse.json({ error: `File exceeds ${limitMB} MB limit` }, { status: 400 });
  }

  const ext = path.extname(file.name).toLowerCase();
  const key = `${userId}/${crypto.randomUUID()}${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  await r2.send(
    new PutObjectCommand({
      Bucket: R2_BUCKET,
      Key: key,
      Body: buffer,
      ContentType: mimeType,
      ContentDisposition: `attachment; filename="${file.name}"`,
    })
  );

  return NextResponse.json({
    key,
    fileName: file.name,
    fileSize: file.size,
    mimeType,
    isImage,
  });
}
