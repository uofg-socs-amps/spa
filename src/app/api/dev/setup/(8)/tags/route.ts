import { tagData } from "@/data";
import { prisma } from "@/lib/prisma";
import { checkUpload, logUpload } from "@/lib/utils";
import { NextResponse } from "next/server";

export async function POST() {
  const tags = (
    await prisma.tag.findMany({
      select: {
        title: true,
      },
    })
  ).map((item) => item.title);

  if (!checkUpload("TAGS", tags, 20)) {
    await prisma.tag.createMany({ data: tagData });
  }

  logUpload("TAGS", tags, 20);
  return NextResponse.json({ status: 200, data: true });
}
