import { NextRequest, NextResponse } from "next/server";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { auth } from "@/auth";
import { getItemById } from "@/lib/db/items";
import { r2, R2_BUCKET } from "@/lib/r2";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const item = await getItemById(id, userId);
  if (!item || item.contentType !== "FILE" || !item.fileUrl) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const obj = await r2.send(
    new GetObjectCommand({ Bucket: R2_BUCKET, Key: item.fileUrl })
  );

  const bytes = await obj.Body?.transformToByteArray();
  if (!bytes) return NextResponse.json({ error: "File not found" }, { status: 404 });

  const headers = new Headers();
  if (obj.ContentType) headers.set("Content-Type", obj.ContentType);
  if (obj.ContentDisposition) {
    headers.set("Content-Disposition", obj.ContentDisposition);
  } else if (item.fileName) {
    headers.set("Content-Disposition", `attachment; filename="${item.fileName}"`);
  }
  if (obj.ContentLength) headers.set("Content-Length", String(obj.ContentLength));

  return new NextResponse(Buffer.from(bytes), { headers });
}
