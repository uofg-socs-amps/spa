import { z } from "zod";

import { expand } from "@/lib/utils/general/instance-params";
import { instanceParamsSchema } from "@/lib/validations/params";

import { createTRPCRouter, instanceProcedure } from "@/server/trpc";

export const readerRouter = createTRPCRouter({
  getAllProjects: instanceProcedure
    .input(z.object({ params: instanceParamsSchema }))
    .query(async ({ ctx, input: { params } }) => {
      const readerAllocations = await ctx.db.projectAllocationReader.findMany({
        where: { ...expand(params), readerId: ctx.session.user.id },
        include: {
          projectAllocation: {
            select: {
              project: { include: { supervisor: { include: { user: true } } } },
              student: {
                include: {
                  user: true,
                  studentDetails: { where: { ...expand(params) } },
                },
              },
            },
          },
        },
      });

      return readerAllocations.map((a) => ({
        id: a.id,
        project: {
          id: a.projectAllocation.project.id,
          title: a.projectAllocation.project.title,
        },
        supervisor: {
          id: a.projectAllocation.project.supervisor.userId,
          name: a.projectAllocation.project.supervisor.user.name,
          email: a.projectAllocation.project.supervisor.user.email,
        },
        student: {
          id: a.projectAllocation.student.userId,
          name: a.projectAllocation.student.user.name,
          level: a.projectAllocation.student.studentDetails[0].studentLevel,
        },
      }));
    }),
});
