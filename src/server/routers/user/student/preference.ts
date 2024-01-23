import { instanceParamsSchema } from "@/lib/validations/params";
import { createTRPCRouter, protectedProcedure } from "@/server/trpc";
import { PreferenceType } from "@prisma/client";
import { z } from "zod";

export const preferenceRouter = createTRPCRouter({
  update: protectedProcedure
    .input(
      z.object({
        params: instanceParamsSchema,
        projectId: z.string(),
        preferenceType: z.nativeEnum(PreferenceType).or(z.literal("None")),
      }),
    )
    .mutation(
      async ({
        ctx,
        input: {
          params: { group, subGroup, instance },
          projectId,
          preferenceType,
        },
      }) => {
        const userId = ctx.session.user.id;

        if (preferenceType === "None") {
          await ctx.db.preference.delete({
            where: {
              projectId_userId_allocationGroupId_allocationSubGroupId_allocationInstanceId:
                {
                  allocationGroupId: group,
                  allocationSubGroupId: subGroup,
                  allocationInstanceId: instance,
                  projectId,
                  userId,
                },
            },
          });
          return;
        }

        const currentPreference = await ctx.db.preference.findFirst({
          where: {
            allocationGroupId: group,
            allocationSubGroupId: subGroup,
            allocationInstanceId: instance,
            projectId,
            userId,
          },
        });

        if (!currentPreference) {
          await ctx.db.preference.create({
            data: {
              allocationGroupId: group,
              allocationSubGroupId: subGroup,
              allocationInstanceId: instance,
              projectId,
              userId,
              type: preferenceType,
              rank: 0,
            },
          });
          return;
        }

        await ctx.db.preference.update({
          where: {
            projectId_userId_allocationGroupId_allocationSubGroupId_allocationInstanceId:
              {
                allocationGroupId: group,
                allocationSubGroupId: subGroup,
                allocationInstanceId: instance,
                projectId,
                userId,
              },
          },
          data: { type: preferenceType, rank: 0 },
        });
        return;
      },
    ),

  getForProject: protectedProcedure
    .input(
      z.object({
        params: instanceParamsSchema,
        projectId: z.string(),
      }),
    )
    .query(
      async ({
        ctx,
        input: {
          params: { group, subGroup, instance },
          projectId,
        },
      }) => {
        const preference = await ctx.db.preference.findFirst({
          where: {
            allocationGroupId: group,
            allocationSubGroupId: subGroup,
            allocationInstanceId: instance,
            projectId,
            userId: ctx.session.user.id,
          },
          select: { type: true },
        });

        return preference ? preference.type : "None";
      },
    ),
});
