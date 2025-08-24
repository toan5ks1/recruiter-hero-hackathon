import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { jdId, fileName, content } = await req.json();

    // Validate required fields
    if (!jdId || !fileName || !content) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create the CV with all required fields
    const createdCV = await prisma.cV.create({
      data: {
        jobDescriptionId: jdId,
        fileName: fileName,
        content: content || "",
        resume: {}, // Empty until AI finishes
        score: {}, // Empty until AI finishes
        uploadedAt: new Date(),
        shortlisted: false,
        status: "created",
        jobDescription: {
          connect: {
            id: jdId
          }
        }
      },
      include: {
        jobDescription: true
      }
    });

    return NextResponse.json(createdCV);
  } catch (error) {
    console.error("Error creating CV:", error);
    return NextResponse.json(
      { error: "Failed to create CV" },
      { status: 500 }
    );
  }
}
