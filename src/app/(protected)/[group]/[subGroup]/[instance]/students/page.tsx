import { api } from "@/lib/trpc/server";
import { StudentsDataTable } from "./_components/students-data-table";
import { InstanceParams } from "@/lib/validations/params";

export default async function Students({ params }: { params: InstanceParams }) {
  const tableData = await api.institution.instance.students.query({ params });
  return (
    <div className="flex w-2/3 max-w-7xl flex-col">
      <div className="flex rounded-md bg-accent px-6 py-5">
        <h1 className="text-5xl text-accent-foreground">Students</h1>
      </div>
      <StudentsDataTable data={tableData} />
    </div>
  );
}
