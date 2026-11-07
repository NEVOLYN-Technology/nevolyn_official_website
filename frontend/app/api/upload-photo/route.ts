import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const rawUsername = (formData.get("username") as string | null) || "employee";

    if (!file || typeof file === "string") {
      return NextResponse.json(
        { success: false, message: "No image file provided" },
        { status: 400 }
      );
    }

    const validMimeTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (!validMimeTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, message: "Invalid image format. Supported formats: JPG, PNG, WEBP." },
        { status: 400 }
      );
    }

    // 5MB limit
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, message: "Image size must not exceed 5MB." },
        { status: 400 }
      );
    }

    const targetCandidates = [
      path.join(process.cwd(), "public"),
      path.join(process.cwd(), "frontend", "public"),
      "d:\\nevolyn_official_website\\frontend\\public",
    ];

    let targetDir = targetCandidates.find((dir) => fs.existsSync(dir));
    if (!targetDir) {
      targetDir = path.join(process.cwd(), "public");
      fs.mkdirSync(targetDir, { recursive: true });
    }

    const ext = file.name.endsWith(".png")
      ? "png"
      : file.name.endsWith(".webp")
      ? "webp"
      : "jpg";

    const cleanName = rawUsername.toLowerCase().trim().replace(/[^a-z0-9_-]/g, "");
    const fileName = `${cleanName}-photo.${ext}`;
    const filePath = path.join(targetDir, fileName);

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    await fs.promises.writeFile(filePath, buffer);

    const relativeUrl = `/${fileName}`;

    return NextResponse.json({
      success: true,
      url: relativeUrl,
      cacheBustedUrl: `${relativeUrl}?t=${Date.now()}`,
      fileName,
    });
  } catch (err: any) {
    console.error("Photo upload error:", err);
    return NextResponse.json(
      { success: false, message: err?.message || "Failed to process image upload" },
      { status: 500 }
    );
  }
}

