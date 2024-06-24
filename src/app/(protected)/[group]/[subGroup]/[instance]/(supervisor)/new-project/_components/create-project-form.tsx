"use client";
import { User } from "next-auth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { useInstanceParams } from "@/components/params-context";
import { ProjectForm } from "@/components/project-form";
import { Button } from "@/components/ui/button";

import { api } from "@/lib/trpc/client";
import { formatParamsAsPath } from "@/lib/utils/general/get-instance-path";
import {
  FormInternalData,
  UpdatedProjectFormDetails,
} from "@/lib/validations/project-form";

export function CreateProjectForm({
  formInternalData,
  supervisor,
}: {
  formInternalData: FormInternalData;
  supervisor: User;
}) {
  const params = useInstanceParams();
  const router = useRouter();
  const instancePath = formatParamsAsPath(params);

  const { mutateAsync } = api.project.create.useMutation();

  const onSubmit = (data: UpdatedProjectFormDetails) => {
    void toast.promise(
      mutateAsync({
        params,
        newProject: data,
        supervisorId: supervisor.id,
      }).then(() => {
        router.push(`${instancePath}/my-projects`);
        router.refresh();
      }),
      {
        loading: "Creating Project...",
        error: "Something went wrong",
        success: "Success",
      },
    );
  };

  return (
    <ProjectForm
      formInternalData={formInternalData}
      submissionButtonLabel="Create New Project"
      onSubmit={onSubmit}
    >
      <Button variant="outline" size="lg" type="button" asChild>
        <Link href={`${instancePath}/my-projects`}>Cancel</Link>
      </Button>
    </ProjectForm>
  );
}
