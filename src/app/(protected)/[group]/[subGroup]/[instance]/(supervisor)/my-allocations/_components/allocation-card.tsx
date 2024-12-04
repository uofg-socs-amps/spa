"use client";
import { HashIcon, MailIcon, User2Icon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { cn } from "@/lib/utils";
import { copyToClipboard } from "@/lib/utils/general/copy-to-clipboard";

type StudentInfo = {
  id: string;
  name: string;
  email: string;
  rank: number;
  level: number;
};

type ProjectCardProps = {
  title: string;
  student: StudentInfo;
};

export function AllocationCard({ title, student }: ProjectCardProps) {
  return (
    <Card className="w-full max-w-3xl overflow-hidden">
      <CardHeader className="bg-accent p-4">
        <CardTitle className="text-wrap text-lg font-semibold leading-tight">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="grid gap-2">
          <div className="flex items-center justify-between">
            <Badge variant="accent" className="bg-indigo-50 text-indigo-700">
              GUID: {student.id}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <User2Icon className="h-4 w-4 text-muted-foreground" />
            <span className="text-base">{student.name}</span>{" "}
            <Badge variant="accent" className="bg-indigo-50 text-indigo-700">
              Level {student.level}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <MailIcon className="h-4 w-4 text-muted-foreground" />
            <button
              onClick={() => copyToClipboard(student.email)}
              className={cn(
                buttonVariants({ variant: "link" }),
                "truncate px-0 text-base",
              )}
            >
              {student.email}
            </button>
          </div>
          <div className="flex items-center gap-2">
            <HashIcon className="h-4 w-4 text-indigo-500" />
            <span className="text-base">Rank: {student.rank}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
