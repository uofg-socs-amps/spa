import { readerRouter } from "./routers/(marking)/reader";
import { accessControlRouter } from "./routers/access-control";
import { institutionRouter } from "./routers/institution";
import { projectRouter } from "./routers/project";
import { userRouter } from "./routers/user";
import { createCallerFactory, createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  project: projectRouter,
  user: userRouter,
  institution: institutionRouter,
  ac: accessControlRouter,
  reader: readerRouter,
});

export type AppRouter = typeof appRouter;

export const createCaller = createCallerFactory(appRouter);
