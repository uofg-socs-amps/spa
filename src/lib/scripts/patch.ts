/* eslint-disable @typescript-eslint/no-unused-vars */
import { PrismaClient } from "@prisma/client";

import { expand } from "../utils/general/instance-params";

const db = new PrismaClient();

async function main() {
  const group = "socs";
  const subGroup = "lvl-4-and-lvl-5-honours";
  const instance = "2024-2025";

  const params = { group, subGroup, instance };

  await db.$transaction(async (tx) => {
    await tx.projectAllocationReader.create({
      data: {
        ...expand(params),
        readerId: "gn32b",
        projectId: "2295eab2-27c6-43ed-9f87-9a47479764ba",
        studentId: "2526547K",
      },
    });
  });
  console.log("PATCH COMPLETE");
}

main()
  .catch(async (e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
