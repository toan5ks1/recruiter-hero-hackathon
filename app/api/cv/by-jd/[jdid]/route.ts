import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: { jdid: string } },
) {
  const { jdid } = params;

  const cvs = await prisma.cV.findMany({
    where: { jobDescriptionId: jdid },
  });

  return NextResponse.json(cvs);
}
