import { z } from "zod";

const baseSchema = z.object({
  groupName: z.string().min(1, "Please enter a name"),
});

export function buildNewAllocationGroupFormSchema(
  takenGroupNames: Set<string>,
) {
  return baseSchema.refine(
    ({ groupName }) => {
      const nameAllowed = !takenGroupNames.has(groupName);
      return nameAllowed;
    },
    {
      message: "This name is already taken",
      path: ["groupName"],
    },
  );
}

export type NewAllocationGroupForm = z.infer<typeof baseSchema>;
