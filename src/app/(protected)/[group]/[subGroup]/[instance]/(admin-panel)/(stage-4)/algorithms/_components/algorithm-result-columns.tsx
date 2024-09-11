import { Dispatch, SetStateAction } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";

import { useInstanceParams } from "@/components/params-context";
import { Button } from "@/components/ui/button";
import {
  DestructiveAction,
  DestructiveActionCancel,
  DestructiveActionConfirm,
  DestructiveActionContent,
  DestructiveActionDescription,
  DestructiveActionHeader,
  DestructiveActionTitle,
  DestructiveActionTrigger,
  DestructiveActionVerificationTypeIn,
} from "@/components/ui/destructive-action";

import { api } from "@/lib/trpc/client";
import {
  formatProfile,
  formatSize,
  formatWeight,
} from "@/lib/utils/algorithm-results/format";
import { AlgorithmResultDto } from "@/lib/validations/algorithm";

export function useAlgorithmResultColumns({
  selectedAlgName,
  setSelectedAlgName,
}: {
  selectedAlgName: string | undefined;
  setSelectedAlgName: Dispatch<SetStateAction<string | undefined>>;
}): ColumnDef<AlgorithmResultDto>[] {
  const params = useInstanceParams();

  const { mutateAsync: selectMatchingAsync } =
    api.institution.instance.matching.select.useMutation();

  const handleSelection = (algName: string) => {
    void toast.promise(
      selectMatchingAsync({
        algName,
        params,
      }).then(() => {
        setSelectedAlgName(algName);
      }),
      {
        loading: "Changing selection...",
        error: "Something went wrong",
        success: "Successfully updated selection",
      },
    );
  };

  const columns: ColumnDef<AlgorithmResultDto>[] = [
    {
      id: "Name",
      accessorFn: (a) => a.displayName,
      header: "Name",
    },
    {
      id: "Weight",
      accessorFn: (a) => a.weight,
      header: "Weight",
      cell: ({
        row: {
          original: { weight },
        },
      }) => <p className="text-center">{formatWeight(weight)}</p>,
    },
    {
      id: "Size",
      accessorFn: (a) => a.size,
      header: "Size",
      cell: ({
        row: {
          original: { size },
        },
      }) => <p className="text-center">{formatSize(size)}</p>,
    },
    {
      id: "Profile",
      accessorFn: (a) => a.profile,
      header: "Profile",
      cell: ({
        row: {
          original: { profile },
        },
      }) => <p className="text-center">{formatProfile(profile)}</p>,
    },
    {
      id: "selection",
      header: () => null,
      cell: ({
        row: {
          original: { algName, profile, displayName },
        },
      }) => (
        <DestructiveAction
          action={() => handleSelection(algName)}
          // TODO: don't allow selection of algName if it's already selected
          requiresVerification
        >
          <DestructiveActionTrigger asChild>
            <Button
              className="w-24"
              variant={selectedAlgName === algName ? "secondary" : "ghost"}
              disabled={profile.length === 0}
            >
              {selectedAlgName === algName ? "Selected" : "Select"}
            </Button>
          </DestructiveActionTrigger>
          <DestructiveActionContent>
            <DestructiveActionHeader>
              <DestructiveActionTitle>Select Matching</DestructiveActionTitle>
              <DestructiveActionDescription>
                You are about to select the matching produced by algorithm
                &quot;{displayName}&quot;. This will override any previous
                selection, and remove the students matched by this algorithm
                from the pool of available students to run further matching
                algorithms against. Please confirm by typing the name of this
                algorithm below:
              </DestructiveActionDescription>
            </DestructiveActionHeader>
            <DestructiveActionVerificationTypeIn phrase={displayName} />
            <div className="flex w-full flex-row justify-between gap-4">
              <DestructiveActionCancel asChild>
                <Button className="w-full">Cancel</Button>
              </DestructiveActionCancel>
              <DestructiveActionConfirm asChild>
                <Button className="w-full" variant="secondary">
                  Select
                </Button>
              </DestructiveActionConfirm>
            </div>
          </DestructiveActionContent>
        </DestructiveAction>
      ),
    },
  ];

  return columns;
}
