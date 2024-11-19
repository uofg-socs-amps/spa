import { z } from "zod";

import { expand } from "@/lib/utils/general/instance-params";
import { instanceParamsSchema } from "@/lib/validations/params";

import { createTRPCRouter, instanceProcedure } from "@/server/trpc";

export const markingRouter = createTRPCRouter({
  createSpecialCircumstance: instanceProcedure
    .input(
      z.object({
        params: instanceParamsSchema,
        projectId: z.string(),
        studentId: z.string(),
        description: z.string(),
      }),
    )
    .mutation(
      async ({ ctx, input: { params, projectId, studentId, description } }) => {
        await ctx.db.projectAllocation.update({
          where: {
            allocationId: {
              ...expand(params),
              projectId,
              userId: studentId,
            },
          },
          data: {
            specialCircumstances: description,
          },
        });
      },
    ),
});
