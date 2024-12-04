import { Heading } from "@/components/heading";
import { PanelWrapper } from "@/components/panel-wrapper";
import { Unauthorised } from "@/components/unauthorised";

import { api } from "@/lib/trpc/server";
import { InstanceParams } from "@/lib/validations/params";

import { ReaderAllocationCard } from "./_components/reader-allocation-card";

import { app, metadataTitle } from "@/content/config/app";
import { pages } from "@/content/pages";

export async function generateMetadata({ params }: { params: InstanceParams }) {
  const { displayName } = await api.institution.instance.get({ params });

  return {
    title: metadataTitle([pages.readerProjects.title, displayName, app.name]),
  };
}

export default async function Page({ params }: { params: InstanceParams }) {
  const allocationAccess = await api.user.supervisor.allocationAccess({
    params,
  });

  if (!allocationAccess) {
    return (
      <Unauthorised message="You are not allowed to access this resource at this time" />
    );
  }

  const projectAllocations = await api.reader.getAllProjects({ params });

  return (
    <>
      <Heading>Reader Project</Heading>
      <PanelWrapper className="mt-16">
        {projectAllocations.length !== 0 ? (
          <p className="mb-3 text-lg">
            You are the allocated reader for the following projects:
          </p>
        ) : (
          <p className="mb-3 text-lg">
            You are not the allocated reader for any projects at this time.
          </p>
        )}
        {projectAllocations.map((a) => (
          <ReaderAllocationCard
            key={a.id}
            title={a.project.title}
            student={a.student}
            supervisor={a.supervisor}
          />
        ))}
      </PanelWrapper>
    </>
  );
}
