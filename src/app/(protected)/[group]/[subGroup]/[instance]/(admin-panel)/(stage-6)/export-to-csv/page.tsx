import { SubHeading } from "@/components/heading";
import { PanelWrapper } from "@/components/panel-wrapper";

import { api } from "@/lib/trpc/server";
import { InstanceParams } from "@/lib/validations/params";
import { adminTabs } from "@/lib/validations/tabs/admin-panel";

import { AllocationDataTable } from "./_components/allocation-data-table";
import { ExportDataButton } from "./_components/export-button";

export default async function Page({ params }: { params: InstanceParams }) {
  const data = await api.institution.instance.matching.exportCsvData({
    params,
  });

  return (
    <PanelWrapper className="flex flex-col gap-5 pt-8">
      <SubHeading className="mt-3">{adminTabs.exportToCSV.title}</SubHeading>
      <ExportDataButton data={data} />
      <AllocationDataTable data={data} />
    </PanelWrapper>
  );
}
