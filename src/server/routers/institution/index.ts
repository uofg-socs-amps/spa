import { AdminLevel } from "@prisma/client";
import { z } from "zod";

import { slugify } from "@/lib/utils/general/slugify";
import { groupParamsSchema } from "@/lib/validations/params";

import {
  createTRPCRouter,
  protectedProcedure,
  superAdminProcedure,
} from "@/server/trpc";
import { isSuperAdmin } from "@/server/utils/admin/is-super-admin";

import { groupRouter } from "./group";
import { instanceRouter } from "./instance";
import { subGroupRouter } from "./sub-group";

export const institutionRouter = createTRPCRouter({
  group: groupRouter,
  subGroup: subGroupRouter,
  instance: instanceRouter,

  superAdminAccess: protectedProcedure.query(async ({ ctx }) => {
    const access = await isSuperAdmin(ctx.db, ctx.session.user.id);
    return access;
  }),

  groupManagement: superAdminProcedure.query(async ({ ctx }) => {
    const groups = await ctx.db.allocationGroup.findMany({});
    const superAdmins = await ctx.db.adminInSpace.findMany({
      where: { adminLevel: AdminLevel.SUPER },
      select: { user: { select: { id: true, name: true, email: true } } },
    });
    return { groups, superAdmins: superAdmins.map(({ user }) => user) };
  }),

  takenGroupNames: superAdminProcedure.query(async ({ ctx }) => {
    const groups = await ctx.db.allocationGroup.findMany({
      select: { displayName: true },
    });
    return new Set(groups.map(({ displayName }) => displayName));
  }),

  createGroup: superAdminProcedure
    .input(z.object({ groupName: z.string() }))
    .mutation(async ({ ctx, input: { groupName } }) => {
      await ctx.db.allocationGroup.create({
        data: {
          id: slugify(groupName),
          displayName: groupName,
        },
      });
    }),

  deleteGroup: superAdminProcedure
    .input(z.object({ params: groupParamsSchema }))
    .mutation(
      async ({
        ctx,
        input: {
          params: { group },
        },
      }) => {
        await ctx.db.allocationGroup.delete({
          where: { id: group },
        });
      },
    ),
});
