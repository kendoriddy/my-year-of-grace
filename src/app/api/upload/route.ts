import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { getSetting } from "@/lib/settings";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: Request) {
  try {
    if (
      !process.env.CLOUDINARY_CLOUD_NAME ||
      !process.env.CLOUDINARY_API_KEY ||
      !process.env.CLOUDINARY_API_SECRET
    ) {
      return NextResponse.json(
        { error: "Image upload is not configured." },
        { status: 503 },
      );
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file provided." }, { status: 400 });
    }

    const maxMb = Number(await getSetting("maxPhotoSizeMb")) || 5;
    if (file.size > maxMb * 1024 * 1024) {
      return NextResponse.json(
        { error: `File must be under ${maxMb}MB.` },
        { status: 400 },
      );
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Only images are allowed." }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploaded = await new Promise<{ secure_url: string }>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: "myyearofgrace/testimonies",
            resource_type: "image",
          },
          (error, result) => {
            if (error || !result) reject(error);
            else resolve(result);
          },
        )
        .end(buffer);
    });

    return NextResponse.json({ url: uploaded.secure_url });
  } catch {
    return NextResponse.json({ error: "Upload failed." }, { status: 500 });
  }
}
