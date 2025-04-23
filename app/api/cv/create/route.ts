// import { NextResponse } from "next/server";
// import { deepseek } from "@ai-sdk/deepseek";
// import { JsonObject } from "@prisma/client/runtime/library";
// import { generateObject } from "ai";

// import { prisma } from "@/lib/db";
// import { resumeScoreSchema } from "@/lib/schemas";

// export async function POST(req: Request) {
//   const { jdId, fileName } = await req.json();

//   const createdCV = await prisma.cV.create({
//     data: {
//       jobDescriptionId: jdId,
//       fileName: fileName,
//       resume: {}, // Empty until AI finishes
//       score: {}, // Empty until AI finishes
//       uploadedAt: new Date(),
//       shortlisted: false,
//       status: "created",
//     },
//   });

//   return NextResponse.json(createdCV);
// }
