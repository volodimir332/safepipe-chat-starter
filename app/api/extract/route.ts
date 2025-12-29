import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ["application/pdf", "text/plain", "text/markdown", "text/csv"];

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "File exceeds 10MB limit" }, { status: 400 });
    }

    const extension = file.name.toLowerCase().split(".").pop();
    const isValidType = ALLOWED_TYPES.includes(file.type) || ["pdf", "txt", "md", "csv"].includes(extension || "");

    if (!isValidType) {
      return NextResponse.json({ error: "Unsupported file type" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    let text = "";

    if (file.type === "application/pdf" || extension === "pdf") {
      const pdfParse = require("pdf-parse");
      const pdfData = await pdfParse(buffer);
      text = pdfData.text;

      // Clean PDF artifacts
      text = text
        .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, "")
        .replace(/%PDF-\d\.\d/g, "")
        .replace(/\b(obj|endobj|stream|endstream|xref|trailer|startxref)\b/gi, "")
        .replace(/\/[\w\d]+/g, "")
        .replace(/<<.*?>>/gs, "")
        .replace(/\[.*?\]/gs, "")
        .replace(/\s+/g, " ")
        .trim();
    } else {
      text = buffer.toString("utf-8").trim();
    }

    if (!text || text.length === 0) {
      return NextResponse.json(
        { error: "Could not extract text. File may be image-based." },
        { status: 422 }
      );
    }

    // Truncate for safety
    const MAX_LENGTH = 15000;
    if (text.length > MAX_LENGTH) {
      text = text.substring(0, MAX_LENGTH) + "\n\n[Content truncated]";
    }

    return NextResponse.json({
      success: true,
      text,
      filename: file.name,
      length: text.length,
    });
  } catch (error) {
    console.error("Extract API error:", error);
    return NextResponse.json(
      { error: "Failed to process file" },
      { status: 500 }
    );
  }
}

